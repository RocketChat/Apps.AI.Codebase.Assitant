import { namedTypes } from "ast-types"
import { print } from "recast"
import { DBNode } from "./dbNode"

export namespace Enums {
	export function Handle(n: namedTypes.EnumDeclaration) {
		const node = new DBNode(
			n.id?.name.toString() ?? "",
			"Enums",
			(n.body as any).body.map((e: any) => print(e).code).join("\n")
		)

		console.log(node)

		return node
	}
}
