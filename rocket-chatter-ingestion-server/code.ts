interface A {
	name(): string
}

interface Printable {
	print(): void
}

interface Loggable {
	log(): void
}

// type Logger = (Printable & Loggable) | A
type Box<T> = { value: T }
type Logger<T> = T extends any[] ? Box<T[number]> : Box<T>
