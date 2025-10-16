/*!
 * BSD 3-Clause License
 * Copyright (c) 2025, [Ben yedder]
 */
console.log("Gaming Tools Suite Complete - Content script chargé");



// ================================
// ADBLOCK FUNCTIONS
// ================================

// Sélecteurs courants pour les publicités
const adSelectors = [
    '[id*="google_ads"]',
    '[class*="google-ad"]',
    '[id*="ad-"]',
    '[class*="ad-"]',
    '[class*="advertisement"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    '.adsbygoogle',
    '[id*="banner"]',
    '[class*="banner"]',
    '[id*="sponsor"]',
    '[class*="sponsor"]',
    '[class*="AdBox"]',
    '[class*="ad_container"]',
    '[id*="popup"]',
    '[class*="popup-ad"]'
];

let adblockActive = true;
let adblockObserver = null;

// Fonction pour masquer les publicités
function hideAds() {
    if (!adblockActive) return 0;
    
    const selector = adSelectors.join(', ');
    const ads = document.querySelectorAll(selector);
    let blockedCount = 0;
    
    ads.forEach(ad => {
        if (ad.style.display !== 'none') {
            ad.style.display = 'none';
            ad.style.visibility = 'hidden';
            ad.style.opacity = '0';
            ad.style.height = '0';
            ad.style.width = '0';
            ad.style.position = 'absolute';
            ad.style.pointerEvents = 'none';
            blockedCount++;
        }
    });
    
    if (blockedCount > 0) {
        chrome.runtime.sendMessage({ action: "adBlocked" });
    }
    
    return blockedCount;
}

// Initialiser l'adblock
function initAdblock() {
    chrome.runtime.sendMessage({ action: "getAdblockState" }, (response) => {
        if (response && response.active !== undefined) {
            adblockActive = response.active;
            
            if (adblockActive) {
                startAdblocking();
            } else {
                stopAdblocking();
            }
        }
    });
}

// Démarrer le blocage
function startAdblocking() {
    console.log("AdBlock activé sur cette page");
    
    // Masquer les publicités au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideAds);
    } else {
        hideAds();
    }
    
    // Observer les changements du DOM
    if (!adblockObserver) {
        adblockObserver = new MutationObserver((mutations) => {
            hideAds();
        });
        
        adblockObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    // Vérifier périodiquement
    setInterval(() => {
        if (adblockActive) {
            hideAds();
        }
    }, 2000);
}

// Arrêter le blocage
function stopAdblocking() {
    console.log("AdBlock désactivé sur cette page");
    
    if (adblockObserver) {
        adblockObserver.disconnect();
        adblockObserver = null;
    }
}

// Initialiser l'adblock au chargement
initAdblock();

// ================================
// TIMER & OTHER FEATURES
// ================================

// Variables globales
let timerOverlay = null;
let timerState = 'stopped';
let startTime = null;
let currentTime = 0;
let timerInterval = null;
let isVisible = false;
let currentHotkey = 'Control';
let zqsdHandler = null;
let isResolutionForced = false;

