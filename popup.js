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
console.log("Gaming Tools Suite - Popup script loaded");
// Global variables
let currentActiveKey = 'KeyT';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing...");
    init();
});

function init() {
    setupTabNavigation();
    loadCurrentHotkey();
    setupTimerEventListeners();
    setupSubwayEventListeners();
    setupZqsdEventListeners();
}

// ================================
// TAB SYSTEM
// ================================

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Deactivate all tabs
            tabContents.forEach(content => content.classList.remove('active'));
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activate target tab
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            button.classList.add('active');
            
            // Improved animation
            const activeContent = document.getElementById(`${targetTab}-tab`);
            activeContent.style.animation = 'none';
            setTimeout(() => {
                activeContent.style.animation = 'fadeInUp 0.4s ease-out';
            }, 10);
        });
    });
}

// ================================
// SPEEDRUN TIMER FEATURES
// ================================

function loadCurrentHotkey() {
    chrome.runtime.sendMessage({ action: "getHotkey" }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Error loading hotkey:", chrome.runtime.lastError);
            return;
        }
        if (response && response.hotkey) {
            currentActiveKey = response.hotkey;
            updateHotkeyDisplay();
        }
    });
}

function updateHotkeyDisplay() {
    const display = document.getElementById('currentHotkeyDisplay');
    const hotkeyButtons = document.querySelectorAll('.hotkey-btn');
    
    if (display) {
        display.textContent = getKeyDisplayName(currentActiveKey);
    }
    
    hotkeyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.key === currentActiveKey) {
            btn.classList.add('active');
        }
    });
}

function getKeyDisplayName(keyCode) {
    const keyNames = {
        'KeyT': 'T', 'KeyR': 'R', 'KeyQ': 'Q', 'KeyA': 'A', 'KeyS': 'S', 'KeyW': 'W',
        'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyZ': 'Z', 'KeyX': 'X',
        'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'KeyM': 'M',
        'Space': 'SPACE', 'Enter': 'ENTER', 'Control': 'CTRL', 'Shift': 'SHIFT',
        'Alt': 'ALT', 'Meta': 'META', 'Tab': 'TAB', 'Escape': 'ESC',
        'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
        'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12'
    };
    return keyNames[keyCode] || keyCode;
}

function setupTimerEventListeners() {
    const toggleTimerBtn = document.getElementById('toggleTimer');
    const hotkeyButtons = document.querySelectorAll('.hotkey-btn');
    const customKeyInput = document.getElementById('customKeyInput');

    if (toggleTimerBtn) {
        toggleTimerBtn.addEventListener('click', function() {
            console.log("Toggle timer clicked");
            toggleTimerBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                toggleTimerBtn.style.transform = '';
            }, 150);
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleTimer" }, (response) => {
                        if (chrome.runtime.lastError) {
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                func: (message, type) => {
                                    const notification = document.createElement('div');
                                    notification.innerHTML = message;
                                    notification.style.cssText = `
                                        position: fixed;
                                        top: 10px;
                                        left: 50%;
                                        transform: translateX(-50%);
                                        background: linear-gradient(135deg, #ef4444, #dc2626);
                                        color: white;
                                        padding: 16px 32px;
                                        border-radius: 12px;
                                        font-family: 'Inter', Arial, sans-serif;
                                        font-size: 14px;
                                        font-weight: 600;
                                        z-index: 1000000;
                                        opacity: 0;
                                        transform: translateX(-50%) translateY(-20px);
                                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                        max-width: 400px;
                                        text-align: center;
                                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                                        backdrop-filter: blur(10px);
                                    `;
                                    document.body.appendChild(notification);
                                    requestAnimationFrame(() => {
                                        notification.style.opacity = '1';
                                        notification.style.transform = 'translateX(-50%) translateY(0)';
                                    });
                                    setTimeout(() => {
                                        notification.style.opacity = '0';
                                        notification.style.transform = 'translateX(-50%) translateY(-20px)';
                                        setTimeout(() => notification.remove(), 400);
                                    }, 4000);
                                },
                                args: ["⚠️ Reload the page to use the timer", 'error']
                            });
                            showStatus("Reload the page to use the timer", false);
                        } else {
                            showStatus("Timer toggled!", true);
                        }
                    });
                }
            });
        });
    }

    hotkeyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log("Hotkey button clicked:", btn.dataset.key);
            setHotkey(btn.dataset.key);
        });
    });

    if (customKeyInput) {
        customKeyInput.addEventListener('keydown', function(e) {
            e.preventDefault();
            let detectedKey = e.code;
            
            if (e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
                detectedKey = 'Control';
            } else if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                detectedKey = 'Shift';
            } else if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                detectedKey = 'Alt';
            } else if (e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                detectedKey = 'Meta';
            }
            
            if (isValidKey(detectedKey)) {
                customKeyInput.value = getKeyDisplayName(detectedKey);
                setHotkey(detectedKey);
            } else {
                showStatus("Key not supported", false);
            }
        });

        customKeyInput.addEventListener('focus', function() {
            customKeyInput.value = '';
            customKeyInput.placeholder = 'Press any key...';
        });

        customKeyInput.addEventListener('blur', function() {
            customKeyInput.placeholder = 'Or press any key...';
        });
    }
}

function isValidKey(keyCode) {
    const validKeys = [
        'KeyT', 'KeyR', 'KeyQ', 'KeyA', 'KeyS', 'KeyW', 'KeyD', 'KeyF', 'KeyG', 'KeyH',
        'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'KeyE', 'KeyY', 'KeyU',
        'KeyI', 'KeyO', 'KeyP', 'KeyJ', 'KeyK', 'KeyL', 'Digit1', 'Digit2', 'Digit3',
        'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0',
        'Space', 'Enter', 'Tab', 'Escape',
        'Control', 'Shift', 'Alt', 'Meta',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
    ];
    return validKeys.includes(keyCode);
}

function setHotkey(keyCode) {
    chrome.runtime.sendMessage({ 
        action: "saveHotkey", 
        hotkey: keyCode 
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Error saving hotkey:", chrome.runtime.lastError);
            return;
        }
        if (response && response.success) {
            currentActiveKey = keyCode;
            updateHotkeyDisplay();
            showStatus(`Key changed: ${getKeyDisplayName(keyCode)}`, true);
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: "updateHotkey", 
                        hotkey: keyCode 
                    });
                }
            });
        }
    });
}

// ================================
// SUBWAY SURFERS FEATURES
// ================================

function setupSubwayEventListeners() {
    const backupBtn = document.getElementById('backup');
    const restoreBtn = document.getElementById('restore');
    const save100Btn = document.getElementById('save100');
    const cleanDataBtn = document.getElementById('cleanData');

    if (backupBtn) {
        backupBtn.addEventListener('click', function() {
            console.log("Backup button clicked");
            addButtonFeedback(backupBtn);
            doBackup();
        });
    }

    if (restoreBtn) {
        restoreBtn.addEventListener('click', function() {
            console.log("Restore button clicked");
            addButtonFeedback(restoreBtn);
            doRestore();
        });
    }

    if (save100Btn) {
        save100Btn.addEventListener('click', function() {
            console.log("Save 100% button clicked");
            addButtonFeedback(save100Btn);
            doSave100();
        });
    }

    if (cleanDataBtn) {
        cleanDataBtn.addEventListener('click', function() {
            console.log("Clean data button clicked");
            addButtonFeedback(cleanDataBtn);
            doCleanData();
        });
    }
}

function addButtonFeedback(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

function doBackup() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            showStatus("No active tab found", false);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: backupData
        }, (results) => {
            if (chrome.runtime.lastError) {
                showStatus("Error: Reload Subway Surfers page", false);
                console.error("Backup error:", chrome.runtime.lastError);
            } else {
                showStatus("Backup created successfully!", true);
            }
        });
    });
}

function doRestore() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.bin';
    
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0]) {
                    showStatus("No active tab found", false);
                    return;
                }

                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    args: [fileContent],
                    func: restoreData
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        showStatus("Error: Reload Subway Surfers page", false);
                        console.error("Restore error:", chrome.runtime.lastError);
                    } else {
                        showStatus("Save restored! Reload the page.", true);
                    }
                });
            });
        };
        reader.readAsText(file);
    };
    
    fileInput.click();
}

function doSave100() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            showStatus("No active tab found", false);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: applySave100
        }, (results) => {
            if (chrome.runtime.lastError) {
                showStatus("Error: Reload Subway Surfers page", false);
                console.error("Save 100% error:", chrome.runtime.lastError);
            } else {
                showStatus("100% Save applied! Reload the page.", true);
            }
        });
    });
}

function doCleanData() {
    if (!confirm("Are you sure you want to delete all data? This action is irreversible!")) {
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            showStatus("No active tab found", false);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: cleanAllData
        }, (results) => {
            if (chrome.runtime.lastError) {
                showStatus("Error: Reload Subway Surfers page", false);
                console.error("Clean data error:", chrome.runtime.lastError);
            } else {
                showStatus("Data deleted. Reload the page.", true);
            }
        });
    });
}

