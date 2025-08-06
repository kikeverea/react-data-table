import { Dispatch, ReactNode } from 'react'

export type Dictionary<T> = { [key: string]: T }
export type Entity = { id: number | string }

/************ Table ***************/

export type TableColumn<T extends Entity> = {
  name: string,
  data: (item: T) => ReactNode,
  format?: (value: string) => string,
  type?: 'text' | 'number' | 'date'
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

export type RangeFilter = [string, 'range', ('number' | 'date'), ((value: string) => number)?]

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

export type FilterStructure = Dictionary<string[] | StructureRange>

export type StructureRange = {
  range: true
  type: 'number' | 'date',
  parser?: (value: string) => number
}

export type TableFilter = Dictionary<string[] | FilterRange>

export type FilterRange = {
  min?: number | string,
  max?: number | string,
  type: 'number' | 'date',
  parser?: (value: string) => number
}

export type TableFilterProps = {
  filterStructure: FilterStructure,
  filter: TableFilter,
  dispatchFilterChange: Dispatch<FilterAction>,
  onCloseFilter: () => void
}

export type ColumnTogglePayload = { column: string, value: string, selected: boolean }
export type RangeValuePayload = { column: string, target: 'min' | 'max', type: 'number' | 'date', value: string | number }

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