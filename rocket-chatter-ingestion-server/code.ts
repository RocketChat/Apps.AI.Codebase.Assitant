interface A {}
interface Calculate {
	(x: TreeNode<TreeNode<Student>>, y: Status): A
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
