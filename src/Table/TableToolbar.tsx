import { TableToolbarProps } from './types/types.ts'
import TableFilter from './TableFilter.tsx'
import useFilterStructure from './hooks/useFilter.ts'
import {useState} from 'react'
import styles from './css/TableToolbar.module.css'
import SearchIcon from './resources/search.svg?react'
import FilterIcon from './resources/filter.svg?react'

const TableToolbar = (
{
  collection,
  filterColumns,
  showSearch=true,
  searchPlaceholder,
  onSearchChange=() => {},
  onFilterChange=() => {},
  onFilterReset=() => {}
}: TableToolbarProps) => {

  const [showFilter, setShowFilter] = useState<boolean>(false)
  const filterStructure = useFilterStructure(filterColumns, collection)

  const hasStructure = filterStructure && Object.keys(filterStructure).length

  return (
    <div className={ styles.toolbar }>
      { showSearch &&
        <div className={ styles.searchbarContainer }>
          <input
            type='text'
            className={ styles.searchbar }
            onInput={ e => onSearchChange(e.currentTarget.value) }
            aria-label='table search'
            placeholder={ searchPlaceholder || 'Search' }
          />
          <SearchIcon className={ styles.searchbarIcon } />
        </div>
      }
      { !!hasStructure &&
        <div className={ styles.filterContainer }>

          { showFilter &&
            <div className={styles.filter}>
              <TableFilter
                filterStructure={ filterStructure }
                onFilterValueChanged={ onFilterChange }
                onCloseFilter={ () => setShowFilter(false) }
                onFilterReset={ onFilterReset }
              />
            </div>
          }

          <button
            className={ styles.filterButton }
            aria-label='show filter'
            onClick={ () => setShowFilter(!showFilter)}
          >
            <FilterIcon className={ styles.filterButtonIcon }/> <span className={ styles.filterButtonLabel }>Filter</span>
          </button>
        </div>
      }
    </div>
  )
}

export default TableToolbar