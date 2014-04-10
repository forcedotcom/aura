var AuraInspectorContentScript = {
    
    port : null,
    dtsPort : null,

    connect : function(){
        AuraInspectorContentScript.dtsPort = document.getElementById("AuraDevToolServicePort");
        if (!AuraInspectorContentScript.dtsPort) {
            AuraInspectorContentScript.dtsPort = null;
            setTimeout(AuraInspectorContentScript.connect, 1500);
        }
        AuraInspectorContentScript.port = chrome.extension.connect();
        AuraInspectorContentScript.port.onMessage.addListener(AuraInspectorContentScript.handleMessage);
        AuraInspectorContentScript.port.onDisconnect.addListener(AuraInspectorContentScript.disconnect);
        setTimeout(AuraInspectorContentScript.actions.getComponentTree, 1500);
    },
    
    handleMessage : function(message){
        AuraInspectorContentScript.actions[message.action](message.params);
    },

    disconnect : function(port) {
        // doh! what should we do?
        AuraInspectorContentScript.port = null;
        AuraInspectorContentScript.dtsPort = null;
        setTimeout(AuraInspectorContentScript.connect, 1500);
    },
    
    actions : {
        getComponentTree : function(){
            if (AuraInspectorContentScript.port == null || AuraInspectorContentScript.dtsPort == null) {
                return;
            }
            var customEvent = document.createEvent('Event');
            customEvent.initEvent('getComponentTreeEvent', true, true);
            document.body.dispatchEvent(customEvent);
            AuraInspectorContentScript.port.postMessage({action : "publishComponentTree",
                                                         params : AuraInspectorContentScript.dtsPort.innerText});
            AuraInspectorContentScript.dtsPort.innerText = "";
        },

        highlightElements : function(globalId){
            var customEvent = document.createEvent('MessageEvent');
            customEvent.initMessageEvent('highlightElementsEvent', true, true, globalId);
            document.body.dispatchEvent(customEvent);
        }
    }
};
AuraInspectorContentScript.connect();
