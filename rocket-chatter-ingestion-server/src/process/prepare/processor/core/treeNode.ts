export class TreeNode {
	name: string = ""
	type: string = ""
	body: string = ""

	lineNumber: number
	columnNumber: number

	uses: {
		name: string
		type: string
	}[] = []

	constructor(
		name: string,
		type: string,
		body: string,
		lineNumber: number,
		columnNumber: number
	) {
		this.name = name
		this.type = type
		this.body = body
		this.lineNumber = lineNumber
		this.columnNumber = columnNumber
	}

	toString() {
		return `${this.name} (${this.type})`
	}

	getID(): string {
		return `${this.name}:${this.type}:${this.lineNumber}:${this.columnNumber}`
	}

	pushUse(...uses: { name: string; type: string }[]) {
		for (const use of uses) {
			if (this.uses.findIndex((u) => u.name == use.name) !== -1) continue
			this.uses.push(use)
		}
	}
}