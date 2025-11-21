// Background Animation Configuration
const BG_CONFIG = {
    GRID_SIZE: 64,
    MAX_PINGS: 8,
    PING_DURATION: 2000,
    PING_PROB: 0.1,
    CHECK_INTERVAL: 150,
    STAGGER_MIN: 100,
    STAGGER_MAX: 250
};

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize only if motion is allowed
if (!prefersReducedMotion) {
    let animationTimer = null;
    let pingPool = [];
    let isTabVisible = true;

    // Initialize the animation system
    function init() {
        const pulseLayer = document.querySelector('.pulse-layer');
        if (!pulseLayer) return;

        // Create ping element pool (green/red indicators)
        for (let i = 0; i < BG_CONFIG.MAX_PINGS; i++) {
            const ping = document.createElement('div');
            ping.className = 'ping';
            pulseLayer.appendChild(ping);
            pingPool.push({
                element: ping,
                active: false,
                timeout: null,
                color: null
            });
        }

        // Start animation scheduler
        startScheduler();
        
        // Initial pings for immediate feedback
        setTimeout(() => {
            [0, 1, 2].forEach((i, idx) => {
                if (pingPool[i]) setTimeout(() => activatePing(pingPool[i]), idx * 200);
            });
        }, 500);

        // Handle visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);

    }

    function getGridPosition() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        return {
            x: Math.round(x / BG_CONFIG.GRID_SIZE) * BG_CONFIG.GRID_SIZE,
            y: Math.round(y / BG_CONFIG.GRID_SIZE) * BG_CONFIG.GRID_SIZE
        };
    }

    function activatePing(ping) {
        if (ping.active) return;
        
        const pos = getGridPosition();
        ping.element.style.left = pos.x + 'px';
        ping.element.style.top = pos.y + 'px';
        ping.element.className = `ping ${Math.random() < 0.6 ? 'green' : 'red'} active`;
        ping.active = true;
        
        ping.timeout = setTimeout(() => {
            ping.element.classList.remove('active');
            ping.active = false;
            ping.timeout = null;
        }, BG_CONFIG.PING_DURATION);
    }

    function scheduleNextEffect() {
        if (!isTabVisible) return;
        
        if (Math.random() < BG_CONFIG.PING_PROB) {
            const available = pingPool.find(p => !p.active);
            if (available) {
                const delay = BG_CONFIG.STAGGER_MIN + 
                    Math.random() * (BG_CONFIG.STAGGER_MAX - BG_CONFIG.STAGGER_MIN);
                setTimeout(() => activatePing(available), delay);
            }
        }
    }

    function startScheduler() {
        if (animationTimer) clearInterval(animationTimer);
        animationTimer = setInterval(scheduleNextEffect, BG_CONFIG.CHECK_INTERVAL);
    }

    function stopScheduler() {
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
        }
    }

    function handleVisibilityChange() {
        isTabVisible = !document.hidden;
        isTabVisible ? startScheduler() : stopScheduler();
    }

    // Initialize
    document.readyState === 'loading' ? 
        document.addEventListener('DOMContentLoaded', init) : init();
}
