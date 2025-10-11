/*!
 * BSD 3-Clause License
 * Copyright (c) 2025, [Ben yedder]
 */
console.log("Gaming Tools Suite Complete - Content script chargé");

// Variables globales
let timerOverlay = null;
let timerState = 'stopped';
let startTime = null;
let currentTime = 0;
let timerInterval = null;
let isVisible = false;
let currentHotkey = 'Control';
let currentTheme = 'livesplit';
let zqsdHandler = null;
let isResolutionForced = false;

// Charger la hotkey
chrome.runtime.sendMessage({ action: "getHotkey" }, (response) => {
    if (response && response.hotkey) {
        currentHotkey = response.hotkey;
    }
});

// Charger le thème
chrome.runtime.sendMessage({ action: "getTheme" }, (response) => {
    if (response && response.theme) {
        currentTheme = response.theme;
        if (timerOverlay) {
            applyThemeToTimer(currentTheme);
        }
    }
});

// AUTO-ACTIVATION ZQSD au chargement de la page
chrome.runtime.sendMessage({ action: "getZqsdState" }, (response) => {
    if (response && response.active) {
        console.log("ZQSD était activé - réactivation automatique");
        activateZqsdDirectly();
    }
});

// ================================
// RESOLUTION 608x1080 FUNCTIONS
// ================================

function applyPermanent608x1080() {
    console.log("Application permanente du mode 608x1080");
    
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=608, user-scalable=no';
    
    const body = document.body;
    const html = document.documentElement;
    
    const existingTimer = document.getElementById('speedrun-timer-overlay');
    // Suppression de l'ancienne logique de déplacement du timer (timerParent)
    
    // NOUVELLE LOGIQUE POUR LE TIMER : Déplacer le timer dans l'élément racine (<html>) 
    // pour éviter qu'il ne soit contraint par le <body> en position: fixed.
    if (existingTimer) {
        document.documentElement.appendChild(existingTimer);
        existingTimer.style.position = 'fixed';
        existingTimer.style.zIndex = '2147483647';
    }

    body.style.cssText = `
        margin: 0 !important;
        padding: 0 !important;
        width: 608px !important;
        min-width: 608px !important;
        max-width: 608px !important;
        height: 1080px !important;
        min-height: 1080px !important;
        overflow: hidden !important;
        position: fixed !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        box-sizing: border-box !important;
    `;

    // Suppression de l'ancienne logique de repositionnement du timer ici (if existingTimer && timerParent)
    
    html.style.cssText = `
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        background: transparent !important;
        box-sizing: border-box !important;
    `;

    document.body.offsetHeight;
    html.offsetHeight;
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        document.body.offsetHeight;
    }, 50);
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.scrollTo(0, 0);
    }, 150);
    
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 300);

    setTimeout(() => {
        forceResizeTo608x1080();
    }, 100);

    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #44ff44;
        color: black;
        padding: 5px 10px;
        border-radius: 3px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        z-index: 2147483646;
        pointer-events: none;
        opacity: 0.8;
    `;
    indicator.textContent = '608×1080 ACTIF';
    indicator.id = 'resolution-indicator-permanent';
    document.body.appendChild(indicator);

    setTimeout(() => {
        if (indicator && indicator.parentNode) {
            indicator.style.transition = 'opacity 0.5s';
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator && indicator.parentNode) {
                    indicator.remove();
                }
            }, 500);
        }
    }, 3000);

    console.log("Mode 608x1080 appliqué de manière permanente");
    isResolutionForced = true;
}

function restoreNormalResolution() {
    console.log("Restauration de la résolution normale");
    
    const body = document.body;
    const html = document.documentElement;
    
    body.style.cssText = '';
    html.style.cssText = '';
    
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }
    
    const indicator = document.getElementById('resolution-indicator-permanent');
    if (indicator) {
        indicator.remove();
    }
    
    window.dispatchEvent(new Event('resize'));
    
    const indicatorOff = document.createElement('div');
    indicatorOff.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        z-index: 2147483646;
        pointer-events: none;
        opacity: 0.8;
    `;
    indicatorOff.textContent = 'MODE NORMAL';
    document.body.appendChild(indicatorOff);
    
    setTimeout(() => {
        if (indicatorOff && indicatorOff.parentNode) {
            indicatorOff.style.transition = 'opacity 0.5s';
            indicatorOff.style.opacity = '0';
            setTimeout(() => {
                if (indicatorOff && indicatorOff.parentNode) {
                    indicatorOff.remove();
                }
            }, 500);
        }
    }, 2000);
    
    console.log("Résolution normale restaurée");
    isResolutionForced = false;
}

