interface A {}
interface Calculate {
	(x: TreeNode<TreeNode<Student>>, y: Status): A
}

interface Printable {
	print(): void
}

interface Loggable {
	log(): void
}

type Logger = Printable & Loggable

class ConsoleLogger implements Logger {
	print() {
		console.log("Printing...")
	}

	log() {
		console.log("Logging...")
	}
}


interface TreeNode<T> {
	value: T
	v: A
	children: TreeNode<T>[]
}

enum Status {}

class Student {}

interface Thing<T> {
	name: T
	age: number
	e: Status
	s: Student
}

interface Object extends Thing<string> {
	weight: number
}

interface Animal extends Thing<Object>, Object {
	name: string
	age: number
	speak(): void
}
