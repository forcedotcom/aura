(function(global){

    var panel = new AuraInspectorDevtoolsPanel();
        panel.init();

    // Probably the default we want
    AuraInspectorOptions.getAll({ "activePanel": "component-tree" }, function(options) {
        panel.showPanel(options["activePanel"]);
    });

    //panel.showPanel("event-log");

    // devtools.js has a reference to window.refresh()
    global.refresh = function() {
        panel.updateComponentTree();
    };   

    function AuraInspectorDevtoolsPanel() {
        //var EXTENSIONID = "mhfgenmncdnmcoonglmkepfdnjjjcpla";
        var runtime = null;
        var actions = new Map();
        // For Drawing the Tree, eventually to be moved into it's own component
        var nodeId = 0; 
        var events = new Map();
        var panels = new Map();
        var _name = "AuraInspectorDevtoolsPanel" + Date.now();

        this.connect = function(){
            if(runtime) { return; }
            var tabId = chrome.devtools.inspectedWindow.tabId;

            runtime = chrome.runtime.connect({"name": _name });
            runtime.onMessage.addListener(DevToolsPanel_OnMessage.bind(this));

            // Subscribe to these events from the content script
            var events = [
                "AuraInspector.DevToolsPanel.OnEvent",
                "AuraInspector.DevToolsPanel.OnTransactionEnd"
            ];
            runtime.postMessage({subscribe : events, port: runtime.name, tabId: tabId });
        };

        this.disconnect = function(port) {
            //alert("devtoolspanel.disconnect");

            // doh! what should we do?
            global.AuraInspector.ContentScript.disconnect();
            global.AuraInspector.ContentScript.init();

            this.connect();
            // Used to do this
            //AuraInspectorContentScript.port = null;
            //setTimeout(AuraInspectorContentScript.init, 1500);
        };

        this.init = function() {
            this.connect();

            actions.set("AuraInspector.DevToolsPanel.OnEvent", new GeneralNotify(this, "onevent"));
            actions.set("AuraInspector.DevToolsPanel.OnTransactionEnd", new TransactionEnd(this));

            //-- Attach Event Listeners

            var header = document.querySelector("header.tabs");
            header.addEventListener("click", HeaderActions_OnClick.bind(this));

            // Initialize Panels
            var eventLog = new AuraInspectorEventLog(this);
            var tree = new AuraInspectorComponentTree(this);
            var definitions = new AuraInspectorDefinitionsList(this);
            var perf = new AuraInspectorPerformanceView(this);
            var transaction = new AuraInspectorTransactionView(this);

            this.addPanel("component-tree", tree, "Component Tree");
            this.addPanel("definitions-list", definitions, "Definitions");
            this.addPanel("performance", perf, "Performance");
            this.addPanel("transaction", transaction, "Transactions");
            this.addPanel("event-log", eventLog, "Event Log")

            // Sidebar Panels. Have to be after the primary panels
            var view = new AuraInspectorComponentView(this);
            this.addPanel("component-view", view);
        };

        this.attach = function(eventName, eventHandler) {
            if(!events.has(eventName)) {
                events.set(eventName, new Set());
            }
            events.get(eventName).add(eventHandler);
        };

        this.notify = function(eventName, data) {
             if(events.has(eventName)) {
                var eventInfo = { "data": data };
                events.get(eventName).forEach(function(item){
                    item(eventInfo);
                });
             }
        };

        this.addPanel = function(key, component, title) {
            if(!panels.has(key)) {
                // Create Tab Body and Header
                var tabBody = document.createElement("section");
                    tabBody.className="tab-body";
                    tabBody.id = "tab-body-" + key;

                if(title) {
                    var tabHeader = document.createElement("button");
                        tabHeader.appendChild(document.createTextNode(title));
                        tabHeader.id = "tabs-" + key;                    

                    var tabs = document.querySelector("header.tabs");
                        tabs.appendChild(tabHeader);
                }

                // Initialize component with new body
                component.init(tabBody);
                panels.set(key, component);

                document.body.appendChild(tabBody);
            }
        };
        
        /*
         * Which panel to show to the user in the dev tools.
         * Currently: Component Tree (component-tree), and Event Log (event-log)
         */
        this.showPanel = function(key) {
            if(!key) { return; }
            var buttons = document.querySelectorAll("header.tabs button");
            var sections = document.querySelectorAll("section.tab-body");
            var panelKey = key.indexOf("tabs-")==0?key.substring(5):key;
            var buttonKey = "tabs-"+panelKey;

            for(var c=0;c<buttons.length;c++){
                if(buttons[c].id===buttonKey) {
                    buttons[c].classList.add("selected");
                    sections[c].classList.add("selected");
                } else {
                    buttons[c].classList.remove("selected");
                    sections[c].classList.remove("selected");
                }
            }

            // Render the output. Panel is responsibile for not redrawing if necessary.
            var current = panels.get(panelKey);
            if(current) {
                current.render();
            }

            AuraInspectorOptions.set("activePanel", panelKey);
        };

        /**
         * Essentially hides the component view. More might go in there, but for now, thats it.
         */
        this.hideSidebar = function() {
            document.body.classList.remove("sidebar-visible");
        };

        /**
         * Shows the component view.
         */
        this.showSidebar = function() {
            document.body.classList.add("sidebar-visible");
        };

        /* Panel Specific stuff */
        this.highlightElement = function(globalId) {
            chrome.devtools.inspectedWindow.eval("AuraInspector.ContentScript.highlightElement('" + globalId + "');", { useContentScriptContext: true} );
        };

        this.removeHighlightElement = function() {
            chrome.devtools.inspectedWindow.eval("AuraInspector.ContentScript.removeHighlightElement();", { useContentScriptContext: true} );
        };

        this.addLogMessage = function(msg) {
            if(!panels.get("event-log")) {
                alert("Event log msg added before event log was available. Fix that this isn't possible.");
            }
            panels.get("event-log").addLogItem(msg);
        };

        /**
         * Should show a message of a different type obviously. 
         */
        this.addErrorMessage = function(msg) {
            panels.get("event-log").addLogItem(msg);
        };
        
        this.showLoading = function() {
            document.getElementById("loading").style.display="block";
        };

        this.hideLoading = function() {
            document.getElementById("loading").style.display="none";
        };
        
        this.updateComponentTree = function(json) {
            this.addLogMessage("Updating Component Tree");
            this.showLoading();
            var command = "$A.getRoot().toJSON()";
            chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
                if(exceptionInfo) { console.error(exceptionInfo); }
                if(!response) { return; }
                var tree = JSON.parse(response);
                
                // RESOLVE REFERENCES
                tree = ResolveJSONReferences(tree);

                panels.get("component-tree").setData(tree);
                this.addLogMessage("Component Tree Updated");
                this.hideLoading();
            }.bind(this));
        };

        this.updateComponentView = function(globalId) {
            var command = [
                "var component = $A.getComponent('" + globalId + "')", 
                "if(component) {component.toJSON();}"
            ].join(";")

            chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
                if(exceptionInfo) { console.error(exceptionInfo); }
                if(!response) { return; }
                var tree = JSON.parse(response);
                
                // RESOLVE REFERENCES
                tree = ResolveJSONReferences(tree);

                panels.get("component-view").setData(tree);
            }.bind(this));
        };

        /* Event Handlers */
        function HeaderActions_OnClick(event){
            var target = event.target;
            if(target.id.indexOf("tabs-") !== 0) { return; }
            this.showPanel(target.id);
        }

        function DevToolsPanel_OnMessage(message) {
            //alert(JSON.stringify(message));
            var action = actions.get(message.action);
            if(!action) {
                alert("No action with the id: ", message.action);
                return;
            }
            action.run(message.params);
        }

        /* PRIVATE */
        function stripDescriptorProtocol(descriptor) {
            if(typeof descriptor != 'string') { return descriptor; }
            if(descriptor.indexOf("://") === -1) { 
                return descriptor;
            }
            return descriptor.split("://")[1];
        }


        function ResolveJSONReferences(object) {
            if(!object) { return object; }
            
            var count = 0;
            var serializationMap = new Map();
            var unresolvedReferences = [];

            function resolve(current, parent, property) {
                if(!current) { return current; }
                if(typeof current === "object") {
                    if(current.hasOwnProperty("$serRefId")) {
                        if(serializationMap.has(current["$serRefId"])) { 
                            return serializationMap.get(current["$serRefId"]);
                        } else {
                            // Probably Out of order, so we'll do it after scanning the entire tree
                            unresolvedReferences.push({ parent: parent, property: property, $serRefId: current["$serRefId"] });
                            return current;
                        }
                    }

                    if(current.hasOwnProperty("$serId")) {
                        serializationMap.set(current["$serId"], current);
                        delete current["$serId"];
                    }

                    for(var property in current) {
                        if(current.hasOwnProperty(property)) {
                            if(typeof current[property] === "object") {
                                current[property] = resolve(current[property], current, property);
                            }
                        }
                    }
                }
                return current;
            }

            object = resolve(object);

            // If we had some resolutions out of order, lets clean those up now that we've parsed everything that is serialized.
            var unresolved;
            for(var c=0,length=unresolvedReferences.length;c<length;c++) {
                unresolved = unresolvedReferences[c];
                unresolved.parent[unresolved.property] = serializationMap.get(unresolved["$serRefId"]);
            }


            return object;
        }

        /* Actions */
        function TransactionEnd(service)  {
            this.run = function (data) {
                var transaction = panels.get('transaction');
                    transaction.addTransactions(data);
            };
        }

        /*
         * Pass the action on to the event handler system.
         */
        function GeneralNotify(service, eventName) {
            this.run = function(data) {
                service.notify(eventName, data);
            }
        }
    }

})(this);

