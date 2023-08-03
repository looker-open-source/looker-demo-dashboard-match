/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import React, { useContext, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import { ExtensionContext } from '@looker/extension-sdk-react'

export interface DashboardEmbedProps {
  dashboardId: string
}

export const DashboardEmbed = ({ dashboardId }: DashboardEmbedProps) => {
  const { extensionSDK } = useContext(ExtensionContext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canceller = (event: any) => {
    return { cancel: !event.modal }
  }

  const ref = useRef<HTMLDivElement>(null)

  const animateDashboardLoad = () => {
    document.getElementById('embedcontainer')?.style.setProperty('opacity', '1')
  }

  useEffect(() => {
    const hostUrl = extensionSDK?.lookerHostData?.hostUrl
    const el = ref.current
    if (el && hostUrl && dashboardId) {
      el.innerHTML = ''
      LookerEmbedSDK.init(hostUrl)
      LookerEmbedSDK.createDashboardWithId(dashboardId)
        .withNext()
        .appendTo(el)
        .withTheme('Dashboard_Match')
        .on('drillmenu:click', canceller)
        .on('drillmodal:explore', canceller)
        .on('dashboard:tile:explore', canceller)
        .on('dashboard:tile:view', canceller)
        .on('dashboard:run:start', animateDashboardLoad)
        .build()
        .connect()
        .catch((error: Error) => {
          // @TODO - This should probably throw a visible error
          // eslint-disable-next-line no-console
          console.error('Connection error', error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId])

  return <EmbedContainer id='embedcontainer' ref={ref} />
}

const EmbedContainer = styled.div`
  backgroundColor: #f7f7f7;
  height: 100%;
  opacity: 0.2;
  animation: fadeIn ease-in ease-out 3s;
  > iframe {
    display: block;
    backgroundColor: #f7f7f7;
    height: 100%;
    width: 100%;
  }
`
