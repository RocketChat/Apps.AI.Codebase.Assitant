import { Request, Response } from "express"
import { renderDiagramToBase64URI } from "../core/diagram"
import { LLM } from "../core/llm"
import { Query } from "../core/query"
import { Prompts } from "../prompts"

export async function __diagram__(query: string): Promise<string | null> {
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
	const results = await Query.getCodeNodesFromKeywords(keywords)
	console.log("RESULTS", results)
	if (!results.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 3:
	 * Generate the diagram code and diagram for the user's query given the nodes data
	 * ---------------------------------------------------------------------------------------------
	 */
	const diagram = await LLM.generateOutput(
		Prompts.makeDiagramPrompt(JSON.stringify(results), query)
	)
	if (!diagram) return null

	console.log(diagram)

	const diagramContent = diagram
		.replace("```mermaid", "")
		.replace("```", "")
		.split("<DIAGRAM_START>")[1]
		.split("<DIAGRAM_END>")[0]
		.trim()
	console.log("DIAGRAM:\n", diagramContent)

	const base64Diagram = await renderDiagramToBase64URI(diagramContent)
	return base64Diagram
}

export async function diagramRoute(req: Request, res: Response) {
	const query = req.body.query
	try {
		const result = await __diagram__(query)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		console.log(error)
		res.status(500).json({ status: "ERROR" })
	}
}
