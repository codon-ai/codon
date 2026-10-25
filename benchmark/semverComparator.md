# Semantic Version Parser and Comparator
Create a SemVer parser and comparator class in a single file without external libraries.

Requirements:
- Export class `SemVer`: properties `major: number`, `minor: number`, `patch: number`.
- Static method `parse(versionStr: string): SemVer`: parses `major.minor.patch` using regex `^(\d+)\.(\d+)\.(\d+)$`. Throws `new Error("Invalid semver string")` if invalid.
- Method `compare(other: SemVer): -1 | 0 | 1`: compares major, then minor, then patch. Returns `1` if this > other, `-1` if this < other, `0` if equal.
- Method `gt(other: SemVer): boolean`: returns `this.compare(other) === 1`.
- Method `lt(other: SemVer): boolean`: returns `this.compare(other) === -1`.
- Method `eq(other: SemVer): boolean`: returns `this.compare(other) === 0`.
- Method `toString(): string`: returns ``${this.major}.${this.minor}.${this.patch}`.
