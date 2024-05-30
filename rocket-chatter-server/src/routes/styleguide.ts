import { Request, Response } from "express"
import { LLM } from "../core/llm"
import { db } from "../core/neo4j"
import { Prompts } from "../prompts"

export async function __styleguide__(
	targetEntity: string
): Promise<string | null> {
	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 1:
	 * Query the database to find the nodes which contains the styleguide rules
	 * ---------------------------------------------------------------------------------------------
	 */
	const dbResults = await db.run(`MATCH (n:Styleguide) RETURN n`)
	const styleGuides = dbResults.records.map(
		(record) => record.get("n").properties
	)
	if (!styleGuides.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 2:
	 * Generate the new code based on the styleguide nodes and user's query
	 * ---------------------------------------------------------------------------------------------
	 */
	const result = await LLM.generateOutput(
		Prompts.makeStyleguidePrompt(targetEntity, JSON.stringify(styleGuides))
	)
	if (!result) return null

	const answer = result.split("<ANSWER>")[1].split("</ANSWER>")[0].trim()

	return answer
}

export async function styleguideRoute(req: Request, res: Response) {
	const query = req.body.query

	try {
		const result = await __styleguide__(query)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ status: "ERROR" })
	}
}
