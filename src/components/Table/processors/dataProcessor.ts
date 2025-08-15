import {Entity, Primitive, TableColumn, ItemData, TableData } from '../types.ts'
import { FilterRange, TableFilter } from '../../TableFilter/types.ts'
import {isBoolean, isString} from '../../types.ts'
import {normalizeObjectKeys} from '../../util.ts'

type FilterDataArgs = {
  search?: string,
  filter?: TableFilter
}

export const mapToData = <T extends Entity>(collection: T[] = [], columns: TableColumn<T>[]): TableData => {
  return collection.map(item => {
    const data = columns.reduce((data, column) => ({ ...data, ...extractItemData(item, column) }), {} as ItemData)

    return { id: item.id, data }
  })
}

const extractItemData = <T extends Entity>(item: T, column: TableColumn<T>): ItemData =>
  ({ [column.name.toLowerCase()]: { value: column.data(item), presenter: column.presenter }})

export const filterData = (collection: TableData = [], args: FilterDataArgs): TableData => {
  return collection.filter(item => applySearchAndFilter(item.data, args.search, args.filter))
}

const applySearchAndFilter = (
  item: ItemData,
  search?: string,
  filter?: TableFilter
): boolean => {

  if (!search && !filter)
    return true

  let passesFilter = true
  let passesSearch = !search

  const normalizedFilter = filter && normalizeObjectKeys(filter)

  for (const [column, { value }] of Object.entries(item)) {
    passesFilter = !filter || (passesFilter && evaluateFilter(normalizedFilter, column, value))
    passesSearch = !search || passesSearch || evaluateSearch(search, value)
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

const evaluateRangeFilter = (filter: FilterRange, primitiveValue: Primitive): boolean => {
  const value = asNumber(primitiveValue)

  if (!value)
    return true

  const parser = filter.parser

  const min = parser ? parser(filter.min) : asNumber(filter.min)
  const max = parser ? parser(filter.max) : asNumber(filter.max)

  const hasMin = numberPresent(min)
  const hasMax = numberPresent(max)

  if (hasMin && hasMax)
    return value >= min && value <= max

  else if (hasMin)
    return value >= min

  else if (hasMax)
    return value <= max

  else return true
}

const evaluateCompoundFilter = (filter: string[], value: Primitive): boolean => {
  return (
    !filter?.length ||
    filter.some(filterValue => String(value).toLowerCase().includes(filterValue.toLowerCase()))
  )
}

const asNumber = (value: string | number | undefined): number | null => {
  if (!value)
    return null

  if (isBoolean(value))
    return value ? 1 : 0

  if (isString(value))
    return parseFloat(value)

  return value
}
const numberPresent = (value: number | null): value is number =>
  value !== undefined && value !== null && String(value).trim() !== ''