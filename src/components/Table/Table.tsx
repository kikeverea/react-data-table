import {isValidElement, ReactNode, useMemo, useState} from 'react'
import {Entity, TableColumn, TableFilter, TableProps, TableSort} from './types/types.ts'

const Table = <T extends Entity>(
  {
  collection,
  columns,
  search,
  filter,
  sort: sortBy,
  pagination: itemsPerPage,
  page: currentPage,
  noEntriesMessage,
}: TableProps<T>) => {

  const header = useMemo(() => columns.map(col => col.name), [columns])

  const [sort, setSort] = useState<TableSort | undefined>(sortBy)
  const [pagination, setPagination] = useState(itemsPerPage)
  const [page, setPage] = useState(currentPage || 0)

  const handleSortChange = (headerName: string): void => {
    if (!sort)
      return setSort({ by: headerName })

    const toggleSortDirection = (direction?: string): 'asc' | 'desc' => direction === 'asc' ? 'desc' : 'asc'

    const isSameColumn = sort.by.toLowerCase() === headerName.toLowerCase()

    const direction = isSameColumn
      ? toggleSortDirection(sort.direction || 'asc')
      : 'asc'

    setSort({ by: headerName, direction: direction })
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
    <>
      <table>
        <thead>
          <tr>
            { header.map(headerName =>
              <th key={ headerName } onClick={ ()=> handleSortChange(headerName) }>{ headerName }</th>)
            }
          </tr>
        </thead>
        <tbody>
          { rows?.length
            ? rows.map(item =>
              <tr key={ item.id }>
                { columns.map(column =>
                  <td key={ `${item.id}-${column.name}` }>
                    { column.data(item) }
                  </td>)
                }
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
    </>
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
    const value = extractValue(column.data(item)).toLowerCase()
    const filterValue = filter?.[column.name]

    passesFilter = passesFilter && (!filterValue || evaluateFilter(filterValue, value))
    passesSearch = passesSearch || !search || value.includes(search.toLowerCase())
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

  const column = columns.find(column => column.name.toLowerCase() === sort.by.toLowerCase())

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

const evaluateFilter = (filter: string | { min?: number | string, max?: number | string, parser?: (value: any) => number }, value: string): boolean => {

  const isRange = typeof filter !== 'string'

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
    return value.includes(filter.toLowerCase())
}

const pageRange = (currentPage: number, pagination: number | undefined, collectionLength: number): readonly [number, number]=> {
  if (!pagination)
    return [0, collectionLength]

  const startIndex = currentPage * pagination
  const endIndex = startIndex + pagination

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