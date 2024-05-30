import { Prompt } from "./core/llm"

export namespace Prompts {
	export function makeDBKeywordQueryPrompt(query: string): string {
		const prompt = new Prompt(
			`
				You are an expert in understanding and answering questions of user when given a proper context of the codebase.

				INPUT: User's text query in either natural language or code format.

				TASKS:
				- NEVER USE backslash in any of the keywords even if it's part of the query.
				- Extract the possible keywords from the user's query.
				- Query the database to find the nodes names of which are similar to what user has requested.
				- If you are unable to extract the keywords, return an empty array.
				- EXTRACT THE KEYWORDS IN SUCH A WAY THAT EACH STRING AS ONE WORD ELEMENT ONLY.

				EXAMPLE:
				- INPUT:
					"Find the codebase for the user query CRC_TABLE in the main.ts'
				- OUTPUT:
					<ANSWER>
						CRC_TABLE, main.ts
					</ANSWER>

				OUTPUT:
				<ANSWER>
					- Provide the possible keywords extracted from the user's query in a comma-separated format (unquoted).
				</ANSWER>

				RULES:
				- DO NOT REPEAT THE KEYWORDS MULTIPLE TIMES.
				- STRICTLY, do not make anything other than the answer to the user's query.
			`,
			"Sure, I will strictly follow my instructions. I will provide the answer the above specified format only."
		)

		return prompt.make(
			[
				{
					role: "system",
					content: `
					Here's the user query:
					<QUERY_START>
						${query}
					<QUERY_END>
				`,
				},
				{
					role: "assistant",
					content:
						"Yeah sure. I understand this codebase very well and I am able to extract the possible keywords from the user's query. If I can't find the keywords, I'll return an empty array.",
				},
				{ role: "user", content: query },
			],
			`<ANSWER>"`
		)
	}

