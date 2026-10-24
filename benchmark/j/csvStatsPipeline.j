NB. export
{{ NB. FD|parseCSV|raw
lines =: ((raw.trim()).split "\n")
[,...rows] =: lines
return. (((rows.map ({{ NB. pE|line
((line.split ',').map ({{ NB. pE|cell
cell.trim()
}}))
}})).filter ({{ NB. pE|[item,category,qty,price]
(((item && category) && (! (isNaN (Number qty)))) && (! (isNaN (Number price))))
}})).map ({{ NB. pE|[item,category,qty,price]
O('item';item;'category';category;'quantity';(Number qty);'price';(Number price))
}}))
}}

NB. export
{{ NB. FD|aggregateByCategory|records
summary =: O''
for_of. {category,quantity,price} : records do.
prev =: (summary.[category] ?? O('totalRevenue';0;'totalQuantity';0;'avgPrice';0))
totalRevenue =: (prev.totalRevenue + (quantity * price))
totalQuantity =: (prev.totalQuantity + quantity)
(summary.[category] = O('totalRevenue';totalRevenue;'totalQuantity';totalQuantity;'avgPrice';((Math.round ((totalRevenue / totalQuantity) * 100)) / 100)))
end.
return. summary
}}

mockCSV =: `
item,category,quantity,price
Apples,Produce,10,1.5
Oranges,Produce,5,2.0
Laptop,Electronics,1,999.0
Mouse,Electronics,2,25.5
`

(console.log (aggregateByCategory (parseCSV mockCSV)))