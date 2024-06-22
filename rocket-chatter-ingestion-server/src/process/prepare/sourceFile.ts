import { readFileSync } from "fs"
import { ISourceFile } from "./sourceFile.types"

export class SourceFile implements ISourceFile {
	private _path: string

	constructor(path: string) {
		this._path = path
	}

	read(): string {
		const content = readFileSync(this._path, "utf-8")
		return content
	}
}
