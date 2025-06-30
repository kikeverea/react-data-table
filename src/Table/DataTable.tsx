import {
  FilterEventValue,
  FilterRange,
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

  const updateFilter = (column: string, value: FilterEventValue) => {
    const tableFilter: TableFilter = buildTableFilter(column, filter, value)
    setFilter({ ...tableFilter })
  }

  return (
    <>
      { (showSearch || filter?.length) &&
        <TableToolbar
          collection={ collection }
          filterColumns={ filterColumns }
          showSearch={ showSearch }
          onSearchChange={ setSearch }
          onFilterChange={ updateFilter }
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

const buildTableFilter = (column: string, filter: TableFilter, value: FilterEventValue): TableFilter => {

  if (isCheckboxEvent(value)) {

    let valuesArray = filter[column]

    if (!valuesArray) {
      valuesArray = []
      filter[column] = valuesArray
    }

    assertValueAsArray(valuesArray)

    if (value.checked)
      valuesArray.push(value.name)
    else
      valuesArray.filter(name => name !== value.name)
  }
  else {
    // is range event

    const filterValue = filter[column]
    filter[column] = { ...(filterValue || {}), ...value }
  }

  return filter
}

const isCheckboxEvent = (value: any): value is { name: string, checked: boolean } =>
  value.name && value.checked !== undefined

function assertValueAsArray (value: string[] | FilterRange): asserts value is string[] {
  if (!Array.isArray(value))
    throw new Error(`Expected value to be a string array, but is a ${typeof value}`)
}