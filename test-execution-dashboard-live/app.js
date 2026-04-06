const DATA_URL = './data/test-execution-dashboard.json'

const dom = {
  summaryCards: document.querySelector('#summaryCards'),
  statusMessage: document.querySelector('#statusMessage'),
  objectFilter: document.querySelector('#objectFilter'),
  capabilityFilter: document.querySelector('#capabilityFilter'),
  serviceFunctionFilter: document.querySelector('#serviceFunctionFilter'),
  testTypeFilter: document.querySelector('#testTypeFilter'),
  statusFilter: document.querySelector('#statusFilter'),
  requirementFilter: document.querySelector('#requirementFilter'),
  resetFilters: document.querySelector('#resetFilters'),
  testsTableBody: document.querySelector('#testsTableBody'),
  detailPanel: document.querySelector('#detailPanel'),
  objectTableBody: document.querySelector('#objectTableBody'),
  releaseTableBody: document.querySelector('#releaseTableBody'),
  runTableBody: document.querySelector('#runTableBody'),
  statusRules: document.querySelector('#statusRules'),
  dataSources: document.querySelector('#dataSources'),
  tabButtons: Array.from(document.querySelectorAll('.tab-button')),
  tabPanels: Array.from(document.querySelectorAll('.tab-panel')),
}

const state = {
  rawData: null,
  selectedKey: null,
  activeTab: 'currentView',
  filters: {
    object: 'ALL',
    capability: 'ALL',
    serviceFunction: 'ALL',
    testType: 'ALL',
    status: 'ALL',
    requirement: '',
  },
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName)
  if (className) {
    element.className = className
  }
  if (typeof textContent === 'string') {
    element.textContent = textContent
  }
  return element
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function setStatus(message, { isError = false } = {}) {
  dom.statusMessage.textContent = message
  dom.statusMessage.classList.toggle('error', isError)
}

