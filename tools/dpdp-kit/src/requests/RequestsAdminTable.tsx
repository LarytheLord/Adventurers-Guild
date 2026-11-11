'use client'

import * as React from 'react'
import type { PrincipalRequest } from './types'

export interface RequestsAdminTableProps {
  requests: PrincipalRequest[]
  now?: Date
}

/** Read-only admin list. Wire row actions to the admin PATCH endpoint in your app. */
export function RequestsAdminTable({ requests, now = new Date() }: RequestsAdminTableProps) {
  return (
    <table data-slot="requests-admin-table">
      <caption>Data principal requests</caption>
      <thead>
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Kind</th>
          <th scope="col">Status</th>
          <th scope="col">Identity verified</th>
          <th scope="col">Due</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => {
          const open = r.status === 'received' || r.status === 'in_progress'
          const overdue = open && Date.parse(r.dueAt) < now.getTime()
          return (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.kind}</td>
              <td>{r.status}</td>
              <td>{r.identityVerified ? 'yes' : 'no'}</td>
              <td>
                {r.dueAt.slice(0, 10)}
                {overdue ? ' (OVERDUE)' : ''}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
