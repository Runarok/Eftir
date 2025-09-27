// Global state
let linksData = {};
let filteredLinks = [];
let currentView = 'showcase';

// DOM elements
const elements = {
    loading: document.getElementById('loading'),
    showcase: document.getElementById('showcase'),
    focusedView: document.getElementById('focusedView'),
    errorView: document.getElementById('errorView'),
    linksGrid: document.getElementById('linksGrid'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    searchContainer: document.getElementById('searchContainer'),
    themeToggle: document.getElementById('themeToggle'),
    homeBtn: document.getElementById('homeBtn'),
    logo: document.getElementById('logo'),
    headerDescription: document.getElementById('headerDescription'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    focusedTitle: document.getElementById('focusedTitle'),
    focusedDescription: document.getElementById('focusedDescription'),
    focusedLinks: document.getElementById('focusedLinks')
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeTheme();
    setupEventListeners();
    handleRouting();
});

// Load data from JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to load data');
        linksData = await response.json();
        
        // Update header if config exists
        if (linksData.config) {
            if (linksData.config.title) {
                elements.logo.textContent = linksData.config.title;
                document.title = linksData.config.title;
            }
            if (linksData.config.description) {
                elements.headerDescription.textContent = linksData.config.description;
            }
        }
        
        filteredLinks = linksData.links || [];
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    }
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Event listeners
function setupEventListeners() {
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.homeBtn.addEventListener('click', goHome);
    elements.logo.addEventListener('click', goHome);
    
    elements.searchInput.addEventListener('input', handleSearch);
    elements.searchClear.addEventListener('click', clearSearch);
    
    // Handle browser back/forward
    window.addEventListener('popstate', handleRouting);
}

// Search functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query) {
        elements.searchClear.style.display = 'block';
        filteredLinks = linksData.links.filter(link => 
            link.title.toLowerCase().includes(query) ||
            link.description.toLowerCase().includes(query) ||
            link.keyword.toLowerCase().includes(query) ||
            link.id.toLowerCase().includes(query)
        );
    } else {
        elements.searchClear.style.display = 'none';
        filteredLinks = linksData.links;
    }
    
    if (currentView === 'showcase') {
        renderShowcase();
    }
}

function clearSearch() {
    elements.searchInput.value = '';
    elements.searchClear.style.display = 'none';
    filteredLinks = linksData.links;
    if (currentView === 'showcase') {
        renderShowcase();
    }
}

// Routing
function handleRouting() {
    const params = new URLSearchParams(window.location.search);
    const keys = Array.from(params.keys());
    
    if (keys.length === 0) {
        showShowcase();
        return;
    }
    
    const identifier = keys[0];
    const link = findLink(identifier);
    
    if (!link) {
        showError();
        return;
    }
    
    if (link.type === 'redirect') {
        window.location.href = link.url;
        return;
    }
    
    if (link.type === 'showcase') {
        showFocusedView(link);
        return;
    }
}

function findLink(identifier) {
    return linksData.links.find(link => 
        link.id === identifier || link.keyword === identifier
    );
}

// View management
function hideAllViews() {
    elements.loading.style.display = 'none';
    elements.showcase.style.display = 'none';
    elements.focusedView.style.display = 'none';
    elements.errorView.style.display = 'none';
}

function showShowcase() {
    hideAllViews();
    currentView = 'showcase';
    elements.showcase.style.display = 'block';
    elements.searchContainer.style.display = 'block';
    elements.homeBtn.style.display = 'none';
    renderShowcase();
}

function showFocusedView(link) {
    hideAllViews();
    currentView = 'focused';
    elements.focusedView.style.display = 'block';
    elements.searchContainer.style.display = 'none';
    elements.homeBtn.style.display = 'flex';
    renderFocusedView(link);
}

function showError(message = null) {
    hideAllViews();
    currentView = 'error';
    elements.errorView.style.display = 'block';
    elements.searchContainer.style.display = 'none';
    elements.homeBtn.style.display = 'flex';
}

// Rendering
function renderShowcase() {
    elements.linksGrid.innerHTML = '';
    
    if (filteredLinks.length === 0) {
        elements.linksGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-search" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-muted);">No links found matching your search.</p>
            </div>
        `;
        return;
    }
    
    filteredLinks.forEach(link => {
        const card = createLinkCard(link);
        elements.linksGrid.appendChild(card);
    });
}

function createLinkCard(link) {
    const card = document.createElement('div');
    card.className = 'link-card fade-in';
    
    const shortlink = `${window.location.origin}/?${link.keyword || link.id}`;
    
    card.innerHTML = `
        <div class="card-header">
            <div>
                <h3 class="card-title">${escapeHtml(link.title)}</h3>
                <span class="card-type">${link.type}</span>
            </div>
        </div>
        <p class="card-description">${escapeHtml(link.description)}</p>
        <div class="card-actions">
            <button class="btn btn-secondary copy-btn" data-shortlink="${shortlink}">
                <i class="fas fa-copy"></i> Copy Link
            </button>
            <button class="btn btn-primary open-btn" data-link='${JSON.stringify(link)}'>
                <i class="fas fa-external-link-alt"></i> Open
            </button>
        </div>
    `;
    
    // Add event listeners
    const copyBtn = card.querySelector('.copy-btn');
    const openBtn = card.querySelector('.open-btn');
    
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(shortlink, card);
    });
    
    openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleOpenLink(link);
    });
    
    // Card click to copy
    card.addEventListener('click', () => {
        copyToClipboard(shortlink, card);
    });
    
    return card;
}

function renderFocusedView(link) {
    elements.focusedTitle.textContent = link.title;
    elements.focusedDescription.textContent = link.description;
    
    elements.focusedLinks.innerHTML = '';
    
    if (link.urls && link.urls.length > 0) {
        link.urls.forEach(url => {
            const linkElement = document.createElement('div');
            linkElement.className = 'focused-link';
            
            linkElement.innerHTML = `
                <div class="focused-link-info">
                    <h4>${escapeHtml(url.title || url.url)}</h4>
                    <p>${escapeHtml(url.description || url.url)}</p>
                </div>
                <button class="btn btn-primary" onclick="window.open('${url.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> Visit
                </button>
            `;
            
            elements.focusedLinks.appendChild(linkElement);
        });
    } else {
        elements.focusedLinks.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fas fa-link" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No sub-links available for this showcase.</p>
            </div>
        `;
    }
}

// Actions
function handleOpenLink(link) {
    if (link.type === 'redirect') {
        window.open(link.url, '_blank');
    } else if (link.type === 'showcase') {
        const newUrl = `${window.location.origin}/?${link.keyword || link.id}`;
        history.pushState(null, '', newUrl);
        showFocusedView(link);
    }
}

function copyToClipboard(text, cardElement = null) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Shortlink copied!');
        
        if (cardElement) {
            cardElement.classList.add('copied');
            setTimeout(() => {
                cardElement.classList.remove('copied');
            }, 1000);
        }
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Shortlink copied!');
    });
}

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function goHome() {
    history.pushState(null, '', window.location.origin);
    showShowcase();
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

// Service worker registration (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}