// ================================
// ZQSD FEATURES
// ================================

function setupZqsdEventListeners() {
    const activateBtn = document.getElementById('activateZqsd');
    const deactivateBtn = document.getElementById('deactivateZqsd');

    if (activateBtn) {
        activateBtn.addEventListener('click', function() {
            console.log("Activate WASD/ZQSD button clicked");
            addButtonFeedback(activateBtn);
            activateZqsd();
        });
    }

    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', function() {
            console.log("Deactivate WASD/ZQSD button clicked");
            addButtonFeedback(deactivateBtn);
            deactivateZqsd();
        });
    }
}

function activateZqsd() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            showStatus("No active tab found", false);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            args: [true],
            func: executeZqsdScript
        }, (results) => {
            if (chrome.runtime.lastError) {
                showStatus("Error: Cannot activate WASD/ZQSD", false);
                console.error("WASD/ZQSD activation error:", chrome.runtime.lastError);
            } else {
                showStatus("WASD/ZQSD activated successfully!", true);
            }
        });
    });
}

function deactivateZqsd() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            showStatus("No active tab found", false);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            args: [false],
            func: executeZqsdScript
        }, (results) => {
            if (chrome.runtime.lastError) {
                showStatus("Error: Cannot deactivate WASD/ZQSD", false);
                console.error("WASD/ZQSD deactivation error:", chrome.runtime.lastError);
            } else {
                showStatus("WASD/ZQSD deactivated!", true);
            }
        });
    });
}

function executeZqsdScript(active) {
    const SCRIPT_KEY = "wasdZqsdHandler"; 
    
    async function showPopup(htmlContent, bgColor = "#000") { 
        if (!document.querySelector('link#material-icons')) { 
            const link = document.createElement('link'); 
            link.id = "material-icons"; 
            link.href = "https://fonts.googleapis.com/icon?family=Material+Icons"; 
            link.rel = "stylesheet"; 
            document.head.appendChild(link); 
            await new Promise(resolve => { 
                link.onload = resolve; 
                link.onerror = resolve; 
            }); 
        } 
        const popup = document.createElement("div"); 
        popup.innerHTML = htmlContent; 
        Object.assign(popup.style, { 
            position: "fixed", 
            bottom: "20px", 
            left: "20px", 
            background: bgColor, 
            color: "#fff", 
            padding: "12px 24px", 
            borderRadius: "12px", 
            fontFamily: "'Inter', Arial, sans-serif", 
            fontSize: "14px", 
            fontWeight: "600",
            zIndex: 999999, 
            opacity: 0, 
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            display: "flex", 
            alignItems: "center",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)"
        }); 
        popup.querySelectorAll(".material-icons").forEach(icon => { 
            icon.style.fontSize = "20px"; 
            icon.style.marginRight = "8px"; 
            icon.style.verticalAlign = "middle"; 
        }); 
        document.body.appendChild(popup); 
        requestAnimationFrame(() => (popup.style.opacity = "1")); 
        setTimeout(() => { 
            popup.style.opacity = "0"; 
            setTimeout(() => popup.remove(), 300); 
        }, 2500); 
    } 
    
    if (active) { 
        if (window[SCRIPT_KEY]) return; 
        const targets = [document, window, document.activeElement, document.querySelector('canvas')].filter(Boolean); 
        const handler = (e) => { 
            // Support both WASD (QWERTY) and ZQSD (AZERTY) 
            const mapping = { 
                // QWERTY layout
                w: ['ArrowUp', 38], 
                a: ['ArrowLeft', 37], 
                s: ['ArrowDown', 40], 
                d: ['ArrowRight', 39],
                // AZERTY layout 
                z: ['ArrowUp', 38], 
                q: ['ArrowLeft', 37],
                // S and D are same for both layouts
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
                showPopup('<span class="material-icons" style="vertical-align:middle; margin-right:5px;">play_arrow</span> WASD/ZQSD active (key 1)', "#00ff88"); 
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
        showPopup('<span class="material-icons" style="vertical-align:middle; margin-right:5px;">check_circle</span> WASD/ZQSD activated', "#00d9ff"); 
    } else { 
        if (!window[SCRIPT_KEY]) return; 
        document.removeEventListener("keydown", window[SCRIPT_KEY], true); 
        document.removeEventListener("keyup", window[SCRIPT_KEY], true); 
        window[SCRIPT_KEY] = null; 
        showPopup('<span class="material-icons" style="vertical-align:middle; margin-right:5px;">cancel</span> WASD/ZQSD deactivated', "#ef4444"); 
    }
}

// ================================
// SUBWAY SURFERS FUNCTIONS
// ================================

function backupData() {
    const dbName = "/idbfs";
    const storeName = "FILE_DATA";
    const keyPath = "/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/Save/cloud";

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(keyPath);

            getRequest.onsuccess = function () {
                const data = getRequest.result;

                if (data) {
                    function convertToScript(data) {
                        if (Array.isArray(data)) {
                            return `[${data.map(item => convertToScript(item)).join(', ')}]`;
                        } else if (data instanceof Date) {
                            return `new Date(${data.getTime()})`;
                        } else if (data instanceof Uint8Array) {
                            return `new Uint8Array([${Array.from(data).join(', ')}])`;
                        } else if (typeof data === 'object' && data !== null) {
                            let result = '{';
                            for (const key in data) {
                                if (data.hasOwnProperty(key)) {
                                    const value = data[key];
                                    result += `${JSON.stringify(key)}: ${convertToScript(value)}, `;
                                }
                            }
                            return result.slice(0, -2) + '}';
                        } else {
                            return JSON.stringify(data);
                        }
                    }

                    const script = convertToScript(data);
                    const blob = new Blob([script], { type: "application/octet-stream" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const now = new Date();
                    const timestamp = now.toISOString().replace(/[:.]/g, '-');
                    a.download = `subway_backup_${timestamp}.bin`;
                    a.click();
                    URL.revokeObjectURL(url);
                    resolve(true);
                } else {
                    console.warn("No data found for backup.");
                    resolve(false);
                }
            };

            getRequest.onerror = function () {
                console.error("Error retrieving data.");
                reject(new Error("Error retrieving data."));
            };
        };

        request.onerror = function () {
            console.error("Error accessing IndexedDB.");
            reject(new Error("Error accessing IndexedDB."));
        };
    });
}

function restoreData(fileContent) {
    const request = indexedDB.open("/idbfs");

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["FILE_DATA"], "readwrite");
        const store = transaction.objectStore("FILE_DATA");

        try {
            const data = eval('(' + fileContent + ')');
            
            const putRequest = store.put(data, "/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/Save/cloud");
            putRequest.onsuccess = function () {
                console.log("Data restored successfully.");
                location.reload();
            };
            putRequest.onerror = function () {
                console.error("Error restoring data.");
            };
        } catch (error) {
            console.error("File format error:", error);
        }
    };

    request.onerror = function () {
        console.error("Error accessing IndexedDB.");
    };
}

