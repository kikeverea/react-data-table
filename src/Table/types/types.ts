import { Dispatch, ReactNode } from 'react'

export type Dictionary<T> = { [key: string]: T }
export type Entity = { id: number | string }

export type Primitive = string | number

/************ Table ***************/

export type TableColumn<T extends Entity> = {
  name: string,
  data: (item: T) => Primitive | Primitive[],
  presenter?: (value: any) => ReactNode,
}

export type TableProps<T extends Entity> = {
  collection?: T[]
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter,
  sortBy?: TableSort,
  noEntriesMessage?: string,
  paginate?: number,
  page?: number,
}

/************ Sort ***************/

export type TableSort = { column: string, direction?: 'asc' | 'desc' }


/************ Toolbar ***************/

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


/************ Filter ***************/

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

export type TableFilterProps = {
  filterStructure: FilterStructure,
  filter: TableFilter,
  dispatchFilterChange: Dispatch<FilterAction>,
  onCloseFilter: () => void
}

export type ColumnTogglePayload = { column: string, value: string, selected: boolean }
export type RangeValuePayload = {
  column: string,
  target: 'min' | 'max',
  range: RangeStructure,
  value: string | number
}

export type FilterAction =
  | { type: 'TOGGLE_COLUMN', payload: ColumnTogglePayload }
  | { type: 'SET_COLUMN_RANGE', payload: RangeValuePayload }
  | { type: 'RESET_FILTER' }


/************ DataTable ***************/

export type DataTableProps<T extends Entity> = {
  collection?: T[]
  columns: TableColumn<T>[],
  sortBy?: TableSort,
  noEntriesMessage?: string,
  paginate?: number,
  showSearch?: boolean,
  filter?: FilterColumns,
  page?: number,
}

/************ Guards ***************/

export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
