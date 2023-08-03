import { Looker40SDK, folder } from '@looker/sdk'
import type { IDashboardElement, IDashboard } from '@looker/sdk'
import { embedText, generateText } from './api'
import pReduce from 'p-reduce'

export const DASHBOARD_STORAGE_KEY = 'dashboard-data-for-embeddings'
const folderIds: string[] = []

const getAllDashboardId = async (sdk: Looker40SDK): Promise<string[]> => {
  try {
    
    const dashboards = await Promise.all(folderIds.map((id) => sdk.ok(sdk.folder_dashboards(id, 'id,folder'))))
    // flatten nested arrays
    return dashboards.flat(1).map(({ id }) => id || '')
  } catch (error) {
    return []
  }
}

export interface DashboardMetadata {
  id: string
  title?: string | null
  description?: string | null
}

export interface DashboardElementMetadata {
  elementId?: string
  dashboardId: string
  bodyText: any[] | null | undefined
  noteText?: string | null
  subtitleText?: string | null
  elementTitle?: string | null
  filterables: Array<string | null | undefined>
}

export interface MetaData
  extends DashboardMetadata,
    Partial<DashboardElementMetadata> {
  elements?: DashboardElementMetadata[]
}

const getDashboardAndElementMetadata = async (
  sdk: Looker40SDK,
  dashboardId: string
): Promise<MetaData[] | undefined> => {
  try {
    const dashboard = await sdk.ok(sdk.dashboard(dashboardId))
    const dashboardMetadata = {
      id: dashboard.id || dashboardId,
      title: dashboard.title,
      description: dashboard.description,
    }
    const dashElements = dashboard.dashboard_elements
    if (dashElements && dashElements.length > 0) {
      return dashElements.map((dashElement) => ({
        ...dashboardMetadata,
        dashboardId: dashboardId,
        elementId: dashElement.id,
        bodyText: dashElement.body_text !== null
          ? extractTextFromBodyText(dashElement.body_text)
          : [],
        noteText: dashElement.note_text,
        subtitleText: dashElement.subtitle_text,
        elementTitle: dashElement.title,
        filterables: extractFilterables(dashElement),
      }))
    }
    return [dashboardMetadata]
  } catch (error) {
    return undefined
  }
}

const extractFilterables = (dashboardElementMetadata: IDashboardElement) => {
  const filterables = []
  if (dashboardElementMetadata.result_maker) {
    const listeners =
      dashboardElementMetadata.result_maker.filterables?.[0].listen
    if (listeners) {
      for (const filter of listeners) {
        filterables.push(filter.dashboard_filter_name)
      }
    }
  }
  return filterables
}

interface BodyText {
  type: string | undefined
  children: Array<{ text: string }>
}

const extractTextFromBodyText = (bodyText: string) => {
  const response = []

  // body text comes in a few different formats, this is the most common
  if (bodyText) {
    for (const text of bodyText.split(' ')) {
      response.push(text)
    }
    // try {
    //   const parsed: BodyText[] = JSON.parse(bodyText)
    //   for (const text of parsed) {
    //     const r = text.children[0].text
    //     response.push(r)
    //   }
    // } catch (e) {
    //   console.warn('Error parsing body text')
    // }
  }
  return response.filter((x) => {
    return x.length > 0
  })
}

export interface StoredEmbedding {
  id: string
  embedding: number[]
  metadata: MetaData
}

const getElementEmbeddings = async (
  sdk: Looker40SDK,
  id: string
): Promise<StoredEmbedding[] | undefined> => {
  const metadataArray = await getDashboardAndElementMetadata(sdk, id)
  console.log("Metadata Array: ", metadataArray)
  if (metadataArray) {
    return Promise.all(
      metadataArray.map(async (data) => {
        const result = await embedText(JSON.stringify(data))
        if (typeof result === 'string' || !result?.embedding.value) {
          return {} as StoredEmbedding
        } else {
          return { id, embedding: result.embedding.value, metadata: data }
        }
      })
    )
  }
  return undefined
}

export const loadDashboardEmbeddings = async (sdk: Looker40SDK) => {
  const cachedEmbeddings = localStorage.getItem(DASHBOARD_STORAGE_KEY)
  if (cachedEmbeddings && cachedEmbeddings.length > 0) {
    return JSON.parse(cachedEmbeddings)
  }
  const allDashboardId = await getAllDashboardId(sdk)
  const dashboardEmbeddings = await pReduce(
    allDashboardId,
    async (acc: StoredEmbedding[], id) => {
      const result = await getElementEmbeddings(sdk, id)
      if (result) {
        return acc.concat(result)
      }
      return acc
    },
    []
  )
  localStorage.setItem(
    DASHBOARD_STORAGE_KEY,
    JSON.stringify(dashboardEmbeddings)
  )
  return dashboardEmbeddings
}

export type GetMatchingDashboardsProps = {
  query: string
  embeddings: StoredEmbedding[]
  top: number
}

const cosineSimilarity = (A: number[], B: number[]) => {
  let dotproduct = 0
  let mA = 0
  let mB = 0

  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i]
    mA += A[i] * A[i]
    mB += B[i] * B[i]
  }

  mA = Math.sqrt(mA)
  mB = Math.sqrt(mB)
  const similarity = dotproduct / (mA * mB)

  return similarity
}

const getSummary = async (metadata: MetaData) => {
  const prompt = `${JSON.stringify(metadata)}
  Summarize these dashboard elements {query_list} as a prose description of dashboard intent, in 100 words or less, the first element is always the dashboard title.
  `
  const result = await generateText(prompt)
  return result.candidates[0].output
}

export interface Similarity extends Omit<StoredEmbedding, 'embedding'> {
  similarity: number
  summary?: string
}

export const getMatchingDashboardElements = async ({
  query,
  embeddings,
  top,
}: GetMatchingDashboardsProps): Promise<Similarity[] | string> => {
  const queryEmbeddingResult = await embedText(query)
  if (typeof queryEmbeddingResult === 'string') {
    return 'Failed to get matching dashboards'
  }
  const queryEmbedding = queryEmbeddingResult.embedding.value
  const similarities = embeddings.map(({ id, embedding, metadata }) => {
    const similarity = cosineSimilarity(queryEmbedding, embedding)
    return { id, metadata, similarity }
  })
  similarities.sort((a, b) => b.similarity - a.similarity)
  let num = 1
  let index = 1
  const similaritiesToUse = [similarities[0]]
  while (num < top) {
    const item = similarities[index]
    index++
    if (similaritiesToUse.every((sim) => sim.id !== item.id)) {
      similaritiesToUse.push(item)
      num++
    }
  }
  return Promise.all(
    similaritiesToUse.map(async (item) => {
      const summary = await getSummary(item.metadata)
      return { ...item, summary }
    })
  )
}
