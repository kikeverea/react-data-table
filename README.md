# React Data Table

A lightweight, dependency-free React table component with **search, filtering, sorting, and pagination** out of the box.

Designed to be:
- **Minimal** – no external dependencies (other than React).
- **Flexible** – works with any data shape via accessor functions.
- **Accessible** – semantic HTML + ARIA attributes for screen readers.
- **Tested** – built with unit and integration tests.

---

## ✨ Features
- Declarative column definitions with `data` and optional `presenter` functions.
- Global **search** (case-insensitive).
- **Column filters** (checkbox filters, range filters for numbers/dates).
- **Sorting** (string, number, date).
- **Pagination** (configurable page size, page navigation).
- **Empty state** (`noEntriesMessage` prop).
- Accessible markup (`role="table"`, `aria-label`s, filter dialog with `role="dialog"`).
- TypeScript support with generics.
- 100% tested with Jest + Testing Library.

---

## 🚀 Quick Start

```tsx
import DataTable from "react-data-table";

type Animal = {
  id: number;
  name: string;
  family: string;
  type: string;
  age: number;
  birth: string;
};

const columns = [
  { name: "Name", data: item => item.name },
  { name: "Family", data: item => item.family },
  { name: "Type", data: item => item.type },
  { name: "Age", data: item => item.age },
  { name: "Birth", data: item => new Date(item.birth), presenter: d => d.toLocaleDateString() },
];

<DataTable
  collection={animals}
  columns={columns}
  paginate={5}
  showSearch
  filter={["Family", "Type", ["Age", "range"]]}
/>;
```

---

## 📊 API

### `<DataTable />`

| Prop               | Type                                                           | Default | Description                                                                 |
|--------------------|----------------------------------------------------------------|---------|-----------------------------------------------------------------------------|
| `collection`       | `T[]`                                                          | `[]`    | Array of entities.                                                          |
| `columns`          | `TableColumn<T>[]`                                             | –       | Column definitions (accessor + optional presenter).                         |
| `sortBy`           | `{ column: string, direction?: "asc" \| "desc" }`              | –       | Initial sort state.                                                         |
| `paginate`         | `number`                                                       | –       | Page size (enables pagination).                                             |
| `showSearch`       | `boolean`                                                      | `true`  | Show global search box.                                                     |
| `filter`           | `FilterColumns`                                                | –       | Enable filters by column (string or range).                                 |
| `noEntriesMessage` | `string`                                                       | –       | Custom message when no rows match.                                          |

---

## 🧪 Testing

All components are tested with [Testing Library](https://testing-library.com/).

---

## ♿ Accessibility

- Uses semantic roles (`row`, `cell`, `columnheader`, `dialog`).
- Inputs and buttons labeled with `aria-label` where necessary.
- Filter modal marked `aria-modal="true"`.
- Keyboard and screen reader friendly by default.

---

## ⚡ Performance

- Rendering **hundreds of rows** is fine.
- For **very large datasets (10k+ rows)**, use **pagination** – this keeps the DOM small and scrolling smooth.
- This component deliberately avoids virtualization to remain dependency-free and simple.
- If your use case requires **spreadsheet-style infinite scrolling**, virtualization (e.g. `@tanstack/react-virtual`) can be added — but that’s outside the scope of this library.

> ✅ Recommendation: paginate large datasets for performance and usability.

---

## 🔮 Roadmap

- [ ] Export functionality (CSV/Excel).
- [ ] Dark mode / theming.
- [ ] Virtualization mode (optional, future).

---

## 📄 License

MIT  
