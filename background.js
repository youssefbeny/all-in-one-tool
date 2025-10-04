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
// Service Worker pour Gaming Tools Suite
console.log("Gaming Tools Suite - Background script démarré");

// Gérer les messages des content scripts et popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background reçoit:", message);
    
    // Gestion des hotkeys pour le timer
    if (message.action === "getHotkey") {
        chrome.storage.local.get(['customHotkey'], (result) => {
            sendResponse({ hotkey: result.customHotkey || 'KeyT' });
        });
        return true; // Async response
    }
    
    if (message.action === "saveHotkey") {
        chrome.storage.local.set({ customHotkey: message.hotkey }, () => {
            console.log("Hotkey sauvegardée:", message.hotkey);
            sendResponse({ success: true });
        });
        return true; // Async response
    }
    
    // Gestion des paramètres du timer
    if (message.action === "saveTimerSettings") {
        chrome.storage.local.set({ 
            timerSettings: {
                position: message.position,
                size: message.size,
                visible: message.visible
            }
        }, () => {
            console.log("Paramètres timer sauvegardés");
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (message.action === "getTimerSettings") {
        chrome.storage.local.get(['timerSettings'], (result) => {
            const defaultSettings = {
                position: { x: 20, y: 20 },
                size: { width: 320, height: 80 },
                visible: false
            };
            sendResponse({ settings: result.timerSettings || defaultSettings });
        });
        return true;
    }
    
    // Sauvegarder l'état ZQSD
    if (message.action === "saveZqsdState") {
        chrome.storage.local.set({ zqsdActive: message.active }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    // Récupérer l'état ZQSD
    if (message.action === "getZqsdState") {
        chrome.storage.local.get(['zqsdActive'], (result) => {
            sendResponse({ active: result.zqsdActive || false });
        });
        return true;
    }

    // Sauvegarder l'état du timer
    if (message.action === "saveTimerVisible") {
        chrome.storage.local.set({ timerVisible: message.visible }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    // Récupérer l'état du timer
    if (message.action === "getTimerVisible") {
        chrome.storage.local.get(['timerVisible'], (result) => {
            sendResponse({ visible: result.timerVisible || false });
        });
        return true;
    }
    
    // Logs pour debugging
    if (message.action === "log") {
        console.log("Content script log:", message.data);
        sendResponse({ success: true });
        return true;
    }
});

// Installation initiale
chrome.runtime.onInstalled.addListener(() => {
    console.log("Gaming Tools Suite installée");
    
    // Définir les paramètres par défaut
    chrome.storage.local.set({
        customHotkey: 'KeyT',
        timerSettings: {
            position: { x: 20, y: 20 },
            size: { width: 320, height: 80 },
            visible: false
        }
    });
    
    console.log("Paramètres par défaut initialisés");
});