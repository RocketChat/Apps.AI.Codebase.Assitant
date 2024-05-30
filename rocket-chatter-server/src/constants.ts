import { configDotenv } from "dotenv"
configDotenv()

export const PORT = +(process.env["PORT"] ?? 3000)

export const HF_KEY = process.env["HF_KEY"]
export const OPENAI_KEY = process.env["OPENAI_KEY"]

export const NEO4J_URI = process.env["NEO4J_URI"] ?? ""
export const NEO4J_USERNAME = process.env["NEO4J_USERNAME"] ?? ""
export const NEO4J_PASSWORD = process.env["NEO4J_PASSWORD"] ?? ""
export const NEO4J_DATABASE = process.env["NEO4J_DATABASE"] ?? ""

export const LLM_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"
//export const LLM_MODEL = "meta-llama/Llama-2-7b-hf"
