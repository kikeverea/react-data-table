import {StructureRange, TableFilterProps} from './types/types.ts'
import {ChangeEvent} from 'react'
import styles from './css/TableFilter.module.css'

const isRange = (value: any): value is StructureRange => value.range

const TableFilter = ({ filterStructure, onFilterValueChanged, onCloseFilter, onFilterReset }: TableFilterProps) => {

  const handleRangeValueChanged = (
    e: ChangeEvent<HTMLInputElement>,
    column: string,
    range: StructureRange,
    rangeTarget: 'min' | 'max'): void =>
  {
    const newValue = e.currentTarget.value
    const type = range.type

    const value = type === 'date'
      ? newValue
      : parseFloat(newValue)

    onFilterValueChanged(column, { [rangeTarget]: value, parser: range.parser })
  }

  const handleFilterValueChanged = (e: ChangeEvent<HTMLInputElement>, column: string, valueName: string): void => {
    const checkbox = e.currentTarget
    onFilterValueChanged(column, { name: valueName, checked: checkbox.checked })
  }

  return (
    <div role='dialog' aria-modal="true" aria-label="table filter" className={ styles.filterModal }>
      { filterStructure
        ? Object.entries(filterStructure).map(([columnName, value]) => {

          console.log('columnName', columnName)
          console.log('value', value)

          return (
            <div key={ columnName } className={ styles.filterColumnContainer } role='group' aria-labelledby={`${columnName}-filter-label`}>
              <div id={`${columnName}-filter-label`} className={ styles.filterColumnLabel } aria-label={ columnName }>
                { columnName }
              </div>
              { isRange(value)
                  ? <>
                      <label htmlFor={ `${columnName.toLowerCase()}-min` }>Min</label>
                      <input
                        id={`${columnName.toLowerCase()}-min`}
                        name='min'
                        type="text"
                        aria-label={ `${columnName.toLowerCase()} min` }
                        onChange= { e =>
                          handleRangeValueChanged(e, columnName, value, 'min')
                        }
                      />
                      <label htmlFor={ `${columnName.toLowerCase()}-max` }>Max</label>
                      <input
                        id={`${columnName.toLowerCase()}-max`}
                        name='max'
                        aria-label={ `${columnName.toLowerCase()} max` }
                        type="text"
                        onChange= { e =>
                          handleRangeValueChanged(e, columnName, value, 'max')
                        }
                      />
                    </>
                  : <div className={ styles.checkboxesContainer }>
                      { value.map((valueName) =>
                        <label key={ valueName } className={ styles.filterCheckbox }>
                          <input
                            type='checkbox'
                            name={ valueName.toLowerCase() }
                            className={ styles.checkboxInput }
                            onChange={(e) => handleFilterValueChanged(e, columnName, valueName) }
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
        <button className={ `${styles.button} ${styles.resetButton}` } onClick={ onFilterReset }>
          Reset
        </button>
        <button className={ `${styles.button} ${styles.closeButton}` } onClick={ onCloseFilter }>
          Close
        </button>
      </div>
    </div>
  )
}

export default TableFilter