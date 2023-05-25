import React from 'react'

const Grid = () => {
  const rows = [
    {
      id: 0,
      name: 'Username',
      type: 'Scripted',
      language: 'English',
      genres: 'Nature',
      runtime: '30',
      status: 'Ended',
    },
    {
      id: 1,
      name: 'Username',
      type: 'Scripted',
      language: 'English',
      genres: 'Nature',
      runtime: '30',
      status: 'Ended',
    },
  ]

  const columns = [
    {id: 'name', label: 'Name'},
    {id: 'type', label: 'Type'},
    {id: 'language', label: 'Language'},
    {id: 'genres', label: 'Genre(s)'},
    {id: 'runtime', label: 'Runtime'},
    {id: 'status', label: 'Status'},
  ]

  return (
    <table style={{border: '1px solid #ced3d9', borderRadius: '8px', borderCollapse: 'collapse'}}>
      <thead
        style={{
          minHeight: '48px',
          color: '#181d1f',
          background: '#f6f7f8',
          borderBottom: '1px solid #dfe2e6',
        }}
      >
        <tr>
          {columns.map(headCell => (
            <th style={{padding: '5px 18px'}} key={headCell.id}>
              {headCell.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id}>
            {columns.map(({id}) => (
              <td style={{borderBottom: '1px solid #dfe2e6', padding: '5px 18px'}} key={id}>
                {row[id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Grid
