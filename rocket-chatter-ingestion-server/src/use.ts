import { parse } from "@typescript-eslint/typescript-estree"
import { namedTypes } from "ast-types"
import { readFileSync } from "fs"
import { TypeAlias } from "./objects/typeAlias"

// Sample JavaScript code
const code = readFileSync("code.ts").toString()

// Parse the code into an AST
const ast = parse(code)

for (const node of ast.body) {
	if (namedTypes.FunctionDeclaration.check(node)) {
		// Functions.Handle(node)
	} else if (namedTypes.TSInterfaceDeclaration.check(node)) {
		// Interface.Handle(node)
	} else if (namedTypes.TSTypeAliasDeclaration.check(node)) {
		TypeAlias.Handle(node)
	}
}
