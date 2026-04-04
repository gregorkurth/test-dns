const DATA_URL = "./data/capabilities-dashboard.json";

const SOURCE_FILTER_VALUES = new Set(["ALL", "NATO", "ARCH", "CUST", "INT"]);
const PRIORITY_FILTER_VALUES = new Set(["ALL", "MUSS", "SOLLTE", "KANN"]);

const dom = {
  sourceFilter: document.querySelector("#sourceFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  expandAll: document.querySelector("#expandAll"),
  collapseAll: document.querySelector("#collapseAll"),
  summaryCards: document.querySelector("#summaryCards"),
  statusMessage: document.querySelector("#statusMessage"),
  treeContainer: document.querySelector("#treeContainer"),
  detailContainer: document.querySelector("#detailContainer"),
};

const state = {
  rawData: null,
  visibleData: null,
  selectedKey: null,
  filters: {
    source: "ALL",
    priority: "ALL",
  },
  visibleLookup: new Map(),
  collapsedKeys: new Set(),
  loadError: false,
};

function setStatus(message, { isError = false } = {}) {
  dom.statusMessage.textContent = message;
  dom.statusMessage.classList.toggle("error", isError);
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (typeof textContent === "string") {
    element.textContent = textContent;
  }
  return element;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.toLocaleDateString("de-CH")} ${date.toLocaleTimeString("de-CH")}`;
}

function flattenRequirements(data) {
  const requirements = [];
  for (const capability of data.capabilities) {
    for (const service of capability.services) {
      for (const serviceFunction of service.serviceFunctions) {
        for (const requirement of serviceFunction.requirements) {
          requirements.push(requirement);
        }
      }
    }
  }
  return requirements;
}

function matchesRequirement(requirement, filters) {
  if (filters.source !== "ALL" && requirement.sourceType !== filters.source) {
    return false;
  }
  if (filters.priority !== "ALL" && requirement.priority !== filters.priority) {
    return false;
  }
  return true;
}

function filterData(rawData, filters) {
  const capabilities = [];

  for (const capability of rawData.capabilities || []) {
    const capabilityClone = {
      ...capability,
      services: [],
    };

    for (const service of capability.services || []) {
      const serviceClone = {
        ...service,
        serviceFunctions: [],
      };

      for (const serviceFunction of service.serviceFunctions || []) {
        const allRequirements = serviceFunction.requirements || [];
        const filteredRequirements = allRequirements.filter((requirement) =>
          matchesRequirement(requirement, filters),
        );

        if (allRequirements.length > 0 && filteredRequirements.length === 0) {
          continue;
        }

        serviceClone.serviceFunctions.push({
          ...serviceFunction,
          requirements: filteredRequirements,
          totalRequirementCount: allRequirements.length,
        });
      }

      if (serviceClone.serviceFunctions.length > 0) {
        capabilityClone.services.push(serviceClone);
      }
    }

    if (capabilityClone.services.length > 0) {
      capabilities.push(capabilityClone);
    }
  }

  return {
    ...rawData,
    capabilities,
  };
}

function countTotals(data) {
  const requirements = flattenRequirements(data).length;
  let services = 0;
  let serviceFunctions = 0;

  for (const capability of data.capabilities) {
    services += capability.services.length;
    for (const service of capability.services) {
      serviceFunctions += service.serviceFunctions.length;
    }
  }

  return {
    capabilities: data.capabilities.length,
    services,
    serviceFunctions,
    requirements,
  };
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function renderSummaryCards() {
  clearElement(dom.summaryCards);
  if (!state.rawData) {
    return;
  }

  const total = countTotals(state.rawData);
  const visible = countTotals(state.visibleData);
  const cards = [
    {
      label: "Capabilities",
      value: `${visible.capabilities} / ${total.capabilities}`,
    },
    {
      label: "Services",
      value: `${visible.services} / ${total.services}`,
    },
    {
      label: "Requirements",
      value: `${visible.requirements} / ${total.requirements}`,
    },
    {
      label: "Data Build",
      value: formatDateTime(state.rawData.generatedAt),
    },
  ];

  for (const card of cards) {
    const cardElement = createElement("div", "summary-card");
    cardElement.appendChild(createElement("span", "label", card.label));
    cardElement.appendChild(createElement("span", "value", card.value));
    dom.summaryCards.appendChild(cardElement);
  }
}

function firstSelectableKey(visibleData) {
  for (const capability of visibleData.capabilities) {
    if (state.collapsedKeys.has(capability.key) || capability.services.length === 0) {
      return capability.key;
    }

    for (const service of capability.services) {
      if (
        state.collapsedKeys.has(service.key) ||
        service.serviceFunctions.length === 0
      ) {
        return service.key;
      }

      for (const serviceFunction of service.serviceFunctions) {
        if (
          state.collapsedKeys.has(serviceFunction.key) ||
          serviceFunction.requirements.length === 0
        ) {
          return serviceFunction.key;
        }

        if (serviceFunction.requirements.length > 0) {
          return serviceFunction.requirements[0].key;
        }
        return serviceFunction.key;
      }
      return service.key;
    }
    return capability.key;
  }
  return null;
}

function collectVisibleKeys(visibleData) {
  const keys = new Set();
  for (const capability of visibleData.capabilities) {
    keys.add(capability.key);
    if (state.collapsedKeys.has(capability.key)) {
      continue;
    }

    for (const service of capability.services) {
      keys.add(service.key);
      if (state.collapsedKeys.has(service.key)) {
        continue;
      }

      for (const serviceFunction of service.serviceFunctions) {
        keys.add(serviceFunction.key);
        if (state.collapsedKeys.has(serviceFunction.key)) {
          continue;
        }

        for (const requirement of serviceFunction.requirements) {
          keys.add(requirement.key);
        }
      }
    }
  }
  return keys;
}

function collectExpandableKeys(data) {
  const keys = new Set();
  for (const capability of data.capabilities) {
    if (capability.services.length > 0) {
      keys.add(capability.key);
    }
    for (const service of capability.services) {
      if (service.serviceFunctions.length > 0) {
        keys.add(service.key);
      }
      for (const serviceFunction of service.serviceFunctions) {
        if (serviceFunction.requirements.length > 0) {
          keys.add(serviceFunction.key);
        }
      }
    }
  }
  return keys;
}

function createPill(text, className) {
  return createElement("span", `pill ${className}`.trim(), text);
}

function appendTreeNode({ key, label, meta, depth, pill, isExpandable = false }) {
  const button = createElement("button", `tree-node indent-${Math.min(depth, 3)}`);
  button.type = "button";
  button.dataset.key = key;
  if (state.selectedKey === key) {
    button.classList.add("is-active");
  }

  if (isExpandable) {
    const isCollapsed = state.collapsedKeys.has(key);
    const toggle = createElement("span", "tree-toggle", isCollapsed ? "▸" : "▾");
    toggle.dataset.toggleKey = key;
    toggle.title = isCollapsed ? "Aufklappen" : "Zuklappen";
    button.appendChild(toggle);
  } else {
    button.appendChild(createElement("span", "tree-toggle-spacer"));
  }

  button.appendChild(createElement("span", "label", label));

  if (meta) {
    button.appendChild(createElement("span", "meta", meta));
  }

  if (pill) {
    button.appendChild(pill);
  }

  dom.treeContainer.appendChild(button);
}

function renderTree() {
  clearElement(dom.treeContainer);
  state.visibleLookup.clear();

  if (!state.visibleData || state.visibleData.capabilities.length === 0) {
    dom.treeContainer.appendChild(
      createElement(
        "p",
        "empty-note",
        "Keine Treffer fuer die aktuellen Filter. Bitte Filter anpassen.",
      ),
    );
    return;
  }

  for (const capability of state.visibleData.capabilities) {
    state.visibleLookup.set(capability.key, {
      kind: "capability",
      capability,
    });
    appendTreeNode({
      key: capability.key,
      label: `${capability.id} - ${capability.name}`,
      meta: `${capability.services.length} Services`,
      depth: 0,
      pill: createPill(capability.maturity, "source"),
      isExpandable: capability.services.length > 0,
    });

    if (state.collapsedKeys.has(capability.key)) {
      continue;
    }

    for (const service of capability.services) {
      state.visibleLookup.set(service.key, {
        kind: "service",
        capability,
        service,
      });
      appendTreeNode({
        key: service.key,
        label: `${service.id} - ${service.name}`,
        meta: `${service.serviceFunctions.length} SFN`,
        depth: 1,
        isExpandable: service.serviceFunctions.length > 0,
      });

      if (state.collapsedKeys.has(service.key)) {
        continue;
      }

      for (const serviceFunction of service.serviceFunctions) {
        state.visibleLookup.set(serviceFunction.key, {
          kind: "service-function",
          capability,
          service,
          serviceFunction,
        });

        const requirementCountText =
          serviceFunction.totalRequirementCount === 0
            ? "Keine Requirements definiert"
            : `${serviceFunction.requirements.length} Requirements sichtbar`;

        appendTreeNode({
          key: serviceFunction.key,
          label: `${serviceFunction.id} - ${serviceFunction.name}`,
          meta: requirementCountText,
          depth: 2,
          isExpandable: serviceFunction.requirements.length > 0,
        });

        if (serviceFunction.totalRequirementCount === 0) {
          const emptyNode = createElement(
            "p",
            "empty-note muted indent-3",
            "Keine Requirements definiert",
          );
          dom.treeContainer.appendChild(emptyNode);
          continue;
        }

        if (state.collapsedKeys.has(serviceFunction.key)) {
          continue;
        }

        for (const requirement of serviceFunction.requirements) {
          state.visibleLookup.set(requirement.key, {
            kind: "requirement",
            capability,
            service,
            serviceFunction,
            requirement,
          });

          appendTreeNode({
            key: requirement.key,
            label: `${requirement.id} - ${requirement.title}`,
            meta: `${requirement.sourceType} | ${requirement.priority}`,
            depth: 3,
            pill: createPill(
              requirement.priority,
              `priority-${requirement.priority.toLowerCase()}`,
            ),
          });
        }
      }
    }
  }
}

function appendMetaLine(parent, label, value) {
  const line = createElement("p", "detail-text");
  const strong = createElement("strong", "", `${label}:`);
  line.appendChild(strong);
  line.appendChild(document.createTextNode(` ${value || "-"}`));
  parent.appendChild(line);
}

function createExpandableTextBlock({ title, text, fallbackText }) {
  const block = createElement("div", "detail-block");
  block.appendChild(createElement("h3", "detail-title", title));

  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    block.appendChild(createElement("p", "empty-note", fallbackText));
    return block;
  }

  const paragraph = createElement("p", "detail-text");
  const limit = 360;

  if (normalizedText.length <= limit) {
    paragraph.textContent = normalizedText;
    block.appendChild(paragraph);
    return block;
  }

  let expanded = false;
  const button = createElement("button", "inline-button", "Mehr anzeigen");
  button.type = "button";

  const updateText = () => {
    if (expanded) {
      paragraph.textContent = normalizedText;
      button.textContent = "Weniger anzeigen";
    } else {
      paragraph.textContent = `${normalizedText.slice(0, limit)}...`;
      button.textContent = "Mehr anzeigen";
    }
  };

  button.addEventListener("click", () => {
    expanded = !expanded;
    updateText();
  });

  updateText();
  block.appendChild(paragraph);
  block.appendChild(button);
  return block;
}

function renderCapabilityDetail(context) {
  const { capability } = context;

  const overview = createElement("div", "detail-block");
  overview.appendChild(
    createElement("h3", "detail-title", `${capability.id} - ${capability.name}`),
  );
  appendMetaLine(overview, "Maturitaet", capability.maturity);
  appendMetaLine(overview, "Services", String(capability.services.length));
  appendMetaLine(overview, "Quelle", capability.path);
  dom.detailContainer.appendChild(overview);
}

function renderServiceDetail(context) {
  const { capability, service } = context;

  const overview = createElement("div", "detail-block");
  overview.appendChild(
    createElement("h3", "detail-title", `${service.id} - ${service.name}`),
  );
  appendMetaLine(overview, "Capability", `${capability.id} - ${capability.name}`);
  appendMetaLine(overview, "Service Functions", String(service.serviceFunctions.length));
  appendMetaLine(overview, "Quelle", service.path);
  dom.detailContainer.appendChild(overview);
}

function renderServiceFunctionDetail(context) {
  const { capability, service, serviceFunction } = context;

  const overview = createElement("div", "detail-block");
  overview.appendChild(
    createElement(
      "h3",
      "detail-title",
      `${serviceFunction.id} - ${serviceFunction.name}`,
    ),
  );
  appendMetaLine(overview, "Capability", `${capability.id} - ${capability.name}`);
  appendMetaLine(overview, "Service", `${service.id} - ${service.name}`);
  appendMetaLine(overview, "Requirements", String(serviceFunction.totalRequirementCount));
  appendMetaLine(overview, "Quelle", serviceFunction.path);
  dom.detailContainer.appendChild(overview);

  if (serviceFunction.totalRequirementCount === 0) {
    dom.detailContainer.appendChild(
      createElement(
        "p",
        "empty-note",
        "Keine Requirements definiert. Diese Service Function ist noch unvollstaendig.",
      ),
    );
  }
}

function renderRequirementDetail(context) {
  const { capability, service, serviceFunction, requirement } = context;

  const overview = createElement("div", "detail-block");
  overview.appendChild(
    createElement(
      "h3",
      "detail-title",
      `${requirement.id} - ${requirement.title}`,
    ),
  );

  const meta = createElement("div", "detail-meta");
  meta.appendChild(createPill(`[${requirement.sourceType}]`, "source"));
  meta.appendChild(
    createPill(
      requirement.priority,
      `priority-${requirement.priority.toLowerCase()}`,
    ),
  );
  overview.appendChild(meta);

  appendMetaLine(overview, "Capability", `${capability.id} - ${capability.name}`);
  appendMetaLine(overview, "Service", `${service.id} - ${service.name}`);
  appendMetaLine(overview, "Service Function", `${serviceFunction.id} - ${serviceFunction.name}`);
  appendMetaLine(overview, "Dateiquelle", requirement.path);
  dom.detailContainer.appendChild(overview);

  dom.detailContainer.appendChild(
    createExpandableTextBlock({
      title: "Anforderungstext (Original)",
      text: requirement.originalText,
      fallbackText: "Kein Originaltext hinterlegt.",
    }),
  );

  dom.detailContainer.appendChild(
    createExpandableTextBlock({
      title: "Anforderungstext (Deutsch)",
      text: requirement.germanText,
      fallbackText: "Keine deutsche Uebersetzung vorhanden.",
    }),
  );

  const criteriaBlock = createElement("div", "detail-block");
  criteriaBlock.appendChild(createElement("h3", "detail-title", "Akzeptanzkriterien"));
  if ((requirement.acceptanceCriteria || []).length === 0) {
    criteriaBlock.appendChild(
      createElement("p", "empty-note", "Keine Akzeptanzkriterien hinterlegt."),
    );
  } else {
    const list = createElement("ol", "criteria-list");
    for (const criterion of requirement.acceptanceCriteria) {
      list.appendChild(createElement("li", "", criterion));
    }
    criteriaBlock.appendChild(list);
  }
  dom.detailContainer.appendChild(criteriaBlock);
}

function renderDetail() {
  clearElement(dom.detailContainer);

  if (!state.selectedKey) {
    dom.detailContainer.appendChild(
      createElement("p", "empty-note", "Keine Auswahl vorhanden."),
    );
    return;
  }

  const context = state.visibleLookup.get(state.selectedKey);
  if (!context) {
    dom.detailContainer.appendChild(
      createElement("p", "empty-note", "Auswahl ist mit aktuellem Filter nicht sichtbar."),
    );
    return;
  }

  if (context.kind === "capability") {
    renderCapabilityDetail(context);
    return;
  }
  if (context.kind === "service") {
    renderServiceDetail(context);
    return;
  }
  if (context.kind === "service-function") {
    renderServiceFunctionDetail(context);
    return;
  }
  renderRequirementDetail(context);
}

function renderStatusForCurrentState() {
  if (state.loadError) {
    setStatus("Capabilities-Daten nicht gefunden. Bitte pruefe data/capabilities-dashboard.json.", {
      isError: true,
    });
    return;
  }

  const visibleCounts = countTotals(state.visibleData);
  if (visibleCounts.requirements === 0) {
    setStatus("Keine Requirements fuer die aktuellen Filter gefunden.");
    return;
  }

  const sourceText =
    state.filters.source === "ALL" ? "alle Quellen" : `[${state.filters.source}]`;
  const priorityText =
    state.filters.priority === "ALL" ? "alle Prioritaeten" : state.filters.priority;
  setStatus(
    `Filter aktiv: ${sourceText}, ${priorityText}. Sichtbare Requirements: ${visibleCounts.requirements}.`,
  );
}

function render() {
  if (!state.rawData) {
    return;
  }

  state.visibleData = filterData(state.rawData, state.filters);
  const visibleKeys = collectVisibleKeys(state.visibleData);
  const firstKey = firstSelectableKey(state.visibleData);
  if (!firstKey) {
    state.selectedKey = null;
  } else if (!state.selectedKey || !visibleKeys.has(state.selectedKey)) {
    state.selectedKey = firstKey;
  }

  renderTree();
  renderDetail();
  renderSummaryCards();
  renderStatusForCurrentState();
}

function validateFilterValue(value, supportedValues, fallback) {
  return supportedValues.has(value) ? value : fallback;
}

async function loadData() {
  setStatus("Lade Capabilities-Daten...");
  state.loadError = false;

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload.capabilities)) {
      throw new Error("Invalid data format");
    }

    state.rawData = payload;
    render();
  } catch (error) {
    state.loadError = true;
    state.rawData = {
      generatedAt: null,
      capabilities: [],
    };
    render();
    console.error("Failed to load live dashboard data", error);
  }
}

function wireEvents() {
  dom.sourceFilter.addEventListener("change", (event) => {
    state.filters.source = validateFilterValue(
      event.target.value,
      SOURCE_FILTER_VALUES,
      "ALL",
    );
    render();
  });

  dom.priorityFilter.addEventListener("change", (event) => {
    state.filters.priority = validateFilterValue(
      event.target.value,
      PRIORITY_FILTER_VALUES,
      "ALL",
    );
    render();
  });

  dom.resetFilters.addEventListener("click", () => {
    state.filters.source = "ALL";
    state.filters.priority = "ALL";
    dom.sourceFilter.value = "ALL";
    dom.priorityFilter.value = "ALL";
    render();
  });

  dom.expandAll.addEventListener("click", () => {
    state.collapsedKeys.clear();
    render();
  });

  dom.collapseAll.addEventListener("click", () => {
    const expandableKeys = collectExpandableKeys(state.visibleData || { capabilities: [] });
    state.collapsedKeys = expandableKeys;
    render();
  });

  dom.treeContainer.addEventListener("click", (event) => {
    const toggleTarget = event.target.closest("[data-toggle-key]");
    if (toggleTarget) {
      const toggleKey = toggleTarget.dataset.toggleKey;
      if (!toggleKey) {
        return;
      }

      if (state.collapsedKeys.has(toggleKey)) {
        state.collapsedKeys.delete(toggleKey);
      } else {
        state.collapsedKeys.add(toggleKey);
      }
      render();
      return;
    }

    const nodeButton = event.target.closest("button.tree-node");
    if (!nodeButton) {
      return;
    }
    state.selectedKey = nodeButton.dataset.key || null;
    renderDetail();

    for (const button of dom.treeContainer.querySelectorAll("button.tree-node")) {
      button.classList.toggle("is-active", button.dataset.key === state.selectedKey);
    }
  });
}

async function bootstrap() {
  wireEvents();
  await loadData();
}

bootstrap();
