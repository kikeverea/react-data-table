import { ReactNode } from 'react'

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
  onFilterChange?: (
    columnName: string,
    value: FilterEventValue
  ) => void
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
  onFilterValueChanged: (
    columnName: string,
    value: FilterEventValue
  ) => void
}

export type FilterEventValue =
  { min?: number | string, max?: number | string, parser?: (...args: any[]) => any } |
  { name: string, checked: boolean }


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