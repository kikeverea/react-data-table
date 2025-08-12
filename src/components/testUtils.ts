import {screen, within} from '@testing-library/react'

export type TestData = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

export const formatDate = (dateMillis: number): string => {
  const date = new Date(dateMillis)
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
}

export const parseDate = (date: string): number => {
  return new Date(date).getTime()
}

export const getTestData = ({ collection, row, col }: { collection: TestData[], row: number, col: number }) => {

  const data = collection[row]

  switch (col) {
    case 0 :
      return String(data.name)

    case 1 :
      return String(data.family)

    case 2 :
      return String(data.type)

    case 3 :
      return String(data.age)

    case 4 :
      return formatDate(parseDate(data.birth))
  }
}

export const dataRows = () => {
  return screen.getAllByRole('row').slice(1)    // rows excluding the header row
}

export const getNameCellsContent = (rows: HTMLElement[]=dataRows()) => {
  const nameCellIndex = 0

  return rows.map(row =>
    within(row).getAllByRole('cell')[nameCellIndex].textContent)
}