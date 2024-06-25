export namespace SomeNamespace {
	export class Employee<T> extends Human {
		private _salary: number = 0
		private _name: T

		constructor(name: T, salary: number) {
			this._name = name
			this._salary = salary
		}

		get salary(): number {
			return this._salary
		}

		set salary(value: number) {
			if (value >= 0) {
				this._salary = value
			} else {
				throw new Error("Salary cannot be negative.")
			}
		}

		dumb<B>(a: T, b: B) {
			return a
		}
	}

	export function foo() {
		return 1
	}

	export const bar = 2

	export const j = () => {}

	export const k = function () {}
}
