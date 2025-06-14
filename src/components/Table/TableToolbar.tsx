import { TableToolbarProps } from './types/types.ts'
import TableFilter from './TableFilter.tsx'
import useFilterStructure from './hooks/useFilter.ts'

const TableToolbar = (
{
  collection,
  filterColumns,
  showSearch=true,
  onSearchChange=() => {},
  onFilterChange=() => {}
}: TableToolbarProps) => {

  const showFilter = filterColumns?.length
  const filterStructure = showFilter && useFilterStructure(filterColumns, collection)

  return (
    <div>
      { showSearch &&
        <input type='text' onInput={ e => onSearchChange(e.currentTarget.value) } aria-label='table search'/>
      }
      { filterStructure && Object.keys(filterStructure).length > 0 &&
        <TableFilter filterStructure={ filterStructure } onFilterValueChanged={ onFilterChange } />
      }
    </div>
  )
}

export default TableToolbar