function forceResizeTo608x1080() {
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
        if (element.id === 'speedrun-timer-overlay') return;
        
        const style = window.getComputedStyle(element);
        
        if (['div', 'section', 'main', 'article', 'header', 'footer'].includes(element.tagName.toLowerCase())) {
            if (style.width === '100%' || element.offsetWidth > 608) {
                element.style.width = '100%';
                element.style.maxWidth = '608px';
            }
        }
        
        if (element.tagName.toLowerCase() === 'img') {
            element.style.maxWidth = '100%';
            element.style.height = 'auto';
        }
    });
}

// ================================
// ZQSD FUNCTIONS
// ================================

function activateZqsdDirectly() {
    const SCRIPT_KEY = "wasdZqsdHandler";
    
    if (window[SCRIPT_KEY]) {
        console.log("ZQSD déjà actif");
        return;
    }
    
    const targets = [document, window, document.activeElement, document.querySelector('canvas')].filter(Boolean);
    
    const handler = (e) => {
        const mapping = {
            w: ['ArrowUp', 38],
            a: ['ArrowLeft', 37],
            s: ['ArrowDown', 40],
            d: ['ArrowRight', 39],
            z: ['ArrowUp', 38],
            q: ['ArrowLeft', 37],
        };
        
        if (e.key === '1') {
            e.preventDefault();
            e.stopImmediatePropagation();
            targets.forEach(t => t.dispatchEvent(new KeyboardEvent(e.type, {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                which: 32,
                bubbles: true
            })));
            return;
        }
        
        if (e.key === ' ' && e.isTrusted) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }
        
        const mapped = mapping[e.key.toLowerCase()];
        if (mapped) {
            e.preventDefault();
            e.stopImmediatePropagation();
            targets.forEach(t => t.dispatchEvent(new KeyboardEvent(e.type, {
                key: mapped[0],
                code: mapped[0],
                keyCode: mapped[1],
                which: mapped[1],
                bubbles: true
            })));
        }
    };
    
    document.addEventListener("keydown", handler, true);
    document.addEventListener("keyup", handler, true);
    window[SCRIPT_KEY] = handler;
    zqsdHandler = handler;
    
    console.log("ZQSD activé automatiquement");
}

// ================================
// TIMER THEME STYLES
// ================================

