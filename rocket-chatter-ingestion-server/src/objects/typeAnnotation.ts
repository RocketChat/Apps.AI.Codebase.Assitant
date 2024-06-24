import { namedTypes } from "ast-types"

export namespace TypeAnnotation {
	export function flatten(
		type: namedTypes.TSTypeAliasDeclaration["typeAnnotation"]
	) {
		const typeArguments: string[] = []

		if (namedTypes.TSTypeAnnotation.check(type)) {
			typeArguments.push(...flatten((type as any).typeAnnotation))
		}
		// Handle direct type references
		else if (namedTypes.TSTypeReference.check(type)) {
			typeArguments.push((type as any).typeName.name)
		}
		// Handle intersection (|) and union (&) types
		else if (
			namedTypes.TSIntersectionType.check(type) ||
			namedTypes.TSUnionType.check(type)
		) {
			for (const t of type.types) {
				typeArguments.push(...flatten(t))
			}
		}
		// Handle function types
		else if (namedTypes.TSFunctionType.check(type)) {
			// Handle return type of the function
			if ((type as any).returnType) {
				typeArguments.push(...flatten((type as any).returnType.typeAnnotation))
			}

			// Handle parameters of the function
			for (const t of (type as any).params) {
				typeArguments.push(...flatten((t as any).typeAnnotation))
			}
		}
		// Handle array types
		else if (namedTypes.TSTupleType.check(type)) {
			for (const t of type.elementTypes) typeArguments.push(...flatten(t))
		}
		// Handle indexed access types
		else if (namedTypes.TSIndexedAccessType.check(type)) {
			typeArguments.push(...flatten((type as any).objectType))
			typeArguments.push(...flatten((type as any).indexType))
		}
		// Handle infer types
		else if (namedTypes.TSConditionalType.check(type)) {
			typeArguments.push(...flatten(type.checkType))
			typeArguments.push(...flatten(type.extendsType))
			typeArguments.push(...flatten(type.trueType))
			typeArguments.push(...flatten(type.falseType))
		}
		// Handle mapped types
		else if (namedTypes.TSMappedType.check(type)) {
			if (type.typeAnnotation)
				typeArguments.push(...flatten(type.typeAnnotation))
			if (type.typeParameter.constraint)
				typeArguments.push(...flatten(type.typeParameter.constraint))
			if (type.typeParameter.default)
				typeArguments.push(...flatten(type.typeParameter.default))
		}

		return typeArguments
	}
}
