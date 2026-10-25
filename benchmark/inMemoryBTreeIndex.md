# In-Memory Indexed Table
Create an in-memory indexed table with secondary field indexing in a single file.

Requirements:
- Export class `IndexedTable<T extends { id: string | number }>`: constructor takes `indexFields: Array<keyof T>`.
- Maintains primary map `records = new Map<string | number, T>()`.
- Maintains secondary indices `indices = new Map<keyof T, Map<any, Set<string | number>>>()`.
- Method `insert(row: T): void`: stores in primary map. For each indexed field, adds `row.id` to the secondary index Set for `row[field]`.
- Method `findById(id: T["id"]): T | undefined`: returns row from primary map.
- Method `findBy(field: keyof T, val: any): T[]`: looks up Set of IDs in secondary index, retrieves corresponding rows from primary map.
- Method `delete(id: T["id"]): boolean`: removes row from primary map and cleans up IDs in all secondary indices.
