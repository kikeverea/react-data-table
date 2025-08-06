import {FilterRange, StructureRange, TableFilterProps} from './types/types.ts'
import {ChangeEvent} from 'react'
import styles from './css/TableFilter.module.css'

const isRange = (value: any): value is StructureRange => value.range

const TableFilter = ({ filterStructure, filter={}, dispatchFilterChange, onCloseFilter }: TableFilterProps) => {

  const handleFilterValueChanged = (e: ChangeEvent<HTMLInputElement>, column: string, value: string): void => {
    const checkbox = e.currentTarget
    dispatchFilterChange({ type: 'TOGGLE_COLUMN', payload: { column, value, selected: checkbox.checked }})
  }

  const handleRangeValueChanged = (
    e: ChangeEvent<HTMLInputElement>,
    column: string,
    range: StructureRange,
    target: 'min' | 'max'): void =>
  {
    const input = e.currentTarget
    dispatchFilterChange({ type: 'SET_COLUMN_RANGE', payload: { column, target, value: input.value, type: range.type }})
  }

  return (
    <div role='dialog' aria-modal="true" aria-label="table filter" className={ styles.filterModal }>
      { filterStructure
        ? Object.entries(filterStructure).map(([columnName, value]) => {

          const filterValues = filter[columnName]

          return (
            <div key={ columnName } className={ styles.filterColumnContainer } role='group' aria-label={ columnName }>
              <div id={`${columnName.toLowerCase()}-filter-label`} className={ styles.filterColumnLabel } role='label' >
                { columnName }
              </div>
              { isRange(value)
                  ? <div className={ styles.rangesContainer }>
                      <div>
                        <label htmlFor={ `${columnName.toLowerCase()}-min` }>Min</label>
                        <input
                          type="text"
                          id={`${columnName.toLowerCase()}-min`}
                          className={ styles.rangeInput }
                          name='min'
                          aria-label={ `${columnName.toLowerCase()} min` }
                          value={ getRangeLimit(filterValues as FilterRange, 'min') }
                          onChange= { e => handleRangeValueChanged(e, columnName, value, 'min') }
                        />
                      </div>
                      <div>
                        <label htmlFor={ `${columnName.toLowerCase()}-max` }>Max</label>
                        <input
                          type="text"
                          id={`${columnName.toLowerCase()}-max`}
                          className={ styles.rangeInput }
                          name='max'
                          aria-label={ `${columnName.toLowerCase()} max` }
                          value={ getRangeLimit(filterValues as FilterRange, 'max') }
                          onChange= { e => handleRangeValueChanged(e, columnName, value, 'max') }
                        />
                      </div>
                    </div>
                  : <div className={ styles.checkboxesContainer }>
                      { value.map((valueName) =>
                        <label key={ valueName } className={ styles.filterCheckbox }>
                          <input
                            type='checkbox'
                            name={ valueName.toLowerCase() }
                            className={ styles.checkboxInput }
                            checked={ !!filterValues && isInValues(valueName, filterValues as string[]) }
                            onChange={ e => handleFilterValueChanged(e, columnName, valueName) }
                          />
                          <span className={ styles.checkboxBox } aria-hidden="true"></span>
                          <span className={ styles.checkboxLabel }>
                            { valueName }
                          </span>
                        </label>
                      )}
                    </div>
              }
            </div>
          )})
        : 'No data available'
      }
      <div className={ styles.buttonsContainer }>
        <button className={ `${styles.button} ${styles.resetButton}` } onClick={ () => dispatchFilterChange({ type: 'RESET_FILTER' })}>
          Reset
        </button>
        <button className={ `${styles.button} ${styles.closeButton}` } onClick={ onCloseFilter }>
          Close
        </button>
      </div>
    </div>
  )
}

const getRangeLimit = (range: FilterRange, limit: 'min'|'max'): string => {
  const rangeLimit = range && range[limit]
  return rangeLimit ? String(rangeLimit) : ''
}

const isInValues = (value: string, values: string[]): boolean =>
  values.includes(value)

export default TableFilter