window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    if (!dropdown || !button) return;
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    if (!container || !dropdown || !button) return;
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (!dropdown || !button) return;
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

const datasetBrowserState = {
    datasetInfo: null,
    currentSplit: 'benchmark',
    previousSplit: 'benchmark',
    recordsBySplit: {
        benchmark: [],
        full: []
    },
    filteredRecords: [],
    currentPage: 1,
    pageSize: 6
};

function getPageSizeForCurrentSplit() {
    return datasetBrowserState.currentSplit === 'full' ? 12 : 6;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function datasetEl(id) {
    return document.getElementById(id);
}

function truncateText(value, maxLength = 96) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1)}...`;
}

function setDatasetStateVisibility({ loading = false, error = false, empty = false, results = false }) {
    const loadingEl = datasetEl('dataset-loading');
    const errorEl = datasetEl('dataset-error');
    const emptyEl = datasetEl('dataset-empty');
    const resultsEl = datasetEl('dataset-results');

    if (loadingEl) loadingEl.classList.toggle('is-hidden', !loading);
    if (errorEl) errorEl.classList.toggle('is-hidden', !error);
    if (emptyEl) emptyEl.classList.toggle('is-hidden', !empty);
    if (resultsEl) resultsEl.classList.toggle('is-hidden', !results);
}

function renderDatasetStats(datasetInfo, filteredCount) {
    const splitInfo = datasetInfo?.[datasetBrowserState.currentSplit];
    const total = splitInfo?.num_rows ?? datasetBrowserState.recordsBySplit[datasetBrowserState.currentSplit].length;
    const currentPage = datasetBrowserState.currentPage;
    const totalPages = Math.max(1, Math.ceil(filteredCount / getPageSizeForCurrentSplit()));
    const splitLabel = datasetBrowserState.currentSplit === 'full' ? 'full release' : 'benchmark subset';

    const statusText = filteredCount === total
        ? `Showing samples from the local ${splitLabel}.`
        : `Showing ${filteredCount} matched samples from the local ${splitLabel}.`;

    if (datasetEl('dataset-status-text')) datasetEl('dataset-status-text').textContent = statusText;
    if (datasetEl('dataset-total-pill')) datasetEl('dataset-total-pill').textContent = `Total: ${total}`;
    if (datasetEl('dataset-filtered-pill')) datasetEl('dataset-filtered-pill').textContent = `Filtered: ${filteredCount}`;
    if (datasetEl('dataset-page-pill')) datasetEl('dataset-page-pill').textContent = `Page: ${currentPage} / ${totalPages}`;
}

function buildDatasetCard(record) {
    if (datasetBrowserState.currentSplit === 'full') {
        return buildFullDatasetCard(record);
    }

    return buildBenchmarkDatasetCard(record);
}

function buildBenchmarkDatasetCard(record) {
    const prompt = escapeHtml(record.prompt || '');
    const classIntentRaw = String(record.label ?? '').trim();
    const classIntent = escapeHtml(classIntentRaw || '--');
    const sentenceIntent = escapeHtml(record.sentence_intent || 'Not provided');
    const sourceRaw = String(record.source || 'unknown').trim().toLowerCase();
    const userTypeRaw = String(record.user_type || 'unknown').trim().toLowerCase();
    const challenge = escapeHtml(record.challenge || 'unknown');
    const imageUrl = escapeHtml(record.thumbnail_url || record.image_url || '');
    const userTypeDisplay = escapeHtml(userTypeRaw.toUpperCase());
    const sourceTooltip = escapeHtml(`source: ${sourceRaw}`);
    const challengeDisplay = escapeHtml(record.challenge ? record.challenge.toUpperCase() : 'N/A');

    return `
      <article class="dataset-result-card">
        <div class="dataset-image-shell is-loading">
          <div class="dataset-image-spinner" aria-hidden="true"></div>
          <img class="dataset-result-image" src="${imageUrl}" alt="Dataset sample ${classIntent}" loading="lazy" referrerpolicy="no-referrer">
        </div>
        <div class="dataset-result-body">
          <div class="dataset-hover-field">
            <button class="dataset-hover-trigger" type="button">
              <span class="dataset-hover-preview dataset-gradient-label">Prompt</span>
            </button>
            <div class="dataset-hover-popover">
              <span class="dataset-hover-popover-title">Full Prompt</span>
              <p class="dataset-hover-popover-text">${prompt}</p>
            </div>
          </div>

          <div class="dataset-hover-field">
            <button class="dataset-hover-trigger" type="button">
              <span class="dataset-hover-preview dataset-gradient-label">Intent</span>
            </button>
            <div class="dataset-hover-popover">
              <span class="dataset-hover-popover-title">Intent Details</span>
              <p class="dataset-hover-popover-text"><strong>Class-level:</strong> ${classIntent}</p>
              <p class="dataset-hover-popover-text"><strong>Sentence-level:</strong> ${sentenceIntent}</p>
            </div>
          </div>

          <div class="dataset-meta-row">
            <div class="dataset-meta-row-benchmark">
              <span class="dataset-tag dataset-user-type-chip" data-tooltip="${sourceTooltip}">${userTypeDisplay}</span>
              <span class="dataset-tag challenge-${challenge}">${challengeDisplay}</span>
            </div>
          </div>
        </div>
      </article>
    `;
}

function buildFullDatasetCard(record) {
    const prompt = escapeHtml(record.prompt || '');
    const promptPreview = escapeHtml('Prompt');
    const sourceDisplay = escapeHtml(String(record.source || '--').trim() || '--');
    const url = String(record.image_url || '').trim();
    const safeUrl = escapeHtml(url || '#');

    return `
      <article class="dataset-result-card dataset-result-card-full">
        <div class="dataset-full-row">
          <div class="dataset-hover-field">
            <button class="dataset-hover-trigger dataset-hover-trigger-full dataset-chip-trigger" type="button">
              <span class="dataset-hover-preview dataset-gradient-label">${promptPreview}</span>
            </button>
            <div class="dataset-hover-popover">
              <span class="dataset-hover-popover-title">Full Prompt</span>
              <p class="dataset-hover-popover-text">${prompt}</p>
            </div>
          </div>
        </div>

        <div class="dataset-full-row dataset-meta-row">
          <span class="dataset-full-chip">${sourceDisplay.toUpperCase()}</span>
        </div>

        <div class="dataset-full-row">
          ${url ? `<a class="dataset-url-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer"><span>URL</span><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : `<span class="dataset-tag">--</span>`}
        </div>
      </article>
    `;
}

