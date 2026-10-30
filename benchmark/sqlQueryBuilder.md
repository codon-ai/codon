# Fluent SQL Query Builder
Create a fluent SQL query builder generating parameterized queries in a single file.

Requirements:
- Export class `SqlQueryBuilder`: maintains `table: string = ""`, `columns: string[] = []`, `whereClauses: string[] = []`, `params: any[] = []`, `orderByCol: string = ""`, `limitVal: number | null = null`.
- Method `select(...cols: string[]): this`: sets columns (defaults to `["*"]`).
- Method `from(table: string): this`: sets table name.
- Method `where(clause: string, paramVal?: any): this`: appends clause (e.g. `"age >= ?"`) and adds parameter if provided.
- Method `orderBy(col: string, dir: "ASC" | "DESC" = "ASC"): this`: sets ordering.
- Method `limit(n: number): this`: sets limit.
- Method `build(): { sql: string; params: any[] }`: constructs SQL string `SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...` and returns with params array.
