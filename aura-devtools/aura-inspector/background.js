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

            chrome.runtime.onMessageExternal.addListener(BackgroundPage_OnMessageExternal.bind(this));
        };

        function BackgroundPage_OnConnect(port) {
            if(port.name){
                // Dev tool panel
                ports.set(port.name, port);
            } else {
                // Chrome Tab
                var tabId = port.sender.tab.id;
                createTabInfo(tabId);
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

            // Don't just build up a bunch of messages for tabs that have been unloaded
            if(tab) {
                var storedTab = tabs.get(tab.id);
                if(storedTab && storedTab.port && !ports.has(storedTab.port.name)) {
                    // Chrome Tab
                    tabs.delete(tab.id); 
                    stored.delete(tab.id); 
                }
            }
        }

        function BackgroundPage_OnMessage(message, event) {
            if(message.subscribe){
                var port = typeof message.port == "string" ? ports.get(message.port) : message.port;
                var tabId = message.tabId; 
                var tabInfo = getTabInfo(tabId);

                // Tab doesn't exist. 
                // Can happen when you launch dev tools on dev tools.
                if(!tabInfo) {
                    return;
                }
                
                tabInfo.port = port;
                port.tabId = tabId;

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
                var tabId = event.sender.tab.id;
                if(tabId !== -1) {
                    passMessageToDevTools(message, tabId);
                }
            }
        }

        function BackgroundPage_OnMessageExternal(message, event) {
            // Only allow messages from the Sfdc Inspector
            //if(event.id !== "eihmlihnchelfaplbpcpgelolkommnib") { return; }
            
            var tabId = message.tabId;
            delete message.tabId;

            passMessageToDevTools(message, tabId);
        }

        function passMessageToDevTools(message, tabId) {
            var tabInfo = getTabInfo(tabId);

            // Dev tools may not be open yet
            if(!tabInfo || !tabInfo.port) {
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