import { TableToolbarProps } from './types/types.ts'
import TableFilter from './TableFilter.tsx'
import useFilterStructure from './hooks/useFilter.ts'
import {useState} from 'react'

const TableToolbar = (
{
  collection,
  filterColumns,
  showSearch=true,
  onSearchChange=() => {},
  onFilterChange=() => {}
}: TableToolbarProps) => {

  const [showFilter, setShowFilter] = useState<boolean>(false)
  const filterStructure = useFilterStructure(filterColumns, collection)

  const hasStructure = filterStructure && Object.keys(filterStructure).length

  return (
    <div>
      { showSearch &&
        <input type='text' onInput={ e => onSearchChange(e.currentTarget.value) } aria-label='table search'/>
      }
      { !!hasStructure &&
        (showFilter
          ? <TableFilter filterStructure={ filterStructure } onFilterValueChanged={ onFilterChange } />
          : <button
              className={ styles.filterButton }
              aria-label='show filter'
              onClick={ () => setShowFilter(true)}
            >
              <FilterIcon className={ styles.filterButtonIcon }/> Filter
            </button>
        )
      }
    </div>
  )
}

export default TableToolbar