// Charger la hotkey
chrome.runtime.sendMessage({ action: "getHotkey" }, (response) => {
    if (response && response.hotkey) {
        currentHotkey = response.hotkey;
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

let blackBarsEnabled = true; // Par défaut activé

// Charger l'état des barres noires au démarrage
chrome.storage.local.get(['blackBarsEnabled'], (result) => {
    if (result.blackBarsEnabled !== undefined) {
        blackBarsEnabled = result.blackBarsEnabled;
    }
});

function applyPermanent608x1080(enableBlackBars = true) {
    console.log("Application permanente du mode 608x1080");
    blackBarsEnabled = enableBlackBars;
    // Sauvegarder l'état
    chrome.storage.local.set({ blackBarsEnabled: enableBlackBars });
    
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
    
    const backgroundColor = blackBarsEnabled ? '#000000' : 'transparent';
    html.style.cssText = `
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        background: ${backgroundColor} !important;
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
// TIMER COLOR SETTINGS
// ================================

let timerColors = {
    stopped: '#FFFFFF',   // Couleur quand arrêté (0.00)
    running: '#FFFFFF',   // Couleur quand en marche
    paused: '#FFFFFF'     // Couleur quand en pause
};

// Charger les couleurs personnalisées
chrome.runtime.sendMessage({ action: "getTimerColors" }, (response) => {
    if (response && response.colors) {
        timerColors = response.colors;
        applyTimerColor();
    }
});

function applyTimerColor() {
    if (!timerOverlay) return;
    const display = timerOverlay.querySelector('#timer-display');
    if (!display) return;
    
    let color = timerColors.stopped;
    if (timerState === 'running') color = timerColors.running;
    else if (timerState === 'paused') color = timerColors.paused;
    
    display.style.color = color;
}

function applyThemeToTimer() {
    if (!timerOverlay) return;
    const display = timerOverlay.querySelector('#timer-display');
    if (!display) return;
    
    Object.assign(timerOverlay.style, {
        background: '#000',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
        backdropFilter: 'none',
        padding: '0'
    });

    Object.assign(display.style, {
        fontFamily: "'Calibri','Segoe UI',Arial,sans-serif",
        fontWeight: 'bold',
        textShadow: 'none',
        fontSize: '43px',
        letterSpacing: '0',
        textAlign: 'right',
        padding: '8px 12px',
        lineHeight: '1',
        position: 'relative',
        transform: 'none',
        top: 'auto',
        left: 'auto',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    });
    
    applyTimerColor();
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
            #speedrun-timer-overlay{position:fixed;top:20px;right:20px;width:225px;height:50px;z-index:2147483647;display:none;user-select:none;min-width:180px;min-height:40px;max-width:800px;max-height:200px;overflow:hidden;background:#000;border:none;box-shadow:none;border-radius:0}
            #timer-content{width:100%;height:100%;position:relative;cursor:move}
            #timer-display{font-family:'Calibri','Segoe UI',Arial,sans-serif;font-weight:bold;font-size:43px;letter-spacing:0;line-height:1;color:#FFF;text-shadow:none;white-space:nowrap;display:flex;align-items:baseline;justify-content:flex-end;width:100%;height:100%;padding:8px 12px;box-sizing:border-box;position:relative}
            #timer-display .time-main{font-size:1em;line-height:1;display:inline-block}
            #timer-display .time-decimals{font-size:.7em;line-height:1;display:inline-block;transform:translateY(0.12em)}
            .timer-stopped,.timer-running,.timer-paused{color:#FFF}
            .resize-handle{position:absolute;background:transparent;z-index:2147483648;opacity:0;transition:opacity .2s}
            #speedrun-timer-overlay:hover .resize-handle{opacity:.3;background:rgba(255,255,255,.1)}
            .resize-handle:hover{opacity:.6!important;background:rgba(255,255,255,.2)!important}
            .resize-nw{top:0;left:0;width:12px;height:12px;cursor:nw-resize}
            .resize-ne{top:0;right:0;width:12px;height:12px;cursor:ne-resize}
            .resize-sw{bottom:0;left:0;width:12px;height:12px;cursor:sw-resize}
            .resize-se{bottom:0;right:0;width:12px;height:12px;cursor:se-resize}
            .resize-n{top:0;left:12px;right:12px;height:8px;cursor:n-resize}
            .resize-s{bottom:0;left:12px;right:12px;height:8px;cursor:s-resize}
            .resize-w{left:0;top:12px;bottom:12px;width:8px;cursor:w-resize}
            .resize-e{right:0;top:12px;bottom:12px;width:8px;cursor:e-resize}
            .size-indicator{position:absolute;top:-35px;right:0;background:rgba(0,0,0,.9);color:#FFF;padding:6px 12px;font-size:12px;opacity:0;pointer-events:none;font-family:'Segoe UI',Arial,sans-serif;font-weight:400;transition:opacity .2s;border-radius:3px}
            #speedrun-timer-overlay.resizing .size-indicator{opacity:1}
        </style>
        <div id="timer-content">
            <div id="timer-display" class="timer-stopped">
                <span class="time-main">0</span><span class="time-decimals">.00</span>
            </div>
        </div>
        <div class="resize-handle resize-nw" data-direction="nw"></div>
        <div class="resize-handle resize-ne" data-direction="ne"></div>
        <div class="resize-handle resize-sw" data-direction="sw"></div>
        <div class="resize-handle resize-se" data-direction="se"></div>
        <div class="resize-handle resize-n" data-direction="n"></div>
        <div class="resize-handle resize-s" data-direction="s"></div>
        <div class="resize-handle resize-w" data-direction="w"></div>
        <div class="resize-handle resize-e" data-direction="e"></div>
        <div class="size-indicator">225px × 50px</div>
    `;
    
    document.documentElement.appendChild(timerOverlay); 
    applyThemeToTimer();
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
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, isDragging = false;
    
    el.addEventListener('mousedown', dragStart);
    
    function dragStart(e) {
        if (e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        isDragging = true;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        const newLeft = Math.max(0, Math.min((el.offsetLeft || 0) - pos1, window.innerWidth - el.offsetWidth));
        const newTop = Math.max(0, Math.min((el.offsetTop || 0) - pos2, window.innerHeight - el.offsetHeight));
        
        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
        saveTimerSettings();
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        saveTimerSettings();
    }
}

function makeResizable(el) {
    const handles = el.querySelectorAll('.resize-handle');
    const indicator = el.querySelector('.size-indicator');
    let isResizing = false, dir = '', startX = 0, startY = 0, startW = 0, startH = 0, startL = 0, startT = 0;
    
    handles.forEach(h => h.addEventListener('mousedown', startResize));
    
    function startResize(e) {
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
    }
    
    function resize(e) {
        if (!isResizing) return;
        e.preventDefault();
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        let w = startW, h = startH, l = startL, t = startT;
        
        if (dir.includes('e')) w = Math.max(180, Math.min(800, startW + dx));
        if (dir.includes('w')) {
            w = Math.max(180, Math.min(800, startW - dx));
            l = startL + (startW - w);
        }
        if (dir.includes('s')) h = Math.max(40, Math.min(200, startH + dy));
        if (dir.includes('n')) {
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
        if (!isResizing) return;
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
    const baseWidth = 225;
    const baseHeight = 50;
    const scaleX = w / baseWidth;
    const scaleY = h / baseHeight;
    const scale = Math.min(scaleX, scaleY);
    const size = Math.max(18, Math.min(120, baseSize * scale));

    d.style.fontSize = `${size}px`;
    d.style.letterSpacing = '0px';
    d.style.lineHeight = '1';
    d.style.padding = '8px 12px';
    d.style.textAlign = 'right';
    
    const decimals = d.querySelector('.time-decimals');
    if (decimals) {
        decimals.style.fontSize = '0.7em';
    }
}

function saveTimerSettings() {
    if (!timerOverlay) return;
    const rect = timerOverlay.getBoundingClientRect();
    chrome.runtime.sendMessage({
        action: "saveTimerSettings",
        position: { x: Math.round(rect.left), y: Math.round(rect.top) },
        size: { width: Math.round(rect.width), height: Math.round(rect.height) },
        visible: isVisible
    });
}

function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    
    const decimalPart = cs.toString().padStart(2, '0');
    const mainPart = h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : m > 0 
            ? `${m}:${s.toString().padStart(2, '0')}`
            : `${s}`;
    
    return { mainPart, decimalPart };
}

function updateTimer() {
    if (!timerOverlay || !isVisible || timerState !== 'running') return;
    
    currentTime = performance.now() - startTime;
    const display = timerOverlay.querySelector('#timer-display');
    if (!display) return;
    
    const { mainPart, decimalPart } = formatTime(currentTime);
    display.innerHTML = `<span class="time-main">${mainPart}</span><span class="time-decimals">.${decimalPart}</span>`;
}

function controlTimer() {
    if (!isVisible) return;
    const display = timerOverlay.querySelector('#timer-display');
    if (!display) return;
    
    if (timerState === 'stopped') {
        // Start timer
        startTime = performance.now();
        currentTime = 0;
        timerState = 'running';
        display.className = 'timer-running';
        applyTimerColor();
        
        const updateFrame = () => {
            if (timerState === 'running') {
                updateTimer();
                timerInterval = requestAnimationFrame(updateFrame);
            }
        };
        timerInterval = requestAnimationFrame(updateFrame);
    } else if (timerState === 'running') {
        // Pause timer
        cancelAnimationFrame(timerInterval);
        timerState = 'paused';
        display.className = 'timer-paused';
        applyTimerColor();
    } else {
        // Reset timer
        cancelAnimationFrame(timerInterval);
        timerState = 'stopped';
        currentTime = 0;
        display.className = 'timer-stopped';
        applyTimerColor();
        
        // Reset à 0.00
        display.innerHTML = '<span class="time-main">0</span><span class="time-decimals">.00</span>';
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
    if (msg.action === "updateTimerColors") {
        timerColors = msg.colors;
        applyTimerColor();
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
            const enableBlackBars = msg.blackBarsEnabled !== false;
            applyPermanent608x1080(enableBlackBars);
        } else {
            restoreNormalResolution();
            // MODIFICATION : Recharger la page après la désactivation de la résolution
            window.location.reload(); 
        }
        respond({ success: true, enabled: isResolutionForced });
    }
    if (msg.action === "updateBlackBars") {
        if (isResolutionForced) {
            blackBarsEnabled = msg.enabled !== false;
            const html = document.documentElement;
            const backgroundColor = blackBarsEnabled ? '#000000' : 'transparent';
            html.style.background = `${backgroundColor} !important`;
        }
        respond({ success: true });
    }
    if (msg.action === "reloadWithBlackBars") {
        if (isResolutionForced) {
            // Sauvegarder l'état avant de recharger
            blackBarsEnabled = msg.enabled !== false;
            // Recharger la page pour réappliquer la résolution avec le nouveau paramètre
            window.location.reload();
            respond({ success: true, reloaded: true });
        } else {
            respond({ success: false, reloaded: false });
        }
    }
    if (msg.action === "enableAdblock") {
        adblockActive = true;
        startAdblocking();
        respond({success: true});
    }
    if (msg.action === "disableAdblock") {
        adblockActive = false;
        stopAdblocking();
        respond({success: true});
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
