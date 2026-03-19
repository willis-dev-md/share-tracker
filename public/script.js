async function fetchData() {
    const tableBody = document.getElementById('ticker-body');
    const loadingState = document.getElementById('loading-state');
    const updateLabel = document.getElementById('last-updated');

    // 1. Show loader, hide old data
    loadingState.classList.remove('hidden');
    tableBody.innerHTML = '';

    try {
        // Hits your Vercel Python function at /api
        const response = await fetch('/api');
        const data = await response.json();
        
        // 2. Hide loader
        loadingState.classList.add('hidden');

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="2" class="p-8 text-center text-gray-500 italic">
                        No gainers found in the last hour. (Market may be closed)
                    </td>
                </tr>`;
        } else {
            tableBody.innerHTML = data.map(item => `
                <tr class="border-t border-gray-700 hover:bg-gray-700/30 transition">
                    <td class="p-4">
                        <span class="font-mono font-bold text-lg">${item.ticker}</span>
                    </td>
                    <td class="p-4 text-right">
                        <span class="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                            +${item.change}%
                        </span>
                    </td>
                </tr>
            `).join('');
        }

        // 3. Update the timestamp
        const now = new Date();
        updateLabel.innerText = `Last checked: ${now.toLocaleTimeString()}`;

    } catch (error) {
        loadingState.classList.add('hidden');
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="p-8 text-center text-red-400 font-medium">
                    Failed to fetch data. Check your API logs.
                </td>
            </tr>`;
        console.error("Fetch error:", error);
    }
}

// Run automatically when the page loads
document.addEventListener('DOMContentLoaded', fetchData);