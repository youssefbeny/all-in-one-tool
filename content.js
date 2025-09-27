console.log("Gaming Tools Suite - Content script chargé");

// Variables globales pour le timer
let timerOverlay = null;
let timerState = 'stopped'; // stopped, running, paused
let startTime = null;
let currentTime = 0;
let timerInterval = null;
let isVisible = false;
let currentHotkey = 'KeyT';

// Charger les paramètres sauvegardés
loadSettings();

function loadSettings() {
    chrome.runtime.sendMessage({ action: "getHotkey" }, (response) => {
        if (response && response.hotkey) {
            currentHotkey = response.hotkey;
            console.log("Hotkey chargée:", currentHotkey);
        }
    });
    
    chrome.runtime.sendMessage({ action: "getTimerSettings" }, (response) => {
        if (response && response.settings && timerOverlay) {
            const settings = response.settings;
            timerOverlay.style.left = settings.position.x + 'px';
            timerOverlay.style.top = settings.position.y + 'px';
            timerOverlay.style.width = settings.size.width + 'px';
            timerOverlay.style.height = settings.size.height + 'px';
            updateFontSize(settings.size.width, settings.size.height);
        }
    });
}

// Créer l'overlay du timer
function createTimerOverlay() {
    if (timerOverlay) return;
    
    console.log("Création de l'overlay timer");
    
    timerOverlay = document.createElement('div');
    timerOverlay.id = 'speedrun-timer-overlay';
    timerOverlay.innerHTML = `
        <style>
            #speedrun-timer-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 2px solid #ffffff;
                border-radius: 16px;
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                z-index: 999999;
                display: none;
                user-select: none;
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
                backdrop-filter: blur(20px);
                min-width: 200px;
                min-height: 50px;
                max-width: 800px;
                max-height: 200px;
                overflow: hidden;
            }
            
            #timer-content {
                width: 100%;
                height: 100%;
                position: relative;
                cursor: move;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.1);
                border-radius: 14px;
                margin: 2px;
            }
            
            #timer-display {
                color: #ffffff;
                font-weight: 900;
                text-align: center;
                text-shadow: 0 0 20px rgba(255,255,255,0.5);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;
                overflow: hidden;
                font-size: 36px;
                letter-spacing: 2px;
            }
            
            .timer-stopped { 
                color: #ffffff !important;
                text-shadow: 0 0 20px rgba(255,255,255,0.3) !important;
            }
            .timer-running { 
                color: #00ff88 !important;
                text-shadow: 0 0 30px rgba(0,255,136,0.8) !important;
                animation: pulse 2s infinite;
            }
            .timer-paused { 
                color: #ffd60a !important;
                text-shadow: 0 0 30px rgba(255,214,10,0.8) !important;
                animation: blink 1s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.5; }
            }
            
            #speedrun-timer-overlay:hover {
                box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
                transform: translateY(-2px);
            }
            
            /* Poignées de redimensionnement */
            .resize-handle {
                position: absolute;
                /* MODIFIÉ : Rendre l'arrière-plan totalement transparent pour supprimer les barres */
                background: transparent; 
                z-index: 1000000;
                transition: all 0.2s;
                border-radius: 4px;
            }
            
            .resize-handle:hover {
                /* MODIFIÉ : Rendre l'arrière-plan totalement transparent même au survol */
                background: transparent; 
                /* Nous gardons le scale pour que le curseur change, mais le background reste invisible */
                transform: scale(1.2);
            }
            
            /* Coins */
            .resize-nw {
                top: -8px;
                left: -8px;
                width: 16px;
                height: 16px;
                cursor: nw-resize;
                border-top-left-radius: 8px;
            }
            
            .resize-ne {
                top: -8px;
                right: -8px;
                width: 16px;
                height: 16px;
                cursor: ne-resize;
                border-top-right-radius: 8px;
            }
            
            .resize-sw {
                bottom: -8px;
                left: -8px;
                width: 16px;
                height: 16px;
                cursor: sw-resize;
                border-bottom-left-radius: 8px;
            }
            
            .resize-se {
                bottom: -8px;
                right: -8px;
                width: 16px;
                height: 16px;
                cursor: se-resize;
                border-bottom-right-radius: 8px;
            }
            
            /* Bordures */
            .resize-n {
                top: -8px;
                left: 20px;
                right: 20px;
                height: 16px;
                cursor: n-resize;
            }
            
            .resize-s {
                bottom: -8px;
                left: 20px;
                right: 20px;
                height: 16px;
                cursor: s-resize;
            }
            
            .resize-w {
                left: -8px;
                top: 20px;
                bottom: 20px;
                width: 16px;
                cursor: w-resize;
            }
            
            .resize-e {
                right: -8px;
                top: 20px;
                bottom: 20px;
                width: 16px;
                cursor: e-resize;
            }
            
            .size-indicator {
                position: absolute;
                top: -40px;
                right: 0;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: #ffffff;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            
            #speedrun-timer-overlay.resizing .size-indicator {
                opacity: 1;
                transform: translateY(-5px);
            }
            
            /* Animation d'apparition */
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            #speedrun-timer-overlay.show {
                animation: slideInFromRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
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
        
        <div class="size-indicator">320px × 80px</div>
    `;
    
    document.body.appendChild(timerOverlay);
    makeDraggable(timerOverlay);
    makeResizable(timerOverlay);
    
    // Charger les paramètres sauvegardés
    loadSettings();
    
    console.log("Overlay créé et ajouté au DOM");
}

