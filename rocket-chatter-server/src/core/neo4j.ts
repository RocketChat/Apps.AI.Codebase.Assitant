import neo4j, { Driver } from "neo4j-driver"
import {
	NEO4J_DATABASE,
	NEO4J_PASSWORD,
	NEO4J_URI,
	NEO4J_USERNAME,
} from "../constants"

// ------------------------------------------------------------------------------------------------
// Create a driver instance
// ------------------------------------------------------------------------------------------------

const driver: Driver = neo4j.driver(
	NEO4J_URI,
	neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
)
export const db = driver.session({ database: NEO4J_DATABASE })

// ------------------------------------------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------------------------------------------

export async function verifyConnectivity() {
	return driver.verifyConnectivity()
}

export function closeDBConnection() {
	db.close()
	driver.close()
}

// ------------------------------------------------------------------------------------------------
