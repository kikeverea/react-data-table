import {Dispatch, SetStateAction, useMemo, useRef, useState} from 'react'
import {Dictionary, FilterColumns, FilterRange, FilterStructure, RangeColumn} from '../types/types.ts'

type UseFilterReturn = [
  FilterStructure | null | undefined,
  Dispatch<SetStateAction<FilterStructure | null | undefined>>
]

const useFilter = (columns?: FilterColumns, collection?: Dictionary<string|number>[]): UseFilterReturn => {

  const filterVersion = useRef<number>(0)

  const [filterStructure, version] = useMemo<[FilterStructure | {}, number]>((): [FilterStructure | {}, number] =>
      [
        extractFilter(columns, collection),
        filterVersion.current + 1
      ],
    [columns, collection])

  const [filter, setFilter] = useState<FilterStructure | null>()

  if (filterVersion.current != version) {
    setFilter(filterStructure)
    filterVersion.current = version
  }

  return [filter, setFilter]
}

export const extractFilter = (
  columns?: FilterColumns,
  collection?: Dictionary<string|number>[],
  previousState?: FilterStructure
)
: FilterStructure | {} => {

  if (!collection?.length || !columns?.length)
    return {}

  return columns.reduce((filter: FilterStructure, column): FilterStructure => {

    if (isRangeColumn(column)) {
      const [columnName] = column
      filter[columnName] = extractRangeFilter(column, previousState)
    }
    else {
      // noinspection UnnecessaryLocalVariableJS
      const columnName = column
      filter[columnName] = extractBooleanFilter(column, collection, previousState)
    }

    return filter
  }, {})
}

const extractRangeFilter = (column: RangeColumn, previousState?: FilterStructure): FilterRange => {
  const [columnName, _range, type] = column
  const previousRange = previousState && previousState[columnName]

  assertFilterRange(previousRange)

  return previousRange || { type: type, range: true }
}

const extractBooleanFilter = (column: string, collection: Dictionary<string|number>[], previousState?: FilterStructure): Dictionary<boolean> => {
  const columnName = column
  const previousBooleanSet = previousState && previousState[columnName]

  assertNotFilterRange(previousBooleanSet)

  return collection.reduce((filterValue, entity) => {

    const value = String(entity[columnName] || '').trim()

    if (value) {
      const previousFilterValue = previousBooleanSet && previousBooleanSet[value]
      filterValue[value] = previousFilterValue || false
    } else
      console.warn(`Could not find column ${columnName}. Available columns: ${Object.keys(entity).join(', ')}`)

    return filterValue
  },
  {} as Dictionary<boolean>)
}

const isRangeColumn = (column: string | any[]): column is RangeColumn =>
  Array.isArray(column) && column[1] === 'range'

function assertNotFilterRange(value?: { range?: boolean }): asserts value is Dictionary<boolean> {
  if (value?.range)
    throw new Error('Value is a FilterRange')
}

function assertFilterRange(value?: { range?: boolean }): asserts value is FilterRange {
  if (value && !value.range)
    throw new Error('Value is not FilterRange')
}

export default useFilter