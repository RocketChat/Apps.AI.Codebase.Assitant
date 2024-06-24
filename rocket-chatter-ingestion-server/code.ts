interface A {
	name(): string
}

interface Printable<T> {
	print(): void
}

type aA = [string, Printable<string>]

class People {}

class Animal {}

interface Loggable<T> extends Printable<T>, aA {
	// someProp: Loggable<string> & (People | Animal)

	log(a: Printable<T> & Loggable<string> & (People | Animal)): TSMethodSignature
}
