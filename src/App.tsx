import './App.css'
import Table from "./components/Table/Table.tsx";
import {TableColumn} from "./components/Table/types/types.ts";

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
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '14-07-2015' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '14-07-2020' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '14-07-2012' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '14-07-2009' },
    { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 16, birth: '22-03-2019' },
    { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 16, birth: '16-11-2022' },
    { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 16, birth: '08-01-2020' }
  ]

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Table collection={ collection } columns={ columns } sort={{ by: 'family' }} pagination={ 2 } />
      </div>
    </>
  )
}

export default App