// Rendre l'overlay déplaçable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    const timerContent = element.querySelector('#timer-content');
    
    timerContent.addEventListener('mousedown', startDrag);
    
    function startDrag(e) {
        if (e.target.classList.contains('resize-handle')) return;
        
        e.preventDefault();
        isDragging = true;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        timerContent.style.cursor = 'grabbing';
    }
    
    function doDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        timerContent.style.cursor = 'move';
        
        // Sauvegarder la position
        saveTimerSettings();
    }
}

// Rendre l'overlay redimensionnable
function makeResizable(element) {
    const handles = element.querySelectorAll('.resize-handle');
    const sizeIndicator = element.querySelector('.size-indicator');
    let isResizing = false;
    let resizeDirection = '';
    let startX = 0, startY = 0;
    let startWidth = 0, startHeight = 0;
    let startLeft = 0, startTop = 0;
    
    handles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
    });
    
    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isResizing = true;
        resizeDirection = e.target.dataset.direction;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        
        element.classList.add('resizing');
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.body.style.userSelect = 'none';
    }
    
    function doResize(e) {
        if (!isResizing) return;
        e.preventDefault();
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        
        switch(resizeDirection) {
            case 'se':
                newWidth = Math.max(200, Math.min(800, startWidth + deltaX));
                newHeight = Math.max(50, Math.min(200, startHeight + deltaY));
                break;
            case 'sw':
                newWidth = Math.max(200, Math.min(800, startWidth - deltaX));
                newHeight = Math.max(50, Math.min(200, startHeight + deltaY));
                newLeft = startLeft + (startWidth - newWidth);
                break;
            case 'ne':
                newWidth = Math.max(200, Math.min(800, startWidth + deltaX));
                newHeight = Math.max(50, Math.min(200, startHeight - deltaY));
                newTop = startTop + (startHeight - newHeight);
                break;
            case 'nw':
                newWidth = Math.max(200, Math.min(800, startWidth - deltaX));
                newHeight = Math.max(50, Math.min(200, startHeight - deltaY));
                newLeft = startLeft + (startWidth - newWidth);
                newTop = startTop + (startHeight - newHeight);
                break;
            case 'n':
                newHeight = Math.max(50, Math.min(200, startHeight - deltaY));
                newTop = startTop + (startHeight - newHeight);
                break;
            case 's':
                newHeight = Math.max(50, Math.min(200, startHeight + deltaY));
                break;
            case 'w':
                newWidth = Math.max(200, Math.min(800, startWidth - deltaX));
                newLeft = startLeft + (startWidth - newWidth);
                break;
            case 'e':
                newWidth = Math.max(200, Math.min(800, startWidth + deltaX));
                break;
        }
        
        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        
        updateFontSize(newWidth, newHeight);
        sizeIndicator.textContent = `${Math.round(newWidth)}px × ${Math.round(newHeight)}px`;
    }
    
    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        document.body.style.userSelect = '';
        element.classList.remove('resizing');
        
        saveTimerSettings();
    }
}

