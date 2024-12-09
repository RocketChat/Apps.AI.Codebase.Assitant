import { execSync } from "child_process";

// Clear terminal based on platform
const isWindows = process.platform === "win32";
try {
  execSync(isWindows ? "cls" : "clear", { stdio: "inherit" });
} catch (err) {
  console.error("Failed to clear the terminal:", err.message);
}

// If `test.ts` doesn't exist, change this to a valid file (e.g., `main.ts` or another script)
const scriptPath = './src/main.ts'; // Update this to your correct TypeScript file

// Run the TypeScript file with tsx
try {
  execSync(`npx tsx ${scriptPath}`, { stdio: "inherit" });
} catch (err) {
  console.error("Failed to execute tsx:", err.message);
  process.exit(1);
}
