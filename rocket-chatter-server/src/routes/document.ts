import { Request, Response } from "express"
import { LLM } from "../core/llm"
import { Query } from "../core/query"
import { Prompts } from "../prompts"

export async function __document__(
	query: string
): Promise<Record<string, string> | null> {
	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 1:
	 * Extract the possible keywords from the user's query
	 * ---------------------------------------------------------------------------------------------
	 */
	const keywords = await Query.getDBKeywordsFromQuery(query)
	console.log("KEYWORDS", keywords)
	if (!keywords.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 2:
	 * Query the database to find the nodes names of which are similar to what user has requested
	 * ---------------------------------------------------------------------------------------------
	 */
	const codeNodes = await Query.getCodeNodesFromKeywords(keywords)
	if (!codeNodes.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 3:
	 * Generate the documentation based on the code nodes and user's query
	 * ---------------------------------------------------------------------------------------------
	 */
	const result = await LLM.generateOutput(
		Prompts.makeDocumentPrompt(JSON.stringify(codeNodes), query)
	)
	if (!result) return null

	console.log(result)

	const answer = result
		.split("<ANSWER_START>")[1]
		.split("<ANSWER_END>")[0]
		.trim()

	const jsDoc = answer.split("<JSDOC>")[1].split("</JSDOC>")[0].trim()
	const explanation = answer
		.split("<EXPLANATION>")[1]
		.split("</EXPLANATION>")[0]
		.trim()

	console.log(jsDoc)
	console.log(explanation)

	return { jsDoc: jsDoc, explanation: explanation }
}

export async function documentRoute(req: Request, res: Response) {
	const query = req.body.query

	try {
		const result = await __document__(query)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ status: "ERROR" })
	}
}
