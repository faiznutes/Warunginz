import * as fs from "fs";
import * as path from "path";

const logFile = path.join(__dirname, "debug.log");

function debugLog(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

export { debugLog };
