(function(global){

    // Initialize    
    var inspector = new AuraInspectorContentScript();
        inspector.init();
        inspector.addEventLogMessage("AuraDevTools: Content Script Loaded");
        
    global.AuraInspector = global.AuraInspector || {};
    global.AuraInspector.ContentScript = inspector;


    function AuraInspectorContentScript(){
        var actions = new Map();
        var runtime = null;
        //var EXTENSION_ID = "mhfgenmncdnmcoonglmkepfdnjjjcpla";

        /**
         * Initializes the connection to the chrome extensions runtime
         */
        this.connect = function () {
            // Don't setup everything again, that wouldn't make sense
            if(runtime) { return; }
            //runtime = chrome.runtime.connect(EXTENSION_ID);
            runtime = chrome.runtime.connect();
            runtime.onMessage.addListener(handleMessage);
            runtime.onDisconnect.addListener(this.disconnect.bind(this));

            // Inject the script that will talk with the $A services.
            var src = chrome.extension.getURL('AuraInspectorInjectedScript.js');
            var scriptElement = global.document.createElement("script");
            scriptElement.src = src;            
            scriptElement.onload = function() {
                this.parentNode.removeChild(this);
            };
            (document.head||document.documentElement).appendChild(scriptElement);
        };

        /**
         * Not quite sure when this would happen.
         */
        this.disconnect = function() {
            // doh! what should we do?
            runtime = null;
            actions = new Map();

            setTimeout(this.init.bind(this), 1500);
        };

        this.init = function(){
            this.connect();

            // Initialize Actions which map messages to commands that get run
            // After running, we should get this response, and need to handle the response
            window.addEventListener("message", function AuraInspectorContent$Response(event){
                if(event.data.action === "AuraDevToolService.RequestComponentTreeResponse") {
                    return this.updateComponentTree(event.data.responseText);
                }
                if(event.data.action === "AuraDevToolService.RequestComponentViewResponse") {
                    return this.updateComponentView(null, event.data.responseText);
                }
                if(event.data.action === "AuraDevToolService.OnError") {
                    return this.addEventLogMessage(event.data.text);
                }
                if (event.data.action === 'AuraDevToolService.OnTransactionEnd') {
                    this.updateTransaction(event.data.payload);
                }

            }.bind(this));

            // Comment this til Kris fixes the problem
            // We shouldnt call timeout but instead hook a function 
            // in the framework once the app is ready
            // setTimeout(this.updateComponentTree, 1500);
        };

        this.highlightElement = function(globalId) {
            global.postMessage({
                action: "AuraDevToolService.HighlightElement",
                globalId: globalId
            }, "*");
        };

        this.removeHighlightElement = function() {
            global.postMessage({
                action: "AuraDevToolService.RemoveHighlightElement"
            }, "*");
        };

        this.isConnected = function() {
            return !!runtime;
        };

        this.updateTransaction = function (payload) {
            runtime.postMessage({
                action: "AuraInspector.DevToolsPanel.OnTransactionEnd",
                params: payload
            });
        },

        this.updateComponentTree = function(json) {
            if(json) {
                // With the new result, notify the Background Page
                // So it can tell the DevToolsPanel to draw the tree.
                runtime.postMessage({
                    action: "AuraInspector.DevToolsPanel.PublishComponentTree",
                    params: json
                });
            } else {
                //actions.get("AuraInspector.ContentScript.GetComponentTree").run();
                window.postMessage({
                    action: "AuraDevToolService.RequestComponentTree"
                }, "*");
            }
        };

        this.updateComponentView = function(globalId, json) {
            if(json) {
                // With the new result, notify the Background Page
                // So it can tell the DevToolsPanel to draw the tree.
                runtime.postMessage({
                    action: "AuraInspector.DevToolsPanel.PublishComponentView",
                    params: json
                });
            } else {
                //actions.get("AuraInspector.ContentScript.GetComponentTree").run(globalId);
                window.postMessage({
                    action: "AuraDevToolService.RequestComponentTree",
                    globalId: globalId
                }, "*");
            }
        };

        this.addEventLogMessage = function(msg) {
            if(!msg) { return; }
            runtime.postMessage({
                action: "AuraInspector.DevToolsPanel.OnEvent",
                params: msg
            });
        };

        /* Private Methods */
        function handleMessage(message, sender) {
            var action = actions.get(message.action);
            if(!action) {
                console.warn("Tried to handle unknown action: ", message.action);    
            }
            action.run(message.params);
        }
    }

})(this);