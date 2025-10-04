/*!
 * BSD 3-Clause License
 * 
 * Copyright (c) 2025, [Ben yedder]
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of [Ben yedder] nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
console.log("Gaming Tools Suite - Content script chargé");

// Variables globales pour le timer
let timerOverlay = null;
let timerState = 'stopped';
let startTime = null;
let currentTime = 0;
let timerInterval = null;
let isVisible = false;
let currentHotkey = 'KeyT';

// Charger la hotkey au démarrage
chrome.runtime.sendMessage({ action: "getHotkey" }, (response) => {
    if (response && response.hotkey) {
        currentHotkey = response.hotkey;
        console.log("Hotkey chargée:", currentHotkey);
    }
});

// Créer l'overlay du timer immédiatement
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
                width: 300px;
                height: 60px;
                background: linear-gradient(to bottom, #2d2d30 0%, #1e1e1e 100%);
                border: 1px solid #3c3c3c;
                border-radius: 0;
                font-family: 'Consolas', 'Monaco', 'Lucida Console', monospace;
                z-index: 999999;
                display: none;
                user-select: none;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                min-width: 150px;
                min-height: 30px;
                max-width: 800px;
                max-height: 150px;
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
                padding: 8px 16px;
            }
            
            #timer-display {
                color: #ffffff;
                font-weight: bold;
                text-align: center;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                white-space: nowrap;
                font-size: 32px;
                letter-spacing: 1px;
                line-height: 1;
                font-family: 'Consolas', 'Monaco', 'Lucida Console', monospace;
            }
            
            .timer-stopped { color: #cccccc !important; }
            .timer-running { color: #ffffff !important; }
            .timer-paused { color: #ffffff !important; }
            
            #speedrun-timer-overlay:hover {
                background: linear-gradient(to bottom, #353538 0%, #252525 100%);
                border-color: #4c4c4c;
            }
            
            .resize-handle {
                position: absolute;
                background: transparent;
                z-index: 1000000;
                opacity: 0;
            }
            
            #speedrun-timer-overlay:hover .resize-handle {
                opacity: 1;
                background: rgba(100, 100, 100, 0.3);
            }
            
            .resize-handle:hover {
                background: rgba(150, 150, 150, 0.5) !important;
            }
            
            .resize-nw { top: -3px; left: -3px; width: 10px; height: 10px; cursor: nw-resize; }
            .resize-ne { top: -3px; right: -3px; width: 10px; height: 10px; cursor: ne-resize; }
            .resize-sw { bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: sw-resize; }
            .resize-se { bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: se-resize; }
            .resize-n { top: -3px; left: 10px; right: 10px; height: 6px; cursor: n-resize; }
            .resize-s { bottom: -3px; left: 10px; right: 10px; height: 6px; cursor: s-resize; }
            .resize-w { left: -3px; top: 10px; bottom: 10px; width: 6px; cursor: w-resize; }
            .resize-e { right: -3px; top: 10px; bottom: 10px; width: 6px; cursor: e-resize; }
            
            .size-indicator {
                position: absolute;
                top: -30px;
                right: 0;
                background: rgba(45, 45, 48, 0.95);
                color: #cccccc;
                padding: 4px 8px;
                font-size: 10px;
                opacity: 0;
                pointer-events: none;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                border: 1px solid #3c3c3c;
                font-family: 'Consolas', 'Monaco', 'Lucida Console', monospace;
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
        
        <div class="size-indicator">300px × 60px</div>
    `;
    
    document.body.appendChild(timerOverlay);
    makeDraggable(timerOverlay);
    makeResizable(timerOverlay);
    loadSettings();
}

// Initialiser le timer dès que possible
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
    const content = el.querySelector('#timer-content');
    
    content.addEventListener('mousedown', (e) => {
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
        el.style.left = Math.max(0, Math.min(el.offsetLeft - pos1, window.innerWidth - el.offsetWidth)) + "px";
        el.style.top = Math.max(0, Math.min(el.offsetTop - pos2, window.innerHeight - el.offsetHeight)) + "px";
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
    let isResizing=false, dir='', startX=0, startY=0, startW=0, startH=0, startL=0, startT=0;
    
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
        const dx = e.clientX - startX, dy = e.clientY - startY;
        let w=startW, h=startH, l=startL, t=startT;
        
        if(dir.includes('e')) w = Math.max(150, Math.min(800, startW + dx));
        if(dir.includes('w')) { w = Math.max(150, Math.min(800, startW - dx)); l = startL + (startW - w); }
        if(dir.includes('s')) h = Math.max(30, Math.min(150, startH + dy));
        if(dir.includes('n')) { h = Math.max(30, Math.min(150, startH - dy)); t = startT + (startH - h); }
        
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.left = l + 'px';
        el.style.top = t + 'px';
        updateFontSize(w, h);
        indicator.textContent = `${Math.round(w)}px × ${Math.round(h)}px`;
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        el.classList.remove('resizing');
        saveTimerSettings();
    }
}

function updateFontSize(w, h) {
    const d = timerOverlay.querySelector('#timer-display');
    if (!d) return;
    const size = Math.max(12, Math.min(64, 32 * Math.min(w/300, h/60)));
    d.style.fontSize = size + 'px';
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
    if (timerState === 'running') currentTime = performance.now() - startTime;
    timerOverlay.querySelector('#timer-display').textContent = formatTime(currentTime);
}

function controlTimer() {
    if (!isVisible) return;
    const d = timerOverlay.querySelector('#timer-display');
    
    if (timerState === 'stopped') {
        startTime = performance.now();
        timerState = 'running';
        d.className = 'timer-running';
        timerInterval = setInterval(updateTimer, 10);
    } else if (timerState === 'running') {
        clearInterval(timerInterval);
        timerState = 'paused';
        d.className = 'timer-paused';
    } else {
        clearInterval(timerInterval);
        timerState = 'stopped';
        currentTime = 0;
        d.className = 'timer-stopped';
        d.textContent = '00:00.000';
    }
}

function toggleTimer() {
    if (!timerOverlay) createTimerOverlay();
    isVisible = !isVisible;
    timerOverlay.style.display = isVisible ? 'block' : 'none';
    if (isVisible) updateTimer();
    saveTimerSettings();
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (msg.action === "toggleTimer") { 
        toggleTimer(); 
        respond({success: true}); 
    }
    if (msg.action === "updateHotkey") { 
        currentHotkey = msg.hotkey; 
        respond({success: true}); 
    }
});

document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    let match = false;
    
    if (currentHotkey === 'Control' && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) match = true;
    else if (currentHotkey === 'Shift' && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) match = true;
    else if (currentHotkey === 'Alt' && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) match = true;
    else if (currentHotkey === 'Meta' && e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) match = true;
    else if (currentHotkey === e.code && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) match = true;
    
    if (match) { e.preventDefault(); controlTimer(); }
});

console.log("Gaming Tools Suite - Content script prêt");