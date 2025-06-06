import { ReactNode } from 'react'

export type Entity = { id: number | string }

export type FilterRange = {
  min?: number | string,
  max?: number | string,
  parser?: (value: string) => number
}

export type TableFilter = {
  [column: string]: string[] | FilterRange
}

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