import { namedTypes } from "ast-types"
import { print } from "recast"
import { Classes } from "./classes"
import { DBNode } from "./dbNode"
import { TypeArguments } from "./typeArguments"

export namespace Functions {
	export function Handle(n: namedTypes.FunctionDeclaration) {
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
							node.pushUse(...Classes.flattenNewExpression(d.init))
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

	export function flattenCallExpression(node: namedTypes.CallExpression) {
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
					uses.push(...Classes.flattenNewExpression(a))
				}
			}
		}

		if (node.typeArguments) {
			const types = TypeArguments.flatten(node.typeArguments?.params ?? [])
			for (const t of types) {
				uses.push({
					name: t,
					type: "type",
				})
			}
		}

		return uses
	}
}