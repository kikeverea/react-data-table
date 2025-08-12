import {Entity, Primitive, TableColumn, TableSort} from './types.ts'
import { FilterRange, TableFilter } from '../TableFilter/types.ts'

export type ProcessData = {
  search?: string
  filter?: TableFilter
  page?: number
  paginate?: number
  sort?: TableSort
}

export const processData = <T extends Entity>(
  collection: T[] = [],
  columns: TableColumn<T>[],
  args: ProcessData
): T[] => {

  const { search, filter, page=0, paginate, sort } = args

  const [pageStart, pageEnd] = pageRange(page, paginate, collection.length)

  return collection.length
    ? collection
      .filter(item => applySearchAndFilter(item, columns, search, filter))
      .slice(pageStart, pageEnd)      // paginate
      .sort((item1, item2) => applySort(item1, item2, columns, sort))
    : []
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
    const value = column.data(item)

    passesFilter = passesFilter && evaluateFilter(filter, column.name, value)
    passesSearch = passesSearch || !search || evaluateSearch(search, value)
  }

  return passesFilter && passesSearch
}

const evaluateSearch = (search: string, value: Primitive | Primitive[]) => {
  return String(value).toLowerCase().includes(search.toLowerCase())
}

const evaluateFilter = (filter: TableFilter | undefined, columnName: string, value: Primitive | Primitive[]): boolean => {
  return Array.isArray(value)
    ? value.every(value => evaluateFilterWithValue(filter, columnName, value))
    : evaluateFilterWithValue(filter, columnName, value)
}

const evaluateFilterWithValue = (filter: TableFilter | undefined, columnName: string, value: Primitive): boolean => {

  const columnFilter = filter?.[columnName]

  if (!columnFilter)
    return true

  const isRange = !Array.isArray(columnFilter)

  return isRange
    ? evaluateRangeFilter(columnFilter, value)
    : evaluateCompoundFilter(columnFilter, value)
}

const evaluateRangeFilter = (filter: FilterRange, value: Primitive): boolean => {
  const parser = filter.parser

  const min = parser ? parser(filter.min) : filter.min
  const max = parser ? parser(filter.max) : filter.max

  if (min !== undefined && max !== undefined)
    return value >= min && value <= max

  else if (min !== undefined)
    return value >= min

  else if (max !== undefined)
    return value <= max

  else return true
}

const evaluateCompoundFilter = (filter: string[], value: Primitive): boolean => {
  return (
    !filter?.length ||
    filter.some(filterValue => String(value).toLowerCase().includes(filterValue.toLowerCase()))
  )
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

  const value1 = column.data(item1)
  const value2 = column.data(item2)
  const direction = sort.direction || 'asc'

  const areStrings = isString(value1) && isString(value2)
  const areNumbers = isNumber(value1) && isNumber(value2)
  const areBooleans = isBoolean(value1) && isBoolean(value2)

  if (areStrings)
    return direction === 'asc'
      ? value1.localeCompare(value2)
      : value2.localeCompare(value1)

  else if (areNumbers)
    return direction === 'asc'
      ? value1 - value2
      : value2 - value1

  else if (areBooleans) {
    return direction === 'asc'
      ? Number(value2) - Number(value1)
      : Number(value2) - Number(value1)
  }
  else return 1
}

export const pageRange = (currentPage: number, itemsPerPage: number | undefined, collectionLength: number): readonly [number, number]=> {
  if (!itemsPerPage)
    return [0, collectionLength]

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return [startIndex, endIndex]
}