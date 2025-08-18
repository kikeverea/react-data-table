import styles from '../Table/Table.module.css'
import {Entity, TableColumn, TableSort} from '../Table/types.ts'
import {normalized} from '../util.ts'

type SortingHeaderProps<T extends Entity> = {
  sort?: TableSort,
  columns: TableColumn<T>[],
  setSortColumn: (name: string)=> void,
}

const SortingHeader = <T extends Entity>({ sort, columns, setSortColumn }: SortingHeaderProps<T>) => {

  const column = sort?.column
  const direction = sort?.direction || 'asc'

  return (
    <thead className={ styles.tableHeader }>
      <tr className={ styles.tableRow }>
        { columns.map(col =>
          <th
            key={ col.name }
            className={ `${styles.tableCell} ${column === col.name ? `${styles.sort} ${styles[direction]}` : ''}` }
            onClick={ () => setSortColumn(normalized(col.name)) }
          >
            { col.name }
          </th>
        )}
      </tr>
    </thead>
  )
}

export default SortingHeader