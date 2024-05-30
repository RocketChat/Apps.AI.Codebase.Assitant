import { Request, Response } from "express"
import { LLM } from "../core/llm"
import { Query } from "../core/query"
import { DBNode } from "../database/node.types"

export async function __findSimilar__(
	code: string
): Promise<Record<string, DBNode[]> | null> {
	const queryVector = await LLM.generateEmbeddings(code)
	const similarNodes = await Query.getDBNodesFromVectorQuery(
		"codeEmbeddings",
		queryVector,
		0.5
	)

	return { result: similarNodes }
}

export async function findSimilarRoute(req: Request, res: Response) {
	const query = req.body.query
	try {
		const result = await __findSimilar__(query)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ status: "ERROR" })
	}
}
