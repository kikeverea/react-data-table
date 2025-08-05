import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterStructure } from '../types/types.ts'
import TableFilter from '../TableFilter.tsx'

describe('Table Filter', () => {

  const parser = (date: string) => new Date(date).getTime()

  const filterStructure: FilterStructure = {
    'Family': ['Feline', 'Canine', 'Seals', 'Fish', 'Primate'],
    'Type': ['Pet', 'Wild',],
    'Age': { type: 'number', range: true },
    'Birth': { type: 'date', range: true, parser: parser }
  }

  const onFilterChangeMock = vi.fn()
  const onCloseFilterMock = vi.fn()

  beforeEach(() => {
    render(
      <TableFilter
        filterStructure={ filterStructure }
        filter={{}}
        onFilterChange={ onFilterChangeMock }
        onCloseFilter={ onCloseFilterMock }
      />)
  })

  test('component has a dialog role, aria modal and is labeled', () => {
    const tableFilter = screen.getByRole('dialog')

    expect(tableFilter).toBeDefined()
    expect(tableFilter.ariaModal).toBe('true')
    expect(tableFilter.ariaLabel).toBe('table filter')
  })

  test('renders all filter labels', () => {
    const family = screen.getAllByLabelText('Family')

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
  })

  test('renders number ranges', () => {
    const min = screen.getByLabelText('age min') as HTMLInputElement
    const max = screen.getByLabelText('age max') as HTMLInputElement

    expect(min).toBeDefined()
    expect(max).toBeDefined()
  })

  test('renders date ranges', () => {
    const min = screen.getByLabelText('birth min') as HTMLInputElement
    const max = screen.getByLabelText('birth max') as HTMLInputElement

    expect(min).toBeDefined()
    expect(max).toBeDefined()
  })

  test('checking a checkbox calls the handler with the column and values', async () => {
    const checkbox = screen.getByRole('checkbox', { name: /Feline/i })
    await userEvent.click(checkbox)

    expect(onFilterChangeMock).toHaveBeenCalledWith({ Family: ['Feline'] })
  })

  test('input in a number range calls the handler with the column name and range value', async () => {

    const age = screen.getByRole('group', { name: 'Age' })
    const [min, max] = within(age).getAllByRole('textbox') as HTMLInputElement[]

    await userEvent.type(min, '1')
    expect(onFilterChangeMock).toHaveBeenLastCalledWith({ 'Age': { min: 1 }})

    await userEvent.type(max, '1')
    expect(onFilterChangeMock).toHaveBeenLastCalledWith({ 'Age': { min: 1, max: 1 }})
  })

  test('input in a date range calls the handler with the column name and range value', async () => {

    const birth = screen.getByRole('group', { name: 'Birth' })
    const [min, max] = within(birth).getAllByRole('textbox') as HTMLInputElement[]

    await userEvent.type(min, '2019-03-22')    // appends to the existing text
    expect(onFilterChangeMock).toHaveBeenLastCalledWith({ 'Birth': { min: '2019-03-22', parser: parser }})

    await userEvent.type(max, '2021-03-22')   // appends to the existing text
    expect(onFilterChangeMock).toHaveBeenLastCalledWith({ 'Birth': { min: '2019-03-22', max: '2021-03-22', parser: parser }})
  })

  test('clicking close button calls its handler', async () => {
    const button = screen.getByRole('button', { name: /close/i })
    await userEvent.click(button)

    expect(onCloseFilterMock).toHaveBeenCalledTimes(1)
  })

  test('clicking reset button calls its handler', async () => {
    const button = screen.getByRole('button', { name: /reset/i })
    await userEvent.click(button)

    expect(onFilterChangeMock).toHaveBeenLastCalledWith({})
  })
})