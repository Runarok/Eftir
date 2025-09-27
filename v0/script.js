// App State
let appData = null
let filteredLinks = []
let currentTheme = localStorage.getItem("theme") || "light"

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  await loadData()
  initializeTheme()
  setupEventListeners()
  handleRouting()
})

// Load Data
async function loadData() {
  try {
    const response = await fetch("data.json")
    appData = await response.json()
    filteredLinks = appData.links || []
  } catch (error) {
    console.error("Failed to load data:", error)
    // Fallback data if JSON fails to load
    appData = {
      title: "URL Redirector",
      description: "Manage and showcase your links",
      links: [],
    }
    filteredLinks = []
  }
}

// Theme Management
function initializeTheme() {
  document.body.classList.toggle("dark", currentTheme === "dark")
  updateThemeIcon()
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  localStorage.setItem("theme", currentTheme)
  document.body.classList.toggle("dark", currentTheme === "dark")
  updateThemeIcon()
}

function updateThemeIcon() {
  const icon = document.querySelector(".theme-icon")
  icon.textContent = currentTheme === "light" ? "🌙" : "☀️"
}

// Event Listeners
function setupEventListeners() {
  document.getElementById("themeToggle").addEventListener("click", toggleTheme)
  document.getElementById("searchInput").addEventListener("input", handleSearch)

  // Handle browser back/forward
  window.addEventListener("popstate", handleRouting)
}

// Search Functionality
function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim()

  if (!query) {
    filteredLinks = appData.links || []
  } else {
    filteredLinks = (appData.links || []).filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query) ||
        link.keyword.toLowerCase().includes(query) ||
        link.id.toLowerCase().includes(query),
    )
  }

  renderShowcase()
}

// Routing
function handleRouting() {
  const params = new URLSearchParams(window.location.search)
  const keys = Array.from(params.keys())

  if (keys.length === 0) {
    showShowcase()
    return
  }

  const identifier = keys[0]
  const link = findLink(identifier)

  if (!link) {
    show404()
    return
  }

  if (link.type === "redirect") {
    window.location.href = link.url
  } else {
    showFocusedShowcase(link)
  }
}

// Find Link
function findLink(identifier) {
  return (appData.links || []).find((link) => link.id === identifier || link.keyword === identifier)
}

// Show Functions
function showShowcase() {
  document.getElementById("errorPage").classList.add("hidden")
  document.getElementById("mainContent").classList.remove("hidden")
  document.querySelector(".search-container").classList.remove("hidden")
  renderShowcase()
}

function showFocusedShowcase(link) {
  document.getElementById("errorPage").classList.add("hidden")
  document.getElementById("mainContent").classList.remove("hidden")
  document.querySelector(".search-container").classList.add("hidden")
  renderFocusedShowcase(link)
}

function show404() {
  document.getElementById("mainContent").classList.add("hidden")
  document.querySelector(".search-container").classList.add("hidden")
  document.getElementById("errorPage").classList.remove("hidden")
}

// Render Functions
function renderShowcase() {
  const mainContent = document.getElementById("mainContent")

  if (filteredLinks.length === 0) {
    mainContent.innerHTML = `
            <div class="error-content">
                <h2 class="error-title">No Links Found</h2>
                <p class="error-message">Try adjusting your search or add some links to get started.</p>
            </div>
        `
    return
  }

  const grid = document.createElement("div")
  grid.className = "links-grid"

  filteredLinks.forEach((link) => {
    const card = createLinkCard(link)
    grid.appendChild(card)
  })

  mainContent.innerHTML = ""
  mainContent.appendChild(grid)
}

function renderFocusedShowcase(link) {
  const mainContent = document.getElementById("mainContent")

  const container = document.createElement("div")
  container.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <button class="home-btn" onclick="goHome()" style="margin-bottom: 1rem;">← Back to All Links</button>
            <h2 class="error-title">${link.title}</h2>
            <p class="error-message">${link.description}</p>
        </div>
    `

  if (link.urls && link.urls.length > 0) {
    const grid = document.createElement("div")
    grid.className = "links-grid"

    link.urls.forEach((url) => {
      const subCard = createSubLinkCard(url)
      grid.appendChild(subCard)
    })

    container.appendChild(grid)
  }

  mainContent.innerHTML = ""
  mainContent.appendChild(container)
}

// Create Card Elements
function createLinkCard(link) {
  const card = document.createElement("div")
  card.className = "link-card"
  card.onclick = () => copyShortlink(link)

  const showcaseLinks =
    link.type === "showcase" && link.urls
      ? `<div class="showcase-links">
            <h4>Sub-links (${link.urls.length})</h4>
            ${link.urls
              .slice(0, 3)
              .map(
                (url) =>
                  `<a href="${url.url}" class="sub-link" onclick="event.stopPropagation()" target="_blank">${url.title}</a>`,
              )
              .join("")}
            ${link.urls.length > 3 ? `<div class="sub-link" style="opacity: 0.6;">+${link.urls.length - 3} more...</div>` : ""}
        </div>`
      : ""

  card.innerHTML = `
        <div class="card-actions">
            <button class="action-btn copy-btn" onclick="event.stopPropagation(); copyShortlink(${JSON.stringify(link).replace(/"/g, "&quot;")})" title="Copy shortlink">
                📋
            </button>
            <button class="action-btn open-btn" onclick="event.stopPropagation(); openLink(${JSON.stringify(link).replace(/"/g, "&quot;")})" title="${link.type === "redirect" ? "Open link" : "View showcase"}">
                ${link.type === "redirect" ? "🔗" : "👁️"}
            </button>
        </div>
        <div class="card-content">
            <h3 class="card-title">${link.title}</h3>
            <p class="card-description">${link.description}</p>
            <div class="card-meta">
                <span class="card-type type-${link.type}">${link.type}</span>
                <span class="card-keyword">/${link.keyword}</span>
            </div>
            ${showcaseLinks}
        </div>
    `

  return card
}

function createSubLinkCard(url) {
  const card = document.createElement("div")
  card.className = "link-card"
  card.onclick = () => window.open(url.url, "_blank")

  card.innerHTML = `
        <div class="card-actions">
            <button class="action-btn open-btn" onclick="event.stopPropagation(); window.open('${url.url}', '_blank')" title="Open link">
                🔗
            </button>
        </div>
        <div class="card-content">
            <h3 class="card-title">${url.title}</h3>
            <p class="card-description">${url.description || "Click to visit this link"}</p>
        </div>
    `

  return card
}

// Actions
function copyShortlink(link) {
  const shortlink = `${window.location.origin}/?${link.keyword}`

  navigator.clipboard
    .writeText(shortlink)
    .then(() => {
      showToast("Shortlink copied!")

      // Visual feedback
      event.target.closest(".link-card").classList.add("clicked")
      setTimeout(() => {
        const card = document.querySelector(".link-card.clicked")
        if (card) card.classList.remove("clicked")
      }, 200)
    })
    .catch(() => {
      showToast("Failed to copy shortlink")
    })
}

function openLink(link) {
  if (link.type === "redirect") {
    window.open(link.url, "_blank")
  } else {
    window.location.search = `?${link.keyword}`
  }
}

function goHome() {
  window.history.pushState({}, "", window.location.pathname)
  showShowcase()
}

// Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast")
  const messageEl = toast.querySelector(".toast-message")

  messageEl.textContent = message
  toast.classList.remove("hidden")
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      toast.classList.add("hidden")
    }, 300)
  }, 2000)
}
