import cors from "cors"
import express from "express"
import { PORT } from "./constants"
import { healthRoute } from "./routes/health"
import { ingestRoute } from "./routes/ingest"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: "*" }))

app.get("/health", healthRoute)
app.post("/ingest", ingestRoute)

app.listen(PORT, () =>
	console.log(`🚀 Server running on port http://localhost:${PORT}`)
)
