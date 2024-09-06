import { configDotenv } from "dotenv"
configDotenv()

export const DOCUMENTATION_URL = "https://developer.rocket.chat/docs"
export const REPO_URI = "https://github.com/RocketChat/Rocket.Chat"
export const RC_APP_URI = process.env["RC_APP_URI"] ?? ""
