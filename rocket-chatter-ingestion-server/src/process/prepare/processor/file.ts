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
import { VariableDeclarations } from "./syntax/variableDeclarations"

export class FileProcessor implements IFileProcessor {
	process(sourceFile: ISourceFile, nodesRef: Record<string, DBNode>): void {
		const fileContent = sourceFile.read()
		const ast = parse(fileContent)

		const imports = ast.body.filter((node) =>
			namedTypes.ImportDeclaration.check(node)
		)

		let treeNodes: TreeNode[] = []
		for (let node of ast.body) {
			if (namedTypes.ExportNamedDeclaration.check(node)) {
				node = (node as any).declaration
			}

			if (namedTypes.FunctionDeclaration.check(node)) {
				treeNodes.push(Functions.Handle(node))
			} else if (namedTypes.TSInterfaceDeclaration.check(node)) {
				treeNodes.push(Interface.Handle(node))
			} else if (namedTypes.TSTypeAliasDeclaration.check(node)) {
				treeNodes.push(TypeAlias.Handle(node))
			} else if (namedTypes.TSEnumDeclaration.check(node)) {
				treeNodes.push(Enums.Handle(node))
			} else if (namedTypes.ClassDeclaration.check(node)) {
				treeNodes.push(Classes.Handle(node))
			} else if (namedTypes.TSModuleDeclaration.check(node)) {
				treeNodes.push(Namespaces.Handle(node))
			} else if (namedTypes.VariableDeclaration.check(node)) {
				treeNodes.push(...VariableDeclarations.Handle(node))
			}
		}
		for (const treeNode of treeNodes) {
			console.log(`${sourceFile.getFullPath()}:${treeNode.getID()}`)
		}
	}
}
