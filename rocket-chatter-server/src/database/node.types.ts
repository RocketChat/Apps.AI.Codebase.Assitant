export type DBNodeRelation = "USED_IN" | "IN_FILE" | "CALLED_BY" | "DEPENDS_ON"

export type DBNode = {
	id: string
	name: string
	kind: string
	type: string

	code: string
	comments: string[]

	filePath: string
	relations: { target: string; relation: DBNodeRelation }[]

	nameEmbeddings: number[]
	codeEmbeddings: number[]
}
