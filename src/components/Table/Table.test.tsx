import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table from './Table.tsx'
import { TableColumn } from './types/types.ts'

import { parse } from 'date-fns'

type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

describe('Table', () => {

  const columns: TableColumn<TestData>[] = [
    { name: 'Name', data: item => `${item.name}`},
    { name: 'Family', data: item => `${item.family}`},
    { name: 'Type', data: item => `${item.type}`},
    { name: 'Age', data: item => `${item.age}`},
    { name: 'Birth', data: item => `${item.birth}`},
  ]

  const collection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '14-07-2015' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '14-07-2020' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '14-07-2012' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '14-07-2009' },
  ]

  const longCollection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '14-07-2015' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '14-07-2020' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '14-07-2012' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '14-07-2009' },
    { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 16, birth: '22-03-2019' },
    { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 16, birth: '16-11-2022' },
    { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 16, birth: '08-01-2020' },
  ]
  const getTestData = ({ row, col }: { row: number, col: number }) => {

    const dataRow = collection[row]
    switch (col) {
      case 0 :
        return String(dataRow.name)

      case 1 :
        return String(dataRow.family)

      case 2 :
        return String(dataRow.type)

      case 3 :
        return String(dataRow.age)

      case 4 :
        return String(dataRow.birth)
    }
  }

  const getNameCellsContent = (rows: HTMLElement[]) => {
    return rows.map(row => within(row).getAllByRole('cell')[0].textContent)
  }

  describe('Without data', () => {
    test('renders header', () => {
      render(<Table collection={ [] } columns={ columns } />)

      const headerCells = screen.getAllByRole('columnheader')

      expect(headerCells[0].textContent).toBe('Name')
      expect(headerCells[1].textContent).toBe('Family')
      expect(headerCells[2].textContent).toBe('Type')
      expect(headerCells[3].textContent).toBe('Age')
      expect(headerCells[4].textContent).toBe('Birth')
    })

    test('renders empty message', () => {
      render(<Table collection={ [] } columns={ columns } />)

      const emptyMessage = screen.getByText('No data available')
      expect(emptyMessage).toBeDefined()
    })

    test('renders custom empty message', () => {
      render(<Table collection={ [] } columns={ columns } noEntriesMessage='No entries'/>)

      const emptyMessage = screen.getByText('No entries')
      expect(emptyMessage).toBeDefined()
    })
  })

  describe('With data', () => {

    test('renders collection', () => {
      render(<Table collection={ collection } columns={ columns }/>)

      const rows = screen.getAllByRole('row')

      rows.slice(1).forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')
        cells.forEach((cell, colIndex) => {
          expect(cell.textContent)
            .toBe(getTestData({ row: rowIndex, col: colIndex}))
        })
      })
    })

    test('renders rows that pass the search', () => {
      render(<Table collection={ collection } columns={ columns } search='dog' />)

      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('Dog')
    })

    test('renders empty message if no row passes the search', () => {
      render(<Table collection={ collection } columns={ columns } search='no-rows' />)

      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{
          'Family': 'feline',
          'Type': 'wild',
        }}
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')
      expect(cells[0].textContent).toBe('Lion')
    })

    test('renders empty message if no row passes the filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{
        'Family': 'feline',
        'Name': 'dog',
      }} />)

      const rows = screen.getAllByRole('row')

      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the filter and search', () => {
      render(<Table collection={ collection } columns={ columns } search='cat' filter={{
          'Family': 'feline'
        }}
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')
      expect(cells[0].textContent).toBe('Cat')
    })

    test('renders empty message if no row passes the filter and search', () => {
      render(<Table collection={ collection } columns={ columns } search='dog' filter={{ 'Family': 'feline' }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the range filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 8, max: 15 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const lionRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const lionCells = within(lionRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(lionCells[0].textContent).toBe('Lion')
    })


    test('renders rows that pass the range filter, edge cases', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 10, max: 13 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const lionRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const lionCells = within(lionRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(lionCells[0].textContent).toBe('Lion')
    })

    test('renders empty message if no row passes the range filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 18, max: 20 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass a min range filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 12 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 2 = header row + 2 data rows

      const lionRows = rows[1]
      const seaLionRows = rows[2]

      const lionCells = within(lionRows).getAllByRole('cell')
      const seaLionCells = within(seaLionRows).getAllByRole('cell')

      expect(lionCells[0].textContent).toBe('Lion')
      expect(seaLionCells[0].textContent).toBe('Sea Lion')
    })

    test('renders empty message if no row passes the min range filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { min: 18 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the max range filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { max: 12 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const dogRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const dogCells = within(dogRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(dogCells[0].textContent).toBe('Dog')
    })

    test('renders empty message if no row passes the max range filter', () => {
      render(<Table collection={ collection } columns={ columns } filter={{ 'Age': { max: 2 } }} />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + empty message row

      const emptyMessageRow = rows[1]
      const cells = within(emptyMessageRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('No data available')
    })

    test('renders rows that pass the date range filter', () => {
      const dateFormat = 'dd-MM-yyyy'

      render(<Table
        collection={ collection }
        columns={ columns }
        filter={{
          'Birth': {
            min: '14-07-2012',
            max: '14-07-2015',
            parser: date => parse(date, dateFormat, new Date()).getTime()
        }}}
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(3)   // 3 = header row + 2 data rows

      const catRow = rows[1]
      const lionRow = rows[2]

      const catCells = within(catRow).getAllByRole('cell')
      const lionCells = within(lionRow).getAllByRole('cell')

      expect(catCells[0].textContent).toBe('Cat')
      expect(lionCells[0].textContent).toBe('Lion')
    })

    test('renders rows that pass a range filter, filter and search', () => {
      render(<Table
        collection={ collection }
        columns={ columns }
        filter={{ 'Age': { min: 8, max: 16 }, 'Family': 'feline' }}
        search='Lion'
      />)

      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(2)   // 2 = header row + data row

      const filteredRow = rows[1]
      const cells = within(filteredRow).getAllByRole('cell')

      expect(cells[0].textContent).toBe('Lion')
    })

    describe('Pagination', () => {

      test('without pagination, page numbers are not rendered', () => {
        render(<Table collection={ collection } columns={ columns } />)

        const paginationNavigation = screen.queryByLabelText('Pagination Navigation')
        expect(paginationNavigation).toBeNull()
      })

      test('with pagination, render page numbers', () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        expect(paginationNavigation).toBeDefined()

        const pageLinks = within(paginationNavigation).getAllByRole('listitem')
        expect(pageLinks.length).toBe(2)

        pageLinks.forEach((link, ind) => {
          expect(link.textContent).toBe(`${ind + 1}`)
        })
      })

      test('with pagination, render pagination info', () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 2 }/>)

        const paginationInfo = screen.getByRole('status')

        expect(paginationInfo.textContent).toBe(`Showing 1 to 2 of ${longCollection.length} records`)
      })

      test('paginates data', () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(2)

        const [cat, dog] = rows

        const catCells = within(cat).getAllByRole('cell')
        const dogCells = within(dog).getAllByRole('cell')

        expect(catCells[0].textContent).toBe('Cat')
        expect(dogCells[0].textContent).toBe('Dog')
      })

      test('render the selected page data', async () => {
        render(<Table collection={ collection } columns={ columns } pagination={ 2 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageNumbers = within(paginationNavigation).getAllByRole('listitem')

        await userEvent.click(pageNumbers[1])

        const rows = screen.getAllByRole('row').slice(1)
        const [lion, seaLion] = rows

        const lionCells = within(lion).getAllByRole('cell')
        const seaLionCells = within(seaLion).getAllByRole('cell')

        expect(lionCells[0].textContent).toBe('Lion')
        expect(seaLionCells[0].textContent).toBe('Sea Lion')
      })

      test('if more than 6 pages, render navigation arrows', () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 1 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const pageNumbers = within(paginationNavigation).getAllByRole('listitem')
        const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')
        const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')

        expect(pageNumbers.length - 2).toBe(6)
        expect(leftArrow).toBeDefined()
        expect(rightArrow).toBeDefined()
      })

      test('left arrow navigates to previous page', async () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 1 } page={ 4 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')
        await userEvent.click(leftArrow)

        const row = screen.getAllByRole('row').slice(1)[0]
        const nameCell = within(row).getAllByRole('cell')[0]
        const expectedPage = 3

        expect(nameCell.textContent).toBe(longCollection[expectedPage].name)
      })

      test('left arrow navigates to next page', async () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 1 } page={ 4 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')
        await userEvent.click(rightArrow)

        const row = screen.getAllByRole('row').slice(1)[0]
        const nameCell = within(row).getAllByRole('cell')[0]
        const expectedPage = 5

        expect(nameCell.textContent).toBe(longCollection[expectedPage].name)
      })

      test('has select for choosing items per page', () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 2 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageCountSelect = within(paginationNavigation).getByRole('combobox')

        expect(pageCountSelect).toBeDefined()
      })

      test('has select for choosing items per page', async () => {
        render(<Table collection={ longCollection } columns={ columns } pagination={ 2 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageCountSelect = within(paginationNavigation).getByRole('combobox')

        await userEvent.selectOptions(pageCountSelect, '10')

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows).toHaveLength(Math.min(longCollection.length, 10))
      })
    })

    describe('Sorting', () => {
      test('sorts rows ascending', () => {
        render(<Table collection={ collection } columns={ columns } sort={['family']} />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(collection.length)

        // Rows in expected order
        const [dog, cat, lion, seaLion] = rows

        const catNameCell = within(cat).getAllByRole('cell')[0]
        const lionNameCell = within(lion).getAllByRole('cell')[0]
        const dogNameCell = within(dog).getAllByRole('cell')[0]
        const seaLionNameCell = within(seaLion).getAllByRole('cell')[0]

        expect(catNameCell.textContent).toBe('Cat')
        expect(lionNameCell.textContent).toBe('Lion')
        expect(dogNameCell.textContent).toBe('Dog')
        expect(seaLionNameCell.textContent).toBe('Sea Lion')
      })

      test('sorts rows descending', () => {
        render(<Table collection={ collection } columns={ columns } sort={['family', 'desc']} />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(collection.length)

        // Rows in expected order
        const [seaLion, cat, lion, dog] = rows

        const catNameCell = within(cat).getAllByRole('cell')[0]
        const lionNameCell = within(lion).getAllByRole('cell')[0]
        const dogNameCell = within(dog).getAllByRole('cell')[0]
        const seaLionNameCell = within(seaLion).getAllByRole('cell')[0]

        expect(catNameCell.textContent).toBe('Cat')
        expect(lionNameCell.textContent).toBe('Lion')
        expect(dogNameCell.textContent).toBe('Dog')
        expect(seaLionNameCell.textContent).toBe('Sea Lion')
      })

      test('sorts rows that pass a range filter, filter and search', () => {
        render(<Table
          collection={ collection }
          columns={ columns }
          filter={{ 'Age': { min: 8, max: 16 } }}
          search='Lion'
          sort={[ 'name', 'desc']}
        />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(2)

        // Rows in expected order
        const [seaLion, lion] = rows

        const seaLionCells = within(seaLion).getAllByRole('cell')
        const lionCells = within(lion).getAllByRole('cell')

        expect(lionCells[0].textContent).toBe('Lion')
        expect(seaLionCells[0].textContent).toBe('Sea Lion')
      })

      test('sorts a filtered, paginated collection', () => {
        render(<Table collection={ collection } columns={ columns } sort={['family']} pagination={ 2 } />)

        const rows = screen.getAllByRole('row').slice(1)
        expect(rows.length).toBe(2)

        // Rows in expected order
        const [dog, cat] = rows

        const dogCells = within(dog).getAllByRole('cell')
        const catCells = within(cat).getAllByRole('cell')

        expect(dogCells[0].textContent).toBe('Dog')
        expect(catCells[0].textContent).toBe('Cat')
      })

      test('sorts the table by the clicked header', async () => {
        render(<Table collection={ collection } columns={ columns } sort={['family']} />)

        const nameHeader = screen.getAllByRole('columnheader')[0]
        await userEvent.click(nameHeader)

        const rows = screen.getAllByRole('row').slice(1)

        // Rows in expected order
        const [cat, dog, lion, seaLion] = rows

        const catNameCell = within(cat).getAllByRole('cell')[0]
        const dogNameCell = within(dog).getAllByRole('cell')[0]
        const lionNameCell = within(lion).getAllByRole('cell')[0]
        const seaLionNameCell = within(seaLion).getAllByRole('cell')[0]

        expect(catNameCell.textContent).toBe('Cat')
        expect(dogNameCell.textContent).toBe('Dog')
        expect(lionNameCell.textContent).toBe('Lion')
        expect(seaLionNameCell.textContent).toBe('Sea Lion')
      })

      test('toggles sort direction when clicking the sorting header', async () => {
        render(<Table collection={ collection } columns={ columns } sort={['family', 'asc']} />)

        const familyHeader = screen.getAllByRole('columnheader')[1]
        await userEvent.click(familyHeader)

        const rows = screen.getAllByRole('row').slice(1)

        // Rows in expected order
        const [seaLion, cat, lion, dog] = getNameCellsContent(rows)

        expect(cat).toBe('Cat')
        expect(dog).toBe('Dog')
        expect(lion).toBe('Lion')
        expect(seaLion).toBe('Sea Lion')
      })

      test('sorts a paginated collection', () => {

      })
    })
  })
})