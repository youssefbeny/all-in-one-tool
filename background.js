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
        resolutionActive: false,
        adblockActive: true,
        adsBlocked: 0,
        sessionBlocked: 0,
        adblockStats: {
            today: 0,
            total: 0,
            lastReset: new Date().toDateString()
        }
    });
    
    console.log("Paramètres initialisés avec thème livesplit et adblock");
    console.log('Bloqueur de publicités installé');
});

// Réinitialiser les stats de session au démarrage
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({ sessionBlocked: 0 });
    console.log('Session adblock réinitialisée');
});

// Incrémenter le compteur de publicités bloquées
function incrementBlockCount() {
    chrome.storage.local.get(['adsBlocked', 'sessionBlocked', 'adblockStats'], (data) => {
        const adsBlocked = (data.adsBlocked || 0) + 1;
        const sessionBlocked = (data.sessionBlocked || 0) + 1;
        
        let stats = data.adblockStats || { today: 0, total: 0, lastReset: new Date().toDateString() };
        const currentDate = new Date().toDateString();
        
        // Réinitialiser le compteur journalier si nécessaire
        if (stats.lastReset !== currentDate) {
            stats.today = 0;
            stats.lastReset = currentDate;
        }
        
        stats.today += 1;
        stats.total += 1;
        
        chrome.storage.local.set({ 
            adsBlocked, 
            sessionBlocked,
            adblockStats: stats
        });
    });
}

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
    
    // AdBlock - Activer
    if (message.action === "enableAdblock") {
        chrome.storage.local.set({ adblockActive: true }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    // AdBlock - Désactiver
    if (message.action === "disableAdblock") {
        chrome.storage.local.set({ adblockActive: false }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    // AdBlock - Récupérer l'état
    if (message.action === "getAdblockState") {
        chrome.storage.local.get(['adblockActive', 'adblockStats'], (result) => {
            sendResponse({ 
                active: result.adblockActive !== undefined ? result.adblockActive : true,
                stats: result.adblockStats || { today: 0, total: 0 }
            });
        });
        return true;
    }
    
    // AdBlock - Réinitialiser les statistiques
    if (message.action === "resetAdblockStats") {
        chrome.storage.local.set({ 
            adblockStats: {
                today: 0,
                total: 0,
                lastReset: new Date().toDateString()
            },
            adsBlocked: 0,
            sessionBlocked: 0
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    // AdBlock - Publicité bloquée
    if (message.action === "adBlocked") {
        incrementBlockCount();
        sendResponse({ success: true });
        return true;
    }
    
    if (message.action === "log") {
        console.log("Content log:", message.data);
        sendResponse({ success: true });
        return true;
    }
    
    return false;
});