	export function makeAskPrompt(codebase: string, query: string): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding and answering questions of user when given a proper context of the codebase. Here're the rules:
            1. Even if user asks for any kind of diagram or visualization, you must ignore that.
            2. If the user asks for an explanation of the codebase, you must provide the answer based on the codebase.
            3. You must provide the answer in text GitHub Markdown format only.
            4. In case of any request for diagrams or visualizations, tell user to use the "/rcc-diagram" command.
            5. If you are unable to answer the question, you must tell the user that you are unable to answer the question.
         `,
			"Sure, I will strictly follow my instructions. I will only provide the answer in text GitHub Markdown format. I will ignore any request for diagrams or visualizations."
		)

		return prompt.make([
			{
				role: "system",
				content: `
               HERE'RE THE NODES OF THE CODEBASE TO USE AS CONTEXT:
               <CODEBASE_START>
                  ${codebase}
               </CODEBASE_END>
            `,
			},
			{
				role: "assistant",
				content:
					"Yeah sure. I understand this codebase very well and I am able to answer questions only from the above codebase. If I don't know the answer, I'll tell it to you.",
			},
			{ role: "user", content: query },
		])
	}

	export function makeDiagramPrompt(codebase: string, query: string): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding and answering questions of user when given a proper context of the codebase.
				You provide mermaid 8.9.0 based graph and sequence diagrams which enhance the user's understanding of the codebase. These diagrams has a special quality that they are never off the mark and always render properly. The diagram are never other than the information provided in the codebase.
				
				EXPECTED OUTPUT:
				<ANSWER>
					- You provide mermaid 8.9.0 based graph and sequence diagrams only.
					- The aim is to make it easy for the user to understand the flow & overall working.
					- The output must not have any kind of errors and must render properly.
				</ANSWER>
         `,
			"Sure, I will strictly follow my instructions. I will provide the answer in a valid PLAIN TEXT only. I won't use parentheses at all even if they are required."
		)

		return prompt.make(
			[
				{
					role: "system",
					content: `
               HERE'RE THE NODES OF THE CODEBASE TO USE AS CONTEXT:
               <CODEBASE_START>
                  ${codebase}
               </CODEBASE_END>
            `,
				},
				{
					role: "assistant",
					content:
						"Yeah sure. I'll start my response with <DIAGRAM_START> and end with <DIAGRAM_END>.",
				},
				{ role: "user", content: query },
			],
			"<DIAGRAM_START>```mermaid\n"
		)
	}

	export function makeDocumentPrompt(codebase: string, query: string): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding and generating JSDoc documentation for other developers when given a proper context of the codebase.

            INPUT: Inter-related entities from a huge codebase in JSON format, target entity to generate documentation for & number of example usages to provide.

            EXPECTED OUTPUT:
				<ANSWER_START>
					<JSDOC>
						- Generate a short JSDoc documentation for the target entity explaining its purpose and usage.
						- Generate a comprehensive JSDoc documentation for the target entity explaining its purpose, usage, and parameters in @description, @param, @returns, @throws sections respectively.
						- (IF EXISTS) Explain the edge cases and exceptions the target entity might throw or face in the @throws section.
						- (ONLY IF POSSIBLE & RELEVANT) Provide different example usages of the target entity in the codebase.
					</JSDOC>
					<EXPLANATION>
						- Provide an additional comprehensive explanation of the target entity with proper reasoning.
					</EXPLANATION>
				<ANSWER_END>

            RULES:
            - STRICTLY, do not make anything other than the answer to the user's query.
            - DON'T REPEAT THE EXAMPLES.
            - Do not provide any kind of diagram or visualization in the output.
         `,
			"Sure, I will strictly follow my instructions. The output will be in the above format only."
		)

		return prompt.make(
			[
				{
					role: "system",
					content: `
               HERE'RE THE NODES OF THE CODEBASE TO USE AS CONTEXT:
               <CODEBASE_START>
                  ${codebase}
               </CODEBASE_END>
            `,
				},
				{
					role: "assistant",
					content:
						"Yeah sure. I understand this codebase very well and I am able to generate JSDoc & documentation for the target entity.",
				},
				{ role: "user", content: query },
			],
			"<ANSWER_START>\n<JSDOC>"
		)
	}

	export function makeWhyUsedPrompt(codebase: string, query: string): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding and answering questions of user when given a proper context of the codebase.

            INPUT: User's text query

            EXPECTED OUTPUT:
				<ANSWER>
					<EXPLANATION>
						- Provide an additional comprehensive explanation in markdown list format.
						- NEVER NEVER NEVER explain the entity itself or it's working.
						- ALWAYS explain where and why it's used in the codebase with due reasoning and mention of the file and line number.
					</EXPLANATION>
					<IMPACT>
						- Provide the impact score of the target entity based on the number of usages and the importance of the file.
					</IMPACT>
					<DIAGRAM>
						- You only provide flowchart or sequence diagram in the mermaid 8.9.0 format.
						- The diagram must be clear and understandable for the user. The aim is to make it easy for the user to understand the flow & overall working.
						- The output must not have any kind of errors and must render properly.
					</DIAGRAM>
				</ANSWER>
						
				RULES:
				- NEVER NEVER NEVER explain the entity itself or it's working.
            - Don't tell me how to use that entity in the codebase.
            - STRICTLY, do not make anything other than the answer to the user's query.
            - If that entity is used multiple times then provide the reasoning for each usage separately.
            - DON'T REPEAT THE USAGES OF THE ENTITY MULTIPLE TIMES.
            - The output MUST BE IN ONLY AND ONLY IN THE ABOVE SPECIFIED FORMAT.
         `,
			"Sure, I will strictly follow my instructions. I will only provide the answer in the above specified format only."
		)

		return prompt.make(
			[
				{
					role: "system",
					content: `
               HERE'RE THE NODES OF THE CODEBASE TO USE AS CONTEXT:
               <CODEBASE_START>
                  ${codebase}
               </CODEBASE_END>
            `,
				},
				{
					role: "assistant",
					content:
						"Yeah sure. If I don't know the answer, I'll tell it to you.",
				},
				{ role: "user", content: query },
			],
			"<ANSWER>"
		)
	}

	export function makeStyleguidePrompt(
		codebase: string,
		styleguides: string
	): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding typescript and javascript codebases and adhering to the styleguides.

            INPUT: Styleguide rules to enforce on the codebase & the codebase to enforce the rules on.

            TASKS:
            - If the codebase doesn't adhere to the styleguide rules then provide the code strictly adhering to the styleguide rules.
            - If the codebase already adheres to the styleguide rules then tell that it is already following the rules.

            EXPECTED OUTPUT:
				<ANSWER>
					- Provide the codebase strictly adhering to the styleguide rules.
				</ANSWER>

            RULES:
            - STRICTLY, do not make anything other than the answer to the user's query.
            - Do not provide any kind of diagram or visualization in the output.
            - The output MUST BE IN ONLY AND ONLY STRING.
         `,
			"Sure, I will strictly follow my instructions. I will only provide the answer in text format."
		)

		return prompt.make([
			{
				role: "system",
				content: `
               <STYLEGUIDES_START>
                  ${styleguides}
               <STYLEGUIDES_END>
               <CODEBASE_START>
                  ${codebase}
               </CODEBASE_END>
            `,
			},
			{
				role: "assistant",
				content:
					"Yeah sure. I understand this codebase very well and I am able to enforce the styleguide rules on the codebase. If I don't know the answer, I'll tell it to you.",
			},
			{
				role: "user",
				content: "Enforce the styleguide rules on the provided codebase.",
			},
		])
	}

	export function makeSuggestPrompt(
		codebase: string,
		targetEntity: string
	): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding typescript and javascript codebases and fixing it provided the context of the codebase.

            INPUT: Other entities the target entity might be using. The target entity to refactor.

            TASKS:
            - Refactoring might include:
               - Renaming
               - Extracting different parts into separate functions
               - Making code concise to make it more readable, maintainable
               - Removing dead code
               - Performance improvements
               - Better alternatives
               - Syntax improvements
               - Code style improvements
               - Best practices
            - Suggest multiple (only if relevant) fixes for the target entity.
            - If the target entity is already correct then tell that it is already correct.
            - If the provided codebase contains entities that are functionally similar to what's used in the target entity, suggest using entities from the codebase.

            EXPECTED OUTPUT: Suggestions for the target entity in form of MARKDOWN and CODE SNIPPET with the fix and explanation.

            RULES:
            - STRICTLY, do not make anything other than the answer to the user's query.
            - Do not provide any kind of diagram or visualization in the output.
            - The output MUST BE IN ONLY AND ONLY MARKDOWN.
         `,
			"Sure, I will strictly follow my instructions. I will only provide the answer in text format."
		)

		return prompt.make([
			{
				role: "system",
				content: `
               <CODEBASE_START>
                  ${codebase}
               <CODEBASE_END>
               <TARGET_ENTITY_START>
                  ${targetEntity}
               <TARGET_ENTITY_END>
            `,
			},
			{
				role: "assistant",
				content: `
               Yeah sure. I understand this codebase very well and I am able to suggest multiple fixes for the target entity. If I don't know the answer, I'll tell it to you.
            `,
			},
			{
				role: "user",
				content:
					"Suggest multiple (only if possible) fixes for the target entity.",
			},
		])
	}

	export function makeTranslatePrompt(
		codebase: string,
		targetEntity: string,
		targetLanguage: string
	): string {
		const prompt = new Prompt(
			`
            You are an expert in understanding various programming languages and specialized in typescript and javascript.

            INPUT: Inter-related entities from a huge codebase in JSON format, target entity to translate, target entity & the language to translate to.

            TASK: Based on the context (codebase) (external entities it uses) provided, translate the target entity to the language provided by the user.

            EXPECTED OUTPUT: code in the target language not in markdown format.

            RULES:
            - STRICTLY, do not make anything other than the answer to the user's query.
            - DO NOT REPEAT THE TRANSLATION MULTIPLE TIMES.
            - Do not provide any kind of diagram or visualization in the output.
            - The output MUST BE IN ONLY AND ONLY STRING.
         `,
			"Sure, I will strictly follow my instructions. I will only provide the answer in text format."
		)

		return prompt.make([
			{
				role: "system",
				content: `
               <TARGET_ENTITY_START>
                  ${targetEntity}
               <TARGET_ENTITY_START>
               <CODEBASE_START>
                  ${codebase}
               </CODEBASE_END>
            `,
			},
			{
				role: "assistant",
				content:
					"Yeah sure. I understand this codebase very well and I am able to translate the target entity to the target language. If I don't know the answer, I'll tell it to you.",
			},
			{
				role: "user",
				content: `Translate the target entity to ${targetLanguage}`,
			},
		])
	}
}
