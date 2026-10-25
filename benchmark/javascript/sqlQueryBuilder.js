export class SqlQueryBuilder {
  constructor() {
    this.table = "";
    this.columns = [];
    this.whereClauses = [];
    this.params = [];
    this.orderByCol = "";
    this.limitVal = null;
  }

  select(...cols) {
    this.columns = cols.length ? cols : ["*"];
    return this;
  }

  from(table) {
    this.table = table;
    return this;
  }

  where(clause, paramVal) {
    this.whereClauses.push(clause);
    if (paramVal !== undefined) {
      this.params.push(paramVal);
    }
    return this;
  }

  orderBy(col, dir = "ASC") {
    this.orderByCol = `${col} ${dir}`;
    return this;
  }

  limit(n) {
    this.limitVal = n;
    return this;
  }

  build() {
    let sql = `SELECT ${this.columns.length ? this.columns.join(", ") : "*"} FROM ${this.table}`;
    if (this.whereClauses.length > 0) {
      sql += ` WHERE ${this.whereClauses.join(" AND ")}`;
    }
    if (this.orderByCol) {
      sql += ` ORDER BY ${this.orderByCol}`;
    }
    if (this.limitVal !== null) {
      sql += ` LIMIT ${this.limitVal}`;
    }
    return {
      sql,
      params: [...this.params],
    };
  }
}
