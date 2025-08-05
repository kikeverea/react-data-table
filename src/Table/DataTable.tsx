import {
  TableFilter, DataTableProps, Entity
} from './types/types.ts'

import {useState} from 'react'
import TableToolbar from './TableToolbar.tsx'
import Table from './Table.tsx'

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

  const [filter, setFilter] = useState<TableFilter>({})
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
          onFilterChange={ setFilter }
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

// const buildTableFilter = (column: string, filter: TableFilter, value: FilterEventValue): TableFilter => {
//
//   if (isCheckboxEvent(value)) {
//
//     const valuesArray = filter[column] || []
//
//     assertValueAsArray(valuesArray)
//
//     if (value.checked)
//       filter[column] = [ ...valuesArray, value.name ]
//     else
//       filter[column] = valuesArray.filter(name => name.toLowerCase() !== value.name.toLowerCase())
//   }
//   else {
//     // is range event
//
//     const filterValue = filter[column]
//     filter[column] = { ...(filterValue || {}), ...value }
//   }
//
//   return filter
// }

// const isCheckboxEvent = (value: any): value is { name: string, checked: boolean } =>
//   value.name && value.checked !== undefined
//
// function assertValueAsArray (value: string[] | FilterRange): asserts value is string[] {
//   if (!Array.isArray(value))
//     throw new Error(`Expected value to be a string array, but is a ${typeof value}`)
// }