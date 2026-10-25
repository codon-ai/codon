const transitions = {
  pending: { pay: "paid", cancel: "cancelled" },
  paid: { ship: "shipped", cancel: "cancelled" },
  shipped: { deliver: "delivered" },
  delivered: {},
  cancelled: {},
};

export function transition(order, action) {
  const nextState = transitions[order.state]?.[action];

  if (!nextState) {
    throw new Error(`Cannot transition from '${order.state}' with action '${action}'`);
  }

  return {
    ...order,
    state: nextState,
    updatedAt: new Date(),
  };
}

let order = { id: "ORD-101", state: "pending", updatedAt: new Date() };
console.log("Initial:", order.state);

order = transition(order, "pay");
console.log("After pay:", order.state);

order = transition(order, "ship");
console.log("After ship:", order.state);

order = transition(order, "deliver");
console.log("After deliver:", order.state);
