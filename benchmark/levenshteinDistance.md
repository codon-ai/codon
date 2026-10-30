# Levenshtein Edit Distance
Create a dynamic programming Levenshtein distance function in a single file.

Requirements:
- Export function `levenshteinDistance(a: string, b: string): number`.
- If `a === b`, return `0`. If `a.length === 0`, return `b.length`. If `b.length === 0`, return `a.length`.
- Construct a 2D matrix `dp` of size `(a.length + 1) x (b.length + 1)`.
- Initialize `dp[i][0] = i` for all `i`, and `dp[0][j] = j` for all `j`.
- Iterate `i` from 1 to `a.length` and `j` from 1 to `b.length`:
- If `a[i - 1] === b[j - 1]`, cost is 0; otherwise cost is 1.
- Set `dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)`.
- Return `dp[a.length][b.length]`.
