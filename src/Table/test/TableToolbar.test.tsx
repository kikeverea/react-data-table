import { render, screen } from '@testing-library/react'
import TableToolbar from '../TableToolbar.tsx'
import { TestData } from './testUtils.ts'
import userEvent from '@testing-library/user-event'

describe('Table Toolbar', () => {

  describe('Search', () => {
    test('Renders search bar by default', () => {
      render(<TableToolbar />)

      const searchBar = screen.getByLabelText('table search')
      expect(searchBar).toBeDefined()
    })

    test('Shows given placeholder', () => {
      render(<TableToolbar searchPlaceholder='Test placeholder' />)

      const searchBar = screen.getByPlaceholderText('Test placeholder')
      expect(searchBar).toBeDefined()
    })

    test("Doesn't show search bar if indicated", () => {
      render(<TableToolbar showSearch={ false }/>)

      const searchBar = screen.queryByLabelText('table search')
      expect(searchBar).toBeNull()
    })

    test('Calls search change handler', async () => {
      const onSearchChangeMock = vi.fn()

      render(<TableToolbar onSearchChange={ onSearchChangeMock }/>)

      const searchBar = screen.getByRole('textbox')
      await userEvent.type(searchBar, 'Hello')

      expect(onSearchChangeMock).toHaveBeenCalledWith('Hello')
    })
  })

  describe('Filter', () => {
    const collection: TestData[] = [
      { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
      { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' }
    ]

    test("Doesn't show filter no columns given", () => {
      render(<TableToolbar collection={[]}/>)

      const showFilterButton = screen.queryByLabelText('show filter')
      expect(showFilterButton).toBeNull()
    })

    test("Doesn't show filter if empty columns", () => {
      render(<TableToolbar filterColumns={[]} collection={[]}/>)

      const showFilterButton = screen.queryByLabelText('show filter')
      expect(showFilterButton).toBeNull()
    })

    test("Renders show filter button", () => {
      render(<TableToolbar filterColumns={['family', 'type']} collection={ collection } />)

      const showFilterButton = screen.getByLabelText('show filter')
      expect(showFilterButton).toBeDefined()
    })

    test('Displays filter', async () => {
      render(<TableToolbar filterColumns={['family', 'type']} collection={ collection } />)

      const showFilterButton = screen.getByLabelText('show filter')
      await userEvent.click(showFilterButton)

      const filterElement = screen.getByLabelText('table filter')
      const familyParam = screen.getByLabelText('family')
      const typeParam = screen.getByLabelText('type')

      expect(filterElement).toBeDefined()
      expect(familyParam).toBeDefined()
      expect(typeParam).toBeDefined()
    })

    test('Calls filter change handler', async () => {
      const onFilterChangeMock = vi.fn()

      render(
        <TableToolbar
          showSearch={ false }
          filterColumns={['family', 'type', ['age', 'range', 'number']]}
          collection={ collection }
          onFilterChange={ onFilterChangeMock }
        />
      )

      const filterButton = screen.getByLabelText('show filter')
      await userEvent.click(filterButton)

      const felineCheckbox = screen.getAllByRole('checkbox')[0]
      await userEvent.click(felineCheckbox)
      expect(onFilterChangeMock).toHaveBeenCalledWith('family', { name: 'Feline', checked: true })

      const canineCheckbox = screen.getAllByRole('checkbox')[1]
      await userEvent.click(canineCheckbox)
      expect(onFilterChangeMock).toHaveBeenCalledWith('family', { name: 'Feline', checked: true })

      const petCheckbox = screen.getAllByRole('checkbox')[2]
      await userEvent.click(petCheckbox)
      expect(onFilterChangeMock).toHaveBeenCalledWith('type', { name: 'Pet', checked: true })

      await userEvent.click(felineCheckbox)
      expect(onFilterChangeMock).toHaveBeenCalledWith('family', { name: 'Feline', checked: false })

      const minAge = screen.getByLabelText('age min')
      await userEvent.type(minAge, '5')
      expect(onFilterChangeMock).toHaveBeenCalledWith('age', { min: 5 })

      const maxAge = screen.getByLabelText('age max')
      await userEvent.type(maxAge, '10')
      expect(onFilterChangeMock).toHaveBeenCalledWith('age', { max: 10 })

    })
  })

})

