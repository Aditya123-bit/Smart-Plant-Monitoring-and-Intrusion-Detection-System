// script.js - Dashboard logic

if (window.location.pathname.includes('dashboard')) {
    
    // Check authentication on load
    document.addEventListener('DOMContentLoaded', async () => {
        const isAuth = await checkAuth(true); // redirect to login if not auth
        if (isAuth) {
            initDashboard();
        }
    });

    function initDashboard() {
        const isSoilPage = window.location.pathname.includes('dashboard-soil');
        const isIntruderPage = window.location.pathname.includes('dashboard-intruder');

        // Common elements
        const lastUpdated = document.getElementById('last-updated');
        const timeDisplay = document.getElementById('current-time');
        const connectionDot = document.getElementById('connection-dot');
        const connectionText = document.getElementById('connection-text');
        const lastTimeValue = document.getElementById('last-time-value');
        
        // Soil elements
        const soilStatus = document.getElementById('soil-status');
        const soilMsg = document.getElementById('soil-msg');
        const soilProgress = document.getElementById('soil-progress');
        const healthStatus = document.getElementById('health-status');
        const healthDetail = document.getElementById('health-detail');

        // Intruder elements
        const intruderStatus = document.getElementById('intruder-status');
        const intruderCard = document.getElementById('intruder-card');
        const intruderMsg = document.getElementById('intruder-msg');
        const intruderIconWrapper = document.getElementById('intruder-icon-wrapper');
        const intruderIcon = document.getElementById('intruder-icon');
        const logContainer = document.getElementById('log-container');

        // Clock update
        if (timeDisplay) {
            setInterval(() => {
                const now = new Date();
                timeDisplay.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }, 1000);
        }

        // Fetch data function
        async function fetchDashboardData() {
            try {
                // Add timestamp to prevent browser caching GET request
                const response = await fetch(`/api/data?t=${new Date().getTime()}`);
                
                if (response.status === 401) {
                    window.location.href = 'login.html';
                    return;
                }

                if (!response.ok) throw new Error('API Error');

                const data = await response.json();
                updateDashboard(data);
                
                // Update connection indicator
                if (connectionDot) {
                    connectionDot.className = 'status-dot status-online';
                    connectionText.textContent = 'Online';
                }
                
            } catch (error) {
                console.error('Failed to fetch data:', error);
                
                // Offline status
                if (connectionDot) {
                    connectionDot.className = 'status-dot status-offline';
                    connectionText.textContent = 'Offline';
                }
                if (healthStatus && healthDetail) {
                    healthStatus.textContent = 'Offline';
                    healthStatus.className = 'text-xl font-bold text-red-500 mt-2';
                    healthDetail.textContent = 'API disconnected';
                }
            }
        }

        // Time ago formatter
        function timeAgo(dateString) {
            if (!dateString) return '--';
            const date = new Date(dateString);
            const seconds = Math.floor((new Date() - date) / 1000);
            
            if (seconds < 5) return 'Just now';
            if (seconds < 60) return `${seconds} seconds ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} min ago`;
            const hours = Math.floor(minutes / 60);
            return `${hours} hr ago`;
        }

        // Update UI
        function updateDashboard(data) {
            
            // Common
            if (lastUpdated) lastUpdated.textContent = `${timeAgo(data.updatedAt)}`;
            if (lastTimeValue && data.updatedAt) {
                const updatedDate = new Date(data.updatedAt);
                lastTimeValue.textContent = updatedDate.toLocaleTimeString();
            }

            if (isSoilPage) {
                // Soil
                if (soilStatus) {
                    soilStatus.textContent = data.soil;
                    if (data.soil.toLowerCase() === 'wet') {
                        soilStatus.className = 'text-3xl font-bold text-emerald-600';
                        soilMsg.textContent = 'Optimal Moisture Level';
                        soilMsg.className = 'text-sm font-medium text-emerald-600';
                        if(soilProgress) soilProgress.style.width = '85%';
                        if(soilProgress) soilProgress.className = 'h-full bg-emerald-500 transition-all duration-700 ease-out';
                    } else {
                        soilStatus.className = 'text-3xl font-bold text-amber-500';
                        soilMsg.textContent = 'Watering Recommended';
                        soilMsg.className = 'text-sm font-medium text-amber-600';
                        if(soilProgress) soilProgress.style.width = '20%';
                        if(soilProgress) soilProgress.className = 'h-full bg-amber-500 transition-all duration-700 ease-out';
                    }
                }

                // Health
                if (healthStatus) {
                    healthStatus.textContent = data.status;
                    if (data.status.toLowerCase() === 'online') {
                        healthStatus.className = 'text-xl font-bold text-emerald-600 mt-2';
                        healthDetail.textContent = 'ESP8266 Connected';
                    } else {
                        healthStatus.className = 'text-xl font-bold text-amber-500 mt-2';
                        healthDetail.textContent = 'Device Error / Offline';
                    }
                }
            }

            if (isIntruderPage) {
                // Intruder
                if (intruderStatus) {
                    if (data.intruder) {
                        intruderStatus.textContent = 'ALERT: Detected';
                        intruderStatus.className = 'text-3xl font-bold text-red-600';
                        intruderCard.style.border = '2px solid #ef4444';
                        intruderMsg.textContent = 'IR Sensor triggered! Motion detected.';
                        intruderMsg.className = 'text-sm font-bold text-red-600';
                        intruderIconWrapper.className = 'status-icon-wrapper bg-red-light';
                        intruderIcon.className = 'fa-solid fa-triangle-exclamation';
                    } else {
                        intruderStatus.textContent = 'Safe';
                        intruderStatus.className = 'text-3xl font-bold text-emerald-600';
                        intruderCard.style.border = '1px solid var(--border-color)';
                        intruderMsg.textContent = 'Perimeter is secure.';
                        intruderMsg.className = 'text-sm font-medium text-slate-600';
                        intruderIconWrapper.className = 'status-icon-wrapper bg-green-light';
                        intruderIcon.className = 'fa-solid fa-shield-check';
                    }
                }

                // Logs
                if (logContainer) {
                    renderLogs(data.logs);
                }
            }
        }

        function renderLogs(logs) {
            logContainer.innerHTML = '';
            logs.forEach(log => {
                const div = document.createElement('div');
                div.className = 'log-entry';
                
                let colorClass = 'log-info';
                if (log.message.includes('[WARNING]')) colorClass = 'log-alert';
                if (log.message.includes('[SYSTEM]')) colorClass = 'log-system';
                
                div.innerHTML = `<span class="log-time">[${log.time}]</span> <span class="${colorClass}">${log.message}</span>`;
                logContainer.appendChild(div);
            });
        }

        // Fetch initially and then every 2 seconds
        fetchDashboardData();
        setInterval(fetchDashboardData, 2000);
    }
}
