export class IndexedTable {
  constructor(indexFields) {
    this.indexFields = indexFields;
    this.records = new Map();
    this.indices = new Map();
    for (const f of indexFields) this.indices.set(f, new Map());
  }
  insert(row) {
    this.records.set(row.id, row);
    for (const f of this.indexFields) {
      const idx = this.indices.get(f);
      const val = row[f];
      if (!idx.has(val)) idx.set(val, new Set());
      idx.get(val).add(row.id);
    }
  }
  findById(id) { return this.records.get(id); }
  findBy(field, val) {
    const ids = this.indices.get(field)?.get(val);
    if (!ids) return [];
    return Array.from(ids).map(id => this.records.get(id)).filter(Boolean);
  }
  delete(id) {
    const row = this.records.get(id);
    if (!row) return false;
    this.records.delete(id);
    for (const f of this.indexFields) {
      const idx = this.indices.get(f);
      const val = row[f];
      idx.get(val)?.delete(id);
    }
    return true;
  }
}
