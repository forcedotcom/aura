(function(global) {

    var backgroundPage = new AuraInspectorBackgroundPage();
        backgroundPage.init();

    function AuraInspectorBackgroundPage() {
        // Chrome Tabs
        var tabs = new Map();
        // Dev Tool Panels to send messages to
        var ports = new Map();
        // Messages we are queuing up till the dev tools panel is launched.
        var stored = new Map();

        var MAX_QUEUE_LENGTH = 100000;

        this.init = function() {
            chrome.runtime.onConnect.addListener(BackgroundPage_OnConnect.bind(this));
            // onSuspend?
        };

        function BackgroundPage_OnConnect(port) {
            if(port.name){
                // Dev tool panel
                ports.set(port.name, port);
            } else {
                // Chrome Tab
                var tabId = port.sender.tab.id;
                createTabInfo(tabId);

                // chrome.tabs.executeScript(port.sender.tab.id,
                //     { file: "injectedScript.js" }
                // );
            }

            // I feel like this might not want to be added if we've already added it.
            port.onMessage.addListener(BackgroundPage_OnMessage.bind(this));
            port.onDisconnect.addListener(ConnectedPort_OnDisconnect.bind(this));
        }

        function ConnectedPort_OnDisconnect(port) {
            var tab = port.sender.tab;

            if(port.name){
                // Dev Tool
                ports.delete(port.name);
            }

            // Currently we are not deleting the tracking of the tab. We really should.
            //  else {
            //     // Chrome Tab
            //     tabs.delete(tab.id); 
            // }

            // Don't just build up a bunch of messages for tabs that have been unloaded
            if(tab) {
                stored.delete(tab.id); 
            }
        }

        function BackgroundPage_OnMessage(message, event) {
            if(message.subscribe){
                var port = typeof message.port == "string" ? ports.get(message.port) : message.port;
                var tabId = message.tabId;
                var tabInfo = getTabInfo(tabId);
                    tabInfo.port = port;

                for(var i=0;i<message.subscribe.length;i++){
                    var type = message.subscribe[i];
                    var sub = tabInfo.subscriptions.has(type);
                    if(!sub){
                        tabInfo.subscriptions.add(type);
                    }
                }

                if(stored.has(tabId)) {
                    var storedMessages = stored.get(tabId);
                    storedMessages = storedMessages.filter(function(message) {
                        if(tabInfo.subscriptions.has(message.action)) {
                            passMessageToDevTools(message, tabId);
                            // Filter out
                            return false;
                        }
                        // Stay stored
                        return true;
                    });

                    if(storedMessages.length) {
                        stored.set(tabId, storedMessages);                        
                    } else {
                        stored.delete(tabId);
                    }
                }
            }else{
                passMessageToDevTools(message, event.sender.tab.id)
            }
        }

        function passMessageToDevTools(message, tabId) {
            var tabInfo = getTabInfo(tabId);

            // Dev tools may not be open yet
            if(!tabInfo.port) {
                if(!stored.has(tabId)) {
                    stored.set(tabId, []);
                }
                var queue = stored.get(tabId);
                    queue.push(message);
                if(queue.length > MAX_QUEUE_LENGTH) {
                    queue.shift();
                }

                return;
            }

            var subscriptions = tabInfo.subscriptions.has(message.action);
            if(tabInfo.subscriptions.has(message.action)){
                tabInfo.port.postMessage(message);
            }
        }


        function getTabInfo(tabId) {
            return tabs.get(tabId);
        }

        // If it doesn't exist, create it
        function createTabInfo(tabId) {
            var tabInfo = tabs.get(tabId);
            
            if(!tabInfo){
                tabInfo = { subscriptions : new Set() };
                tabs.set(tabId, tabInfo);
            }
            return tabInfo;
        }

    }

})(this);