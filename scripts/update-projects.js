#!/usr/bin/env node

const fs = require("node:fs");

const USERNAME = "nguyenxuandinhit";
const README_PATH = "README.md";
const START = "<!-- AUTO-PROJECTS:START -->";
const END = "<!-- AUTO-PROJECTS:END -->";
const MAX_PROJECTS = 6;
const EXCLUDED_REPOS = [
  "BTNHOM_NOSQL",
  "WebBanMyPham",
  "API-webmovie",
  "TH_Deep_Learning",
];

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

async function fetchRepositories() {
  const response = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?type=owner&sort=updated&direction=desc&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `${USERNAME}-profile-updater`,
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}`);
  }
  return response.json();
}

function selectProjects(repositories) {
  const candidates = repositories.filter(
    (repo) =>
      !repo.fork &&
      !repo.archived &&
      repo.name !== USERNAME &&
      !EXCLUDED_REPOS.includes(repo.name),
  );
  return candidates.slice(0, MAX_PROJECTS);
}

const PROJECT_META = {
  ShopeeSnip: {
    desc: "Automated Shopee data extraction, deals & sniping automation tool.",
    topics: ["python", "automation", "shopee-tool", "bot"],
  },
  MetaAIChecker: {
    desc: "A project focusing on AI integration & verification automation workflows.",
    topics: ["python", "ai-tool", "automation"],
  },
  "Spam-send-mail-": {
    desc: "Automated email delivery & mailing automation tool.",
    topics: ["automation", "email-tool", "javascript"],
  },
  Downloadlink_CamScanner: {
    desc: "Web utility tool for file downloading and document processing.",
    topics: ["html", "javascript", "utility"],
  },
};

function renderCard(repo) {
  const meta = PROJECT_META[repo.name] || {};
  const description = escapeHtml(repo.description || meta.desc || "A project by Nguyễn Xuân Định.");
  const language = escapeHtml(repo.language || "Multi-language");
  const topics = repo.topics && repo.topics.length ? repo.topics.slice(0, 4) : (meta.topics || ["project", "automation"]);
  const topicLine = topics.map((t) => `<code>${escapeHtml(t)}</code>`).join(" ");

  return `### <a href="${repo.html_url}">${escapeHtml(repo.name)}</a>\n\n` +
    `${description}\n\n` +
    `${topicLine}\n\n` +
    `<a href="${repo.html_url}/stargazers"><img src="https://img.shields.io/github/stars/${USERNAME}/${encodeURIComponent(repo.name)}?style=flat-square&labelColor=020617&color=0284c7&logo=github&logoColor=38bdf8" alt="Stars" /></a> ` +
    `<img src="https://img.shields.io/badge/${encodeURIComponent(language)}-020617?style=flat-square&logoColor=38bdf8" alt="Language" /> ` +
    `<a href="${repo.html_url}"><img src="https://img.shields.io/badge/VIEW_REPOSITORY-020617?style=flat-square&logo=github&logoColor=38bdf8" alt="View" /></a>`;
}

async function main() {
  const repos = await fetchRepositories();
  const projects = selectProjects(repos);

  let tableHtml = "<table>\n";
  for (let i = 0; i < projects.length; i += 2) {
    tableHtml += "<tr>\n";
    tableHtml += `<td width="50%" valign="top">\n\n${renderCard(projects[i])}\n\n</td>\n`;
    if (projects[i + 1]) {
      tableHtml += `<td width="50%" valign="top">\n\n${renderCard(projects[i + 1])}\n\n</td>\n`;
    } else {
      tableHtml += `<td width="50%" valign="top">\n\n</td>\n`;
    }
    tableHtml += "</tr>\n";
  }
  tableHtml += "</table>\n";
  tableHtml += `<div align="center">\n<a href="https://github.com/${USERNAME}?tab=repositories"><img src="https://img.shields.io/badge/EXPLORE_ALL_PROJECTS-020617?style=for-the-badge&logo=github&logoColor=38bdf8" alt="Explore all projects" /></a>\n</div>`;

  const readme = fs.readFileSync(README_PATH, "utf8");
  const startIndex = readme.indexOf(START);
  const endIndex = readme.indexOf(END);

  if (startIndex === -1 || endIndex === -1) return;

  const updatedReadme =
    readme.slice(0, startIndex + START.length) +
    "\n" + tableHtml + "\n" +
    readme.slice(endIndex);

  fs.writeFileSync(README_PATH, updatedReadme, "utf8");
}

main();
