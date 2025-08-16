import {isValidElement, ReactNode, useMemo} from 'react'
import {Entity, TableProps, TableData} from './types.ts'
import {mapToData, filterData} from './processors/dataProcessor.ts'
import styles from './Table.module.css'
import useSort from './hooks/useSort.ts'
import usePagination from './hooks/usePagination.ts'
import TablePaginator from '../TablePaginator/TablePaginator.tsx'
import {sortAndPaginateData} from './processors/dataSortAndPaginate.ts'
import SortingHeader from '../SortingHeader/SortingHeader.tsx'

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

  const tableData = useMemo<TableData>(
    () => mapToData(collection, columns),
    [collection, columns]
  )

  const filteredData = useMemo<TableData>(
    () => filterData(tableData, { search, filter }),
    [tableData, search, filter]
  )

  const [sort, setSortColumn] = useSort(sortBy)
  const [pagination, setItemsPerPage, setPage] = usePagination(paginate, currentPage || 0)

  const rows = sortAndPaginateData(filteredData, { pagination, sort })

  return (
    <div className={ styles.tableResponsive }>
      <table className={ styles.table }>
        <SortingHeader
          columns={ columns }
          sort={ sort }
          setSortColumn={ setSortColumn }
        />
        <tbody className={ styles.tableBody }>
          { rows?.length
            ? rows.map(item =>
              <tr key={ item.id } className={ styles.tableRow }>
                { columns.map(column => {

                  const data = item.data[column.name.toLowerCase()]
                  const displayValue = data.presenter ? data.presenter(data.value) : String(data.value)
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