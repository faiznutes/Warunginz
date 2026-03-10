#!/usr/bin/env node

/**
 * PHASE 33 - Automated Vue Component Audit Scanner
 * Purpose: Detect unused functions, computed properties, watchers, and lifecycle hooks
 * Usage: node scripts/audit-scanner.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const VUE_FILES_PATH = path.join(__dirname, '../client/src/views/**/*.vue');
const COMPONENTS_PATH = path.join(__dirname, '../client/src/components/**/*.vue');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset);
}

/**
 * Parse Vue component and extract defined functions/computed/watchers
 */
function parseVueComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract script section
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      return null;
    }

    const scriptContent = scriptMatch[1];

    // Find defined functions (methods, computed, watchers, lifecycle)
    const defined = {
      methods: new Set(),
      computed: new Set(),
      watchers: new Set(),
      lifecycle: new Set(),
      imports: new Set(),
    };

    // Extract methods
    const methodsMatch = scriptContent.match(/methods\s*:\s*\{([^}]*)\}/);
    if (methodsMatch) {
      const methodNames = methodsMatch[1].match(/(\w+)\s*\(/g);
      if (methodNames) {
        methodNames.forEach((m) => {
          defined.methods.add(m.replace('(', '').trim());
        });
      }
    }

    // Extract computed properties
    const computedMatch = scriptContent.match(/computed\s*:\s*\{([^}]*)\}/s);
    if (computedMatch) {
      const computedNames = computedMatch[1].match(/(\w+)\s*\(/g);
      if (computedNames) {
        computedNames.forEach((c) => {
          defined.computed.add(c.replace('(', '').trim());
        });
      }
    }

    // Extract watchers
    const watchMatch = scriptContent.match(/watch\s*:\s*\{([^}]*)\}/s);
    if (watchMatch) {
      const watcherNames = watchMatch[1].match(/('|")(\w+)\1\s*:/g);
      if (watcherNames) {
        watcherNames.forEach((w) => {
          const name = w.match(/\w+/)[0];
          defined.watchers.add(name);
        });
      }
    }

    // Extract lifecycle hooks
    const lifecycleHooks = [
      'beforeCreate',
      'created',
      'beforeMount',
      'mounted',
      'beforeUpdate',
      'updated',
      'beforeUnmount',
      'unmounted',
      'activated',
      'deactivated',
    ];

    lifecycleHooks.forEach((hook) => {
      if (scriptContent.includes(hook)) {
        defined.lifecycle.add(hook);
      }
    });

    return {
      file: filePath,
      content: scriptContent,
      defined,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Check which functions are actually used in the component
 */
function findUnusedFunctions(parsed) {
  if (!parsed) return null;

  const { content, defined } = parsed;
  const unused = {
    methods: [],
    computed: [],
    watchers: [],
    lifecycle: [],
  };

  // Check for unused methods
  defined.methods.forEach((method) => {
    // Look for method calls: method() or this.method
    const patterns = [
      new RegExp(`\\bthis\\.${method}\\b`),
      new RegExp(`\\${method}\\(`),
      new RegExp(`@\\w+="${method}`), // event handlers
      new RegExp(`@\\w+="\\${method}`),
    ];

    const isUsed = patterns.some((pattern) => pattern.test(content));
    if (!isUsed) {
      unused.methods.push(method);
    }
  });

  // Check for unused computed
  defined.computed.forEach((comp) => {
    const patterns = [new RegExp(`\\bthis\\.${comp}\\b`), new RegExp(`\\${comp}\\b`)];
    const isUsed = patterns.some((pattern) => pattern.test(content));
    if (!isUsed) {
      unused.computed.push(comp);
    }
  });

  // Check for unused watchers
  defined.watchers.forEach((watcher) => {
    const isUsed = new RegExp(`\\bthis\\.${watcher}\\b`).test(content);
    if (!isUsed) {
      unused.watchers.push(watcher);
    }
  });

  return unused;
}

/**
 * Main audit function
 */
async function runAudit() {
  log('\n' + '='.repeat(80), 'cyan');
  log('PHASE 33 - COMPONENT AUDIT SCANNER', 'cyan');
  log('='.repeat(80) + '\n', 'cyan');

  // Find all Vue files
  const vueFiles = glob.sync(VUE_FILES_PATH);
  const componentFiles = glob.sync(COMPONENTS_PATH);
  const allFiles = [...vueFiles, ...componentFiles];

  log(`Found ${allFiles.length} Vue files to audit\n`, 'blue');

  let totalIssues = 0;
  const report = [];

  // Audit each file
  allFiles.forEach((filePath, index) => {
    const relPath = path.relative(__dirname, filePath);
    log(`[${index + 1}/${allFiles.length}] Auditing ${relPath}...`);

    const parsed = parseVueComponent(filePath);
    if (!parsed) return;

    const unused = findUnusedFunctions(parsed);
    if (!unused) return;

    const issuesInFile =
      unused.methods.length +
      unused.computed.length +
      unused.watchers.length +
      unused.lifecycle.length;

    if (issuesInFile > 0) {
      totalIssues += issuesInFile;

      const issue = {
        file: relPath,
        issues: unused,
        count: issuesInFile,
      };

      report.push(issue);

      log(`  ⚠️  Found ${issuesInFile} potential issues`, 'yellow');

      if (unused.methods.length > 0) {
        log(`    - Unused methods: ${unused.methods.join(', ')}`, 'yellow');
      }
      if (unused.computed.length > 0) {
        log(`    - Unused computed: ${unused.computed.join(', ')}`, 'yellow');
      }
      if (unused.watchers.length > 0) {
        log(`    - Unused watchers: ${unused.watchers.join(', ')}`, 'yellow');
      }
      if (unused.lifecycle.length > 0) {
        log(`    - Unused lifecycle: ${unused.lifecycle.join(', ')}`, 'yellow');
      }
    } else {
      log(`  ✅ Clean`, 'green');
    }
  });

  // Generate report
  log('\n' + '='.repeat(80), 'cyan');
  log('AUDIT SUMMARY', 'cyan');
  log('='.repeat(80) + '\n', 'cyan');

  log(`Total files audited: ${allFiles.length}`, 'blue');
  log(`Files with issues: ${report.length}`, totalIssues > 0 ? 'red' : 'green');
  log(`Total issues found: ${totalIssues}\n`, totalIssues > 0 ? 'red' : 'green');

  if (report.length > 0) {
    log('Issues by file:', 'yellow');
    report.forEach((item) => {
      log(`  ${item.file}: ${item.count} issues`, 'yellow');
    });
  }

  // Save report to file
  const reportPath = path.join(__dirname, '../docs/PHASE33_AUDIT_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${reportPath}`, 'green');

  log('\n✅ Audit complete!\n', 'green');
}

// Run audit
runAudit().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
