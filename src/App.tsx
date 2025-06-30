import './App.css'
import {TableColumn} from "./Table/types/types.ts";
import DataTable from './Table/DataTable.tsx'

type Animal = {
  id: number,
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

function App() {

  const columns: TableColumn<Animal>[] = [
    { name: 'Name', data: item => `${item.name}`},
    { name: 'Family', data: item => `${item.family}`},
    { name: 'Type', data: item => `${item.type}`},
    { name: 'Age', data: item => `${item.age}`, type: 'number'},
    { name: 'Birth', data: item => `${item.birth}`, type: 'date'},
  ]

  const collection: Animal[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
    { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 16, birth: '2019-03-22' },
    { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 16, birth: '2022-11-16' },
    { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 16, birth: '2020-08-01' }
  ]

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DataTable collection={ collection } columns={ columns } sortBy={{ column: 'family' }} />
      </div>
    </>
  )
}

export default App
