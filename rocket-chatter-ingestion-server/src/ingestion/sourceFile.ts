import { SourceFile as TSMorphSourceFile } from "ts-morph"
import { DBNode } from "../core/dbNode"
import { ISourceFile } from "./sourceFile.types"

export class SourceFile implements ISourceFile {
	async process(nodesRef: Record<string, DBNode>): Promise<void> {}

	static fromTSMorphSourceFile(sourceFile: TSMorphSourceFile): SourceFile {
		return new SourceFile()
	}
}
