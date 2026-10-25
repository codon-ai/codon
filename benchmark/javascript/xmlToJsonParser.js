export function parseXml(xml) {
  const result = {};
  const regex = /<([a-zA-Z0-9_]+)>([^<]*)<\/\1>/g;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const tag = match[1];
    const text = match[2].trim();
    let val;

    if (!isNaN(Number(text)) && text !== "") {
      val = Number(text);
    } else if (text === "true") {
      val = true;
    } else if (text === "false") {
      val = false;
    } else {
      val = text;
    }

    if (tag in result) {
      if (Array.isArray(result[tag])) {
        result[tag].push(val);
      } else {
        result[tag] = [result[tag], val];
      }
    } else {
      result[tag] = val;
    }
  }

  return result;
}
