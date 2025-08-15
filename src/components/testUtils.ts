import {screen, within} from '@testing-library/react'
import {TableData} from './Table/types.ts'

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

export const parseUserInputDate = (date: string): number | null => {
  if (!date)
    return null

  const [day, month, year] = date.split('-')

  const validDate =
    year && month && day &&
    year.length === 4 &&
    month.length >= 1 &&
    day.length >= 1

  return validDate ? parseDate(`${year}-${month}-${day}`) : null
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

export const names = (data: TableData): string[] => data.map(item => item.data['name'].value as string)

export const get = (collection: TestData[], ...names: string[]): string[] => {
  return names.reduce((items, name) => {
      const item = collection.find(item => item.name.toLowerCase() === name.toLowerCase())

      if (!item)
        throw new Error(`Test error!: No item found with name'${name}'`)

      return item ? [ ...items, item.name ] : items
    },
    [] as string[])
}