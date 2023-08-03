/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import type { Reducer } from 'react'
import type { IDashboard } from '@looker/sdk'
import type { StoredEmbedding, Similarity } from './dashboardData'

export type DashboardMatchAction = {
  type:
    | 'EMBEDDINGS_LOAD'
    | 'EMBEDDINGS_READY'
    | 'EMBEDDINGS_FAIL'
    | 'MATCHES_LOAD'
    | 'MATCHES_COMPLETE'
    | 'MATCHES_FAIL'
    | 'MATCHES_LOAD'
    | 'FAIL_TO_FIND_DASHBOARD'
    | 'SET_SELECTED_DASHBOARD_ID'
    | 'SET_STATE'
  payload?: Partial<DashboardMatchState>
}

export type DashboardMatchState = {
  loadingEmbeddings: boolean
  embeddings: StoredEmbedding[]
  query: string
  loadingMatches: boolean
  matches: Similarity[]
  selectedDashboardId?: string
  currentDashboard?: IDashboard
  errorMessage: string
}

export const initialState: DashboardMatchState = {
  loadingEmbeddings: false,
  embeddings: [],
  query: '',
  loadingMatches: false,
  matches: [],
  selectedDashboardId: undefined,
  currentDashboard: undefined,
  errorMessage: '',
}

export const reducer: Reducer<DashboardMatchState, DashboardMatchAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case 'EMBEDDINGS_LOAD':
      return {
        ...state,
        errorMessage: '',
        loadingEmbeddings: true,
      }
    case 'EMBEDDINGS_READY':
      return {
        ...state,
        loadingEmbeddings: false,
        embeddings: action.payload?.embeddings || [],
      }
    case 'EMBEDDINGS_FAIL':
      return {
        ...state,
        errorMessage: 'Error loading embeddings',
        loadingEmbeddings: false,
        embeddings: [],
      }
    case 'MATCHES_LOAD':
      return {
        ...state,
        loadingMatches: true,
        matches: [],
        errorMessage: '',
      }
    case 'MATCHES_COMPLETE':
      return {
        ...state,
        loadingMatches: false,
        matches: action.payload?.matches || [],
      }
    case 'FAIL_TO_FIND_DASHBOARD':
      return {
        ...state,
        currentDashboard: undefined,
        errorMessage: 'Unable to load dashboard.',
        selectedDashboardId: undefined,
      }
    // Handles all one-off state piece setting
    case 'SET_STATE':
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}
