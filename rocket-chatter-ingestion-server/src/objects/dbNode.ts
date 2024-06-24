export class DBNode {
	name: string = ""
	type: string = ""
	body: string = ""
	uses: {
		name: string
		type: string
	}[] = []

	constructor(name: string, type: string, body: string) {
		this.name = name
		this.type = type
		this.body = body
	}

	toString() {
		return `${this.name} (${this.type})`
	}

	pushUse(...uses: { name: string; type: string }[]) {
		for (const use of uses) {
			if (this.uses.findIndex((u) => u.name == use.name) !== -1) continue
			this.uses.push(use)
		}
	}
}
