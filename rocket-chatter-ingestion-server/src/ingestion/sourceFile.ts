import { readFileSync } from "fs"
import { DBNode } from "../core/dbNode"
import { ISourceFile } from "./sourceFile.types"

export class SourceFile implements ISourceFile {
	private _path: string

	constructor(path: string) {
		this._path = path
	}

	readFile(): string {
		const content = readFileSync(this._path, "utf-8")
		return content
	}

	async process(nodesRef: Record<string, DBNode>): Promise<void> {
		console.log(this.readFile())
	}
}
