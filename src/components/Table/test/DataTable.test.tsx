import {render, screen, within} from '@testing-library/react'
import { TableColumn } from '../types/types.ts'
import {getNameCellsContent, TestData, dataRows, getTestData} from './testUtils.ts'
import DataTable from '../DataTable.tsx'
import userEvent from '@testing-library/user-event'

const collection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

const columns: TableColumn<TestData>[] = [
  { name: 'Name', data: item => `${item.name}`},
  { name: 'Family', data: item => `${item.family}`},
  { name: 'Type', data: item => `${item.type}`},
  { name: 'Age', data: item => `${item.age}`, type: 'number' },
  { name: 'Birth', data: item => `${item.birth}`, type: 'date' },
]

describe('Data Table', () => {

  describe('Without data', () => {
    test('renders empty message', () => {
      render(<DataTable collection={ [] } columns={ columns } />)

      const rows = dataRows()
      const [emptyMessage] = getNameCellsContent(rows)

      expect(rows.length).toBe(1)
      expect(emptyMessage).toBe('No data available')
    })

    test('renders custom empty message', () => {
      render(<DataTable collection={ [] } columns={ columns } noEntriesMessage='No entries'/>)

      const rows = dataRows()
      const [emptyMessage] = getNameCellsContent(rows)

      expect(rows.length).toBe(1)
      expect(emptyMessage).toBe('No entries')
    })
  })

  describe('With data', () => {

    test('renders collection', () => {
      render(<DataTable collection={ collection } columns={ columns } />)

      const rows = dataRows()

      rows.forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')

        cells.forEach((cell, colIndex) => {
          expect(cell.textContent)
            .toBe(getTestData({ collection, row: rowIndex, col: colIndex }))
        })
      })
    })

    describe('Sorting', () => {
      test('sorts rows', () => {
        render(<DataTable collection={ collection } columns={ columns } sortBy={{ column: 'family' }} />)

        const rows = dataRows()
        expect(rows.length).toBe(collection.length)

        // Names in expected order
        const [dog, redFox, cat, lion, goldFish, monkey, seaLion] = getNameCellsContent(rows)

        expect(dog).toBe('Dog')
        expect(redFox).toBe('Red Fox')
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
        expect(goldFish).toBe('Gold Fish')
        expect(monkey).toBe('Monkey')
        expect(seaLion).toBe('Sea Lion')
      })
    })

    describe('Pagination', () => {
      test('paginates data', () => {
        render(<DataTable collection={ collection } columns={ columns } paginate={ 2 }/>)

        const rows = dataRows()
        expect(rows.length).toBe(2)

        // Names in expected order
        const [cat, dog] = getNameCellsContent()

        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
      })
    })


    describe('Search', () => {
      test('renders search box', () => {
        render(<DataTable collection={collection} columns={columns} showSearch={true}/>)

        const searchBar = screen.getByRole('textbox')
        expect(searchBar).toBeDefined()
      })

      test('renders rows that pass the search', async () => {
        render(<DataTable collection={ collection } columns={ columns } />)

        const searchBox = screen.getByLabelText('table search')

        await userEvent.type(searchBox, 'Lion')

        const rows = dataRows()
        const [lion, seaLion] = getNameCellsContent(rows)

        expect(rows.length).toBe(2)
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })
    })

    describe('Filter', () => {

      test('renders filter options', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['family', 'type']}/>)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const filterElement = screen.getByLabelText('table filter')
        const familyParam = screen.getByText('Family')
        const typeParam = screen.getByText('Type')

        expect(filterElement).toBeDefined()
        expect(familyParam).toBeDefined()
        expect(typeParam).toBeDefined()
      })

      test('renders rows that pass the filter', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['Family', 'Type', ['Age', 'range', 'number']]} />)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const felineCheckbox = screen.getByLabelText('Feline')
        const petCheckbox = screen.getByLabelText('Pet')

        await userEvent.click(felineCheckbox)

        const felineRows = dataRows()
        const [cat, lion] = getNameCellsContent(felineRows)

        expect(felineRows.length).toBe(2)
        expect(lion).toBe('Lion')
        expect(cat).toBe('Cat')

        await userEvent.click(petCheckbox)

        const felinePetRows = dataRows()
        const [petCat] = getNameCellsContent(felinePetRows)

        expect(felinePetRows.length).toBe(1)
        expect(petCat).toBe('Cat')
      })

      test('renders rows that pass the range filter', async () => {
        render(<DataTable collection={ collection } columns={ columns } filter={['Family', 'Type', ['Age', 'range', 'number']]} />)

        const showFilterButton = screen.getByLabelText('show filter')
        await userEvent.click(showFilterButton)

        const minRange = screen.getByLabelText('Min')
        const maxRange = screen.getByLabelText('Max')

        await userEvent.type(minRange, '10')
        const minRows = dataRows()

        // Names in expected order
        const [cat, lion, seaLion] = getNameCellsContent(minRows)

        expect(minRows.length).toBe(3)
        expect(cat).toBe('Cat')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')

        await userEvent.type(maxRange, '11')
        const maxRows = dataRows()

        // Names in expected order
        const [catMax] = getNameCellsContent(maxRows)

        expect(maxRows.length).toBe(1)
        expect(catMax).toBe('Cat')
      })
    })
  })
})