const THEME_STYLES = {
    livesplit: {
        bg: '#000000',
        text: '#FFFFFF',
        border: 'none',
        shadow: 'none',
        textShadow: 'none',
        customStyles: {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontWeight: '400',
            letterSpacing: '0px',
            borderRadius: '0px',
            backdropFilter: 'none'
        }
    },
    light: {
        bg: '#ffffff',
        text: '#2563eb',
        border: '2px solid #3b82f6',
        shadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        textShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
        customStyles: {
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    dark: {
        bg: 'linear-gradient(135deg, #0f1115 0%, #1a1d24 100%)',
        text: '#60a5fa',
        border: '3px solid #60a5fa',
        shadow: '0 0 40px rgba(96, 165, 250, 0.6)',
        textShadow: '0 0 25px #60a5fa',
        customStyles: {
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    neon: {
        bg: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 100%)',
        text: '#e9d5ff',
        border: '3px solid #c084fc',
        shadow: '0 0 50px rgba(192, 132, 252, 0.8)',
        textShadow: '0 0 30px #c084fc',
        customStyles: {
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    matrix: {
        bg: 'linear-gradient(135deg, #000d00 0%, #001a00 100%)',
        text: '#d1fae5',
        border: '3px solid #00ff88',
        shadow: '0 0 50px rgba(0, 255, 136, 0.8)',
        textShadow: '0 0 30px #00ff88',
        customStyles: {
            fontFamily: "'Courier New', monospace",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    sunset: {
        bg: 'linear-gradient(135deg, #1a0500 0%, #330a00 100%)',
        text: '#fff5e6',
        border: '3px solid #ff8e53',
        shadow: '0 0 50px rgba(255, 142, 83, 0.8)',
        textShadow: '0 0 25px #ff8e53',
        customStyles: {
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    ocean: {
        bg: 'linear-gradient(135deg, #001233 0%, #002147 100%)',
        text: '#e0f2fe',
        border: '3px solid #4facfe',
        shadow: '0 0 50px rgba(79, 172, 254, 0.6)',
        textShadow: '0 0 25px #4facfe',
        customStyles: {
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    rose: {
        bg: 'linear-gradient(135deg, #2d0a1f 0%, #4d1436 100%)',
        text: '#fce7f3',
        border: '3px solid #f093fb',
        shadow: '0 0 50px rgba(240, 147, 251, 0.8)',
        textShadow: '0 0 25px #f093fb',
        customStyles: {
            fontFamily: "'Raleway', sans-serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    toxic: {
        bg: 'linear-gradient(135deg, #0d1f00 0%, #1a3300 100%)',
        text: '#ecfccb',
        border: '3px solid #39ff14',
        shadow: '0 0 60px rgba(57, 255, 20, 0.9)',
        textShadow: '0 0 30px #39ff14',
        customStyles: {
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    vaporwave: {
        bg: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%)',
        text: '#fef3ff',
        border: '3px solid #ff6ec7',
        shadow: '0 0 50px rgba(255, 110, 199, 0.8)',
        textShadow: '0 0 25px #ff6ec7',
        customStyles: {
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '800',
            letterSpacing: '3px'
        }
    },
    gold: {
        bg: 'linear-gradient(135deg, #1a1200 0%, #332400 100%)',
        text: '#fefce8',
        border: '3px solid #ffd700',
        shadow: '0 0 60px rgba(255, 215, 0, 0.8)',
        textShadow: '0 0 30px #ffd700',
        customStyles: {
            fontFamily: "'Cinzel', serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    },
    crimson: {
        bg: 'linear-gradient(135deg, #1a0000 0%, #330000 100%)',
        text: '#fee2e2',
        border: '3px solid #dc143c',
        shadow: '0 0 60px rgba(220, 20, 60, 0.9)',
        textShadow: '0 0 30px #dc143c',
        customStyles: {
            fontFamily: "'Oswald', sans-serif",
            fontWeight: '800',
            letterSpacing: '2px'
        }
    }
};

function applyThemeToTimer(theme) {
    if (!timerOverlay) return;
    
    const style = THEME_STYLES[theme] || THEME_STYLES.livesplit;
    
    timerOverlay.style.background = style.bg;
    timerOverlay.style.border = style.border;
    timerOverlay.style.boxShadow = style.shadow;
    
    const display = timerOverlay.querySelector('#timer-display');
    if (!display) return;
    
    display.style.color = style.text;
    display.style.textShadow = style.textShadow;
    
    if (theme === 'livesplit') {
        timerOverlay.style.background = "linear-gradient(to bottom, #2d2d30 0%, #1e1e1e 100%)";
        timerOverlay.style.border = "1px solid #3c3c3c";
        timerOverlay.style.borderRadius = "0";
        timerOverlay.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)";
        timerOverlay.style.backdropFilter = "none";
        timerOverlay.style.padding = "0";

        display.style.color = "#ffffff";
        display.style.fontFamily = "'Consolas','Monaco','Lucida Console',monospace";
        display.style.fontWeight = "bold";
        display.style.textShadow = "1px 1px 2px rgba(0,0,0,0.8)";
        display.style.fontSize = "32px";
        display.style.letterSpacing = "1px";
        display.style.textAlign = "center";
    } else {
        timerOverlay.style.borderRadius = '12px';
        timerOverlay.style.backdropFilter = 'blur(8px)';
        
        display.style.position = 'absolute';
        display.style.top = '50%';
        display.style.left = '50%';
        display.style.transform = 'translate(-50%, -50%)';
        display.style.width = 'auto';
        display.style.height = 'auto';
        display.style.textAlign = 'center';
        display.style.padding = '0';
        
        if (style.customStyles) {
            Object.entries(style.customStyles).forEach(([property, value]) => {
                if (['borderRadius', 'backdropFilter'].includes(property)) {
                    timerOverlay.style[property] = value;
                }
                if (['fontFamily', 'letterSpacing', 'fontWeight'].includes(property)) {
                    display.style[property] = value;
                }
            });
        }
    }
    
    const rect = timerOverlay.getBoundingClientRect();
    updateFontSize(rect.width, rect.height);
}

// ================================
// TIMER FUNCTIONS
// ================================

function createTimerOverlay() {
    if (timerOverlay) return;
    
    timerOverlay = document.createElement('div');
    timerOverlay.id = 'speedrun-timer-overlay';
    timerOverlay.innerHTML = `
        <style>
            #speedrun-timer-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 280px;
                height: 60px;
                z-index: 2147483647;
                display: none;
                user-select: none;
                min-width: 180px;
                min-height: 40px;
                max-width: 800px;
                max-height: 200px;
                overflow: hidden;
                background: #000000;
                border: none;
                box-shadow: none;
            }
            #timer-content {
                width: 100%;
                height: 100%;
                position: relative;
                cursor: move;
            }
            #timer-display {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-weight: 400;
                font-size: 43px;
                letter-spacing: 0px;
                line-height: 1;
                color: #FFFFFF;
                text-shadow: none;
                white-space: nowrap;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                padding: 10px 15px;
                box-sizing: border-box;
            }
            .timer-stopped { opacity: 1; }
            .timer-running { opacity: 1; }
            .timer-paused { opacity: 1; }
            .resize-handle {
                position: absolute;
                background: transparent;
                z-index: 2147483648;
                opacity: 0;
                transition: opacity 0.2s;
            }
            #speedrun-timer-overlay:hover .resize-handle {
                opacity: 0.3;
                background: rgba(255, 255, 255, 0.1);
            }
            .resize-handle:hover {
                opacity: 0.6 !important;
                background: rgba(255, 255, 255, 0.2) !important;
            }
            .resize-nw { top: 0; left: 0; width: 12px; height: 12px; cursor: nw-resize; }
            .resize-ne { top: 0; right: 0; width: 12px; height: 12px; cursor: ne-resize; }
            .resize-sw { bottom: 0; left: 0; width: 12px; height: 12px; cursor: sw-resize; }
            .resize-se { bottom: 0; right: 0; width: 12px; height: 12px; cursor: se-resize; }
            .resize-n { top: 0; left: 12px; right: 12px; height: 8px; cursor: n-resize; }
            .resize-s { bottom: 0; left: 12px; right: 12px; height: 8px; cursor: s-resize; }
            .resize-w { left: 0; top: 12px; bottom: 12px; width: 8px; cursor: w-resize; }
            .resize-e { right: 0; top: 12px; bottom: 12px; width: 8px; cursor: e-resize; }
            .size-indicator {
                position: absolute;
                top: -35px;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                color: #ffffff;
                padding: 6px 12px;
                font-size: 12px;
                opacity: 0;
                pointer-events: none;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-weight: 400;
                transition: opacity 0.2s;
            }
            #speedrun-timer-overlay.resizing .size-indicator { opacity: 1; }
        </style>
        <div id="timer-content">
            <div id="timer-display" class="timer-stopped">00:00.000</div>
        </div>
        <div class="resize-handle resize-nw" data-direction="nw"></div>
        <div class="resize-handle resize-ne" data-direction="ne"></div>
        <div class="resize-handle resize-sw" data-direction="sw"></div>
        <div class="resize-handle resize-se" data-direction="se"></div>
        <div class="resize-handle resize-n" data-direction="n"></div>
        <div class="resize-handle resize-s" data-direction="s"></div>
        <div class="resize-handle resize-w" data-direction="w"></div>
        <div class="resize-handle resize-e" data-direction="e"></div>
        <div class="size-indicator">280px × 60px</div>
    `;
    
    // MODIFICATION : Attacher à l'élément racine <html> au lieu de <body>
    document.documentElement.appendChild(timerOverlay); 
    
    applyThemeToTimer(currentTheme);
    makeDraggable(timerOverlay);
    makeResizable(timerOverlay);
    loadSettings();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTimerOverlay);
} else {
    createTimerOverlay();
}

function loadSettings() {
    chrome.runtime.sendMessage({ action: "getTimerSettings" }, (response) => {
        if (response && response.settings && timerOverlay) {
            const s = response.settings;
            timerOverlay.style.left = s.position.x + 'px';
            timerOverlay.style.top = s.position.y + 'px';
            timerOverlay.style.width = s.size.width + 'px';
            timerOverlay.style.height = s.size.height + 'px';
            updateFontSize(s.size.width, s.size.height);
            if (s.visible) {
                isVisible = true;
                timerOverlay.style.display = 'block';
            }
        }
    });
}

function makeDraggable(el) {
    let pos1=0, pos2=0, pos3=0, pos4=0, isDragging=false;
    el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        isDragging = true;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stop);
    });
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.left = Math.max(0, Math.min((el.offsetLeft || 0) - pos1, window.innerWidth - el.offsetWidth)) + "px";
        el.style.top = Math.max(0, Math.min((el.offsetTop || 0) - pos2, window.innerHeight - el.offsetHeight)) + "px";
        saveTimerSettings();
    }
    
    function stop() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stop);
        saveTimerSettings();
    }
}

function makeResizable(el) {
    const handles = el.querySelectorAll('.resize-handle');
    const indicator = el.querySelector('.size-indicator');
    let isResizing = false, dir = '', startX = 0, startY = 0, startW = 0, startH = 0, startL = 0, startT = 0;
    
    handles.forEach(h => h.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        dir = e.target.dataset.direction;
        startX = e.clientX;
        startY = e.clientY;
        const r = el.getBoundingClientRect();
        startW = r.width;
        startH = r.height;
        startL = r.left;
        startT = r.top;
        
        el.classList.add('resizing');
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }));
    
    function resize(e) {
        if (!isResizing) return;
        e.preventDefault();
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        let w = startW, h = startH, l = startL, t = startT;
        
        if(dir.includes('e')) w = Math.max(180, Math.min(800, startW + dx));
        if(dir.includes('w')) {
            w = Math.max(180, Math.min(800, startW - dx));
            l = startL + (startW - w);
        }
        if(dir.includes('s')) h = Math.max(40, Math.min(200, startH + dy));
        if(dir.includes('n')) {
            h = Math.max(40, Math.min(200, startH - dy));
            t = startT + (startH - h);
        }
        
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.left = `${l}px`;
        el.style.top = `${t}px`;
        
        updateFontSize(w, h);
        indicator.textContent = `${Math.round(w)}px × ${Math.round(h)}px`;
        indicator.style.opacity = '1';
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        el.classList.remove('resizing');
        indicator.style.opacity = '0';
        saveTimerSettings();
    }
}

function updateFontSize(w, h) {
    const d = timerOverlay.querySelector('#timer-display');
    if (!d) return;

    const baseSize = 43;
    const scaleX = w / 280;
    const scaleY = h / 60;
    const scale = Math.min(scaleX, scaleY);
    const size = Math.max(18, Math.min(120, baseSize * scale));

    if (currentTheme === 'livesplit') {
        d.style.fontSize = `${size}px`;
        d.style.letterSpacing = '0px';
        d.style.lineHeight = '1';
    } else {
        const letterSpacing = Math.max(1, Math.min(3, 2 * scale));
        d.style.fontSize = `${size}px`;
        d.style.letterSpacing = `${letterSpacing}px`;
        d.style.lineHeight = '1';
    }
}

function saveTimerSettings() {
    if (!timerOverlay) return;
    const r = timerOverlay.getBoundingClientRect();
    chrome.runtime.sendMessage({
        action: "saveTimerSettings",
        position: { x: r.left, y: r.top },
        size: { width: r.width, height: r.height },
        visible: isVisible
    });
}

function formatTime(ms) {
    const m = Math.floor(ms/60000);
    const s = Math.floor((ms%60000)/1000);
    const milli = Math.floor(ms%1000);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${milli.toString().padStart(3,'0')}`;
}

function updateTimer() {
    if (!timerOverlay || !isVisible) return;
    
    if (timerState === 'running') {
        currentTime = performance.now() - startTime;
        const display = timerOverlay.querySelector('#timer-display');
        if (display) {
            display.textContent = formatTime(currentTime);
        }
    }
}

function controlTimer() {
    if (!isVisible) return;
    const display = timerOverlay.querySelector('#timer-display');
    
    if (timerState === 'stopped') {
        startTime = performance.now();
        currentTime = 0;
        timerState = 'running';
        display.className = 'timer-running';
        
        const updateFrame = () => {
            if (timerState === 'running') {
                updateTimer();
                timerInterval = requestAnimationFrame(updateFrame);
            }
        };
        timerInterval = requestAnimationFrame(updateFrame);
    } else if (timerState === 'running') {
        cancelAnimationFrame(timerInterval);
        timerState = 'paused';
        display.className = 'timer-paused';
    } else {
        cancelAnimationFrame(timerInterval);
        timerState = 'stopped';
        currentTime = 0;
        display.className = 'timer-stopped';
        display.textContent = '00:00.000';
    }
}

function toggleTimerVisibility() {
    if (!timerOverlay) createTimerOverlay();
    isVisible = !isVisible;
    timerOverlay.style.display = isVisible ? 'block' : 'none';
    if (isVisible) updateTimer();
    saveTimerSettings();
}

// ================================
// MESSAGE LISTENERS
// ================================

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (msg.action === "toggleTimer") { 
        toggleTimerVisibility(); 
        respond({success: true}); 
    }
    if (msg.action === "updateHotkey") { 
        currentHotkey = msg.hotkey; 
        respond({success: true}); 
    }
    if (msg.action === "updateTheme") {
        currentTheme = msg.theme;
        applyThemeToTimer(currentTheme);
        respond({success: true});
    }
    if (msg.action === "activateZqsd") {
        activateZqsdDirectly();
        chrome.runtime.sendMessage({ action: "saveZqsdState", active: true });
        respond({success: true});
    }
    if (msg.action === "deactivateZqsd") {
        const SCRIPT_KEY = "wasdZqsdHandler";
        if (window[SCRIPT_KEY]) {
            document.removeEventListener("keydown", window[SCRIPT_KEY], true);
            document.removeEventListener("keyup", window[SCRIPT_KEY], true);
            window[SCRIPT_KEY] = null;
            zqsdHandler = null;
        }
        chrome.runtime.sendMessage({ action: "saveZqsdState", active: false });
        respond({success: true});
    }
    if (msg.action === "toggleResolution") {
        if (!isResolutionForced) {
            applyPermanent608x1080();
        } else {
            restoreNormalResolution();
            // MODIFICATION : Recharger la page après la désactivation de la résolution
            window.location.reload(); 
        }
        respond({ success: true, enabled: isResolutionForced });
    }
    return true;
});

// Gestionnaire d'événements pour le timer avec priorité maximale (capture phase)
document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    let match = false;
        
    // Vérification spéciale pour Space avec priorité
    if (currentHotkey === 'Space') {
        if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
            if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) { // Seul Space
                match = true;
            } else if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) { // Shift + Space
                // Le Shift + Hotkey gérera la visibilité
            }
        }
    }
    // Vérification pour les touches modificatrices
    else if (currentHotkey === 'Control' && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) match = true;
    else if (currentHotkey === 'Shift' && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) match = true;
    else if (currentHotkey === 'Alt' && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) match = true;
    else if (currentHotkey === 'Meta' && e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) match = true;
    // Vérification pour les autres touches (simples, sans modificateur)
    else if (currentHotkey === e.code && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) match = true;
        
    if (match) { 
        e.preventDefault(); 
        e.stopPropagation();
        e.stopImmediatePropagation(); // Priorité max

        // Logique : Hotkey seul pour contrôle (Start/Stop/Reset)
        if (!e.shiftKey) {
            controlTimer(); 
        }
    }
    
    // Ajout de la logique Shift + Hotkey pour la visibilité (sans intercepter les autres touches)
    let visibilityMatch = false;
    if (currentHotkey === 'Space' && (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) visibilityMatch = true;
    else if (currentHotkey !== 'Space' && currentHotkey === e.code && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) visibilityMatch = true;
    
    if (visibilityMatch) {
        e.preventDefault(); 
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleTimerVisibility(); 
    }
}, true); // Ajout de 'true' pour capture phase (priorité maximale)

console.log("Gaming Tools Suite Complete - Content script prêt");