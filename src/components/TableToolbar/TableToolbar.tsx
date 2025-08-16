import TableFilter from '../TableFilter/TableFilter.tsx'
import useFilterStructure from './useFilterStructure.ts'
import {useState} from 'react'
import styles from './TableToolbar.module.css'
import SearchIcon from '../../assets/icons/search.svg?react'
import FilterIcon from '../../assets/icons/filter.svg?react'
import {TableToolbarProps} from './types.ts'

const TableToolbar = (
{
  collection,
  filter={},
  filterColumns,
  showSearch=true,
  searchPlaceholder,
  onSearchChange=() => {},
  dispatchFilterChange=() => {},
}: TableToolbarProps) => {

  const [showFilter, setShowFilter] = useState<boolean>(false)
  const filterStructure = useFilterStructure(filterColumns, collection)

  const hasFilterStructure = filterStructure && Object.keys(filterStructure).length

  return (
    <div className={ styles.toolbar }>
      { showSearch &&
        <div className={ styles.searchbarContainer }>
          <input
            type='text'
            className={ styles.searchbar }
            onChange={ e => onSearchChange(e.currentTarget.value) }
            aria-label='table search'
            placeholder={ searchPlaceholder || 'Search' }
          />
          <SearchIcon className={ styles.searchbarIcon } />
        </div>
      }
      { !!hasFilterStructure &&
        <div className={ styles.filterContainer }>

          { showFilter &&
            <div className={styles.filter}>
              <TableFilter
                filterStructure={ filterStructure }
                filter={ filter }
                dispatchFilterChange={ dispatchFilterChange }
                onCloseFilter={ () => setShowFilter(false) }
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