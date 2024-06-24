import {parse} from "recast"
import { DBNode } from "../../core/dbNode"
import { IFileProcessor } from "./fileProcessor.types"
import { ISourceFile } from "./sourceFile.types"

export class FileProcessor implements IFileProcessor {
	private processNode(node: DBNode, nodesRef: Record<string, DBNode>): void {}

	process(sourceFile: ISourceFile, nodesRef: Record<string, DBNode>): void {
		const fileContent = sourceFile.read()
		console.log(fileContent)

		try {
			const ast = parse(fileContent)
		} catch (e) {
			console.error(e)
		}
		// throw new Error("Method not implemented.")
	}
}
