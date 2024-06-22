import {
	ClassDeclaration,
	EnumDeclaration,
	FunctionDeclaration,
	InterfaceDeclaration,
	NamespaceDeclaration,
	Node,
	TypeAliasDeclaration,
	VariableDeclaration,
	ts,
} from "ts-morph"

export type RefNode =
	| FunctionDeclaration
	| TypeAliasDeclaration
	| EnumDeclaration
	| InterfaceDeclaration
	| ClassDeclaration
	| NamespaceDeclaration
	| VariableDeclaration
	
