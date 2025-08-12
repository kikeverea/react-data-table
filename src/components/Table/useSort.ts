import {useState} from 'react'
import {TableSort} from './types.ts'

type SortState = readonly [TableSort | undefined, (headerName: string) => void]

const useSort = (initialSort: TableSort | undefined): SortState => {

  const [sort, setSort] = useState<TableSort | undefined>(initialSort)

  const handleSortChange = (headerName: string): void => {
    if (!sort)
      return setSort({ column: headerName })

    const toggleSortDirection = (direction?: string): 'asc' | 'desc' => direction === 'asc' ? 'desc' : 'asc'

    const isSameColumn = sort.column.toLowerCase() === headerName.toLowerCase()

    const direction = isSameColumn
      ? toggleSortDirection(sort.direction || 'asc')
      : 'asc'

    setSort({ column: headerName, direction: direction })
  }

  return [sort, handleSortChange]
}

export default useSort