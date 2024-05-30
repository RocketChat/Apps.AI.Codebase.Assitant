import { Request, Response } from "express"
import { LLM } from "../core/llm"
import { Query } from "../core/query"
import { Prompts } from "../prompts"

export async function __translate__(
	targetEntity: string,
	targetLanguage: string
): Promise<Record<string, string> | null> {
	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 1:
	 * Query the database to find the nodes names of which are similar to what user has requested
	 * ---------------------------------------------------------------------------------------------
	 */
	const codeNodes = await Query.getCodeNodesFromKeywords([targetEntity])
	if (!codeNodes.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 2:
	 * Generate the documentation based on the code nodes and user's query
	 * ---------------------------------------------------------------------------------------------
	 */
	const result = await LLM.generateOutput(
		Prompts.makeTranslatePrompt(
			JSON.stringify(codeNodes),
			targetEntity,
			targetLanguage
		)
	)
	if (!result) return null

	return { result }
}

export async function translateRoute(req: Request, res: Response) {
	const targetEntity = req.body.targetEntity
	const targetLanguage = req.body.targetLanguage

	try {
		const result = await __translate__(targetEntity, targetLanguage)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ status: "ERROR" })
	}
}
