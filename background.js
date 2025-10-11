/*!
 * BSD 3-Clause License
 * Copyright (c) 2025, [Ben yedder]
 */

console.log("Gaming Tools Suite Complete - Background script démarré");

chrome.runtime.onInstalled.addListener(() => {
    console.log("Gaming Tools Suite Complete installée");
    
    chrome.storage.local.set({
        customHotkey: 'Control',
        timerSettings: {
            position: { x: 20, y: 20 },
            size: { width: 320, height: 80 },
            visible: false
        },
        unifiedTheme: 'livesplit',
        zqsdActive: false,
        resolutionActive: false
    });
    
    console.log("Paramètres initialisés avec thème livesplit");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background reçoit:", message);
    
    // Gestion hotkeys
    if (message.action === "getHotkey") {
        chrome.storage.local.get(['customHotkey'], (result) => {
            sendResponse({ hotkey: result.customHotkey || 'Control' });
        });
        return true;
    }
    
    if (message.action === "saveHotkey") {
        chrome.storage.local.set({ customHotkey: message.hotkey }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    // Gestion thème unifié
    if (message.action === "getTheme") {
        chrome.storage.local.get(['unifiedTheme'], (result) => {
            sendResponse({ theme: result.unifiedTheme || 'livesplit' });
        });
        return true;
    }
    
    if (message.action === "saveTheme") {
        chrome.storage.local.set({ unifiedTheme: message.theme }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    // Gestion paramètres timer
    if (message.action === "saveTimerSettings") {
        chrome.storage.local.set({ 
            timerSettings: {
                position: message.position,
                size: message.size,
                visible: message.visible
            }
        }, () => {
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
    
    // ZQSD - Sauvegarder l'état
    if (message.action === "saveZqsdState") {
        chrome.storage.local.set({ zqsdActive: message.active }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    // ZQSD - Récupérer l'état
    if (message.action === "getZqsdState") {
        chrome.storage.local.get(['zqsdActive'], (result) => {
            sendResponse({ active: result.zqsdActive || false });
        });
        return true;
    }
    
    // Résolution - Sauvegarder l'état
    if (message.action === "saveResolutionState") {
        chrome.storage.local.set({ resolutionActive: message.active }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    // Résolution - Récupérer l'état
    if (message.action === "getResolutionState") {
        chrome.storage.local.get(['resolutionActive'], (result) => {
            sendResponse({ active: result.resolutionActive || false });
        });
        return true;
    }
    
    if (message.action === "log") {
        console.log("Content log:", message.data);
        sendResponse({ success: true });
        return true;
    }
    
    return false;
});