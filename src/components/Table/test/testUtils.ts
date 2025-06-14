import {TestData} from './Table.test.tsx'
import {screen, within} from '@testing-library/react'

export const collection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

export const getTestData = ({ row, col }: { row: number, col: number }) => {

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

export const getNameCellsContent = (collection?: HTMLElement[]) => {
  const nameCellIndex = 0

  const rows = collection
    ? collection
    : screen.getAllByRole('row').slice(1)   // rows excluding the header row

  return rows.map(row => within(row).getAllByRole('cell')[nameCellIndex].textContent)
}