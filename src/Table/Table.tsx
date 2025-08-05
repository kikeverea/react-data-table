import {isValidElement, ReactNode, useState} from 'react'
import {Entity, FilterRange, TableColumn, TableFilter, TableProps, TableSort} from './types/types.ts'
import styles from './css/Table.module.css'

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

  const [pageStart, pageEnd] = pageRange(page, pagination, collection?.length || 0)

  const pages = pagination
    ? Math.ceil((collection?.length || 0) / pagination)
    : 1

  const rows = collection?.length
    ? collection
        .filter(item => applySearchAndFilter(item, columns, search, filter))
        .slice(pageStart, pageEnd)      // paginate
        .sort((item1, item2) => applySort(item1, item2, columns, sort))
    : []

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
                  const value = extractValue(data)
                  const valueSize = determineValueSize(value)

                  return (
                    <td key={`${item.id}-${column.name}`} className={ styles.tableCell }>
                      <div className={ styles[`tableCell${valueSize}`] }>
                        { column.format ? column.format(value) : data }
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

const determineValueSize = (value: string) => {
  const valueLength = value.length

  if (valueLength < 3)
    return 'Xs'

  if (valueLength < 11)
    return 'Sm'

  if (valueLength < 21)
    return 'Md'

  return 'Lg'
}

const applySearchAndFilter = <T extends Entity>(
  item: T,
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter
): boolean => {

  if (!search && !filter)
    return true

  let passesFilter = true
  let passesSearch = !search

  for (const column of columns) {
    const value = extractValue(column.data(item))
    const filterValue = filter?.[column.name]

    passesFilter = passesFilter && (!filterValue || evaluateFilter(filterValue, value))
    passesSearch = passesSearch || !search || value.toLowerCase().includes(search.toLowerCase())
  }

  return passesFilter && passesSearch
}

const applySort = <T extends Entity>(
  item1: T,
  item2: T,
  columns: TableColumn<T>[],
  sort?: TableSort,
): number => {

  if (!sort)
    return 0

  const column = columns.find(column => column.name.toLowerCase() === sort.column.toLowerCase())

  if (!column)
    return 0

  const value1 = extractValue(column.data(item1)).toLowerCase()
  const value2 = extractValue(column.data(item2)).toLowerCase()
  const direction = sort.direction || 'asc'

  switch (column.type || 'text') {
    case 'text':
      return direction === 'asc'
        ? value1.localeCompare(value2)
        : value2.localeCompare(value1)

    case 'number':
      return direction === 'asc'
        ? parseFloat(value1) - parseFloat(value2)
        : parseFloat(value2) - parseFloat(value1)

    case 'date':
      const date1 = new Date(value1)
      const date2 = new Date(value2)

      if (isNaN(date1.getTime())) {
        console.warn(`Invalid date: '${value1}'`)
        return 1  // sort in last position
      }

      if (isNaN(date2.getTime())) {
        console.warn(`Invalid date: '${value2}'`)
        return 1  // sort in last position
      }

      if (date1 < date2)
        return direction === 'asc' ? -1 : 1

      else if (date1 > date2)
        return direction === 'asc' ? 1 : -1

      else return 0

    default:
      throw new Error(`Invalid column type: ${column.type}`)
  }

}

const needsParsing = (value: unknown): value is string => typeof value === 'string'

const evaluateFilter = (filter: string[] | FilterRange, value: string): boolean => {

  const isRange = !Array.isArray(filter)

  if (isRange) {

    const { min, max, parser = (value: string) => parseInt(value) } = filter

    const minNumber = needsParsing(min) ? parser(min) : min
    const maxNumber = needsParsing(max) ? parser(max) : max
    const valueNumber = parser(value)

    if (minNumber !== undefined && maxNumber !== undefined)
      return valueNumber >= minNumber && valueNumber <= maxNumber

    else if (minNumber !== undefined)
      return valueNumber >= minNumber

    else if (maxNumber !== undefined)
      return valueNumber <= maxNumber

    else return true
  }
  else
    return !filter.length || filter.some(filterValue => value.toLowerCase().includes(filterValue.toLowerCase()))
}

const pageRange = (currentPage: number, itemsPerPage: number | undefined, collectionLength: number): readonly [number, number]=> {
  if (!itemsPerPage)
    return [0, collectionLength]

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return [startIndex, endIndex]
}

const paginationInfoMessage = (currentPage: number, itemsPerPage: number, collection?: any[]): string => {
  if (!collection)
    return ''

  const start = currentPage * itemsPerPage
  const end = Math.min(collection.length, start + itemsPerPage)

  return `Showing ${start + 1} to ${end} of ${collection.length} records`
}

export default Table