function renderDatasetResults(datasetInfo) {
    const resultsEl = datasetEl('dataset-results');
    if (!resultsEl) return;
    resultsEl.dataset.split = datasetBrowserState.currentSplit;
    datasetBrowserState.pageSize = getPageSizeForCurrentSplit();

    const totalFiltered = datasetBrowserState.filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / datasetBrowserState.pageSize));

    if (datasetBrowserState.currentPage > totalPages) {
        datasetBrowserState.currentPage = totalPages;
    }

    renderDatasetStats(datasetInfo, totalFiltered);

    if (totalFiltered === 0) {
        resultsEl.innerHTML = '';
        setDatasetStateVisibility({ empty: true });
        return;
    }

    const start = (datasetBrowserState.currentPage - 1) * datasetBrowserState.pageSize;
    const end = start + datasetBrowserState.pageSize;
    const pageItems = datasetBrowserState.filteredRecords.slice(start, end);

    resultsEl.innerHTML = pageItems.map(buildDatasetCard).join('');
    setDatasetStateVisibility({ results: true });
    animateDatasetResults(resultsEl);
    bindDatasetImageLoading();

    const prevBtn = datasetEl('dataset-prev-btn');
    const nextBtn = datasetEl('dataset-next-btn');
    if (prevBtn) prevBtn.disabled = datasetBrowserState.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = datasetBrowserState.currentPage >= totalPages;
}

