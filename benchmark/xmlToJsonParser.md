# Basic XML-to-JSON Parser
Create a regex-based XML subset to JSON parser in a single file without external libraries.

Requirements:
- Export function `parseXml(xml: string): Record<string, any>`.
- Maintain output object `result: Record<string, any> = {}`.
- Match non-nested element pattern `/<([a-zA-Z0-9_]+)>([^<]*)<\/\1>/g`.
- For each matched tag and text: trim text. If value is numeric, convert to `Number(text)`. If `"true"` / `"false"`, convert to boolean.
- If tag already exists in result: convert to array or push to existing array; otherwise assign scalar.
- Return parsed object.