function applySave100() {
    const request = indexedDB.open("/idbfs");

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["FILE_DATA"], "readwrite");
        const store = transaction.objectStore("FILE_DATA");

        // Save 100% simplifié avec seulement les données essentielles
        const save100Data = {"timestamp": new Date(1758949289867), "mode": 33206, "contents": new Uint8Array([20, 0, 0, 0, 73, 64, 20, 32, 80, 93, 144, 35, 212, 151, 199, 197, 29, 95, 21, 149, 148, 100, 139, 208, 192, 45, 0, 0, 192, 45, 0, 0, 16, 111, 98, 102, 117, 115, 99, 97, 116, 101, 100, 67, 111, 105, 110, 115, 0, 81, 178, 127, 59, 16, 111, 98, 102, 117, 115, 99, 97, 116, 101, 100, 75, 101, 121, 115, 0, 240, 163, 125, 0, 16, 111, 98, 102, 117, 115, 99, 97, 116, 101, 100, 85, 110, 114, 101, 119, 97, 114, 100, 101, 100, 67, 111, 105, 110, 115, 0, 2, 0, 0, 0, 3, 112, 111, 119, 101, 114, 117, 112, 115, 0, 58, 0, 0, 0, 16, 104, 111, 118, 101, 114, 98, 111, 97, 114, 100, 0, 0, 0, 0, 0, 16, 104, 101, 97, 100, 115, 116, 97, 114, 116, 50, 48, 48, 48, 0, 247, 196, 154, 59, 16, 115, 99, 111, 114, 101, 98, 111, 111, 115, 116, 101, 114, 0, 20, 0, 0, 0, 0, 3, 117, 112, 103, 114, 97, 100, 101, 115, 0, 75, 0, 0, 0, 16, 106, 101, 116, 112, 97, 99, 107, 0, 0, 0, 0, 0, 16, 115, 117, 112, 101, 114, 115, 110, 101, 97, 107, 101, 114, 115, 0, 0, 0, 0, 0, 16, 99, 111, 105, 110, 109, 97, 103, 110, 101, 116, 0, 0, 0, 0, 0, 16, 100, 111, 117, 98, 108, 101, 77, 117, 108, 116, 105, 112, 108, 105, 101, 114, 0, 0, 0, 0, 0, 0, 4, 112, 101, 110, 100, 105, 110, 103, 82, 101, 119, 97, 114, 100, 115, 0, 5, 0, 0, 0, 0, 3, 98, 111, 97, 114, 100, 84, 104, 101, 109, 101, 68, 97, 116, 97, 0, 5, 0, 0, 0, 0, 4, 117, 110, 108, 111, 99, 107, 101, 100, 67, 104, 97, 114, 97, 99, 116, 101, 114, 115, 0, 134, 0, 0, 0, 2, 48, 0, 6, 0, 0, 0, 115, 108, 105, 99, 107, 0, 2, 49, 0, 7, 0, 0, 0, 102, 114, 105, 122, 122, 121, 0, 2, 50, 0, 8, 0, 0, 0, 112, 114, 105, 110, 99, 101, 107, 0, 2, 51, 0, 6, 0, 0, 0, 98, 114, 111, 100, 121, 0, 2, 52, 0, 4, 0, 0, 0, 122, 111, 101, 0, 2, 53, 0, 6, 0, 0, 0, 110, 105, 110, 106, 97, 0, 2, 54, 0, 4, 0, 0, 0, 116, 97, 103, 0, 2, 55, 0, 7, 0, 0, 0, 116, 114, 105, 99, 107, 121, 0, 2, 56, 0, 5, 0, 0, 0, 108, 117, 99, 121, 0, 2, 57, 0, 6, 0, 0, 0, 102, 114, 101, 115, 104, 0, 0, 3, 99, 111, 108, 108, 101, 99, 116, 101, 100, 67, 104, 97, 114, 97, 99, 116, 101, 114, 84, 111, 107, 101, 110, 115, 0, 51, 0, 0, 0, 16, 116, 114, 105, 99, 107, 121, 0, 2, 0, 0, 0, 16, 102, 114, 101, 115, 104, 0, 20, 9, 0, 0, 16, 121, 117, 116, 97, 110, 105, 0, 2, 0, 0, 0, 16, 115, 112, 105, 107, 101, 0, 12, 0, 0, 0, 0, 3, 115, 101, 108, 101, 99, 116, 101, 100, 79, 117, 116, 102, 105, 116, 115, 0, 69, 0, 0, 0, 16, 112, 114, 105, 110, 99, 101, 107, 0, 2, 0, 0, 0, 16, 122, 111, 101, 0, 2, 0, 0, 0, 16, 116, 97, 103, 0, 1, 0, 0, 0, 16, 116, 114, 105, 99, 107, 121, 0, 1, 0, 0, 0, 16, 108, 117, 99, 121, 0, 1, 0, 0, 0, 16, 102, 114, 101, 115, 104, 0, 1, 0, 0, 0, 0, 3, 117, 110, 108, 111, 99, 107, 101, 100, 79, 117, 116, 102, 105, 116, 115, 0, 162, 0, 0, 0, 4, 115, 108, 105, 99, 107, 0, 12, 0, 0, 0, 16, 48, 0, 1, 0, 0, 0, 0, 4, 112, 114, 105, 110, 99, 101, 107, 0, 12, 0, 0, 0, 16, 48, 0, 2, 0, 0, 0, 0, 4, 122, 111, 101, 0, 12, 0, 0, 0, 16, 48, 0, 2, 0, 0, 0, 0, 4, 116, 97, 103, 0, 12, 0, 0, 0, 16, 48, 0, 1, 0, 0, 0, 0, 4, 102, 114, 101, 115, 104, 0, 12, 0, 0, 0, 16, 48, 0, 1, 0, 0, 0, 0, 4, 116, 114, 105, 99, 107, 121, 0, 19, 0, 0, 0, 16, 48, 0, 2, 0, 0, 0, 16, 49, 0, 1, 0, 0, 0, 0, 4, 108, 117, 99, 121, 0, 12, 0, 0, 0, 16, 48, 0, 1, 0, 0, 0, 0, 4, 98, 114, 111, 100, 121, 0, 12, 0, 0, 0, 16, 48, 0, 1, 0, 0, 0, 0, 0, 4, 117, 110, 108, 111, 99, 107, 101, 100, 66, 111, 97, 114, 100, 115, 0, 22, 0, 0, 0, 2, 48, 0, 10, 0, 0, 0, 115, 116, 97, 114, 98, 111, 97, 114, 100, 0, 0, 4, 104, 97, 115, 83, 107, 105, 112, 112, 101, 100, 77, 105, 115, 115, 105, 111, 110, 115, 0, 17, 0, 0, 0, 8, 48, 0, 0, 8, 49, 0, 0, 8, 50, 0, 0, 0, 16, 114, 117, 110, 115, 67, 111, 109, 112, 108, 101, 116, 101, 100, 73, 110, 67, 117, 114, 114, 101, 110, 116, 77, 105, 115, 115, 105, 111, 110, 83, 101, 116, 0, 111, 1, 0, 0, 16, 99, 117, 114, 114, 101, 110, 116, 77, 105, 115, 115, 105, 111, 110, 83, 101, 116, 0, 1, 0, 0, 0, 4, 99, 117, 114, 114, 101, 110, 116, 77, 105, 115, 115, 105, 111, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 26, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 20, 0, 0, 0, 16, 50, 0, 2, 0, 0, 0, 0, 16, 109, 105, 115, 115, 105, 111, 110, 83, 101, 116, 67, 111, 109, 112, 108, 101, 116, 101, 100, 67, 111, 117, 110, 116, 0, 2, 0, 0, 0, 16, 99, 117, 114, 114, 101, 110, 116, 83, 107, 105, 112, 70, 111, 114, 86, 105, 100, 101, 111, 77, 105, 115, 115, 105, 111, 110, 73, 110, 100, 101, 120, 0, 0, 0, 0, 0, 9, 99, 117, 114, 114, 101, 110, 116, 83, 107, 105, 112, 70, 111, 114, 86, 105, 100, 101, 111, 73, 110, 100, 101, 120, 83, 101, 116, 65, 116, 0, 107, 47, 140, 137, 153, 1, 0, 0, 9, 108, 97, 115, 116, 84, 105, 109, 101, 77, 105, 115, 115, 105, 111, 110, 87, 97, 115, 83, 107, 105, 112, 112, 101, 100, 70, 111, 114, 86, 105, 100, 101, 111, 0, 128, 243, 119, 238, 124, 199, 255, 255, 8, 104, 97, 115, 83, 107, 105, 112, 112, 101, 100, 77, 105, 115, 115, 105, 111, 110, 70, 111, 114, 86, 105, 100, 101, 111, 84, 104, 105, 115, 83, 101, 116, 0, 0, 4, 97, 99, 104, 105, 101, 118, 101, 109, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 0, 5, 0, 0, 0, 0, 16, 117, 110, 114, 101, 112, 111, 114, 116, 101, 100, 71, 97, 109, 101, 115, 0, 0, 0, 0, 0, 9, 117, 110, 114, 101, 112, 111, 114, 116, 101, 100, 71, 97, 109, 101, 115, 84, 105, 109, 101, 83, 116, 97, 109, 112, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 104, 105, 103, 104, 83, 99, 111, 114, 101, 0, 193, 105, 130, 0, 4, 117, 110, 108, 111, 99, 107, 101, 100, 84, 114, 111, 112, 104, 105, 101, 115, 0, 37, 0, 0, 0, 8, 48, 0, 0, 8, 49, 0, 0, 8, 50, 0, 0, 8, 51, 0, 0, 8, 52, 0, 0, 8, 53, 0, 0, 8, 54, 0, 0, 8, 55, 0, 0, 0, 3, 97, 119, 97, 114, 100, 115, 80, 114, 111, 103, 114, 101, 115, 115, 0, 159, 15, 0, 0, 3, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 76, 65, 78, 69, 0, 238, 0, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 8, 0, 0, 0, 68, 105, 97, 109, 111, 110, 100, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 8, 0, 0, 0, 68, 105, 97, 109, 111, 110, 100, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 9, 0, 0, 0, 70, 105, 110, 105, 115, 104, 101, 100, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 9, 0, 0, 0, 70, 105, 110, 105, 115, 104, 101, 100, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 237, 186, 92, 53, 146, 1, 0, 0, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 5, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 0, 0, 3, 79, 80, 69, 78, 95, 88, 95, 83, 85, 80, 69, 82, 95, 77, 89, 83, 84, 69, 82, 89, 95, 66, 79, 88, 69, 83, 0, 13, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 34, 0, 0, 0, 16, 83, 117, 112, 101, 114, 77, 121, 115, 116, 101, 114, 121, 66, 111, 120, 101, 115, 79, 112, 101, 110, 101, 100, 0, 0, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 87, 73, 78, 95, 88, 95, 74, 65, 67, 75, 80, 79, 84, 83, 0, 1, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 22, 0, 0, 0, 16, 74, 97, 99, 107, 112, 111, 116, 115, 87, 111, 110, 0, 0, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 95, 78, 79, 95, 74, 85, 77, 80, 95, 79, 82, 95, 82, 79, 76, 76, 0, 238, 0, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 8, 0, 0, 0, 68, 105, 97, 109, 111, 110, 100, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 8, 0, 0, 0, 68, 105, 97, 109, 111, 110, 100, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 9, 0, 0, 0, 70, 105, 110, 105, 115, 104, 101, 100, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 9, 0, 0, 0, 70, 105, 110, 105, 115, 104, 101, 100, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 22, 220, 92, 53, 146, 1, 0, 0, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 5, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 0, 0, 3, 79, 80, 69, 78, 95, 88, 95, 77, 89, 83, 84, 69, 82, 89, 95, 66, 79, 88, 69, 83, 0, 9, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 83, 105, 108, 118, 101, 114, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 12, 0, 0, 0, 67, 111, 108, 108, 101, 99, 116, 105, 98, 108, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 218, 173, 20, 99, 146, 1, 0, 0, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 29, 0, 0, 0, 16, 77, 121, 115, 116, 101, 114, 121, 66, 111, 120, 101, 115, 79, 112, 101, 110, 101, 100, 0, 20, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 80, 73, 67, 75, 95, 88, 95, 75, 69, 89, 83, 95, 73, 78, 71, 65, 77, 69, 0, 3, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 24, 0, 0, 0, 16, 75, 101, 121, 115, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 0, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 67, 79, 76, 76, 69, 67, 84, 95, 67, 79, 73, 78, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 0, 240, 0, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 5, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 0, 0, 3, 72, 65, 86, 69, 95, 83, 85, 80, 69, 82, 83, 78, 73, 67, 75, 69, 82, 83, 95, 65, 67, 84, 73, 86, 69, 95, 88, 95, 77, 73, 78, 95, 73, 78, 95, 65, 95, 82, 79, 87, 0, 240, 0, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 5, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 0, 0, 3, 67, 79, 77, 80, 76, 69, 84, 69, 95, 77, 73, 83, 83, 73, 79, 78, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 0, 240, 0, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 83, 105, 108, 118, 101, 114, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 83, 105, 108, 118, 101, 114, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 130, 36, 67, 48, 146, 1, 0, 0, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 5, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 0, 0, 3, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 95, 78, 79, 95, 67, 79, 73, 78, 83, 0, 238, 0, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 8, 0, 0, 0, 68, 105, 97, 109, 111, 110, 100, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 8, 0, 0, 0, 68, 105, 97, 109, 111, 110, 100, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 9, 0, 0, 0, 70, 105, 110, 105, 115, 104, 101, 100, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 9, 0, 0, 0, 70, 105, 110, 105, 115, 104, 101, 100, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 251, 13, 93, 53, 146, 1, 0, 0, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 5, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 0, 0, 3, 80, 73, 67, 75, 85, 80, 95, 80, 79, 87, 69, 82, 85, 80, 83, 0, 4, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 83, 105, 108, 118, 101, 114, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 12, 0, 0, 0, 67, 111, 108, 108, 101, 99, 116, 105, 98, 108, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 104, 170, 29, 99, 146, 1, 0, 0, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 24, 0, 0, 0, 16, 80, 105, 99, 107, 117, 112, 80, 111, 119, 101, 114, 117, 112, 0, 100, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 67, 79, 77, 80, 76, 69, 84, 69, 95, 88, 95, 77, 73, 83, 83, 73, 79, 78, 83, 0, 6, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 27, 0, 0, 0, 16, 77, 105, 115, 115, 105, 111, 110, 67, 111, 109, 112, 108, 101, 116, 101, 100, 0, 0, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 67, 79, 76, 76, 69, 67, 84, 95, 79, 76, 68, 95, 84, 82, 79, 80, 72, 89, 95, 73, 84, 69, 77, 83, 95, 77, 66, 0, 48, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 69, 0, 0, 0, 16, 71, 111, 108, 100, 67, 104, 97, 105, 110, 67, 108, 111, 99, 107, 0, 0, 0, 0, 0, 16, 72, 101, 97, 100, 112, 104, 111, 110, 101, 115, 0, 0, 0, 0, 0, 16, 84, 97, 112, 101, 66, 108, 97, 99, 107, 0, 0, 0, 0, 0, 16, 76, 112, 66, 108, 97, 99, 107, 0, 0, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 3, 67, 79, 76, 76, 69, 67, 84, 95, 79, 76, 68, 95, 84, 82, 79, 80, 72, 89, 95, 73, 84, 69, 77, 83, 95, 83, 77, 66, 0, 46, 1, 0, 0, 2, 97, 99, 116, 105, 118, 101, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 112, 114, 111, 103, 114, 101, 115, 115, 84, 105, 101, 114, 84, 121, 112, 101, 0, 7, 0, 0, 0, 66, 114, 111, 110, 122, 101, 0, 2, 99, 117, 114, 114, 101, 110, 116, 65, 99, 116, 105, 118, 101, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 99, 117, 114, 114, 101, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 65, 119, 97, 114, 100, 83, 116, 97, 116, 101, 0, 11, 0, 0, 0, 73, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 9, 108, 97, 115, 116, 65, 99, 116, 105, 118, 101, 83, 116, 97, 116, 101, 67, 104, 97, 110, 103, 101, 68, 97, 116, 101, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 111, 102, 102, 115, 101, 116, 0, 255, 255, 255, 255, 3, 115, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 67, 0, 0, 0, 16, 71, 111, 108, 100, 67, 104, 97, 105, 110, 68, 111, 108, 108, 97, 114, 0, 0, 0, 0, 0, 16, 71, 111, 108, 100, 83, 107, 117, 108, 108, 0, 0, 0, 0, 0, 16, 71, 111, 108, 100, 98, 97, 114, 0, 0, 0, 0, 0, 16, 68, 105, 97, 109, 111, 110, 100, 0, 0, 0, 0, 0, 0, 8, 104, 97, 115, 77, 105, 103, 114, 97, 116, 101, 100, 84, 111, 85, 115, 101, 83, 116, 97, 116, 79, 102, 102, 115, 101, 116, 0, 1, 0, 0, 9, 119, 101, 101, 107, 108, 121, 71, 105, 102, 116, 85, 110, 108, 111, 99, 107, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 4, 115, 116, 97, 116, 86, 97, 108, 117, 101, 115, 0, 35, 1, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 0, 0, 0, 0, 16, 50, 0, 0, 0, 0, 0, 16, 51, 0, 0, 0, 0, 0, 16, 52, 0, 0, 0, 0, 0, 16, 53, 0, 0, 0, 0, 0, 16, 54, 0, 0, 0, 0, 0, 16, 55, 0, 0, 0, 0, 0, 16, 56, 0, 1, 0, 0, 0, 16, 57, 0, 0, 0, 0, 0, 16, 49, 48, 0, 0, 0, 0, 0, 16, 49, 49, 0, 0, 0, 0, 0, 16, 49, 50, 0, 0, 0, 0, 0, 16, 49, 51, 0, 5, 0, 0, 0, 16, 49, 52, 0, 0, 0, 0, 0, 16, 49, 53, 0, 0, 0, 0, 0, 16, 49, 54, 0, 0, 0, 0, 0, 16, 49, 55, 0, 0, 0, 0, 0, 16, 49, 56, 0, 0, 0, 0, 0, 16, 49, 57, 0, 0, 0, 0, 0, 16, 50, 48, 0, 0, 0, 0, 0, 16, 50, 49, 0, 0, 0, 0, 0, 16, 50, 50, 0, 0, 0, 0, 0, 16, 50, 51, 0, 0, 0, 0, 0, 16, 50, 52, 0, 0, 0, 0, 0, 16, 50, 53, 0, 192, 1, 0, 0, 16, 50, 54, 0, 0, 0, 0, 0, 16, 50, 55, 0, 0, 0, 0, 0, 16, 50, 56, 0, 0, 0, 0, 0, 16, 50, 57, 0, 58, 0, 0, 0, 16, 51, 48, 0, 0, 0, 0, 0, 16, 51, 49, 0, 0, 0, 0, 0, 16, 51, 50, 0, 0, 0, 0, 0, 16, 51, 51, 0, 0, 0, 0, 0, 16, 51, 52, 0, 0, 0, 0, 0, 16, 51, 53, 0, 0, 0, 0, 0, 16, 51, 54, 0, 0, 0, 0, 0, 0, 4, 109, 121, 115, 116, 101, 114, 121, 66, 111, 120, 101, 115, 79, 112, 101, 110, 101, 100, 0, 26, 0, 0, 0, 16, 48, 0, 57, 0, 0, 0, 16, 49, 0, 0, 0, 0, 0, 16, 50, 0, 0, 0, 0, 0, 0, 16, 99, 111, 109, 112, 108, 101, 116, 101, 100, 82, 117, 110, 67, 111, 117, 110, 116, 0, 199, 1, 0, 0, 2, 99, 117, 114, 114, 101, 110, 116, 67, 104, 97, 114, 97, 99, 116, 101, 114, 73, 100, 0, 8, 0, 0, 0, 112, 114, 105, 110, 99, 101, 107, 0, 2, 99, 117, 114, 114, 101, 110, 116, 66, 111, 97, 114, 100, 73, 100, 0, 7, 0, 0, 0, 110, 111, 114, 109, 97, 108, 0, 2, 112, 114, 101, 118, 105, 111, 117, 115, 66, 111, 97, 114, 100, 73, 100, 0, 7, 0, 0, 0, 110, 111, 114, 109, 97, 108, 0, 3, 97, 119, 97, 114, 100, 73, 115, 78, 101, 119, 0, 145, 1, 0, 0, 8, 67, 79, 76, 76, 69, 67, 84, 95, 79, 76, 68, 95, 84, 82, 79, 80, 72, 89, 95, 73, 84, 69, 77, 83, 95, 77, 66, 0, 0, 8, 67, 79, 76, 76, 69, 67, 84, 95, 79, 76, 68, 95, 84, 82, 79, 80, 72, 89, 95, 73, 84, 69, 77, 83, 95, 83, 77, 66, 0, 0, 8, 67, 79, 77, 80, 76, 69, 84, 69, 95, 88, 95, 77, 73, 83, 83, 73, 79, 78, 83, 0, 0, 8, 80, 73, 67, 75, 85, 80, 95, 80, 79, 87, 69, 82, 85, 80, 83, 0, 0, 8, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 95, 78, 79, 95, 67, 79, 73, 78, 83, 0, 0, 8, 67, 79, 77, 80, 76, 69, 84, 69, 95, 77, 73, 83, 83, 73, 79, 78, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 0, 0, 8, 72, 65, 86, 69, 95, 83, 85, 80, 69, 82, 83, 78, 73, 67, 75, 69, 82, 83, 95, 65, 67, 84, 73, 86, 69, 95, 88, 95, 77, 73, 78, 95, 73, 78, 95, 65, 95, 82, 79, 87, 0, 0, 8, 67, 79, 76, 76, 69, 67, 84, 95, 67, 79, 73, 78, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 0, 0, 8, 80, 73, 67, 75, 95, 88, 95, 75, 69, 89, 83, 95, 73, 78, 71, 65, 77, 69, 0, 0, 8, 79, 80, 69, 78, 95, 88, 95, 77, 89, 83, 84, 69, 82, 89, 95, 66, 79, 88, 69, 83, 0, 0, 8, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 95, 78, 79, 95, 74, 85, 77, 80, 95, 79, 82, 95, 82, 79, 76, 76, 0, 0, 8, 87, 73, 78, 95, 88, 95, 74, 65, 67, 75, 80, 79, 84, 83, 0, 0, 8, 79, 80, 69, 78, 95, 88, 95, 83, 85, 80, 69, 82, 95, 77, 89, 83, 84, 69, 82, 89, 95, 66, 79, 88, 69, 83, 0, 0, 8, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 76, 65, 78, 69, 0, 0, 0, 3, 97, 119, 97, 114, 100, 72, 97, 115, 80, 97, 121, 101, 100, 79, 117, 116, 0, 145, 1, 0, 0, 8, 67, 79, 76, 76, 69, 67, 84, 95, 79, 76, 68, 95, 84, 82, 79, 80, 72, 89, 95, 73, 84, 69, 77, 83, 95, 77, 66, 0, 0, 8, 67, 79, 76, 76, 69, 67, 84, 95, 79, 76, 68, 95, 84, 82, 79, 80, 72, 89, 95, 73, 84, 69, 77, 83, 95, 83, 77, 66, 0, 0, 8, 67, 79, 77, 80, 76, 69, 84, 69, 95, 88, 95, 77, 73, 83, 83, 73, 79, 78, 83, 0, 0, 8, 80, 73, 67, 75, 85, 80, 95, 80, 79, 87, 69, 82, 85, 80, 83, 0, 0, 8, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 95, 78, 79, 95, 67, 79, 73, 78, 83, 0, 1, 8, 67, 79, 77, 80, 76, 69, 84, 69, 95, 77, 73, 83, 83, 73, 79, 78, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 0, 1, 8, 72, 65, 86, 69, 95, 83, 85, 80, 69, 82, 83, 78, 73, 67, 75, 69, 82, 83, 95, 65, 67, 84, 73, 86, 69, 95, 88, 95, 77, 73, 78, 95, 73, 78, 95, 65, 95, 82, 79, 87, 0, 0, 8, 67, 79, 76, 76, 69, 67, 84, 95, 67, 79, 73, 78, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 0, 0, 8, 80, 73, 67, 75, 95, 88, 95, 75, 69, 89, 83, 95, 73, 78, 71, 65, 77, 69, 0, 0, 8, 79, 80, 69, 78, 95, 88, 95, 77, 89, 83, 84, 69, 82, 89, 95, 66, 79, 88, 69, 83, 0, 0, 8, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 82, 85, 78, 95, 78, 79, 95, 74, 85, 77, 80, 95, 79, 82, 95, 82, 79, 76, 76, 0, 1, 8, 87, 73, 78, 95, 88, 95, 74, 65, 67, 75, 80, 79, 84, 83, 0, 0, 8, 79, 80, 69, 78, 95, 88, 95, 83, 85, 80, 69, 82, 95, 77, 89, 83, 84, 69, 82, 89, 95, 66, 79, 88, 69, 83, 0, 0, 8, 83, 67, 79, 82, 69, 95, 80, 79, 73, 78, 84, 83, 95, 83, 73, 78, 71, 76, 69, 95, 76, 65, 78, 69, 0, 1, 0, 8, 97, 119, 97, 114, 100, 115, 70, 105, 114, 115, 116, 76, 111, 97, 100, 101, 100, 0, 1, 2, 119, 101, 101, 107, 108, 121, 72, 117, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 86, 101, 114, 115, 105, 111, 110, 0, 4, 0, 0, 0, 49, 46, 48, 0, 4, 104, 97, 115, 76, 111, 103, 103, 101, 100, 87, 101, 101, 107, 108, 121, 72, 117, 110, 116, 80, 101, 114, 105, 111, 100, 0, 21, 0, 0, 0, 8, 48, 0, 1, 8, 49, 0, 1, 8, 50, 0, 1, 8, 51, 0, 1, 0, 3, 119, 101, 101, 107, 108, 121, 72, 117, 110, 116, 80, 114, 111, 103, 114, 101, 115, 115, 68, 97, 116, 97, 0, 95, 0, 0, 0, 2, 104, 117, 110, 116, 83, 116, 97, 114, 116, 86, 101, 114, 115, 105, 111, 110, 0, 20, 0, 0, 0, 48, 57, 47, 49, 51, 47, 50, 48, 49, 56, 32, 48, 48, 58, 48, 48, 58, 48, 48, 0, 4, 116, 111, 107, 101, 110, 80, 114, 111, 103, 114, 101, 115, 115, 0, 33, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 0, 0, 0, 0, 16, 50, 0, 0, 0, 0, 0, 16, 51, 0, 0, 0, 0, 0, 0, 0, 16, 119, 111, 114, 100, 72, 117, 110, 116, 87, 111, 114, 100, 115, 73, 110, 82, 111, 119, 0, 1, 0, 0, 0, 8, 119, 111, 114, 100, 72, 117, 110, 116, 80, 97, 121, 101, 100, 79, 117, 116, 0, 0, 16, 119, 111, 114, 100, 72, 117, 110, 116, 85, 110, 108, 111, 99, 107, 101, 100, 77, 97, 115, 107, 0, 0, 0, 0, 0, 16, 119, 111, 114, 100, 72, 117, 110, 116, 76, 97, 115, 116, 80, 97, 121, 111, 117, 116, 68, 97, 121, 79, 102, 89, 101, 97, 114, 0, 27, 1, 0, 0, 3, 99, 104, 97, 114, 97, 99, 116, 101, 114, 78, 97, 109, 101, 69, 118, 101, 110, 116, 68, 97, 116, 97, 0, 221, 0, 0, 0, 2, 99, 117, 114, 114, 101, 110, 116, 67, 104, 97, 114, 97, 99, 116, 101, 114, 0, 6, 0, 0, 0, 115, 108, 105, 99, 107, 0, 16, 99, 111, 108, 108, 101, 99, 116, 101, 100, 76, 101, 116, 116, 101, 114, 73, 110, 100, 101, 120, 0, 255, 255, 255, 255, 16, 115, 107, 105, 112, 112, 101, 100, 67, 104, 97, 114, 97, 99, 116, 101, 114, 115, 0, 0, 0, 0, 0, 8, 119, 97, 115, 76, 97, 115, 116, 67, 104, 97, 114, 97, 99, 116, 101, 114, 67, 111, 109, 112, 108, 101, 116, 101, 100, 0, 0, 16, 99, 111, 109, 112, 108, 101, 116, 101, 100, 67, 104, 97, 114, 97, 99, 116, 101, 114, 115, 0, 0, 0, 0, 0, 4, 99, 104, 97, 114, 97, 99, 116, 101, 114, 115, 76, 105, 115, 116, 0, 5, 0, 0, 0, 0, 4, 99, 97, 116, 101, 103, 111, 114, 121, 87, 111, 114, 100, 115, 76, 105, 115, 116, 0, 5, 0, 0, 0, 0, 18, 101, 118, 101, 110, 116, 73, 68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 101, 118, 101, 110, 116, 67, 97, 116, 101, 103, 111, 114, 121, 0, 5, 0, 0, 0, 67, 97, 116, 49, 0, 0, 18, 108, 97, 115, 116, 69, 118, 101, 110, 116, 73, 68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 108, 97, 115, 116, 84, 105, 109, 101, 65, 110, 69, 118, 101, 110, 116, 72, 97, 115, 66, 101, 101, 110, 84, 114, 105, 101, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 108, 97, 115, 116, 84, 105, 109, 101, 65, 110, 69, 118, 101, 110, 116, 87, 97, 115, 83, 116, 97, 114, 116, 101, 100, 0, 213, 111, 239, 102, 0, 0, 0, 0, 18, 108, 97, 115, 116, 84, 105, 109, 101, 69, 118, 101, 110, 116, 80, 111, 112, 117, 112, 87, 97, 115, 70, 111, 114, 99, 101, 83, 104, 111, 119, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 108, 97, 115, 116, 69, 118, 101, 110, 116, 73, 116, 101, 109, 73, 68, 0, 1, 0, 0, 0, 0, 8, 115, 104, 111, 117, 108, 100, 82, 101, 115, 116, 111, 114, 101, 73, 116, 101, 109, 65, 102, 116, 101, 114, 69, 118, 101, 110, 116, 0, 0, 2, 119, 111, 114, 100, 72, 117, 110, 116, 68, 97, 105, 108, 121, 87, 111, 114, 100, 0, 6, 0, 0, 0, 67, 72, 65, 77, 80, 0, 9, 119, 111, 114, 100, 72, 117, 110, 116, 69, 120, 112, 105, 114, 101, 84, 105, 109, 101, 0, 57, 131, 158, 141, 153, 1, 0, 0, 2, 115, 121, 98, 111, 65, 110, 97, 108, 121, 116, 105, 99, 115, 83, 97, 109, 112, 108, 101, 83, 116, 97, 116, 101, 0, 10, 0, 0, 0, 85, 110, 115, 97, 109, 112, 108, 101, 100, 0, 2, 115, 121, 98, 111, 65, 110, 97, 108, 121, 116, 105, 99, 115, 85, 115, 101, 114, 73, 100, 0, 1, 0, 0, 0, 0, 2, 115, 121, 98, 111, 65, 103, 103, 114, 101, 103, 97, 116, 101, 100, 68, 97, 116, 97, 83, 116, 114, 105, 110, 103, 0, 1, 0, 0, 0, 0, 3, 115, 121, 98, 111, 65, 110, 97, 108, 121, 116, 105, 99, 115, 85, 110, 104, 97, 110, 100, 108, 101, 100, 65, 98, 84, 101, 115, 116, 68, 97, 116, 97, 0, 5, 0, 0, 0, 0, 16, 115, 121, 98, 111, 65, 110, 97, 108, 121, 116, 105, 99, 115, 67, 117, 114, 114, 101, 110, 116, 83, 101, 115, 115, 105, 111, 110, 0, 255, 255, 255, 255, 8, 107, 105, 108, 111, 111, 65, 110, 97, 108, 121, 116, 105, 99, 115, 72, 97, 115, 76, 111, 103, 103, 101, 100, 83, 121, 98, 111, 85, 115, 101, 114, 73, 100, 0, 0, 16, 112, 101, 114, 115, 105, 115, 116, 101, 100, 83, 101, 115, 115, 105, 111, 110, 69, 118, 101, 110, 116, 78, 117, 109, 98, 101, 114, 0, 255, 255, 255, 255, 3, 109, 97, 110, 97, 103, 101, 114, 68, 97, 116, 97, 0, 111, 0, 0, 0, 9, 108, 97, 115, 116, 83, 117, 98, 109, 105, 116, 116, 101, 100, 83, 99, 111, 114, 101, 83, 116, 97, 114, 116, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 9, 108, 97, 115, 116, 83, 117, 98, 109, 105, 116, 116, 101, 100, 83, 99, 111, 114, 101, 69, 110, 100, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 117, 110, 115, 117, 98, 109, 105, 116, 116, 101, 100, 83, 99, 111, 114, 101, 78, 111, 84, 111, 117, 114, 110, 97, 109, 101, 110, 116, 0, 0, 0, 0, 0, 0, 2, 108, 97, 115, 116, 84, 111, 112, 82, 117, 110, 82, 101, 115, 117, 108, 116, 65, 119, 97, 114, 100, 101, 100, 73, 68, 0, 1, 0, 0, 0, 0, 2, 112, 101, 110, 100, 105, 110, 103, 84, 111, 112, 82, 117, 110, 82, 101, 115, 117, 108, 116, 73, 68, 0, 1, 0, 0, 0, 0, 16, 112, 101, 110, 100, 105, 110, 103, 84, 111, 112, 82, 117, 110, 82, 101, 115, 117, 108, 116, 115, 83, 99, 111, 114, 101, 0, 255, 255, 255, 255, 16, 112, 101, 110, 100, 105, 110, 103, 84, 111, 112, 82, 117, 110, 82, 101, 115, 117, 108, 116, 115, 82, 97, 110, 107, 0, 255, 255, 255, 255, 16, 112, 101, 110, 100, 105, 110, 103, 84, 111, 112, 82, 117, 110, 82, 101, 115, 117, 108, 116, 115, 87, 101, 101, 107, 0, 255, 255, 255, 255, 16, 112, 101, 110, 100, 105, 110, 103, 84, 111, 112, 82, 117, 110, 66, 101, 97, 116, 101, 110, 70, 114, 105, 101, 110, 100, 115, 65, 119, 97, 114, 100, 0, 0, 0, 0, 0, 8, 98, 101, 104, 97, 118, 105, 111, 114, 97, 108, 65, 100, 115, 65, 108, 108, 111, 119, 101, 100, 0, 1, 3, 105, 110, 116, 101, 114, 115, 116, 105, 116, 105, 97, 108, 83, 116, 97, 116, 115, 0, 159, 0, 0, 0, 3, 108, 105, 115, 116, 86, 101, 114, 115, 105, 111, 110, 70, 111, 114, 73, 68, 0, 41, 0, 0, 0, 2, 104, 111, 109, 101, 95, 105, 110, 116, 101, 114, 115, 116, 105, 116, 105, 97, 108, 115, 95, 108, 105, 115, 116, 0, 7, 0, 0, 0, 110, 111, 116, 115, 101, 116, 0, 0, 16, 115, 101, 101, 110, 84, 104, 105, 115, 72, 111, 117, 114, 0, 1, 0, 0, 0, 16, 99, 117, 114, 114, 101, 110, 116, 72, 111, 117, 114, 0, 59, 181, 14, 1, 16, 115, 101, 101, 110, 84, 104, 105, 115, 68, 97, 121, 0, 1, 0, 0, 0, 16, 99, 117, 114, 114, 101, 110, 116, 68, 97, 121, 0, 141, 71, 11, 0, 8, 104, 97, 115, 83, 101, 101, 110, 70, 105, 114, 115, 116, 73, 110, 116, 101, 114, 115, 116, 105, 116, 105, 97, 108, 0, 0, 0, 3, 99, 111, 110, 115, 117, 109, 97, 98, 108, 101, 83, 101, 101, 110, 86, 105, 100, 101, 111, 115, 67, 111, 117, 110, 116, 0, 5, 0, 0, 0, 0, 3, 99, 111, 110, 115, 117, 109, 97, 98, 108, 101, 86, 105, 100, 101, 111, 83, 101, 101, 110, 65, 116, 0, 5, 0, 0, 0, 0, 3, 99, 111, 111, 108, 100, 111, 119, 110, 115, 0, 27, 0, 0, 0, 3, 97, 99, 116, 105, 118, 101, 67, 111, 111, 108, 100, 111, 119, 110, 115, 0, 5, 0, 0, 0, 0, 0, 16, 105, 110, 65, 112, 112, 76, 101, 103, 97, 99, 121, 80, 117, 114, 99, 104, 97, 115, 101, 67, 111, 117, 110, 116, 0, 0, 0, 0, 0, 16, 105, 110, 65, 112, 112, 67, 111, 110, 115, 117, 109, 97, 98, 108, 101, 80, 117, 114, 99, 104, 97, 115, 101, 67, 111, 117, 110, 116, 0, 0, 0, 0, 0, 16, 105, 110, 65, 112, 112, 82, 101, 115, 116, 111, 114, 101, 100, 80, 117, 114, 99, 104, 97, 115, 101, 67, 111, 117, 110, 116, 0, 0, 0, 0, 0, 16, 105, 110, 65, 112, 112, 78, 111, 110, 67, 111, 110, 115, 117, 109, 97, 98, 108, 101, 80, 117, 114, 99, 104, 97, 115, 101, 67, 111, 117, 110, 116, 0, 0, 0, 0, 0, 8, 105, 115, 70, 114, 101, 115, 104, 73, 110, 115, 116, 97, 108, 108, 0, 1, 8, 104, 97, 115, 85, 115, 101, 114, 82, 117, 110, 65, 112, 112, 66, 101, 102, 111, 114, 101, 0, 1, 9, 108, 97, 115, 116, 68, 97, 105, 108, 121, 79, 110, 108, 105, 110, 101, 76, 111, 103, 0, 128, 243, 119, 238, 124, 199, 255, 255, 9, 108, 97, 115, 116, 80, 108, 97, 121, 68, 97, 116, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 9, 108, 97, 115, 116, 81, 117, 105, 116, 68, 97, 116, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 2, 108, 97, 115, 116, 80, 117, 114, 99, 104, 97, 115, 101, 100, 66, 117, 110, 100, 108, 101, 0, 5, 0, 0, 0, 78, 111, 110, 101, 0, 8, 104, 97, 115, 80, 97, 105, 100, 79, 117, 116, 70, 97, 99, 101, 98, 111, 111, 107, 82, 101, 119, 97, 114, 100, 0, 0, 8, 104, 97, 115, 83, 101, 101, 110, 70, 114, 111, 110, 116, 83, 99, 114, 101, 101, 110, 70, 105, 114, 115, 116, 84, 105, 109, 101, 0, 1, 8, 104, 97, 115, 77, 97, 100, 101, 79, 110, 101, 86, 97, 108, 105, 100, 80, 117, 114, 99, 104, 97, 115, 101, 0, 0, 2, 102, 105, 114, 115, 116, 73, 110, 115, 116, 97, 108, 108, 101, 100, 86, 101, 114, 115, 105, 111, 110, 0, 1, 0, 0, 0, 0, 9, 102, 105, 114, 115, 116, 73, 110, 115, 116, 97, 108, 108, 68, 97, 116, 101, 0, 54, 218, 76, 23, 146, 1, 0, 0, 8, 104, 97, 115, 68, 111, 117, 98, 108, 101, 67, 111, 105, 110, 115, 85, 112, 103, 114, 97, 100, 101, 0, 0, 8, 104, 97, 115, 65, 100, 82, 101, 109, 111, 118, 97, 108, 85, 112, 103, 114, 97, 100, 101, 0, 0, 3, 104, 97, 115, 67, 104, 97, 114, 97, 99, 116, 101, 114, 66, 101, 101, 110, 83, 101, 101, 110, 0, 5, 0, 0, 0, 0, 3, 104, 97, 115, 66, 111, 97, 114, 100, 66, 101, 101, 110, 83, 101, 101, 110, 0, 5, 0, 0, 0, 0, 3, 99, 104, 97, 114, 97, 99, 116, 101, 114, 79, 117, 116, 102, 105, 116, 115, 83, 101, 101, 110, 0, 83, 1, 0, 0, 4, 110, 105, 110, 106, 97, 0, 12, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 0, 4, 112, 114, 105, 110, 99, 101, 107, 0, 19, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 2, 0, 0, 0, 0, 4, 102, 114, 97, 110, 107, 0, 12, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 0, 4, 107, 105, 110, 103, 0, 12, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 0, 4, 102, 114, 105, 122, 122, 121, 0, 12, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 0, 4, 115, 108, 105, 99, 107, 0, 19, 0, 0, 0, 16, 48, 0, 1, 0, 0, 0, 16, 49, 0, 0, 0, 0, 0, 0, 4, 122, 111, 101, 0, 19, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 2, 0, 0, 0, 0, 4, 98, 114, 111, 100, 121, 0, 19, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 1, 0, 0, 0, 0, 4, 116, 97, 103, 0, 19, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 1, 0, 0, 0, 0, 4, 116, 97, 115, 104, 97, 0, 12, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 0, 4, 108, 117, 99, 121, 0, 19, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 1, 0, 0, 0, 0, 4, 116, 114, 105, 99, 107, 121, 0, 26, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 2, 0, 0, 0, 16, 50, 0, 1, 0, 0, 0, 0, 4, 102, 114, 101, 115, 104, 0, 26, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 16, 49, 0, 2, 0, 0, 0, 16, 50, 0, 1, 0, 0, 0, 0, 4, 115, 112, 105, 107, 101, 0, 12, 0, 0, 0, 16, 48, 0, 0, 0, 0, 0, 0, 0, 4, 99, 111, 108, 108, 101, 99, 116, 67, 111, 105, 110, 115, 68, 117, 109, 109, 121, 68, 97, 116, 97, 0, 35, 4, 0, 0, 3, 48, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 49, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 0, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 0, 0, 0, 0, 0, 3, 49, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 50, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 0, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 0, 0, 0, 0, 0, 3, 50, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 51, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 0, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 0, 0, 0, 0, 0, 3, 51, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 49, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 24, 0, 0, 0, 0, 3, 52, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 53, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 22, 0, 0, 0, 0, 3, 53, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 54, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 19, 0, 0, 0, 0, 3, 54, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 55, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 15, 0, 0, 0, 0, 3, 55, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 51, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 14, 0, 0, 0, 0, 3, 56, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 56, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 10, 0, 0, 0, 0, 3, 57, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 49, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 7, 0, 0, 0, 0, 3, 49, 48, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 57, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 0, 0, 0, 0, 3, 49, 49, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 52, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 2, 0, 0, 0, 0, 3, 49, 50, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 50, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 1, 0, 0, 0, 0, 3, 49, 51, 0, 72, 0, 0, 0, 2, 110, 97, 109, 101, 0, 20, 0, 0, 0, 68, 85, 77, 77, 89, 95, 70, 82, 73, 69, 78, 68, 95, 78, 65, 77, 69, 95, 51, 0, 8, 104, 97, 115, 66, 101, 101, 110, 67, 111, 108, 108, 101, 99, 116, 101, 100, 0, 1, 16, 102, 97, 107, 101, 80, 114, 111, 103, 114, 101, 115, 115, 0, 0, 0, 0, 0, 0, 0, 3, 101, 97, 114, 110, 67, 117, 114, 114, 101, 110, 99, 121, 68, 97, 116, 97, 0, 5, 0, 0, 0, 0, 3, 105, 110, 65, 112, 112, 80, 117, 114, 99, 104, 97, 115, 101, 72, 105, 115, 116, 111, 114, 121, 0, 5, 0, 0, 0, 0, 16, 110, 117, 109, 98, 101, 114, 79, 102, 66, 114, 101, 97, 100, 67, 114, 117, 109, 98, 115, 83, 104, 111, 119, 110, 79, 110, 70, 114, 111, 110, 116, 80, 97, 103, 101, 0, 197, 5, 0, 0, 16, 97, 103, 101, 82, 101, 115, 116, 114, 105, 99, 116, 105, 111, 110, 73, 110, 112, 117, 116, 86, 101, 114, 115, 105, 111, 110, 0, 0, 0, 0, 0, 16, 97, 103, 101, 82, 101, 115, 116, 114, 105, 99, 116, 105, 111, 110, 73, 110, 112, 117, 116, 77, 111, 110, 116, 104, 0, 12, 0, 0, 0, 16, 97, 103, 101, 82, 101, 115, 116, 114, 105, 99, 116, 105, 111, 110, 73, 110, 112, 117, 116, 89, 101, 97, 114, 0, 207, 7, 0, 0, 3, 98, 114, 101, 97, 100, 99, 114, 117, 109, 98, 115, 0, 91, 0, 0, 0, 2, 108, 97, 115, 116, 68, 97, 105, 108, 121, 87, 111, 114, 100, 0, 6, 0, 0, 0, 67, 72, 65, 77, 80, 0, 18, 119, 101, 101, 107, 108, 121, 72, 117, 110, 116, 80, 101, 114, 105, 111, 100, 69, 120, 112, 105, 114, 101, 68, 97, 116, 101, 84, 105, 99, 107, 115, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 108, 97, 115, 116, 77, 105, 115, 115, 105, 111, 110, 83, 101, 116, 0, 2, 0, 0, 0, 0, 2, 108, 97, 115, 116, 69, 118, 101, 110, 116, 84, 121, 112, 101, 83, 104, 111, 119, 110, 0, 5, 0, 0, 0, 78, 111, 110, 101, 0, 9, 108, 97, 115, 116, 69, 118, 101, 110, 116, 83, 104, 111, 119, 110, 84, 105, 109, 101, 115, 116, 97, 109, 112, 0, 128, 243, 119, 238, 124, 199, 255, 255, 2, 108, 97, 115, 116, 83, 101, 101, 110, 66, 117, 110, 100, 108, 101, 86, 101, 114, 115, 105, 111, 110, 0, 4, 0, 0, 0, 49, 46, 48, 0, 9, 108, 97, 115, 116, 84, 105, 109, 101, 65, 86, 105, 100, 101, 111, 70, 111, 114, 75, 101, 121, 115, 87, 97, 115, 83, 101, 101, 110, 0, 128, 243, 119, 238, 124, 199, 255, 255, 9, 119, 101, 108, 99, 111, 109, 101, 80, 97, 99, 107, 83, 116, 97, 114, 116, 84, 105, 109, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 16, 99, 117, 114, 114, 101, 110, 116, 73, 110, 116, 114, 111, 86, 105, 100, 101, 111, 65, 100, 80, 114, 105, 122, 101, 73, 110, 100, 101, 120, 0, 0, 0, 0, 0, 16, 99, 117, 114, 114, 101, 110, 116, 82, 97, 110, 100, 111, 109, 86, 105, 100, 101, 111, 65, 100, 80, 114, 105, 122, 101, 73, 110, 100, 101, 120, 0, 0, 0, 0, 0, 16, 99, 117, 114, 114, 101, 110, 116, 86, 105, 100, 101, 111, 65, 100, 80, 114, 105, 122, 101, 83, 101, 101, 100, 0, 96, 127, 103, 22, 16, 118, 105, 100, 101, 111, 115, 87, 97, 116, 99, 104, 101, 100, 83, 105, 110, 99, 101, 68, 97, 105, 108, 121, 75, 101, 121, 115, 0, 0, 0, 0, 0, 3, 102, 114, 105, 101, 110, 100, 83, 116, 97, 116, 117, 115, 0, 5, 0, 0, 0, 0, 8, 97, 108, 108, 111, 119, 83, 101, 108, 108, 72, 101, 97, 100, 115, 116, 97, 114, 116, 68, 117, 114, 105, 110, 103, 82, 117, 110, 0, 1, 8, 97, 108, 108, 111, 119, 83, 101, 108, 108, 83, 99, 111, 114, 101, 98, 111, 111, 115, 116, 101, 114, 68, 117, 114, 105, 110, 103, 82, 117, 110, 0, 1, 8, 104, 97, 115, 67, 111, 108, 108, 101, 99, 116, 101, 100, 70, 114, 111, 109, 70, 114, 105, 101, 110, 100, 115, 0, 0, 8, 104, 97, 115, 83, 104, 111, 119, 110, 67, 111, 108, 108, 101, 99, 116, 80, 111, 112, 117, 112, 0, 0, 8, 104, 97, 115, 83, 104, 111, 119, 110, 70, 97, 99, 101, 98, 111, 111, 107, 80, 111, 112, 117, 112, 0, 0, 8, 104, 97, 115, 83, 104, 111, 119, 110, 72, 111, 118, 101, 114, 98, 111, 97, 114, 100, 80, 111, 112, 117, 112, 0, 0, 8, 104, 97, 115, 83, 104, 111, 119, 110, 77, 105, 115, 115, 105, 111, 110, 73, 110, 116, 114, 111, 80, 111, 112, 117, 112, 0, 0, 8, 104, 97, 115, 83, 104, 111, 119, 110, 69, 110, 100, 71, 97, 109, 101, 77, 105, 115, 115, 105, 111, 110, 80, 111, 112, 117, 112, 0, 0, 8, 105, 115, 84, 117, 116, 111, 114, 105, 97, 108, 67, 111, 109, 112, 108, 101, 116, 101, 100, 0, 1, 8, 115, 104, 111, 117, 108, 100, 83, 104, 111, 119, 67, 111, 108, 108, 101, 99, 116, 80, 111, 112, 117, 112, 0, 0, 8, 115, 104, 111, 117, 108, 100, 83, 104, 111, 119, 70, 97, 99, 101, 98, 111, 111, 107, 80, 111, 112, 117, 112, 0, 0, 8, 115, 104, 111, 117, 108, 100, 83, 104, 111, 119, 72, 111, 118, 101, 114, 98, 111, 97, 114, 100, 80, 111, 112, 117, 112, 0, 1, 8, 115, 104, 111, 117, 108, 100, 83, 104, 111, 119, 77, 105, 115, 115, 105, 111, 110, 73, 110, 116, 114, 111, 100, 117, 99, 116, 105, 111, 110, 80, 111, 112, 117, 112, 0, 0, 8, 115, 104, 111, 117, 108, 100, 83, 104, 111, 119, 69, 110, 100, 71, 97, 109, 101, 77, 105, 115, 115, 105, 111, 110, 80, 111, 112, 117, 112, 0, 0, 16, 108, 97, 115, 116, 83, 104, 111, 119, 110, 84, 111, 112, 82, 117, 110, 73, 110, 116, 114, 111, 80, 111, 112, 117, 112, 86, 101, 114, 115, 105, 111, 110, 78, 117, 109, 98, 101, 114, 0, 0, 0, 0, 0, 8, 110, 101, 118, 101, 114, 65, 115, 107, 70, 111, 114, 82, 97, 116, 105, 110, 103, 0, 0, 2, 108, 97, 110, 103, 117, 97, 103, 101, 0, 1, 0, 0, 0, 0, 8, 115, 111, 117, 110, 100, 69, 102, 102, 101, 99, 116, 115, 69, 110, 97, 98, 108, 101, 100, 0, 1, 8, 109, 117, 115, 105, 99, 69, 110, 97, 98, 108, 101, 100, 0, 0, 8, 116, 111, 112, 82, 117, 110, 67, 104, 97, 108, 108, 101, 110, 103, 101, 114, 115, 69, 110, 97, 98, 108, 101, 100, 0, 1, 8, 114, 101, 109, 111, 116, 101, 78, 111, 116, 105, 102, 105, 99, 97, 116, 105, 111, 110, 115, 69, 110, 97, 98, 108, 101, 100, 0, 1, 16, 108, 111, 99, 97, 108, 78, 111, 116, 105, 102, 105, 99, 97, 116, 105, 111, 110, 115, 69, 110, 97, 98, 108, 101, 100, 0, 255, 255, 255, 255, 8, 104, 97, 115, 76, 111, 103, 103, 101, 100, 83, 116, 97, 116, 105, 99, 68, 97, 116, 97, 0, 0, 9, 108, 97, 115, 116, 76, 111, 103, 103, 101, 100, 68, 97, 105, 108, 121, 68, 97, 116, 97, 0, 128, 243, 119, 238, 124, 199, 255, 255, 1, 97, 110, 97, 108, 121, 116, 105, 99, 115, 83, 97, 109, 112, 108, 105, 110, 103, 75, 101, 121, 0, 0, 0, 0, 32, 175, 182, 224, 63, 9, 97, 98, 84, 101, 115, 116, 76, 97, 115, 116, 68, 97, 105, 108, 121, 69, 118, 101, 110, 116, 115, 82, 101, 112, 111, 114, 116, 68, 97, 116, 101, 0, 128, 243, 119, 238, 124, 199, 255, 255, 2, 97, 98, 84, 101, 115, 116, 80, 108, 97, 121, 101, 114, 83, 101, 101, 100, 0, 11, 0, 0, 0, 50, 50, 51, 53, 54, 55, 53, 56, 57, 51, 0, 2, 97, 98, 84, 101, 115, 116, 84, 97, 103, 68, 97, 116, 97, 0, 1, 0, 0, 0, 0, 2, 102, 108, 117, 114, 114, 121, 85, 115, 101, 114, 73, 100, 0, 1, 0, 0, 0, 0, 8, 104, 97, 115, 76, 111, 103, 103, 101, 100, 71, 97, 109, 101, 67, 101, 110, 116, 101, 114, 76, 111, 103, 105, 110, 0, 0, 8, 104, 97, 115, 76, 111, 103, 103, 101, 100, 70, 97, 99, 101, 98, 111, 111, 107, 76, 111, 103, 105, 110, 0, 0, 3, 104, 97, 115, 76, 111, 103, 103, 101, 100, 70, 108, 117, 114, 114, 121, 68, 97, 105, 108, 121, 69, 118, 101, 110, 116, 83, 111, 99, 105, 97, 108, 0, 5, 0, 0, 0, 0, 0])};

        const putRequest = store.put(save100Data, "/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/Save/cloud");
        putRequest.onsuccess = function () {
            console.log("100% save applied successfully.");
            location.reload();
        };
        putRequest.onerror = function () {
            console.error("Error applying 100% save.");
        };
    };

    request.onerror = function () {
        console.error("Error accessing IndexedDB.");
    };
}

function cleanAllData() {
    const request = indexedDB.open("/idbfs");

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["FILE_DATA"], "readwrite");
        const store = transaction.objectStore("FILE_DATA");

        const clearRequest = store.clear();
        clearRequest.onsuccess = function () {
            console.log("All data has been deleted.");
            location.reload();
        };
        clearRequest.onerror = function () {
            console.error("Error deleting data.");
        };
    };

    request.onerror = function () {
        console.error("Error accessing IndexedDB.");
    };
}

// ================================
// UTILITY FUNCTIONS
// ================================

function showStatus(message, success) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        status.className = `status ${success ? 'success' : 'error'}`;
        status.style.display = 'block';
        
        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => {
                status.style.display = 'none';
                status.style.opacity = '1';
            }, 300);
        }, 4000);
    }
    console.log("Status:", message);
}