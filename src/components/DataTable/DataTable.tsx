import {Entity, TableColumn, TableSort} from '../Table/types.ts'
import { useReducer, useState } from 'react'
import TableToolbar from '../TableToolbar/TableToolbar.tsx'
import Table from '../Table/Table.tsx'
import filterReducer from '../TableFilter/filterReducer.ts'
import {FilterColumns} from '../TableToolbar/types.ts'
import { buildFilter } from '../TableToolbar/filterBuilder.ts'

export type DataTableProps<T extends Entity> = {
  collection?: T[]
  columns: TableColumn<T>[],
  sortBy?: TableSort,
  noEntriesMessage?: string,
  paginate?: number,
  showSearch?: boolean,
  filter?: FilterColumns
}

const DataTable = <T extends Entity> (
{
  collection,
  columns,
  sortBy,
  filter: filterColumns,
  showSearch=true,
  paginate,
  noEntriesMessage,
}: DataTableProps<T>) => {

  const [filter, dispatch] = useReducer(
    filterReducer,
    undefined,
    () => filterColumns && collection ? buildFilter({ columns: filterColumns, collection }) : {}
  )

  const [search, setSearch] = useState<string>('')

  return (
    <>
      { (showSearch || filter?.length) &&
        <TableToolbar
          showSearch={ showSearch }
          onSearchChange={ setSearch }
          filter={ filter }
          dispatchFilterChange={ dispatch }
        />
      }
      <Table
        collection={ collection }
        columns={ columns }
        search={ search }
        filter={ filter }
        sortBy={ sortBy }
        paginate={ paginate }
        noEntriesMessage={ noEntriesMessage }
      />
    </>
  )
}

export default DataTable