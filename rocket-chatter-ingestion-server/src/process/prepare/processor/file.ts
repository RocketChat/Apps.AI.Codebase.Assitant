import { parse } from "@typescript-eslint/typescript-estree"
import { namedTypes } from "ast-types"

import { DBNode } from "../../../core/dbNode"
import { ISourceFile } from "../sourceFile.types"
import { IFileProcessor } from "./file.types"

import { TreeNode } from "./core/treeNode"
import { Classes } from "./syntax/classes"
import { Enums } from "./syntax/enums"
import { Functions } from "./syntax/functions"
import { Interface } from "./syntax/interface"
import { Namespaces } from "./syntax/namespaces"
import { TypeAlias } from "./syntax/typeAlias"

export class FileProcessor implements IFileProcessor {
	process(sourceFile: ISourceFile, nodesRef: Record<string, DBNode>): void {
		const fileContent = sourceFile.read()

		const ast = parse(fileContent)

		for (const node of ast.body) {
			let treeNode: TreeNode | null = null
			if (namedTypes.FunctionDeclaration.check(node)) {
				treeNode = Functions.Handle(node)
			} else if (namedTypes.TSInterfaceDeclaration.check(node)) {
				treeNode = Interface.Handle(node)
			} else if (namedTypes.TSTypeAliasDeclaration.check(node)) {
				treeNode = TypeAlias.Handle(node)
			} else if (namedTypes.TSEnumDeclaration.check(node)) {
				treeNode = Enums.Handle(node)
			} else if (
				namedTypes.TSModuleDeclaration.check(node) ||
				namedTypes.ExportNamedDeclaration.check(node)
			) {
				treeNode = Namespaces.Handle(node)
			} else if (namedTypes.ClassDeclaration.check(node)) {
				treeNode = Classes.Handle(node)
			}

			console.log(treeNode)
		}

		// throw new Error("Method not implemented.")
	}
}
