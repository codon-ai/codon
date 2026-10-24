# CSV Stats Pipeline
Create a functional data transformation and aggregation pipeline in a single file without external libraries.

Requirements:
- Types:
  - `SaleRecord`: `{ item: string, category: string, quantity: number, price: number }`
  - `CategorySummary`: `{ totalRevenue: number, totalQuantity: number, avgPrice: number }`
- Export function `parseCSV(raw: string): SaleRecord[]`:
  - Drops the header row.
  - Splits rows by comma and trims cells.
  - Filters out rows with empty item/category or non-numeric quantity/price.
  - Returns array of `SaleRecord` with parsed numbers.
- Export function `aggregateByCategory(records: SaleRecord[]): Record<string, CategorySummary>`:
  - Computes `totalRevenue` (`quantity * price`), `totalQuantity`, and `avgPrice` rounded to 2 decimal places (`Math.round((totalRevenue / totalQuantity) * 100) / 100`).
- At the bottom, run the pipeline on sample mock CSV text with categories "Produce" and "Electronics" and `console.log` the summary object.
