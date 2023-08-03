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

import React from 'react'
import { List, ListItem, Heading, SpaceVertical } from '@looker/components'
import { Similarity } from './dashboardData'

interface DashboardListProps {
  dashboards: Similarity[]
  current?: string
  selectDashboard: (id: string) => void
}

export const DashboardList = ({
  current = '',
  dashboards,
  selectDashboard,
}: DashboardListProps) => {
  return (
    <SpaceVertical paddingY={20}>
      <Heading as="h3" style={{
        width:'100%',
        height:'2vh',
        zIndex:1,
        /* From https://css.glass */
        background: 'rgba(255, 255, 255, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)'
        }}>Recommended Dashboards</Heading>
      <div style={{
        overflowY:'scroll',
        height:'50vh'
      }}>
      <List width="100%">
        {dashboards.map(({ id, metadata, summary }, index) => {
          const { elementId, elementTitle, title } = metadata
          const bestElement = elementTitle || elementId
          const description = (
            <>
              {bestElement ? <strong>Best element: </strong> : null}
              {bestElement}
              {bestElement ? <br /> : null}
              {summary}
            </>
          )
          return (
            <ListItem
            onClick={() => selectDashboard(id)}
            key={id}
            description={description}
            selected={id === current}
            ripple
            style={{
              borderRadius: '10px',
              margin: '5px',
            }}
            >
              {index + 1}. {title}
            </ListItem>
          )
        })}
      </List>
      </div>
    </SpaceVertical>
  )
}
