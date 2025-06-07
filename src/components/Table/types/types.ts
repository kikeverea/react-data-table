import { ReactNode } from 'react'

export type Dictionary<T> = { [key: string]: T }
export type Entity = { id: number | string }

export type FilterRange = {
  min?: number | string,
  max?: number | string,
  type?: 'number' | 'date',
  parser?: (value: string) => number
}

export type TableFilter = Dictionary<string[] | FilterRange>
export type TableFilterProp = Dictionary<Dictionary<boolean> | FilterRange>

export type TableSort = { by: string, direction?: 'asc' | 'desc' }

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

export type TableToolbarProps = {
  collection?: Dictionary<string|number>[]
  filter?: [string, 'range' | 'default' | undefined][],
  showSearch?: boolean,
  showFilter?: boolean,
  onSearchChange?: (search: string) => void,
  onFilterChange?: (filter: TableFilter) => void,
}

export type TableFilterProps = {
  filter: TableFilterProp,
  onFilterValueChanged: (
    columnName: string,
    value: { name?: string, checked?: boolean, min?: number, max?: number }
  ) => void
}
