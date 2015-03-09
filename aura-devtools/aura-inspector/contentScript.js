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
            this.injectBootstrap();
            
            // Initialize Actions which map messages to commands that get run
            // After running, we should get this response, and need to handle the response
            window.addEventListener("message", function AuraInspectorContent$Response(event){
                if(event.data.action === "AuraDevToolService.OnError") {
                    return this.addEventLogMessage(event.data.text);
                }
                if (event.data.action === 'AuraDevToolService.OnTransactionEnd') {
                    this.updateTransaction(event.data.payload);
                }

            }.bind(this));
        };

        this.injectBootstrap = function() {
            var script = document.createElement("script");
            script.textContent = script.text = `
                /**  Aura Inspector Script, ties into $A.initAsync and $A.initConfig to initialize the inspector as soon as possible. **/
                (function(){
                    function wrap(obj, original, before) {
                        return function() {
                            before.apply(obj, arguments);
                            return original.apply(obj, arguments);
                        }
                    }
                    function callBootstrap() {
                        window.postMessage({
                            action  : "AuraDevToolService.Bootstrap"
                        }, '*');
                    }
                    var _$A;
                    Object.defineProperty(window, "$A", {
                        enumerable: true,
                        configurable: true,
                        get: function() { return _$A; },
                        set: function(val) {
                            if(val && val.initAsync) {
                                val.initAsync = wrap(val, val.initAsync, callBootstrap);
                            }
                            if(val && val.initConfig) {
                                val.initConfig = wrap(val, val.initConfig, callBootstrap);
                            }
                            _$A = val;
                        }
                    });
                })();
            `;
            document.documentElement.appendChild(script);
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