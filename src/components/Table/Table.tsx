import {isValidElement, ReactNode, useState} from 'react'
import {Entity, TableProps, TableSort} from './types.ts'
import { processData } from './dataProcessor.ts'
import styles from './Table.module.css'

const Table = <T extends Entity>(
{
  collection,
  columns,
  search,
  filter,
  sortBy,
  paginate: itemsPerPage,
  page: currentPage,
  noEntriesMessage,
}: TableProps<T>) => {

  const [sort, setSort] = useState<TableSort | undefined>(sortBy)
  const [pagination, setPagination] = useState(itemsPerPage)
  const [page, setPage] = useState(currentPage || 0)

  const handleSortChange = (headerName: string): void => {
    if (!sort)
      return setSort({ column: headerName })

    const toggleSortDirection = (direction?: string): 'asc' | 'desc' => direction === 'asc' ? 'desc' : 'asc'

    const isSameColumn = sort.column.toLowerCase() === headerName.toLowerCase()

    const direction = isSameColumn
      ? toggleSortDirection(sort.direction || 'asc')
      : 'asc'

    setSort({ column: headerName, direction: direction })
  }

  const pages = pagination
    ? Math.ceil((collection?.length || 0) / pagination)
    : 1

  const rows = processData(collection, columns, {
    search,
    filter,
    page,
    paginate: pagination,
    sort
  })

  return (
    <div className={ styles.tableResponsive }>
      <table className={ styles.table }>
        <thead className={ styles.tableHeader }>
          <tr className={ styles.tableRow }>
            { columns.map(col =>
              <th
                key={ col.name }
                className={`${styles.tableCell} ${sort?.column === col.name ? `${styles.sort} ${styles[sort.direction || 'asc']}` : ''}`}
                onClick={() => handleSortChange(col.name)}>{col.name}
              </th>
            )}
          </tr>
        </thead>
        <tbody className={ styles.tableBody }>
          { rows?.length
            ? rows.map(item =>
              <tr key={ item.id } className={ styles.tableRow }>
                { columns.map(column => {
                  const data = column.data(item)
                  const displayValue = column.presenter ? column.presenter(data) : String(data)
                  const valueSize = determineValueSize(displayValue)

                  return (
                    <td key={`${item.id}-${column.name}`} className={ styles.tableCell }>
                      <div className={ styles[`tableCell${valueSize}`] }>
                        { displayValue }
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
            : <tr key='empty-message'>
                <td>{ noEntriesMessage || 'No data available' }</td>
              </tr>
          }
        </tbody>
      </table>
      {
        pagination &&
        <div>
          <span role="status" aria-live="polite">
            { paginationInfoMessage(page, pagination, collection) }
          </span>
          <nav aria-label="Pagination Navigation">
            <ul>
              <select
                id="per-page-select"
                name="per-page-select"
                onChange={ (e) => setPagination(parseInt(e.currentTarget.value)) }
              >
                { pagination < 10 && <option value={ pagination }>{ pagination }</option> }
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              { pages > 6 &&
                <li onClick={ () => setPage(page - 1) } aria-label='Go to previous page'>←</li>
              }
              { Array.from({ length: Math.min(pages, 6) }).map((_u, index: number) =>
                <li
                  key={ index }
                  style={{ padding: '10px', backgroundColor: "#1A84FF", color: 'white', display: 'flex', gap: '16px' }}
                  aria-label={ `Go to page ${index + 1}` }
                  aria-current={ page === index }
                  onClick={() => setPage(index)}
                >
                  { index + 1 }
                </li>
              )}
              { pages > 6 &&
                <li onClick={ () => setPage(page + 1) } aria-label='Go to next page'>→</li>
              }
            </ul>
          </nav>
        </div>
      }
    </div>
  )
}

const extractValue = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number')
    return String(node)

  if (Array.isArray(node))
    return node.map(extractValue).join('')

  if (isValidElement<{ children?: ReactNode }>(node))
    return extractValue(node.props.children)

  return ''
}

const determineValueSize = (node: ReactNode) => {
  const value: string = extractValue(node)
  const valueLength = value.length

  if (valueLength < 3)
    return 'Xs'

  if (valueLength < 11)
    return 'Sm'

  if (valueLength < 21)
    return 'Md'

  return 'Lg'
}

const paginationInfoMessage = (currentPage: number, itemsPerPage: number, collection?: any[]): string => {
  if (!collection)
    return ''

  const start = currentPage * itemsPerPage
  const end = Math.min(collection.length, start + itemsPerPage)

  return `Showing ${start + 1} to ${end} of ${collection.length} records`
}

export default Table