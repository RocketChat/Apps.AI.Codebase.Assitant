import { namedTypes } from "ast-types"
import { Functions } from "./functions"
import { TypeArgument } from "./typeArgument"

export namespace Classes {
	export function flattenNewExpression(node: namedTypes.NewExpression) {
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
					uses.push(...Functions.flattenCallExpression(a))
				} else if (namedTypes.NewExpression.check(a)) {
					uses.push(...flattenNewExpression(a))
				}
			}
		}

		if (node.typeArguments) {
			const types = TypeArgument.flatten(node.typeArguments?.params ?? [])
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
