import { TreeNode } from "./processor/core/treeNode"

export enum SourceFileType {
	// TypeScript
	TypeScript,
	TypeScriptReact,

	// JavaScript
	JavaScript,
	JavaScriptReact,

	// Others
	JSON,
}

export interface ISourceFile {
	read(): string
	getFullPath(): string

	registerSyntax(node: TreeNode): void
	hasSyntax(nodeID: string): boolean
	getSyntaxNode(nodeID: string): TreeNode
}
