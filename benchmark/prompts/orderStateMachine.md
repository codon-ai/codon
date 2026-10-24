# Order State Machine
Create an e-commerce order finite state machine in a single file.

Requirements:
- State types:
  - `OrderState = "pending" | "paid" | "shipped" | "delivered" | "cancelled"`
  - `OrderAction = "pay" | "ship" | "deliver" | "cancel"`
  - `Order = { id: string, state: OrderState, updatedAt: Date }`
- State transition lookup table:
  - `pending`: `pay -> "paid"`, `cancel -> "cancelled"`
  - `paid`: `ship -> "shipped"`, `cancel -> "cancelled"`
  - `shipped`: `deliver -> "delivered"`
  - `delivered`: `{}`
  - `cancelled`: `{}`
- Export function `transition(order: Order, action: OrderAction): Order`:
  - Throws `new Error(\`Cannot transition from '\${order.state}' with action '\${action}'\`)` if transition is invalid.
  - Returns a copy of the order with updated `state` and `updatedAt: new Date()`.
- At the bottom, step an order through `"pay"`, `"ship"`, and `"deliver"`, logging the state at each step.
