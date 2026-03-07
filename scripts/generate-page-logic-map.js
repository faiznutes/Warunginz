#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { ROOT, getEnrichedEntries, unique } = require("./page-audit-shared");

function render() {
  const enriched = getEnrichedEntries();
  const domains = unique(enriched.map((entry) => entry.domain));
  const lines = [];

  lines.push("# PAGE LOGIC MAP");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Coverage");
  lines.push("");
  lines.push(`- Routed page entries covered: ${enriched.length}`);
  lines.push(
    `- Page files with direct API calls: ${enriched.filter((entry) => entry.calls.length > 0).length}`,
  );
  lines.push(
    `- Page files without direct API calls: ${enriched.filter((entry) => entry.calls.length === 0).length}`,
  );
  lines.push("- Scope: seluruh routed views yang dipakai user, termasuk halaman sistem/internal yang masih aktif di router.");
  lines.push("");
  lines.push("## Domain Summary");
  lines.push("");
  lines.push("| Domain | Pages |");
  lines.push("|---|---:|");
  for (const domain of domains) {
    lines.push(`| ${domain} | ${enriched.filter((entry) => entry.domain === domain).length} |`);
  }
  lines.push("");
  lines.push("## Page By Page");
  lines.push("");

  for (const domain of domains) {
    lines.push(`## ${domain}`);
    lines.push("");
    const domainEntries = enriched.filter((entry) => entry.domain === domain);
    for (const entry of domainEntries) {
      const gateNotes = [];
      if (entry.requiresPermission) {
        gateNotes.push(
          `requiresPermission ${entry.requiresPermission.role}:${entry.requiresPermission.permission}`,
        );
      }
      if (entry.requiresAddon) {
        gateNotes.push(`requiresAddon ${entry.requiresAddon}`);
      }

      lines.push(`### ${entry.fullPath}`);
      lines.push(`- View: \`${entry.viewPath}\``);
      lines.push(`- Route name: \`${entry.routeName}\``);
      lines.push(`- Layout: ${entry.layout}`);
      lines.push(`- Roles: ${entry.roles.length > 0 ? entry.roles.join(", ") : "Public"}`);
      lines.push(`- Gate tambahan: ${gateNotes.length > 0 ? gateNotes.join("; ") : "-"}`);
      lines.push(`- Tujuan halaman: ${entry.purpose}`);
      lines.push(`- API utama: ${entry.apiSummary}`);
      lines.push(`- Dependensi tenant/store: ${entry.tenantStoreDependency}`);
      lines.push(`- Guard/redirect: ${entry.guardSummary || "-"}`);
      lines.push(`- Navigasi keluar yang terdeteksi: ${entry.outgoingRoutes.length > 0 ? entry.outgoingRoutes.join(", ") : "-"}`);
      lines.push(`- Filter/export/CRUD yang terdeteksi: ${entry.uiCapabilitySummary}`);
      lines.push(`- Empty/error state yang perlu dicek: ${entry.failureSignals}`);
      lines.push(`- Aksi write yang tersedia: ${entry.writeSummary}`);
      lines.push("");
    }
  }

  fs.writeFileSync(path.join(ROOT, "PAGE_LOGIC_MAP.md"), `${lines.join("\n")}\n`);
  console.log("Report written: PAGE_LOGIC_MAP.md");
}

if (require.main === module) {
  render();
}

module.exports = {
  render,
};
