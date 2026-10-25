export function chunkArray(arr, size) {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
