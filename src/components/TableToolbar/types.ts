import {FilterAction, TableFilter} from '../TableFilter/types.ts'
import {Dispatch} from 'react'
import {Dictionary} from '../types.ts'

export type RangeFilter = [string, 'range', ('number' | 'date'), ((value: any) => number)?]

export type FilterColumns = (string | RangeFilter)[]

export type TableToolbarProps = {
  collection?: Dictionary<string|number>[]
  search?: string,
  showSearch?: boolean,
  searchPlaceholder?: string,
  filterColumns?: FilterColumns,
  onSearchChange?: (search: string) => void,
  filter?: TableFilter,
  dispatchFilterChange?: Dispatch<FilterAction>,
}