function animateDatasetResults(resultsEl) {
    if (!resultsEl) return;

    const direction = datasetBrowserState.previousSplit === datasetBrowserState.currentSplit
        ? 'none'
        : datasetBrowserState.currentSplit === 'full'
            ? 'slide-left'
            : 'slide-right';

    resultsEl.classList.remove('is-animating', 'slide-left', 'slide-right');

    if (direction === 'none') return;

    void resultsEl.offsetWidth;
    resultsEl.classList.add('is-animating', direction);

    window.setTimeout(() => {
        resultsEl.classList.remove('is-animating', 'slide-left', 'slide-right');
    }, 320);
}

function bindDatasetImageLoading() {
    document.querySelectorAll('.dataset-image-shell').forEach(shell => {
        const image = shell.querySelector('.dataset-result-image');
        if (!image) return;

        const finishLoading = () => {
            shell.classList.remove('is-loading');
        };

        if (image.complete) {
            finishLoading();
            return;
        }

        image.addEventListener('load', finishLoading, { once: true });
        image.addEventListener('error', finishLoading, { once: true });
    });
}

function applyDatasetFilters(datasetInfo) {
    const searchTerm = (datasetEl('dataset-search')?.value || '').trim().toLowerCase();
    const challengeValue = datasetEl('dataset-challenge-filter')?.value || 'all';
    const userTypeValue = datasetEl('dataset-user-type-filter')?.value || 'all';
    const currentRecords = datasetBrowserState.recordsBySplit[datasetBrowserState.currentSplit] || [];

    datasetBrowserState.filteredRecords = currentRecords.filter(record => {
        const searchHaystack = [
            record.prompt,
            record.sentence_intent,
            record.label,
            record.user_type,
            record.source,
            record.sample_id
        ].join(' ').toLowerCase();

        const matchesSearch = !searchTerm || searchHaystack.includes(searchTerm);
        const matchesChallenge = challengeValue === 'all' || record.challenge === challengeValue;
        const matchesUserType = userTypeValue === 'all' || record.user_type === userTypeValue;

        return matchesSearch && matchesChallenge && matchesUserType;
    });

    datasetBrowserState.currentPage = 1;
    renderDatasetResults(datasetInfo);
}

function updateChallengeFilterForSplit(split) {
    const challengeSelect = datasetEl('dataset-challenge-filter');
    if (!challengeSelect) return;

    const supportsChallenge = split === 'benchmark';
    challengeSelect.disabled = !supportsChallenge;
    challengeSelect.closest('.select')?.classList.toggle('is-disabled', !supportsChallenge);

    if (!supportsChallenge) {
        challengeSelect.value = 'all';
    }
}

function updateUserTypeFilterForSplit(split) {
    const userTypeSelect = datasetEl('dataset-user-type-filter');
    if (!userTypeSelect) return;

    const supportsUserType = split === 'benchmark';
    userTypeSelect.disabled = !supportsUserType;
    userTypeSelect.closest('.select')?.classList.toggle('is-disabled', !supportsUserType);

    if (!supportsUserType) {
        userTypeSelect.value = 'all';
    }
}

function updateSplitToggleUI() {
    document.querySelectorAll('.dataset-split-btn').forEach(button => {
        button.classList.toggle('is-active', button.dataset.split === datasetBrowserState.currentSplit);
    });
}

function setDatasetSplit(split, options = {}) {
    const { force = false } = options;
    if (!datasetBrowserState.recordsBySplit[split]) return;
    if (!force && datasetBrowserState.currentSplit === split) return;

    datasetBrowserState.previousSplit = datasetBrowserState.currentSplit;
    datasetBrowserState.currentSplit = split;
    datasetBrowserState.currentPage = 1;
    updateSplitToggleUI();
    updateChallengeFilterForSplit(split);
    updateUserTypeFilterForSplit(split);
    applyDatasetFilters(datasetBrowserState.datasetInfo);
}

