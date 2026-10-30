export function parseCSV(raw) {
  const lines = raw.trim().split("\n");
  lines.shift();
  const records = [];
  for (const line of lines) {
    const [item, category, qtyStr, priceStr] = line.split(",").map(c => c.trim());
    const quantity = Number(qtyStr), price = Number(priceStr);
    if (item && category && !Number.isNaN(quantity) && !Number.isNaN(price)) {
      records.push({ item, category, quantity, price });
    }
  }
  return records;
}
export function aggregateByCategory(records) {
  const res = {};
  for (const r of records) {
    if (!res[r.category]) res[r.category] = { totalRevenue: 0, totalQuantity: 0, avgPrice: 0 };
    res[r.category].totalRevenue += r.quantity * r.price;
    res[r.category].totalQuantity += r.quantity;
  }
  for (const cat in res) {
    const c = res[cat];
    c.avgPrice = Math.round((c.totalRevenue / c.totalQuantity) * 100) / 100;
  }
  return res;
}
const mockCSV = "item,category,quantity,price\nApple,Produce,10,1.5\nBanana,Produce,20,0.8\nTV,Electronics,2,500\nPhone,Electronics,5,800";
console.log(aggregateByCategory(parseCSV(mockCSV)));
