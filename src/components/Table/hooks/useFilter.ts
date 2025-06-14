import {useMemo, useRef, useState} from 'react'
import {Dictionary, FilterColumns, FilterStructure, StructureRange} from '../types/types.ts'

type UseFilterReturn = FilterStructure

type RangeColumn = [string, 'range', ('number' | 'date'), (value: string) => number]

const useFilter = (columns?: FilterColumns, collection?: Dictionary<string|number>[]): UseFilterReturn => {

  const filterVersion = useRef<number>(0)

  const [filterStructure, version] = useMemo<[FilterStructure | {}, number]>((): [FilterStructure | {}, number] =>
      [
        buildFilterStructure(columns, collection),
        filterVersion.current + 1
      ],
    [columns, collection])

  const [filter, setFilter] = useState<FilterStructure | null>()

  if (filterVersion.current != version) {
    setFilter(filterStructure)
    filterVersion.current = version
  }

  return filter || {}
}

export const buildFilterStructure =
  (columns?: FilterColumns, collection?: Dictionary<string|number>[]): FilterStructure | {} =>
{

  if (!collection?.length || !columns?.length)
    return {}

  return columns.reduce((filter: FilterStructure, column): FilterStructure => {

    if (isRangeColumn(column)) {
      const [columnName] = column
      filter[columnName] = extractRangeFilter(column)
    }
    else {
      // noinspection UnnecessaryLocalVariableJS
      const columnName = column
      filter[columnName] = extractValuesFilter(column, collection)
    }

    return filter
  }, {})
}

const extractRangeFilter = (column: RangeColumn): StructureRange => {
  const [_columnName, _range, type] = column

  return { type: type, range: true }
}

const extractValuesFilter = (column: string, collection: Dictionary<string|number>[]): string[] => {
  const columnName = column

  const values = collection.map((entity) => {

    const value = String(entity[columnName] || '').trim()

    if (value)
      return value
    else {
      console.warn(`Could not find column ${columnName}. Available columns: ${Object.keys(entity).join(', ')}`)
      return ''
    }
  },
  [] as string[])

  return Array.from(new Set(values))  // remove duplicates
}

const isRangeColumn = (column: string | any[]): column is RangeColumn =>
  Array.isArray(column) && column[1] === 'range'

export default useFilter