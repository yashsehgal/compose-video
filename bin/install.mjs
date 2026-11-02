#!/usr/bin/env node
// Installs the compose-video skills into Claude Code's skills folder.
//
//   npx github:yashsehgal/compose-video            all skills, for every project
//   npx github:yashsehgal/compose-video --project  into ./.claude/skills
//   ... --skill compose-audit --skill compose-sounds  only these
//   ... --list                                      list the skills, install nothing
//   ... --force                                     replace skills already installed

import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");

const args = process.argv.slice(2);
const flag = name => args.includes(name);
const picked = args.flatMap((arg, i) => (arg === "--skill" ? [args[i + 1]] : []));

if (flag("--help") || flag("-h")) {
  console.log(`compose-video: install the skills into Claude Code

  --project          install into ./.claude/skills instead of ~/.claude/skills
  --skill <name>     install only this skill (repeatable)
  --force            replace skills that are already installed
  --list             list the skills and exit`);
  process.exit(0);
}

/** The skill's one-line description, from its SKILL.md frontmatter. */
const describe = name => {
  const text = readFileSync(join(SOURCE, name, "SKILL.md"), "utf8");
  const line = text.match(/^description:\s*(.+)$/m)?.[1] ?? "";
  return line.split(". ")[0].replace(/\.$/, "");
};

const all = readdirSync(SOURCE, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(SOURCE, entry.name, "SKILL.md")))
  .map(entry => entry.name)
  .sort();

if (flag("--list")) {
  for (const name of all) console.log(`${name.padEnd(18)} ${describe(name)}`);
  process.exit(0);
}

const unknown = picked.filter(name => !all.includes(name));
if (unknown.length > 0) {
  console.error(`Unknown skill: ${unknown.join(", ")}. Run with --list to see them.`);
  process.exit(1);
}

const target = flag("--project")
  ? resolve(".claude", "skills")
  : join(homedir(), ".claude", "skills");
const chosen = picked.length > 0 ? picked : all;

let installed = 0;
for (const name of chosen) {
  const destination = join(target, name);
  if (existsSync(destination)) {
    if (!flag("--force")) {
      console.log(`  skip     ${name} (already installed; --force replaces it)`);
      continue;
    }
    // Replace the whole folder, so files a newer version dropped don't linger.
    rmSync(destination, { recursive: true });
  }
  cpSync(join(SOURCE, name), destination, { recursive: true });
  console.log(`  install  ${name}`);
  installed += 1;
}

console.log(`\n${installed} of ${chosen.length} skills installed in ${target}`);
if (installed > 0) console.log("Start a new Claude Code session to pick them up.");