function attachDatasetBrowserEvents() {
    const triggerFilter = () => applyDatasetFilters(datasetBrowserState.datasetInfo);
    datasetEl('dataset-search')?.addEventListener('input', triggerFilter);
    datasetEl('dataset-challenge-filter')?.addEventListener('change', triggerFilter);
    datasetEl('dataset-user-type-filter')?.addEventListener('change', triggerFilter);

    datasetEl('dataset-reset-btn')?.addEventListener('click', () => {
        if (datasetEl('dataset-search')) datasetEl('dataset-search').value = '';
        if (datasetEl('dataset-challenge-filter')) datasetEl('dataset-challenge-filter').value = 'all';
        if (datasetEl('dataset-user-type-filter')) datasetEl('dataset-user-type-filter').value = 'all';
        applyDatasetFilters(datasetBrowserState.datasetInfo);
    });

    datasetEl('dataset-random-btn')?.addEventListener('click', () => {
        if (datasetBrowserState.filteredRecords.length === 0) return;
        const totalPages = Math.max(1, Math.ceil(datasetBrowserState.filteredRecords.length / datasetBrowserState.pageSize));
        datasetBrowserState.currentPage = Math.floor(Math.random() * totalPages) + 1;
        renderDatasetResults(datasetBrowserState.datasetInfo);
    });

    datasetEl('dataset-prev-btn')?.addEventListener('click', () => {
        if (datasetBrowserState.currentPage > 1) {
            datasetBrowserState.currentPage -= 1;
            renderDatasetResults(datasetBrowserState.datasetInfo);
        }
    });

    datasetEl('dataset-next-btn')?.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(datasetBrowserState.filteredRecords.length / datasetBrowserState.pageSize));
        if (datasetBrowserState.currentPage < totalPages) {
            datasetBrowserState.currentPage += 1;
            renderDatasetResults(datasetBrowserState.datasetInfo);
        }
    });

    document.querySelectorAll('.dataset-split-btn').forEach(button => {
        button.addEventListener('click', () => setDatasetSplit(button.dataset.split));
    });
}

async function resolveDatasetPayload() {
    if (window.APBenchBrowserData?.info) {
        return window.APBenchBrowserData;
    }

    const [infoResponse, benchmarkPreviewResponse, benchmarkResponse, fullResponse] = await Promise.all([
        fetch('static/data/release/v1/dataset_info.json'),
        fetch('static/data/release/v1/benchmark_with_thumbnail.jsonl'),
        fetch('static/data/release/v1/benchmark.jsonl'),
        fetch('static/data/release/v1/full.jsonl')
    ]);

    if (!infoResponse.ok || !benchmarkPreviewResponse.ok || !benchmarkResponse.ok || !fullResponse.ok) {
        throw new Error('Dataset assets could not be fetched.');
    }

    const parseJsonl = text => text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => JSON.parse(line));

    const benchmarkPreview = parseJsonl(await benchmarkPreviewResponse.text());
    const benchmarkMetadata = parseJsonl(await benchmarkResponse.text());
    const metadataBySampleId = new Map(
        benchmarkMetadata.map(record => [record.sample_id, record])
    );

    return {
        info: await infoResponse.json(),
        benchmark: benchmarkPreview.map(record => ({
            ...metadataBySampleId.get(record.sample_id),
            ...record
        })),
        full: parseJsonl(await fullResponse.text())
    };
}

async function loadLocalDatasetBrowser() {
    const resultsEl = datasetEl('dataset-results');
    if (!resultsEl) return;

    try {
        setDatasetStateVisibility({ loading: true });

        const payload = await resolveDatasetPayload();
        datasetBrowserState.datasetInfo = payload.info;
        datasetBrowserState.recordsBySplit.benchmark = payload.benchmark || [];
        datasetBrowserState.recordsBySplit.full = payload.full || [];
        datasetBrowserState.filteredRecords = datasetBrowserState.recordsBySplit[datasetBrowserState.currentSplit];
        datasetBrowserState.currentPage = 1;

        attachDatasetBrowserEvents();
        setDatasetSplit('benchmark', { force: true });
    } catch (error) {
        console.error('Failed to initialize local dataset browser:', error);
        setDatasetStateVisibility({ error: true });
    }
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // Setup local dataset browser
    loadLocalDatasetBrowser();

})
