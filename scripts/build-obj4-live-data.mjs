import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const capabilitiesRoot = path.join(repoRoot, "capabilities");
const outputPath = path.join(
  repoRoot,
  "capability-dashboard-live",
  "data",
  "capabilities-dashboard.json",
);
const capabilitiesIndexPath = path.join(capabilitiesRoot, "INDEX.md");

const SOURCE_TYPES = ["NATO", "ARCH", "CUST", "INT"];
const PRIORITIES = ["MUSS", "SOLLTE", "KANN"];

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function slugToTitle(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeKey(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/`+/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*---+\s*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function heading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? stripMarkdown(match[1]) : "";
}

function extractSection(content, matcher) {
  const lines = content.split(/\r?\n/);
  let start = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const headingMatch = lines[index].match(/^##\s+(.+)$/);
    if (!headingMatch) {
      continue;
    }
    const title = stripMarkdown(headingMatch[1]);
    if (matcher(title)) {
      start = index + 1;
      break;
    }
  }

  if (start < 0) {
    return "";
  }

  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }

  return lines.slice(start, end).join("\n").trim();
}

function parseMetadata(content) {
  const metadataSection = extractSection(content, (title) =>
    /^metadaten$/i.test(title),
  );
  const metadata = {};

  if (!metadataSection) {
    return metadata;
  }

  for (const line of metadataSection.split(/\r?\n/)) {
    const tableMatch = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|$/);
    if (!tableMatch) {
      continue;
    }

    const key = normalizeKey(tableMatch[1]);
    const value = stripMarkdown(tableMatch[2]);
    metadata[key] = value;
  }

  return metadata;
}

function parseSourceType(value) {
  const upper = String(value || "").toUpperCase();
  const bracketMatch = upper.match(/\[(NATO|ARCH|CUST|INT)\]/);
  if (bracketMatch) {
    return bracketMatch[1];
  }

  for (const sourceType of SOURCE_TYPES) {
    if (upper.includes(sourceType)) {
      return sourceType;
    }
  }

  return "INT";
}

function parsePriority(value) {
  const upper = String(value || "").toUpperCase();
  if (upper.includes("MUSS") || upper.includes("SHALL")) {
    return "MUSS";
  }
  if (upper.includes("SOLLTE") || upper.includes("SHOULD")) {
    return "SOLLTE";
  }
  if (upper.includes("KANN") || upper.includes("MAY")) {
    return "KANN";
  }

  return "MUSS";
}

function parseAcceptanceCriteria(section) {
  if (!section) {
    return [];
  }

  const criteria = [];

  for (const line of section.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("|")) {
      continue;
    }

    const listMatch = trimmed.match(/^(?:[-*]\s+|\d+\.\s+)(.+)$/);
    if (listMatch) {
      criteria.push(stripMarkdown(listMatch[1]));
    }
  }

  if (criteria.length > 0) {
    return criteria;
  }

  const fallback = stripMarkdown(section);
  return fallback ? [fallback] : [];
}

function parseRequirementContent(content, requirementId, fileName) {
  const metadata = parseMetadata(content);
  const requirementHeading = heading(content);
  const titlePrefix = new RegExp(
    `^(?:${escapeRegExp(requirementId)}|${escapeRegExp(fileName)})\\s*[:\\-]\\s*`,
    "i",
  );
  const title = requirementHeading
    .replace(titlePrefix, "")
    .replace(/^Requirement\s*[:\\-]\s*/i, "")
    .trim();

  const originalSection =
    extractSection(content, (sectionTitle) =>
      /^anforderungstext\s*\(original\)$/i.test(sectionTitle),
    ) ||
    extractSection(content, (sectionTitle) =>
      /^anforderungstext$/i.test(sectionTitle),
    ) ||
    extractSection(content, (sectionTitle) =>
      /^anforderungstext\b/i.test(sectionTitle) &&
      !/deutsch/i.test(sectionTitle),
    );

  const germanSection = extractSection(content, (sectionTitle) =>
    /^anforderungstext\s*\(deutsch\)$/i.test(sectionTitle),
  );

  const acceptanceSection = extractSection(content, (sectionTitle) =>
    /^akzeptanzkriterien$/i.test(sectionTitle),
  );

  return {
    title: title || requirementId,
    sourceType: parseSourceType(metadata.quelle || metadata.quellentyp || ""),
    priority: parsePriority(metadata.prioritat || metadata.prioritaet || ""),
    originalText: stripMarkdown(originalSection),
    germanText: stripMarkdown(germanSection),
    acceptanceCriteria: parseAcceptanceCriteria(acceptanceSection),
  };
}

async function readDirNames(targetPath) {
  try {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, "de"));
  } catch {
    return [];
  }
}

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function parseCapabilityIdentity(content, folderName) {
  const capId =
    content.match(/Capability ID:\*\*\s*(CAP-\d+)/i)?.[1] ||
    content.match(/\b(CAP-\d+)\b/i)?.[1] ||
    folderName.toUpperCase();

  const capName =
    heading(content)
      .replace(/^Capability\s*:\s*/i, "")
      .trim() || slugToTitle(folderName);

  const maturity =
    content.match(/\*\*Maturit[^:\n]*:\*\*\s*([^\n]+)/i)?.[1]?.trim() ||
    "Unbekannt";

  return { capId, capName, maturity: stripMarkdown(maturity) };
}

function parseServiceIdentity(content, folderName) {
  const serviceId =
    content.match(/Service ID:\*\*\s*([A-Z0-9-]+)/i)?.[1] ||
    content.match(/\b(SVC-[A-Z0-9-]+)\b/i)?.[1] ||
    folderName.toUpperCase();

  const serviceName =
    heading(content)
      .replace(/^Service\s*:\s*/i, "")
      .trim() || slugToTitle(folderName);

  return { serviceId, serviceName };
}

function parseServiceFunctionIdentity(content, folderName) {
  const headingLine = heading(content);
  const headingId = headingLine.match(/\b(SFN-[A-Z0-9-]+)\b/i)?.[1];
  const metadataId =
    content.match(/Service Function ID:\*\*\s*(SFN-[A-Z0-9-]+)/i)?.[1] ||
    content.match(/\((SFN-[A-Z0-9-]+)\)/i)?.[1];
  const sfnId = (metadataId || headingId || folderName).toUpperCase();

  const sfnName = headingLine
    .replace(/^Service Function\s*:\s*/i, "")
    .replace(/^SFN-[A-Z0-9-]+\s*[:\-]\s*/i, "")
    .replace(new RegExp(`\\(${escapeRegExp(sfnId)}\\)`, "i"), "")
    .trim();

  return {
    sfnId,
    sfnName: sfnName || slugToTitle(folderName),
  };
}

function summaryFromCapabilities(capabilities) {
  let serviceCount = 0;
  let serviceFunctionCount = 0;
  let requirementCount = 0;

  for (const capability of capabilities) {
    serviceCount += capability.services.length;
    for (const service of capability.services) {
      serviceFunctionCount += service.serviceFunctions.length;
      for (const serviceFunction of service.serviceFunctions) {
        requirementCount += serviceFunction.requirements.length;
      }
    }
  }

  return {
    capabilityCount: capabilities.length,
    serviceCount,
    serviceFunctionCount,
    requirementCount,
  };
}

async function buildData() {
  const capabilitiesIndex = await readFileIfExists(capabilitiesIndexPath);
  if (!capabilitiesIndex.trim()) {
    await fs.rm(outputPath, { force: true }).catch(() => {});
    throw new Error(
      "Required source file missing: capabilities/INDEX.md. Dashboard data build aborted.",
    );
  }

  const capabilityFolders = await readDirNames(capabilitiesRoot);
  const capabilities = [];

  for (const capabilityFolder of capabilityFolders) {
    const capabilityPath = path.join(capabilitiesRoot, capabilityFolder);
    const capabilityReadmePath = path.join(capabilityPath, "README.md");
    const capabilityReadme = await readFileIfExists(capabilityReadmePath);
    if (!capabilityReadme) {
      continue;
    }

    const { capId, capName, maturity } = parseCapabilityIdentity(
      capabilityReadme,
      capabilityFolder,
    );
    const capabilityRelativePath = toPosixPath(
      path.relative(repoRoot, capabilityReadmePath),
    );

    const capability = {
      key: `capability:${capId}`,
      kind: "capability",
      id: capId,
      name: capName,
      maturity,
      path: capabilityRelativePath,
      services: [],
    };

    const servicesRoot = path.join(capabilityPath, "services");
    const serviceFolders = await readDirNames(servicesRoot);

    for (const serviceFolder of serviceFolders) {
      const servicePath = path.join(servicesRoot, serviceFolder);
      const serviceReadmePath = path.join(servicePath, "README.md");
      const serviceReadme = await readFileIfExists(serviceReadmePath);
      if (!serviceReadme) {
        continue;
      }

      const { serviceId, serviceName } = parseServiceIdentity(
        serviceReadme,
        serviceFolder,
      );
      const serviceRelativePath = toPosixPath(
        path.relative(repoRoot, serviceReadmePath),
      );
      const service = {
        key: `service:${capId}:${serviceId}`,
        kind: "service",
        id: serviceId,
        name: serviceName,
        capabilityId: capId,
        path: serviceRelativePath,
        serviceFunctions: [],
      };

      const serviceFunctionsRoot = path.join(servicePath, "service-functions");
      const serviceFunctionFolders = await readDirNames(serviceFunctionsRoot);

      for (const serviceFunctionFolder of serviceFunctionFolders) {
        const serviceFunctionPath = path.join(
          serviceFunctionsRoot,
          serviceFunctionFolder,
        );
        const serviceFunctionReadmePath = path.join(
          serviceFunctionPath,
          "README.md",
        );
        const serviceFunctionReadme = await readFileIfExists(
          serviceFunctionReadmePath,
        );
        if (!serviceFunctionReadme) {
          continue;
        }

        const { sfnId, sfnName } = parseServiceFunctionIdentity(
          serviceFunctionReadme,
          serviceFunctionFolder,
        );
        const serviceFunctionRelativePath = toPosixPath(
          path.relative(repoRoot, serviceFunctionReadmePath),
        );
        const serviceFunction = {
          key: `service-function:${capId}:${serviceId}:${sfnId}`,
          kind: "service-function",
          id: sfnId,
          name: sfnName,
          capabilityId: capId,
          serviceId,
          path: serviceFunctionRelativePath,
          requirements: [],
        };

        const requirementsRoot = path.join(serviceFunctionPath, "requirements");
        const requirementFiles = [];
        const requirementFileEntries = await fs
          .readdir(requirementsRoot, { withFileTypes: true })
          .catch(() => []);

        for (const requirementFileEntry of requirementFileEntries) {
          if (!requirementFileEntry.isFile()) {
            continue;
          }
          if (!requirementFileEntry.name.toLowerCase().endsWith(".md")) {
            continue;
          }
          requirementFiles.push(requirementFileEntry.name);
        }

        requirementFiles.sort((left, right) => left.localeCompare(right, "de"));

        for (const requirementFile of requirementFiles) {
          const requirementFilePath = path.join(requirementsRoot, requirementFile);
          const requirementContent = await readFileIfExists(requirementFilePath);
          if (!requirementContent) {
            continue;
          }

          const fileRequirementId = requirementFile.replace(/\.md$/i, "");
          const parsedRequirement = parseRequirementContent(
            requirementContent,
            fileRequirementId,
            requirementFile,
          );

          const requirement = {
            key: `requirement:${capId}:${serviceId}:${sfnId}:${fileRequirementId}`,
            kind: "requirement",
            id: fileRequirementId,
            title: parsedRequirement.title,
            sourceType: parsedRequirement.sourceType,
            priority: parsedRequirement.priority,
            originalText: parsedRequirement.originalText,
            germanText: parsedRequirement.germanText,
            acceptanceCriteria: parsedRequirement.acceptanceCriteria,
            capabilityId: capId,
            serviceId,
            serviceFunctionId: sfnId,
            path: toPosixPath(path.relative(repoRoot, requirementFilePath)),
          };

          serviceFunction.requirements.push(requirement);
        }

        serviceFunction.requirements.sort((left, right) =>
          left.id.localeCompare(right.id, "de"),
        );
        service.serviceFunctions.push(serviceFunction);
      }

      service.serviceFunctions.sort((left, right) =>
        left.id.localeCompare(right.id, "de"),
      );
      capability.services.push(service);
    }

    capability.services.sort((left, right) =>
      left.id.localeCompare(right.id, "de"),
    );
    capabilities.push(capability);
  }

  capabilities.sort((left, right) => left.id.localeCompare(right.id, "de"));

  const summary = summaryFromCapabilities(capabilities);
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceRoot: "capabilities/",
    sourceIndex: toPosixPath(path.relative(repoRoot, capabilitiesIndexPath)),
    supportedSourceTypes: SOURCE_TYPES,
    supportedPriorities: PRIORITIES,
    summary,
    capabilities,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `OBJ-4 data generated: ${toPosixPath(path.relative(repoRoot, outputPath))}`,
  );
  console.log(
    `Capabilities: ${summary.capabilityCount}, Services: ${summary.serviceCount}, SFNs: ${summary.serviceFunctionCount}, Requirements: ${summary.requirementCount}`,
  );
}

buildData().catch((error) => {
  console.error("Failed to build OBJ-4 live dashboard data.");
  console.error(error);
  process.exitCode = 1;
});
