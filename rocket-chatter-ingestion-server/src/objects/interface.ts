import { namedTypes } from "ast-types"
import { print } from "recast"
import { DBNode } from "./dbNode"
import { TypeArguments } from "./typeArguments"

export namespace Interface {
	export function Handle(n: namedTypes.InterfaceDeclaration) {
		const node = new DBNode(
			n.id?.name.toString() ?? "",
			"Interface",
			(n.body as any).body.map((e: any) => print(e).code).join("\n")
		)

		// Check for extensions
		for (const e of n.extends) {
			if (!(e as any).typeArguments) continue

			const params = (e as any).typeArguments?.params ?? []
			node.pushUse(
				{
					name: (e as any).expression.name,
					type: "type",
				},
				...TypeArguments.flatten(params).map((t) => ({
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
			// Check for type references & index signatures (classes, enums, interfaces etc...)
			if (
				namedTypes.TSPropertySignature.check(m) ||
				namedTypes.TSTypeReference.check(m.typeAnnotation?.typeAnnotation)
			) {
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
			// Check for call signatures (functions)
			else if (namedTypes.TSCallSignatureDeclaration.check(m)) {
				// Check for the return type
				const returnType = ((m as any).returnType?.typeAnnotation as any)
					.typeName.name
				node.pushUse({
					name: returnType,
					type: "type",
				})

				// Check for the params type params (recursive)
				for (const p of (m as any).params) {
					const name = (p.typeAnnotation?.typeAnnotation as any)?.typeName?.name
					if (!name) continue

					node.pushUse(
						{
							name: name,
							type: "variable",
						},
						...TypeArguments.flatten(
							(p.typeAnnotation?.typeAnnotation as any)?.typeArguments
								?.params ?? []
						).map((t) => ({
							name: t,
							type: "type",
						}))
					)
				}
			}
		}

		console.log(node)
	}
}