function formatDateTime(value) {
  if (!value) {
    return '—'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function statusLabel(value) {
  if (value === 'passed') return 'Passed'
  if (value === 'failed') return 'Failed'
  return 'Never Executed'
}

function statusClassName(value) {
  if (value === 'passed') return 'status-passed'
  if (value === 'failed') return 'status-failed'
  return 'status-never'
}

function normalizeRunId(record) {
  if (record.runId && String(record.runId).trim()) {
    return String(record.runId).trim()
  }
  if (record.executedAt) {
    return `RUN-${String(record.executedAt).slice(0, 10)}`
  }
  return 'RUN-UNASSIGNED'
}

function normalizeReleaseId(record) {
  if (record.releaseId && String(record.releaseId).trim()) {
    return String(record.releaseId).trim()
  }
  return 'RELEASE-UNASSIGNED'
}

function compareDateDesc(left, right) {
  const leftTs = left ? Date.parse(left) : Number.NEGATIVE_INFINITY
  const rightTs = right ? Date.parse(right) : Number.NEGATIVE_INFINITY
  if (leftTs === rightTs) return 0
  return rightTs - leftTs
}

function buildSnapshots(tests, mode) {
  const buckets = new Map()

  for (const test of tests) {
    for (const record of test.history || []) {
      if (!record.executedAt) {
        continue
      }
      const id = mode === 'run' ? normalizeRunId(record) : normalizeReleaseId(record)
      const list = buckets.get(id) ?? []
      list.push({ testKey: test.key, record })
      buckets.set(id, list)
    }
  }

  const snapshots = []
  for (const [id, records] of buckets.entries()) {
    const latestByTest = new Map()
    const runIds = new Set()

    for (const item of records) {
      runIds.add(normalizeRunId(item.record))
      const existing = latestByTest.get(item.testKey)
      if (!existing || compareDateDesc(item.record.executedAt, existing.executedAt) < 0) {
        latestByTest.set(item.testKey, item.record)
      }
    }

    let passed = 0
    let failed = 0
    let lastExecutedAt = null

    for (const record of latestByTest.values()) {
      if (record.status === 'passed') passed += 1
      if (record.status === 'failed') failed += 1
      if (compareDateDesc(record.executedAt, lastExecutedAt) < 0) {
        lastExecutedAt = record.executedAt
      }
    }

    const totalTests = tests.length
    const executedTests = latestByTest.size
    const neverExecuted = Math.max(totalTests - executedTests, 0)

    snapshots.push({
      id,
      lastExecutedAt,
      totalTests,
      passed,
      failed,
      neverExecuted,
      incomplete: neverExecuted > 0 || id === 'RUN-UNASSIGNED' || id === 'RELEASE-UNASSIGNED',
      runCount: runIds.size,
    })
  }

  snapshots.sort((left, right) => {
    const dateDiff = compareDateDesc(left.lastExecutedAt, right.lastExecutedAt)
    if (dateDiff !== 0) return dateDiff
    return left.id.localeCompare(right.id, 'de')
  })

  if (snapshots.length === 0) {
    snapshots.push({
      id: mode === 'run' ? 'RUN-UNASSIGNED' : 'RELEASE-UNASSIGNED',
      lastExecutedAt: null,
      totalTests: tests.length,
      passed: 0,
      failed: 0,
      neverExecuted: tests.length,
      incomplete: tests.length > 0,
      runCount: 0,
    })
  }

  return snapshots
}

function buildObjSnapshots(tests, objects, focusObjectId) {
  const knownObjects = new Map((objects || []).map((entry) => [entry.id, entry.name]))
  const byObject = new Map()

  function ensureSnapshot(objId) {
    const existing = byObject.get(objId)
    if (existing) {
      return existing
    }

    const created = {
      id: objId,
      name:
        knownObjects.get(objId) ||
        (objId === 'OBJ-UNASSIGNED' ? 'Unzugeordnet' : 'Unbekanntes Objekt'),
      totalTests: 0,
      passed: 0,
      failed: 0,
      neverExecuted: 0,
    }
    byObject.set(objId, created)
    return created
  }

  for (const test of tests) {
    const objectIds = Array.from(
      new Set(
        (Array.isArray(test.objIds) && test.objIds.length > 0
          ? test.objIds
          : ['OBJ-UNASSIGNED']
        ).map((id) => String(id).toUpperCase()),
      ),
    )
    const relevantObjectIds = focusObjectId
      ? objectIds.filter((id) => id === focusObjectId)
      : objectIds

    for (const objId of relevantObjectIds) {
      const snapshot = ensureSnapshot(objId)
      snapshot.totalTests += 1
      if (test.status === 'passed') snapshot.passed += 1
      else if (test.status === 'failed') snapshot.failed += 1
      else snapshot.neverExecuted += 1
    }
  }

  return Array.from(byObject.values()).sort((left, right) =>
    left.id.localeCompare(right.id, 'de'),
  )
}

function getFilteredTests() {
  if (!state.rawData) return []

  const requirementNeedle = state.filters.requirement.trim().toLowerCase()
  return state.rawData.tests.filter((test) => {
    if (state.filters.object !== 'ALL' && !(test.objIds || []).includes(state.filters.object)) {
      return false
    }
    if (
      state.filters.capability !== 'ALL' &&
      test.capabilityId !== state.filters.capability
    ) {
      return false
    }
    if (
      state.filters.serviceFunction !== 'ALL' &&
      test.serviceFunctionId !== state.filters.serviceFunction
    ) {
      return false
    }
    if (state.filters.testType !== 'ALL' && test.testType !== state.filters.testType) {
      return false
    }
    if (state.filters.status !== 'ALL' && test.status !== state.filters.status) {
      return false
    }
    if (!requirementNeedle) {
      return true
    }
    const req = (test.requirementId || '').toLowerCase()
    const testId = String(test.testId || '').toLowerCase()
    return req.includes(requirementNeedle) || testId.includes(requirementNeedle)
  })
}

function ensureSelectedKey(filteredTests) {
  if (filteredTests.length === 0) {
    state.selectedKey = null
    return
  }

  if (!state.selectedKey) {
    state.selectedKey = filteredTests[0].key
    return
  }

  const stillVisible = filteredTests.some((test) => test.key === state.selectedKey)
  if (!stillVisible) {
    state.selectedKey = filteredTests[0].key
  }
}

function populateFilters() {
  const objectOptions = [
    { value: 'ALL', label: 'Alle OBJs' },
    ...(state.rawData.filters?.objects || []).map((item) => ({
      value: item.id,
      label: `${item.id} · ${item.name}`,
    })),
  ]

  const capabilityOptions = [
    { value: 'ALL', label: 'Alle Capabilities' },
    ...(state.rawData.filters?.capabilities || []).map((item) => ({
      value: item.id,
      label: `${item.id} · ${item.name}`,
    })),
  ]

  const serviceFunctionOptions = [
    { value: 'ALL', label: 'Alle SFNs' },
    ...(state.rawData.filters?.serviceFunctions || []).map((item) => ({
      value: item.id,
      label: item.id,
    })),
  ]

  for (const [element, options, value] of [
    [dom.objectFilter, objectOptions, state.filters.object],
    [dom.capabilityFilter, capabilityOptions, state.filters.capability],
    [dom.serviceFunctionFilter, serviceFunctionOptions, state.filters.serviceFunction],
  ]) {
    clearElement(element)
    for (const option of options) {
      const optionElement = createElement('option', null, option.label)
      optionElement.value = option.value
      if (option.value === value) {
        optionElement.selected = true
      }
      element.appendChild(optionElement)
    }
  }
}

function renderSummaryCards(filteredTests) {
  clearElement(dom.summaryCards)
  if (!state.rawData) return

  let passed = 0
  let failed = 0
  let neverExecuted = 0
  for (const test of filteredTests) {
    if (test.status === 'passed') passed += 1
    else if (test.status === 'failed') failed += 1
    else neverExecuted += 1
  }

  const cards = [
    { label: 'Tests (gefiltert)', value: String(filteredTests.length) },
    { label: 'Passed', value: String(passed) },
    { label: 'Failed', value: String(failed) },
    { label: 'Never Executed', value: String(neverExecuted) },
    { label: 'Data Build', value: formatDateTime(state.rawData.generatedAt) },
  ]

  for (const card of cards) {
    const cardElement = createElement('div', 'summary-card')
    cardElement.appendChild(createElement('span', 'label', card.label))
    cardElement.appendChild(createElement('span', 'value', card.value))
    dom.summaryCards.appendChild(cardElement)
  }
}

function renderTestsTable(filteredTests) {
  clearElement(dom.testsTableBody)

  if (filteredTests.length === 0) {
    const row = createElement('tr')
    const cell = createElement(
      'td',
      null,
      'Keine Testfaelle fuer den aktuellen Filter gefunden.',
    )
    cell.colSpan = 7
    row.appendChild(cell)
    dom.testsTableBody.appendChild(row)
    return
  }

  for (const test of filteredTests) {
    const row = createElement('tr', test.key === state.selectedKey ? 'is-active' : '')
    row.addEventListener('click', () => {
      state.selectedKey = test.key
      render()
    })

    row.appendChild(createElement('td', null, test.testId))
    row.appendChild(createElement('td', null, (test.objIds || []).join(', ')))
    row.appendChild(createElement('td', null, test.requirementId || '—'))
    row.appendChild(createElement('td', null, test.testType))

    const statusCell = createElement('td')
    const status = createElement(
      'span',
      `status-pill ${statusClassName(test.status)}`,
      statusLabel(test.status),
    )
    statusCell.appendChild(status)
    row.appendChild(statusCell)

    row.appendChild(createElement('td', null, test.lastRunId || '—'))
    row.appendChild(createElement('td', null, test.lastReleaseId || '—'))
    dom.testsTableBody.appendChild(row)
  }
}

function renderDetailPanel(filteredTests) {
  clearElement(dom.detailPanel)

  const selected = filteredTests.find((test) => test.key === state.selectedKey) || null
  if (!selected) {
    dom.detailPanel.appendChild(
      createElement('p', 'detail-value', 'Waehle einen Testfall fuer Details.'),
    )
    return
  }

  const blocks = [
    ['Testfall', selected.testId],
    ['OBJ', (selected.objIds || []).join(', ') || 'OBJ-UNASSIGNED'],
    ['Capability', `${selected.capabilityId} · ${selected.capabilityName}`],
    ['Service Function', `${selected.serviceFunctionId} · ${selected.serviceFunctionName}`],
    ['Requirement', selected.requirementId || '—'],
    ['Letzte Ausfuehrung', formatDateTime(selected.lastExecutedAt)],
  ]

  for (const [label, value] of blocks) {
    const block = createElement('div', 'detail-block')
    block.appendChild(createElement('span', 'detail-label', label))
    block.appendChild(createElement('span', 'detail-value', value))
    dom.detailPanel.appendChild(block)
  }

  const historyTitle = createElement('span', 'detail-label', 'Historie')
  dom.detailPanel.appendChild(historyTitle)

  if (!selected.history || selected.history.length === 0) {
    dom.detailPanel.appendChild(
      createElement('p', 'detail-value', 'Kein Ausfuehrungsnachweis vorhanden.'),
    )
    return
  }

  for (const record of selected.history) {
    const historyItem = createElement('div', 'history-item')

    const header = createElement('div', 'history-header')
    header.appendChild(
      createElement(
        'span',
        `status-pill ${statusClassName(record.status)}`,
        statusLabel(record.status),
      ),
    )
    header.appendChild(createElement('span', 'detail-label', formatDateTime(record.executedAt)))
    historyItem.appendChild(header)

    historyItem.appendChild(
      createElement(
        'span',
        'detail-value',
        `Run: ${normalizeRunId(record)} · Release: ${normalizeReleaseId(record)}`,
      ),
    )
    historyItem.appendChild(
      createElement('span', 'detail-label', `Nachweis: ${record.evidencePath}`),
    )
    if (record.note) {
      const note = createElement('span', 'detail-value', `Hinweis: ${record.note}`)
      note.style.color = '#991b1b'
      historyItem.appendChild(note)
    }

    dom.detailPanel.appendChild(historyItem)
  }
}

function renderSnapshotTable(targetBody, snapshots) {
  clearElement(targetBody)
  for (const snapshot of snapshots) {
    const row = createElement('tr')
    row.appendChild(createElement('td', null, snapshot.id))
    row.appendChild(createElement('td', null, String(snapshot.passed)))
    row.appendChild(createElement('td', null, String(snapshot.failed)))
    row.appendChild(createElement('td', null, String(snapshot.neverExecuted)))
    row.appendChild(createElement('td', null, snapshot.incomplete ? 'Ja' : 'Nein'))
    row.appendChild(createElement('td', null, formatDateTime(snapshot.lastExecutedAt)))
    targetBody.appendChild(row)
  }
}

function renderObjTable(objSnapshots) {
  clearElement(dom.objectTableBody)

  if (objSnapshots.length === 0) {
    const row = createElement('tr')
    const cell = createElement('td', null, 'Keine Tests fuer den aktuellen Filter gefunden.')
    cell.colSpan = 6
    row.appendChild(cell)
    dom.objectTableBody.appendChild(row)
    return
  }

  for (const snapshot of objSnapshots) {
    const row = createElement('tr')
    row.appendChild(createElement('td', null, snapshot.id))
    row.appendChild(createElement('td', null, snapshot.name))
    row.appendChild(createElement('td', null, String(snapshot.passed)))
    row.appendChild(createElement('td', null, String(snapshot.failed)))
    row.appendChild(createElement('td', null, String(snapshot.neverExecuted)))
    row.appendChild(createElement('td', null, String(snapshot.totalTests)))
    dom.objectTableBody.appendChild(row)
  }
}

function renderRules() {
  clearElement(dom.statusRules)
  clearElement(dom.dataSources)

  for (const rule of state.rawData.statusRules || []) {
    dom.statusRules.appendChild(createElement('p', null, rule))
  }
  for (const source of state.rawData.dataSources || []) {
    dom.dataSources.appendChild(createElement('p', null, source))
  }
}

function renderTabs() {
  for (const button of dom.tabButtons) {
    const target = button.dataset.tabTarget
    const active = target === state.activeTab
    button.classList.toggle('is-active', active)
  }
  for (const panel of dom.tabPanels) {
    panel.classList.toggle('is-active', panel.id === state.activeTab)
  }
}

function render() {
  if (!state.rawData) {
    return
  }

  const filteredTests = getFilteredTests()
  ensureSelectedKey(filteredTests)
  renderSummaryCards(filteredTests)
  renderTestsTable(filteredTests)
  renderDetailPanel(filteredTests)
  renderObjTable(
    buildObjSnapshots(
      filteredTests,
      state.rawData.filters?.objects || [],
      state.filters.object === 'ALL' ? null : state.filters.object,
    ),
  )
  renderSnapshotTable(dom.releaseTableBody, buildSnapshots(filteredTests, 'release'))
  renderSnapshotTable(dom.runTableBody, buildSnapshots(filteredTests, 'run'))
  renderRules()
  renderTabs()

  setStatus(`${filteredTests.length} Testfaelle sichtbar.`)
}

function bindEvents() {
  dom.objectFilter.addEventListener('change', (event) => {
    state.filters.object = event.target.value
    render()
  })
  dom.capabilityFilter.addEventListener('change', (event) => {
    state.filters.capability = event.target.value
    render()
  })
  dom.serviceFunctionFilter.addEventListener('change', (event) => {
    state.filters.serviceFunction = event.target.value
    render()
  })
  dom.testTypeFilter.addEventListener('change', (event) => {
    state.filters.testType = event.target.value
    render()
  })
  dom.statusFilter.addEventListener('change', (event) => {
    state.filters.status = event.target.value
    render()
  })
  dom.requirementFilter.addEventListener('input', (event) => {
    state.filters.requirement = event.target.value
    render()
  })

  dom.resetFilters.addEventListener('click', () => {
    state.filters.object = 'ALL'
    state.filters.capability = 'ALL'
    state.filters.serviceFunction = 'ALL'
    state.filters.testType = 'ALL'
    state.filters.status = 'ALL'
    state.filters.requirement = ''

    dom.objectFilter.value = 'ALL'
    dom.capabilityFilter.value = 'ALL'
    dom.serviceFunctionFilter.value = 'ALL'
    dom.testTypeFilter.value = 'ALL'
    dom.statusFilter.value = 'ALL'
    dom.requirementFilter.value = ''

    render()
  })

  for (const button of dom.tabButtons) {
    button.addEventListener('click', () => {
      state.activeTab = button.dataset.tabTarget
      renderTabs()
    })
  }
}

async function bootstrap() {
  try {
    const response = await fetch(DATA_URL)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    state.rawData = await response.json()
    populateFilters()
    bindEvents()
    render()
  } catch (error) {
    console.error(error)
    setStatus(
      'Test-Execution-Daten konnten nicht geladen werden. Bitte build:obj23-live-data ausfuehren.',
      { isError: true },
    )
  }
}

bootstrap()
