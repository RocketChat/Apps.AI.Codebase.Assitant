import { parse } from "@typescript-eslint/typescript-estree"
import { namedTypes } from "ast-types"
import { readFileSync } from "fs"
import { print } from "recast"

// Sample JavaScript code
const code = readFileSync("code.ts").toString()

// Parse the code into an AST
const ast = parse(code)

class DBNode {
	name: string = ""
	type: string = ""
	body: string = ""
	uses: {
		name: string
		type: string
	}[] = []

	constructor(name: string, type: string, body: string) {
		this.name = name
		this.type = type
		this.body = body
	}

	toString() {
		return `${this.name} (${this.type})`
	}

	pushUse(...uses: { name: string; type: string }[]) {
		for (const use of uses) {
			if (this.uses.findIndex((u) => u.name == use.name) !== -1) continue
			this.uses.push(use)
		}
	}
}

function flattenTypeArguments(
	args: namedTypes.TypeParameterInstantiation["params"]
) {
	const typeArguments: string[] = []

	for (const t of args) {
		if (namedTypes.TSTypeReference.check(t)) {
			typeArguments.push((t as any).typeName.name)

			if ((t as any).typeArguments) {
				typeArguments.push(
					...flattenTypeArguments((t as any).typeArguments.params)
				)
			}
		}
	}

	return typeArguments
}

function flattenCallExpression(node: namedTypes.CallExpression) {
	const uses: { name: string; type: string }[] = []

	if (namedTypes.Identifier.check(node.callee)) {
		uses.push({
			name: node.callee.name,
			type: "function",
		})
	} else {
		// console.log("Unknown call:", e.expression)
	}

	if (node.arguments) {
		for (const a of node.arguments) {
			if (namedTypes.Identifier.check(a)) {
				uses.push({
					name: a.name,
					type: "variable",
				})
			} else if (namedTypes.CallExpression.check(a)) {
				uses.push(...flattenCallExpression(a))
			} else if (namedTypes.NewExpression.check(a)) {
				uses.push(...flattenNewExpression(a))
			}
		}
	}

	if (node.typeArguments) {
		const types = flattenTypeArguments(node.typeArguments?.params ?? [])
		for (const t of types) {
			uses.push({
				name: t,
				type: "type",
			})
		}
	}

	return uses
}

function flattenNewExpression(node: namedTypes.NewExpression) {
	const uses: { name: string; type: string }[] = []

	if (namedTypes.Identifier.check(node.callee)) {
		uses.push({
			name: node.callee.name,
			type: "class",
		})
	} else {
		// console.log("Unknown call:", e.expression)
	}

	if (node.arguments) {
		for (const a of node.arguments) {
			if (namedTypes.Identifier.check(a)) {
				uses.push({
					name: a.name,
					type: "variable",
				})
			} else if (namedTypes.CallExpression.check(a)) {
				uses.push(...flattenCallExpression(a))
			} else if (namedTypes.NewExpression.check(a)) {
				uses.push(...flattenNewExpression(a))
			}
		}
	}

	if (node.typeArguments) {
		const types = flattenTypeArguments(node.typeArguments?.params ?? [])
		for (const t of types) {
			uses.push({
				name: t,
				type: "type",
			})
		}
	}

	return uses
}

namespace Handlers {
	export function HandleFunction(n: namedTypes.FunctionDeclaration) {
		const node = new DBNode(
			n.id?.name.toString() ?? "",
			"function",
			n.body.body.map((e) => print(e).code).join("\n")
		)

		console.log("========================================\n")
		console.log("Function:", n.id?.name)

		// Handle type annotations
		if (n.returnType?.typeAnnotation) {
			const type = n.returnType.typeAnnotation
			if (namedTypes.TSTypeReference.check(type)) {
				console.log("Unknown return type:", type)
			}
			const returnType = (n.returnType.typeAnnotation as any).typeName.name
			node.pushUse({
				name: returnType,
				type: "type",
			})
		}

		// Handle parameters to see if any of them uses an external entity
		for (const p of n.params) {
			if (namedTypes.Identifier.check(p)) {
				const name = (p.typeAnnotation?.typeAnnotation as any)?.typeName?.name
				if (!name) continue
				node.pushUse({
					name: name,
					type: "variable",
				})
			}
		}

		// Handle the body of the function
		for (const c of n.body.body) {
			if (namedTypes.ExpressionStatement.check(c)) {
				// For direct calls
				if (namedTypes.CallExpression.check(c.expression)) {
					node.pushUse(
						{
							name: (c.expression.callee as any).name,
							type: "function",
						},
						...flattenCallExpression(c.expression)
					)
				}
			}
			// For variable declarations
			else if (namedTypes.VariableDeclaration.check(c)) {
				// For variable declarations
				for (const d of c.declarations) {
					if (namedTypes.VariableDeclarator.check(d)) {
						// For variables declared using function calls
						if (namedTypes.CallExpression.check(d.init)) {
							node.pushUse(
								{
									name: (d.init.callee as any).name,
									type: "function",
								},
								...flattenCallExpression(d.init)
							)
						}
						// For variables declared using new expressions
						else if (namedTypes.NewExpression.check(d.init)) {
							if (namedTypes.Identifier.check(d.init.callee)) {
								node.pushUse({
									name: d.init.callee.name,
									type: "class",
								})
							}
							node.pushUse(...flattenNewExpression(d.init))
						}
						// For variables declared using other variables or direct values
						else if (namedTypes.Identifier.check(d.init)) {
							node.pushUse({
								name: d.init.name,
								type: "variable",
							})
						} else {
							// For other types of declarations (e.g. arrow functions) we don't need to do anything
							// as they can't refer to other functions
						}
					}
				}
			}
		}

		console.log("\n========================================")

		if (node.name == "Log") {
			console.log(node)
		}
	}

	export function HandleInterface(n: namedTypes.InterfaceDeclaration) {
		const node = new DBNode(
			n.id?.name.toString() ?? "",
			"Interface",
			(n.body as any).body.map((e: any) => print(e).code).join("\n")
		)
		if (node.name !== "TreeNode") return

		// Check for extensions
		for (const e of n.extends) {
			if (!(e as any).typeArguments) continue

			const params = (e as any).typeArguments?.params ?? []
			node.pushUse(
				{
					name: (e as any).expression.name,
					type: "type",
				},
				...flattenTypeArguments(params).map((t) => ({
					name: t,
					type: "type",
				}))
			)
		}

		// Check for type parameters
		const typeParameters: string[] = []
		for (const p of n.typeParameters?.params ?? []) {
			typeParameters.push((p.name as any).name)
		}

		// Check for external references
		for (const m of (n.body as any).body) {
			// Check for type references (classes, enums, interfaces etc...)
			if (namedTypes.TSPropertySignature.check(m)) {
				if (
					namedTypes.TSTypeReference.check(m.typeAnnotation?.typeAnnotation)
				) {
					const name = (m.typeAnnotation?.typeAnnotation as any).typeName.name
					if (!name) continue
					if (typeParameters.includes(name)) continue
					node.pushUse({
						name: name,
						type: "type",
					})
				}
			}
		}

		console.log(node)
	}
}

for (const node of ast.body) {
	if (namedTypes.FunctionDeclaration.check(node)) {
		Handlers.HandleFunction(node)
	} else if (namedTypes.TSInterfaceDeclaration.check(node)) {
		Handlers.HandleInterface(node)
	}
}
