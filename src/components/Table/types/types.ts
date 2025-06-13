import { ReactNode } from 'react'

export type Dictionary<T> = { [key: string]: T }
export type Entity = { id: number | string }

/************ Table ***************/

export type TableColumn<T extends Entity> = {
  name: string,
  data: (item: T) => ReactNode,
  type?: 'text' | 'number' | 'date'
}

export type TableProps<T extends Entity> = {
  collection?: T[]
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter,
  sort?: TableSort,
  noEntriesMessage?: string,
  pagination?: number,
  page?: number,
}


/************ Sort ***************/

export type TableSort = { by: string, direction?: 'asc' | 'desc' }


/************ Toolbar ***************/

export type TableToolbarProps = {
  collection?: Dictionary<string|number>[]
  filter?: FilterColumns,
  showSearch?: boolean,
  showFilter?: boolean,
  onSearchChange?: (search: string) => void,
  onFilterChange?: (filter: TableFilter) => void,
}


/************ Filter ***************/

export type FilterColumns = (string | [string, 'range', ('number' | 'date')])[]

export type FilterStructure = Dictionary<Dictionary<boolean> | FilterRange>

export type TableFilter = Dictionary<string[] | FilterRange>

export type FilterRange = {
  min?: number | string,
  max?: number | string,
  type: 'number' | 'date',
  parser?: (value: string) => number,
  range: true
}

export type RangeColumn = [string, 'range', ('number' | 'date')]

export type TableFilterProps = {
  filter: FilterStructure,
  onFilterValueChanged: (
    columnName: string,
    value: { name?: string, checked?: boolean, min?: number, max?: number }
  ) => void
}