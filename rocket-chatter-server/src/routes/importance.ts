import { Request, Response } from "express"
import { db } from "../core/neo4j"
import { Query } from "../core/query"
import { DBNode } from "../database/node.types"

namespace Algorithms {
	export async function calculateCentrality(node: DBNode): Promise<number> {
		const maxOutDegreeQuery = await db.run(
			`
				MATCH (n)
				WITH n, [(n)-[]->() | 1] AS outgoingRelationships
				RETURN size(outgoingRelationships) AS outDegree
				ORDER BY outDegree DESC
				LIMIT 1
			`
		)
		const maxOutDegree = maxOutDegreeQuery.records[0]
			.get("outDegree")
			.toNumber()

		const outDegree = await db.run(
			`
				MATCH (n:Node { id: $id })<-[]-(x) 
				RETURN count(x) AS outDegree
			`,
			{ id: node.id }
		)

		const centrality = outDegree.records[0].get("outDegree").toNumber()

		const relativeCentrality = centrality / maxOutDegree
		return relativeCentrality
	}

	export async function calculateCriticality(node: DBNode): Promise<number> {
		const maxInDegreeQuery = await db.run(
			`
				MATCH (n)
				WITH n, [(n)<-[]-() | 1] AS incomingRelationships
				RETURN size(incomingRelationships) AS inDegree
				ORDER BY inDegree DESC
				LIMIT 1
			`
		)
		const maxInDegree = maxInDegreeQuery.records[0].get("inDegree").toNumber()

		const inDegree = await db.run(
			`
				MATCH (n:Node { id: $id })-[]->(x) 
				RETURN count(x) AS inDegree
			`,
			{ id: node.id }
		)
		const criticality = inDegree.records[0].get("inDegree").toNumber()

		const relativeCriticality = criticality / maxInDegree
		return relativeCriticality
	}

	export function calculateLinesOfCode(node: DBNode): number {
		const loc = node.code.split("\n").length
		return loc
	}
}

export async function __importance__(
	query: string
): Promise<Record<string, number> | null> {
	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 1:
	 * Extract the possible keywords from the user's query
	 * ---------------------------------------------------------------------------------------------
	 */
	const keywords = [query]
	// const keywords = await Query.getDBKeywordsFromQuery(query)
	// if (!keywords.length) return null

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 2:
	 * Query the database to find the nodes names of which are similar to what user has requested
	 * ---------------------------------------------------------------------------------------------
	 */
	const codeNodes = await Query.getCodeNodesFromKeywords(keywords)
	if (!codeNodes.length) return null
	const targetNode = codeNodes[0]

	/**
	 * ---------------------------------------------------------------------------------------------
	 * STEP 3:
	 * Generate the final score based on various factors
	 * ---------------------------------------------------------------------------------------------
	 */
	const loc = Algorithms.calculateLinesOfCode(targetNode)
	const centrality = await Algorithms.calculateCentrality(targetNode)
	const criticality = await Algorithms.calculateCriticality(targetNode)
	const importance = (centrality + criticality) / 2

	return { loc, centrality, criticality, importance }
}

export async function importanceRoute(req: Request, res: Response) {
	const query = req.body.query
	try {
		const result = await __importance__(query)
		if (!result) return res.status(400).json({ status: "ERROR" })

		res.status(200).json(result)
	} catch (error) {
		console.log(error)
		res.status(500).json({ status: "ERROR" })
	}
}
