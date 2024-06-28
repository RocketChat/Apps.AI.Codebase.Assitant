import { parse } from "@typescript-eslint/typescript-estree"
import { namedTypes } from "ast-types"
import path from "path"

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

		let treeNodes: TreeNode[] = []
		for (let node of ast.body) {
			if (namedTypes.ExportNamedDeclaration.check(node))
				node = (node as any).declaration

			if (namedTypes.FunctionDeclaration.check(node))
				/* Functions */
				treeNodes.push(Functions.Handle(node))
			else if (namedTypes.TSInterfaceDeclaration.check(node))
				/* Interfaces */
				treeNodes.push(Interface.Handle(node))
			else if (namedTypes.TSTypeAliasDeclaration.check(node))
				/* Type Aliases */
				treeNodes.push(TypeAlias.Handle(node))
			else if (namedTypes.TSEnumDeclaration.check(node))
				/* Enums */
				treeNodes.push(Enums.Handle(node))
			else if (namedTypes.ClassDeclaration.check(node))
				/* Classes */
				treeNodes.push(Classes.Handle(node))
			else if (namedTypes.TSModuleDeclaration.check(node))
				/* Namespaces */
				treeNodes.push(Namespaces.Handle(node))
			else if (namedTypes.VariableDeclaration.check(node))
				/* Variables */
				treeNodes.push(...VariableDeclarations.Handle(node))
		}

		// Resolve imports
		const parsedImports = new Map<string, string>() // { importName: absolutePath }
		{
			const imports = ast.body
				.filter((node) => namedTypes.ImportDeclaration.check(node)) // Filter out all non-import nodes
				.filter((node) => (node as any).source.value.startsWith(".")) // Filter out all library/non-relative imports
			for (const i of imports) {
				const importName = (i as any).specifiers[0].local.name

				const projectPath = sourceFile.getProjectPath()
				const targetFileAbsolutePath = path
					.resolve(path.join(sourceFile.getFullPath(), (i as any).source.value))
					.replace(/\\/g, "/")
				const targetFileRelativePath = targetFileAbsolutePath.slice(
					projectPath.length
				)

				parsedImports.set(importName, targetFileRelativePath)
			}
		}

		// Replace import names with absolute paths
		for (const treeNode of treeNodes) {
			treeNode.sourceFileRelativePath = sourceFile.getFullPath()
			treeNode.uses = treeNode.uses
				.filter((x) => x.name)
				.map((x) => {
					if (parsedImports.has(x.name)) {
						x.name = `${parsedImports.get(x.name)!}:${x.name}`
					}
					return x
				})
		}

		// Add the nodes to the global reference
		for (const treeNode of treeNodes) {
			const dbNode = DBNode.fromTreeNode(treeNode)
			nodesRef[dbNode.id] = dbNode
		}
	}
}
