let b = 4
let c = 5

function getValue(a: number): number {
	return a
}

enum ComputedEnum {
	First = 1,
	Sixth = c,
	Seventh = new A<P>(),
	Second = getValue(b),
	Third = (() => {
		return 3
	})(),
	Fourth = (() => 4)(),
	Fifth = (function () {
		return 5
	})(),
}
