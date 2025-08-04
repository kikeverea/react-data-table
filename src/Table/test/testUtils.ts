import {screen, within} from '@testing-library/react'

export type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

export const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-')
  return `${day}-${month}-${year}`
}

export const dataRows = () => {
  return screen.getAllByRole('row').slice(1)    // rows excluding the header row
}

export const getTestData = ({ collection, row, col }: { collection: TestData[], row: number, col: number }) => {

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
      return String(formatDate(dataRow.birth))
  }
}

export const getNameCellsContent = (rows: HTMLElement[]=dataRows()) => {
  const nameCellIndex = 0

  return rows.map(row =>
    within(row).getAllByRole('cell')[nameCellIndex].textContent)
}