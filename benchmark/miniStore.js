export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();
  return {
    getState: () => state,
    setState: partial => {
      const updates = typeof partial === "function" ? partial(state) : partial;
      state = { ...state, ...updates };
      listeners.forEach(l => l(state));
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
