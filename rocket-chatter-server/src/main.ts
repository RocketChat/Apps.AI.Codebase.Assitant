import cors from "cors"
import express from "express"
import { PORT } from "./constants"

import { askRoute } from "./routes/ask"
import { diagramRoute } from "./routes/diagram"
import { documentRoute } from "./routes/document"
import { findSimilarRoute } from "./routes/findSimilar"
import { healthRoute } from "./routes/health"
import { importanceRoute } from "./routes/importance"
import { styleguideRoute } from "./routes/styleguide"
import { suggestRoute } from "./routes/suggest"
import { translateRoute } from "./routes/translate"
import { whyUsedRoute } from "./routes/whyUsed"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: "*" }))

app.get("/health", healthRoute)

app.post("/ask", askRoute)
app.post("/diagram", diagramRoute)
app.post("/document", documentRoute)
app.post("/findSimilar", findSimilarRoute)
app.post("/importance", importanceRoute)
app.post("/whyUsed", whyUsedRoute)
app.post("/styleguide", styleguideRoute) //
app.post("/suggest", suggestRoute)
app.post("/translate", translateRoute)

app.listen(PORT, () => {
	console.clear()
	console.log(`🚀 Server running on port http://localhost:${PORT}`)
})
