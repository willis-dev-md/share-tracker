// Add this at the top of your script.js or inside DOMContentLoaded
const marketToggle = document.getElementById('market-toggle');
const marketLabel = document.getElementById('market-label');

marketToggle.addEventListener('change', () => {
    marketLabel.innerText = marketToggle.checked ? "UK (London)" : "US (Global)";
    marketLabel.classList.toggle('text-blue-400', marketToggle.checked);
});

function addTicker() {
    const input = document.getElementById('ticker-search');
    let newTicker = input.value.toUpperCase().trim();
    if (!newTicker) return;

    // Logic for UK Market Toggle
    if (marketToggle.checked && !newTicker.endsWith('.L')) {
        newTicker += '.L';
    }

    let current = getCookie("my_stocks");
    let stocks = current ? current.split(',') : [];
    
    if (!stocks.includes(newTicker)) {
        stocks.push(newTicker);
        setCookie("my_stocks", stocks.join(','));
        fetchData(); 
    }
    input.value = '';
}
// --- COOKIE HELPERS ---
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "";
}

// --- CORE LOGIC ---
async function fetchData() {
    const tableBody = document.getElementById('ticker-body');
    const loadingState = document.getElementById('loading-state');
    const updateLabel = document.getElementById('last-updated');

    loadingState.classList.remove('hidden');
    tableBody.innerHTML = '';

    // Get custom tickers from cookies
    const customTickers = getCookie("my_stocks");
    
    try {
        // Send the custom tickers to our Python API via a "query string"
        // e.g., /api?extra=NFLX,META
        const response = await fetch(`/api?extra=${customTickers}`);
        const data = await response.json();
        
        loadingState.classList.add('hidden');

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="2" class="p-8 text-center text-gray-500 italic">No gainers found.</td></tr>`;
        } else {
            tableBody.innerHTML = data.map(item => `
                <tr class="border-t border-gray-700 hover:bg-gray-700/30 transition">
                    <td class="p-4"><span class="font-mono font-bold text-lg">${item.ticker}</span></td>
                    <td class="p-4 text-right"><span class="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">+${item.change}%</span></td>
                </tr>
            `).join('');
        }
        updateLabel.innerText = `Last checked: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        loadingState.classList.add('hidden');
        tableBody.innerHTML = `<tr><td colspan="2" class="p-8 text-center text-red-400">Error loading data.</td></tr>`;
    }
}

function addTicker() {
    const input = document.getElementById('ticker-search');
    const newTicker = input.value.toUpperCase().trim();
    if (!newTicker) return;

    let current = getCookie("my_stocks");
    let stocks = current ? current.split(',') : [];
    
    if (!stocks.includes(newTicker)) {
        stocks.push(newTicker);
        setCookie("my_stocks", stocks.join(','));
        fetchData(); // Refresh list with new ticker
    }
    input.value = '';
}

function clearCustomTickers() {
    setCookie("my_stocks", "", -1);
    fetchData();
}

document.addEventListener('DOMContentLoaded', fetchData);