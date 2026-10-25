# React useToggle Hook
Create a boolean toggle hook returning state and memoized action handlers in a single file.

Requirements:
- Export function `useToggle(initialValue: boolean = false): [boolean, () => void, () => void, () => void]`.
- Maintain state `value: boolean` initialized to `initialValue`.
- Define `toggle = () => setValue((v) => !v)`.
- Define `setTrue = () => setValue(true)`.
- Define `setFalse = () => setValue(false)`.
- Return tuple `[value, toggle, setTrue, setFalse]`.
