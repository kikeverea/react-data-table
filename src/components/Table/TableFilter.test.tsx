import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableFilterProp } from './types/types.ts'
import TableFilter from './TableFilter.tsx'

describe('Table Filter', () => {

  const filter: TableFilterProp = {
    'Family': {
      'Feline': false,
      'Canine': true,
      'Seals': true,
      'Fish': true,
      'Primate': false,
    },
    'Type': {
      'Pet': true,
      'Wild': false,
    },
    'Age': { min: 5, max: 8 },
    'Birth': { min: '2019-03-22', max: '2021-03-22' },
  }

  const onFilterChangeMock = vi.fn()

  beforeEach(() => {
    render(<TableFilter filter={ filter } onFilterValueChanged={ onFilterChangeMock }/>)
  })

  test('component has a dialog role, aria modal and is labeled', () => {
    const tableFilter = screen.getByRole('dialog')

    expect(tableFilter).toBeDefined()
    expect(tableFilter.ariaModal).toBe('true')
    expect(tableFilter.ariaLabel).toBe('table filter')
  })

  test('renders all filter labels', () => {
    const family = screen.getByLabelText('Family')
    const type = screen.getByLabelText('Type')
    const age = screen.getByLabelText('Age')
    const birth = screen.getByLabelText('Birth')

    expect(family).toBeDefined()
    expect(type).toBeDefined()
    expect(age).toBeDefined()
    expect(birth).toBeDefined()
  })

  test('renders checkboxes', () => {
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => expect(checkbox).toBeDefined())

    const [ feline, canine, seals, fish, primate, pet, wild ] = checkboxes as HTMLInputElement[]

    expect(feline.checked).toBe(false)
    expect(canine.checked).toBe(true)
    expect(seals.checked).toBe(true)
    expect(fish.checked).toBe(true)
    expect(primate.checked).toBe(false)
    expect(pet.checked).toBe(true)
    expect(wild.checked).toBe(false)
  })

  test('renders number ranges', () => {

    const [min, max] = screen.getAllByRole('textbox') as HTMLInputElement[]

    expect(min).toBeDefined()
    expect(min.ariaLabel).toBe('age-min')
    expect(min.value).toBe('5')

    expect(max).toBeDefined()
    expect(max.ariaLabel).toBe('age-max')
    expect(max.value).toBe('8')
  })

  test('renders date ranges', () => {
    const min = screen.getByLabelText('birth-min') as HTMLInputElement
    const max = screen.getByLabelText('birth-max') as HTMLInputElement

    expect(min).toBeDefined()
    expect(min.value).toBe('2019-03-22')

    expect(max).toBeDefined()
    expect(max.value).toBe('2021-03-22')
  })

  test.each([
    ['Family', 'Feline', { name: 'Feline', checked: true }],
    ['Family', 'Canine', { name: 'Canine', checked: false }],
    ['Family', 'Seals', { name: 'Seals', checked: false }],
    ['Family', 'Fish', { name: 'Fish', checked: false }],
    ['Family', 'Primate', { name: 'Primate', checked: true }],
    ['Type', 'Pet', { name: 'Pet', checked: false }],
    ['Type', 'Wild', { name: 'Wild', checked: true }],
  ])
  ('checking a checkbox calls the handler with the column, value name and checked', async (column, value, result) => {

    const checkbox = screen.getByRole('checkbox', { name: value }) as HTMLInputElement
    await userEvent.click(checkbox)

    expect(onFilterChangeMock).toHaveBeenCalledWith(column, result)
  })

  test('input in a number range calls the handler with the column name and range value', async () => {

    const age = screen.getByRole('group', { name: 'Age' })
    const [min, max] = within(age).getAllByRole('textbox') as HTMLInputElement[]

    await userEvent.type(min, '1')    // appends to the existing text
    expect(onFilterChangeMock).toHaveBeenCalledWith('Age', { min: 51 })

    await userEvent.clear(max)
    await userEvent.type(max, '1')   // appends to the existing text
    expect(onFilterChangeMock).toHaveBeenCalledWith('Age', { max: 81 })
  })

  test('input in a date range calls the handler with the column name and range value', async () => {

    const birth = screen.getByRole('group', { name: 'Birth' })
    const [min, max] = within(birth).getAllByRole('textbox') as HTMLInputElement[]

    await userEvent.type(min, '1')    // appends to the existing text
    expect(onFilterChangeMock).toHaveBeenCalledWith('Birth', { min: '2019-03-221' })

    await userEvent.type(max, '1')   // appends to the existing text
    expect(onFilterChangeMock).toHaveBeenCalledWith('Birth', { max: '2021-03-221' })
  })
})