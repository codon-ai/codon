export function parseCSV(raw) {
  const lines = raw.trim().split("\n");
  const [, ...rows] = lines;

  return rows
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter(([item, category, qty, price]) => item && category && !isNaN(Number(qty)) && !isNaN(Number(price)))
    .map(([item, category, qty, price]) => ({
      item,
      category,
      quantity: Number(qty),
      price: Number(price),
    }));
}

export function aggregateByCategory(records) {
  const summary = {};

  for (const { category, quantity, price } of records) {
    const prev = summary[category] ?? { totalRevenue: 0, totalQuantity: 0, avgPrice: 0 };
    const totalRevenue = prev.totalRevenue + quantity * price;
    const totalQuantity = prev.totalQuantity + quantity;

    summary[category] = {
      totalRevenue,
      totalQuantity,
      avgPrice: Math.round((totalRevenue / totalQuantity) * 100) / 100,
    };
  }

  return summary;
}

const mockCSV = `
item,category,quantity,price
Apples,Produce,10,1.5
Oranges,Produce,5,2.0
Laptop,Electronics,1,999.0
Mouse,Electronics,2,25.5
`;

console.log(aggregateByCategory(parseCSV(mockCSV)));
