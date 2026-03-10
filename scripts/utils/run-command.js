const { spawnSync } = require("child_process");

function tokenize(command) {
  if (Array.isArray(command)) {
    return command.slice();
  }

  const parts = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = pattern.exec(command)) !== null) {
    parts.push(match[1] ?? match[2] ?? match[3]);
  }
  return parts;
}

function resolveExecutable(executable) {
  if (process.platform !== "win32") {
    return executable;
  }
  if (executable === "npm") return "npm.cmd";
  if (executable === "npx") return "npx.cmd";
  return executable;
}

function needsShell(command) {
  if (Array.isArray(command)) return false;
  if (typeof command !== "string") return false;
  return /[|&;<>()[\]{}^%!`]|\r|\n/.test(command);
}

function quoteForCmd(value) {
  if (value == null) return '""';
  const stringValue = String(value);
  if (stringValue.length === 0) return '""';
  if (/^[A-Za-z0-9_./:\\=-]+$/.test(stringValue)) {
    return stringValue;
  }
  return `"${stringValue.replace(/"/g, '\\"')}"`;
}

function runViaCmd(parts, options = {}) {
  const commandLine = parts.map(quoteForCmd).join(" ");
  return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", commandLine], {
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
}

function runDirect(parts, options = {}) {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error("Cannot run an empty command.");
  }

  const [executable, ...args] = parts;
  return spawnSync(resolveExecutable(executable), args, {
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
}

function runCommand(command, options = {}) {
  if (process.platform === "win32") {
    if (typeof command === "string" && needsShell(command)) {
      return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", command], {
        encoding: "utf8",
        windowsHide: true,
        ...options,
      });
    }

    const parts = tokenize(command);
    if (parts.length === 0) {
      throw new Error("Cannot run an empty command.");
    }

    const resolvedExecutable = resolveExecutable(parts[0]);
    if (resolvedExecutable.toLowerCase().endsWith('.cmd')) {
      return runViaCmd([resolvedExecutable, ...parts.slice(1)], options);
    }

    return runDirect(parts, options);
  }

  const parts = tokenize(command);
  return runDirect(parts, options);
}

module.exports = { runCommand, tokenize, resolveExecutable, needsShell, quoteForCmd };
