import { textGeneration } from "@huggingface/inference"
import OpenAI from "openai"
import { HF_KEY, LLM_MODEL, OPENAI_KEY } from "../constants"

const openai = new OpenAI({ apiKey: OPENAI_KEY })

export class Prompt {
	private systemPrompt: string
	private assistantPrompt: string

	constructor(systemPrompt: string, assistantPrompt: string) {
		this.systemPrompt = systemPrompt
		this.assistantPrompt = assistantPrompt
	}

	/* TODO: Add format checking or use langchain */
	make(
		messages: { role: "system" | "assistant" | "user"; content: string }[],
		delimiter: string = ""
	): string {
		let prompt = "<s>\n"
		prompt += `\t[INST]\n\t\t${this.systemPrompt}\n\t[/INST]\n\t`
		prompt += this.assistantPrompt
		prompt += "\n</s>\n"

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i]
			prompt += `\t[INST]\n\t\t${message.content}\n\t[/INST]`

			const nextMessage = messages[++i]
			if (!nextMessage) {
				break
			}

			prompt += `\n\t${nextMessage.content}`
			prompt += "\n</s>\n"
		}
		prompt += " Assistant:\n" + delimiter

		return prompt
	}

	static processOutput(output: string): string {
		return (output.split("[/INST] Assistant:\n").at(-1) ?? "").trim()
	}
}

export namespace LLM {
	export async function generateEmbeddings(name: string): Promise<number[]> {
		const content = await openai.embeddings.create({
			model: "text-embedding-3-small",
			input: name,
			dimensions: 768,
			encoding_format: "float",
		})

		return content.data[0].embedding
	}

	export async function generateOutput(
		prompt: string,
		a: string = "",
		b: string = ""
	): Promise<string | null> {
		/* OLLAMA BASED LLM USAGE */
		// const reponse = await ollama.chat({
		// 	model: LLM_MODEL,
		// 	options: {
		// 		temperature: 0,
		// 	},
		// 	messages: [
		// 		{ role: "system", content: DB_QUERY_BASE_PROMPT },
		// 		{ role: "user", content: query },
		// 	],
		// })
		// const content = response.message.content
		// return content
		//
		/* HUGGINGFACE BASED LLM USAGE */
		try {
			const output = await textGeneration({
				accessToken: HF_KEY,
				model: LLM_MODEL,
				inputs: prompt,
				parameters: {
					temprature: 0,
					max_new_tokens: 20_000,
				},
			})
			const content = Prompt.processOutput(output.generated_text)
			return content
		} catch (e) {
			console.error(e)
			return null
		}
	}
}