// Ajuster la taille de police proportionnellement
function updateFontSize(width, height) {
    const display = timerOverlay.querySelector('#timer-display');
    if (!display) return;
    
    const baseWidth = 320;
    const baseHeight = 80;
    const baseFontSize = 36;
    
    const widthRatio = width / baseWidth;
    const heightRatio = height / baseHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    
    const fontSize = Math.max(14, Math.min(72, baseFontSize * ratio));
    display.style.fontSize = fontSize + 'px';
}

// Sauvegarder les paramètres du timer
function saveTimerSettings() {
    if (!timerOverlay) return;
    
    const rect = timerOverlay.getBoundingClientRect();
    chrome.runtime.sendMessage({
        action: "saveTimerSettings",
        position: { x: rect.left, y: rect.top },
        size: { width: rect.width, height: rect.height },
        visible: isVisible
    });
}

// Formater le temps
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor(milliseconds % 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Mettre à jour l'affichage du timer
function updateTimer() {
    if (!timerOverlay || !isVisible) return;
    
    if (timerState === 'running') {
        currentTime = performance.now() - startTime;
    }
    
    const display = timerOverlay.querySelector('#timer-display');
    display.textContent = formatTime(currentTime);
}

// Contrôler le timer (start/pause/reset)
function controlTimer() {
    if (!isVisible) return;
    
    console.log("Contrôle timer, état actuel:", timerState);
    const display = timerOverlay.querySelector('#timer-display');
    
    switch (timerState) {
        case 'stopped':
            startTime = performance.now();
            timerState = 'running';
            display.className = 'timer-running';
            timerInterval = setInterval(updateTimer, 10);
            console.log("Timer démarré");
            break;
            
        case 'running':
            clearInterval(timerInterval);
            timerState = 'paused';
            display.className = 'timer-paused';
            console.log("Timer en pause");
            break;
            
        case 'paused':
            clearInterval(timerInterval);
            timerState = 'stopped';
            currentTime = 0;
            display.className = 'timer-stopped';
            display.textContent = '00:00.000';
            console.log("Timer remis à zéro");
            break;
    }
}

// Toggle visibilité
function toggleTimer() {
    if (!timerOverlay) {
        createTimerOverlay();
    }
    
    isVisible = !isVisible;
    
    if (isVisible) {
        timerOverlay.style.display = 'block';
        timerOverlay.classList.add('show');
        updateTimer();
    } else {
        timerOverlay.style.display = 'none';
        timerOverlay.classList.remove('show');
    }
    
    console.log("Timer", isVisible ? "affiché" : "masqué");
    saveTimerSettings();
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Content reçoit:", message);
    
    if (message.action === "toggleTimer") {
        toggleTimer();
        sendResponse({ success: true });
    }
    
    if (message.action === "updateHotkey") {
        currentHotkey = message.hotkey;
        console.log("Hotkey mise à jour:", currentHotkey);
        sendResponse({ success: true });
    }
});

// Écouter les touches du clavier
document.addEventListener('keydown', function(event) {
    if (event.repeat) return;
    
    let isHotkeyPressed = false;
    
    // Gestion des touches spéciales
    if (currentHotkey === 'Control' && (event.ctrlKey && !event.altKey && !event.metaKey)) {
        isHotkeyPressed = true;
        event.preventDefault();
    }
    else if (currentHotkey === 'Shift' && (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey)) {
        isHotkeyPressed = true;
        event.preventDefault();
    }
    else if (currentHotkey === 'Alt' && (event.altKey && !event.ctrlKey && !event.metaKey)) {
        isHotkeyPressed = true;
        event.preventDefault();
    }
    else if (currentHotkey === 'Meta' && (event.metaKey && !event.ctrlKey && !event.altKey)) {
        isHotkeyPressed = true;
        event.preventDefault();
    }
    else if (currentHotkey === event.code) {
        isHotkeyPressed = true;
        event.preventDefault();
    }
    
    if (isHotkeyPressed) {
        console.log("Hotkey détectée, contrôle du timer");
        controlTimer();
    }
});

console.log("Gaming Tools Suite - Content script prêt");