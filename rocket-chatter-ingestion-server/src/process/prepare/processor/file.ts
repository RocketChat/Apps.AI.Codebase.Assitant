import { parse } from "@typescript-eslint/typescript-estree"
import { namedTypes } from "ast-types"
import { DBNode } from "../../../core/dbNode"
import { ISourceFile } from "../sourceFile.types"
import { IFileProcessor } from "./file.types"
import { Namespaces } from "./syntax/namespaces"

export class FileProcessor implements IFileProcessor {
	private processNode(node: DBNode, nodesRef: Record<string, DBNode>): void {}

	process(sourceFile: ISourceFile, nodesRef: Record<string, DBNode>): void {
		const fileContent = sourceFile.read()
		console.log(fileContent)

		const ast = parse(fileContent)

		for (const node of ast.body) {
			if (namedTypes.FunctionDeclaration.check(node)) {
				// Functions.Handle(node)
			} else if (namedTypes.TSInterfaceDeclaration.check(node)) {
				// Interface.Handle(node)
			} else if (namedTypes.TSTypeAliasDeclaration.check(node)) {
				// TypeAlias.Handle(node)
			} else if (namedTypes.TSEnumDeclaration.check(node)) {
				// Enums.Handle(node)
			} else if (
				namedTypes.TSModuleDeclaration.check(node) ||
				namedTypes.ExportNamedDeclaration.check(node)
			) {
				Namespaces.Handle(node)
			} else if (namedTypes.ClassDeclaration.check(node)) {
				// Classes.Handle(node)
			}
		}

		// throw new Error("Method not implemented.")
	}
}
