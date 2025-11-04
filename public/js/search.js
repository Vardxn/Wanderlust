// Add loading spinner during search
function showLoadingSpinner() {
    const spinner = `
        <div class="spinner-container">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    document.querySelector('.listings-container').innerHTML = spinner;
}

// Add debouncing for search input
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
    }, 500);
});
