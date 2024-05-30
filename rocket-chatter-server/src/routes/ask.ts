import { Request, Response } from "express"
import { LLM } from "../core/llm"
import { Query } from "../core/query"
import { Prompts } from "../prompts"

export async function __ask__(query: string): Promise<string | null> {
	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 1:
	 * Extract the possible keywords from the user's query
	 * ---------------------------------------------------------------------------------------------
	 */
	const keywords = await Query.getDBKeywordsFromQuery(query)
	console.log(keywords);
	console.log("KEYWORDS", keywords)
	if (!keywords.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 2:
	 * Query the database to find the nodes names of which are similar to what user has requested
	 * ---------------------------------------------------------------------------------------------
	 */
	const results = await Query.getCodeNodesFromKeywords(keywords)
	console.log("RESULTS", results)
	if (!results.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 3:
	 * Generate the answer and diagram for the user's query given the nodes data
	 * ---------------------------------------------------------------------------------------------
	 */
	const answer = await LLM.generateOutput(
		Prompts.makeAskPrompt(JSON.stringify(results), query)
	)
	console.log("ANSWER", answer)
	if (!answer) return null

	return answer
}

export async function askRoute(req: Request, res: Response) {
	const query = req.body.query
	try {
		const result = await __ask__(query)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		console.log(error)
		res.status(500).json({ status: "ERROR" })
	}
}
