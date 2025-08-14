import {isValidElement, ReactNode} from 'react'
import { Entity, TableProps } from './types.ts'
import { processData } from './dataProcessor.ts'
import styles from './Table.module.css'
import useSort from './useSort.ts'
import usePagination from './usePagination.ts'
import TablePaginator from '../TablePaginator/TablePaginator.tsx'

const Table = <T extends Entity>(
{
  collection,
  columns,
  search,
  filter,
  sortBy,
  paginate,
  page: currentPage,
  noEntriesMessage,
}: TableProps<T>) => {

  const [sort, setSortColumn] = useSort(sortBy)
  const [pagination, setItemsPerPage, setPage] = usePagination(paginate, currentPage || 0)

  // TODO: memoize mapped data (call on column.data)
  // TODO: memoize filtered and searched data, then sort and paginate that data (maybe push state down into SortHeader and Paginator components?)

  const rows = processData(collection, columns, {
    search,
    filter,
    page: pagination?.page,
    paginate: pagination?.itemsPerPage,
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
                onClick={() => setSortColumn(col.name)}>{col.name}
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
        pagination && collection &&
        <TablePaginator
          pagination={ pagination }
          setPage={ setPage }
          setItemsPerPage={ setItemsPerPage }
          collection={ collection }
        />
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

export default Table