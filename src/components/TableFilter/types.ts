import { Dictionary } from '../types.ts'
import { Dispatch } from 'react'

export type FilterParser = (value: any) => number | null

export type TableFilterProps = {
  filterStructure: FilterStructure,
  filter: TableFilter,
  dispatchFilterChange: Dispatch<FilterAction>,
  onCloseFilter: () => void
}

export type FilterStructure = Dictionary<string[] | RangeStructure>

export type RangeStructure = {
  range: true
  type: 'number' | 'date',
  parser?: (value: string) => number
}

export type TableFilter = Dictionary<string[] | FilterRange>

export type FilterRange = {
  min?: number | string,
  max?: number | string,
  parser?: (value: any) => number
}

export type ColumnTogglePayload = { column: string, value: string, selected: boolean }

export type RangeValuePayload = {
  column: string,
  target: 'min' | 'max',
  value: string | number,
  parser?: (value: any) => number
}

export type FilterAction =
  | { type: 'TOGGLE_COLUMN', payload: ColumnTogglePayload }
  | { type: 'SET_COLUMN_RANGE', payload: RangeValuePayload }
  | { type: 'RESET_FILTER' }