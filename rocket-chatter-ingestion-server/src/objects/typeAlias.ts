import { namedTypes } from "ast-types"
import { DBNode } from "./fundamental/dbNode"
import { TypeAnnotation } from "./fundamental/typeAnnotation"

export namespace TypeAlias {
	export function Handle(n: namedTypes.TSTypeAliasDeclaration) {
		const node = new DBNode(n.id?.name.toString() ?? "", "TypeAlias", "")

		// Check for type parameters
		const typeParameters: string[] = []
		for (const p of n.typeParameters?.params ?? []) {
			typeParameters.push((p.name as any).name)
		}

		// Check for external references
		node.pushUse(
			...TypeAnnotation.flatten(n.typeAnnotation).map((name) => ({
				name,
				type: "type",
			}))
		)

		return node
	}
}
