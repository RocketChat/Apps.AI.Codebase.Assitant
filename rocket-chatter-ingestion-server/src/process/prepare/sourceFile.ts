import { readFileSync } from "fs"
import { TreeNode } from "./processor/core/treeNode"
import { ISourceFile } from "./sourceFile.types"

export class SourceFile implements ISourceFile {
	private _path: string
	private _syntaxNodes: Record<string, TreeNode> = {}

	constructor(path: string) {
		this._path = path.replace(/\\/g, "/")
	}

	read(): string {
		const content = readFileSync(this._path, "utf-8")
		return content
	}

	getFullPath(): string {
		return this._path
	}

	registerSyntax(node: TreeNode): void {
		const nodeID = `${this._path}:${node.getID()}`
		this._syntaxNodes[nodeID] = node
	}

	hasSyntax(nodeID: string): boolean {
		return nodeID in this._syntaxNodes
	}

	getSyntaxNode(nodeID: string): TreeNode {
		return this._syntaxNodes[nodeID]
	}
}
