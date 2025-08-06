import { DataTableProps, Entity } from './types/types.ts'
import { useReducer, useState } from 'react'
import TableToolbar from './TableToolbar.tsx'
import Table from './Table.tsx'
import filterReducer from './reducers/filterReducer.ts'

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

  const [filter, dispatch] = useReducer(filterReducer, {})
  const [search, setSearch] = useState<string>('')

  return (
    <>
      { (showSearch || filter?.length) &&
        <TableToolbar
          collection={ collection }
          filterColumns={ filterColumns }
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