# 0/1 Knapsack Solver
Create a dynamic programming 0/1 Knapsack solver in a single file.

Requirements:
- Export interface `KnapsackResult { maxValue: number; selectedIndices: number[]; }`.
- Export function `knapsack(weights: number[], values: number[], capacity: number): KnapsackResult`.
- Construct dynamic programming table `dp` of dimensions `(weights.length + 1) x (capacity + 1)` filled with `0`.
- Populate `dp[i][w]` considering item `i - 1`: if `weights[i - 1] <= w`, take max of excluding item or including it (`values[i - 1] + dp[i - 1][w - weights[i - 1]]`); otherwise exclude.
- Backtrack from `dp[weights.length][capacity]` to find which item indices were selected.
- Return `{ maxValue: dp[weights.length][capacity], selectedIndices: indices.reverse() }`.
