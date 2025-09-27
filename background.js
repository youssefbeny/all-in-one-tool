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