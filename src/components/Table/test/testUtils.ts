import {screen, within} from '@testing-library/react'

export type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

export const getTestData = ({ collection, row, col }: { collection: TestData[] ,row: number, col: number }) => {

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