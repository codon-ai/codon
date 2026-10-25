export class IndexedTable {
  constructor(indexFields) {
    this.indexFields = indexFields;
    this.records = new Map();
    this.indices = new Map();
    for (const field of indexFields) {
      this.indices.set(field, new Map());
    }
  }

  insert(row) {
    this.records.set(row.id, row);
    for (const field of this.indexFields) {
      const val = row[field];
      const indexMap = this.indices.get(field);
      if (!indexMap.has(val)) {
        indexMap.set(val, new Set());
      }
      indexMap.get(val).add(row.id);
    }
  }

  findById(id) {
    return this.records.get(id);
  }

  findBy(field, val) {
    const indexMap = this.indices.get(field);
    if (!indexMap || !indexMap.has(val)) {
      return [];
    }
    const ids = indexMap.get(val);
    const results = [];
    for (const id of ids) {
      const record = this.records.get(id);
      if (record) {
        results.push(record);
      }
    }
    return results;
  }

  delete(id) {
    const record = this.records.get(id);
    if (!record) {
      return false;
    }
    this.records.delete(id);
    for (const field of this.indexFields) {
      const indexMap = this.indices.get(field);
      const val = record[field];
      if (indexMap && indexMap.has(val)) {
        indexMap.get(val).delete(id);
      }
    }
    return true;
  }
}
