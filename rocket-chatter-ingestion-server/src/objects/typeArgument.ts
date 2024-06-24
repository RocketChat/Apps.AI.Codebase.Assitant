import { namedTypes } from "ast-types"

export namespace TypeArgument {
	export function flatten(
		args: namedTypes.TypeParameterInstantiation["params"]
	) {
		const typeArguments: string[] = []

		for (const t of args) {
			if (namedTypes.TSTypeReference.check(t)) {
				typeArguments.push((t as any).typeName.name)

				if ((t as any).typeArguments) {
					typeArguments.push(...flatten((t as any).typeArguments.params))
				}
			}
		}

		return typeArguments
	}
}
