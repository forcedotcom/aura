(function(global){
    /**
     * You can use the publish and subscribe methods to broadcast messages through to the end points of the architecture.
     * The majority of the work is done in the devtoolsPanel and the AuraInspectorInjectedScript. So you'll usually want
     * to communicate between those two layers.
     *
     *
     * The layers go like this.
     * devtoolsPanel <- background <- contentScript <-> AuraInspectorInjectedScript
     *      |------------------------------------------------------^
     *
     * The messages you can publish and subscribe to are
     *
     * AuraInspector:OnAuraInitialized              $A is available and we are just about to run $A.initAsync
     * AuraInspector:OnPanelConnect                 The Aura Panel has been loaded and initialized. (Where we start the instrumentation of the app.)      
     * AuraInspector:OnBootstrapEnd                 We've instrumented Aura, and now the Dev Tools can initialize and expect it to be there.              
     * AuraInspector:OnContextMenu                  User Selected the "Inspect Aura Component" option in the context menu. Handled in the inspected script. Does not contain the information on what they clicked on.
     * AuraInspector:OnHighlightComponent           We focused over a component in the ComponentTree or ComponentView and the accompanying HTML element in the DOM should be spotlighted.
     * AuraInspector:OnHighlightComponentEnd        We have stopped focusing on the component, and now remove the dom element spotlight.
     * AuraInspector:AddPanel                       Add the panel at the specified URL as an Iframe tab.
     * AuraInspector:ConsoleLog                     [DEPRECATED] Show a message in the DevTools console.
     * AuraInspector:OnEventStart                   An Aura event is about to fire. Allows us to track that everything between the start and end happend as a result of this event.
     * AuraInspector:OnEventEnd                     An Aura event fired. Process all the events and actions that have happened since the event fired. 
     * Transactions:OnTransactionEnd                Transaction has ended and should now be added to the UI.
     * AuraInspector:StorageData                    Aura Storage Service has async fetched data to show in the storage panel.
     * AuraInspector:RemoveStorageData              Remove stored response for the action we would like to drop next time we see it
     * AuraInspector:ShowComponentInTree            Indicates you want to show the specified globalID in the component tree.
     * AuraInspector:OnClientActionStart
     * AuraInspector:OnClientActionEnd
     */

    var panel = new AuraInspectorDevtoolsPanel();

    // Connects to content script
    // and draws the panels.
    panel.init(function(){
            // Probably the default we want
        AuraInspectorOptions.getAll({ "activePanel": "transaction" }, function(options) {
            if(!panel.hasPanel(options["activePanel"])) {
                // If the panel we are switching to doesn't exist, use the
                // default which is the transaction panel.
                options["activePanel"] = "transaction";
            }
            panel.showPanel(options["activePanel"]);
        });
    });

    

    function AuraInspectorDevtoolsPanel() {
        //var EXTENSIONID = "mhfgenmncdnmcoonglmkepfdnjjjcpla";
        var PUBLISH_KEY = "AuraInspector:publish";
        var PUBLISH_BATCH_KEY = "AuraInspector:publishbatch";
        var BOOTSTRAP_KEY = "AuraInspector:bootstrap";
        var runtime = null;
        var actions = new Map();
        // For Drawing the Tree, eventually to be moved into it's own component
        var nodeId = 0;
        var events = new Map();
        var panels = new Map();
        var _name = "AuraInspectorDevtoolsPanel" + Date.now();
        var _onReadyQueue = [];
        var _isReady = false;
        var _initialized = false;
        var _subscribers = new Map();
        var COMPONENT_CONTROL_CHAR = "\u263A"; // This value is a component Global Id
        var ACTION_CONTROL_CHAR = "\u2744"; // ❄ - This is an action
        var ESCAPE_CHAR = "\u2353"; // This value was escaped, unescape before using.
        var tabId;

        this.connect = function(){
            if(runtime) { return; }
            tabId = chrome.devtools.inspectedWindow.tabId;

            runtime = chrome.runtime.connect({"name": _name });
            runtime.onMessage.addListener(DevToolsPanel_OnMessage.bind(this));

            runtime.postMessage({subscribe: [BOOTSTRAP_KEY], port: runtime.name, tabId: tabId});
        };

        this.disconnect = function(port) {
            // Panel was closed
            global.AuraInspector.ContentScript.disconnect();
        };

        this.init = function(finishedCallback) {
            this.connect();

            // Wait for the AuraInjectedScript to finish loading.
            this.subscribe("AuraInspector:OnBootstrapEnd", function(){ 
                if(_initialized) { return; }
                //-- Attach Event Listeners
                var header = document.querySelector("header.tabs");
                header.addEventListener("click", HeaderActions_OnClick.bind(this));

                // Initialize Panels
                var eventLog = new AuraInspectorEventLog(this);
                var tree = new AuraInspectorComponentTree(this);
                var perf = new AuraInspectorPerformanceView(this);
                var transaction = new AuraInspectorTransactionView(this);
                var actions = new AuraInspectorActionsView(this);
                var storage = new AuraInspectorStorageView(this);

                this.addPanel("component-tree", tree, "Component Tree");
                this.addPanel("performance", perf, "Performance");
                this.addPanel("transaction", transaction, "Transactions");
                this.addPanel("event-log", eventLog, "Event Log");
                this.addPanel("actions", actions, "Actions");
                this.addPanel(storage.panelId, storage, "Storage");

                // Sidebar Panel
                // The AuraInspectorComponentView adds the sidebar class
                this.addPanel("component-view", new AuraInspectorComponentView(this));

                this.subscribe("AuraInspector:OnAuraInitialized", AuraInspector_OnAuraInitialized.bind(this));

                this.subscribe("AuraInspector:OnContextMenu", function() { 
                    this.publish("AuraInspector:ContextElementRequest", {});
                }.bind(this));

                this.subscribe("AuraInspector:AddPanel", AuraInspector_OnAddPanel.bind(this));
                this.subscribe("AuraInspector:ShowComponentInTree", AuraInspector_OnShowComponentInTree.bind(this));

                // AuraInspector:publish and AuraInspector:publishbash are essentially the only things we listen for anymore.
                // We broadcast one publish message everywhere, and then we have subscribers.
                // We do this here, after we've setup all the subscribers. So now we say send us everything that has been
                // queued up, and start listening going forward.
                runtime.postMessage({subscribe : [PUBLISH_KEY, PUBLISH_BATCH_KEY], port: runtime.name, tabId: tabId });

                _initialized = true;
                
                if(typeof finishedCallback === "function") {
                    finishedCallback();
                }
            }.bind(this));

            this.publish("AuraInspector:OnPanelConnect", {});
        };

        /**
         * Adds a tab for the panel interface.
         *
         * @param {String} key unique identifier for the panel.
         * @param {Object} panel Instance of the panel you are adding.
         * @param {String} title The label which goes in the Tab to select for the panel.
         */
        this.addPanel = function(key, panel, title) {
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
                panel.init(tabBody);
                panels.set(key, panel);

                document.body.appendChild(tabBody);
            }
        };

        /*
         * Which panel to show to the user in the dev tools.
         */
        this.showPanel = function(key, options) {
            if(!key) { return; }
            var buttons = document.querySelectorAll("header.tabs button");
            var sections = document.querySelectorAll("section.tab-body:not(.sidebar)");
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

            // Render the output. Panel is responsible for not redrawing if necessary.
            var current = panels.get(panelKey);
            if(current) {
                current.render(options);
            }

            AuraInspectorOptions.set("activePanel", panelKey);
        };

        /**
         * Check if a panel exists.
         * Depending on the mode, some panels will not be added.
         */
        this.hasPanel = function(key) {
            return panels.has(key);
        };

        /**
         * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
         *
         * @param  {String} key MessageID to broadcast.
         * @param  {Object} data any type of data to pass to the subscribe method.
         */
        this.publish = function(key, data) {
            if(!key) { return; }

            var jsonData = JSON.stringify(data);
            var command = `
                window.postMessage({
                    "action": "${PUBLISH_KEY}",
                    "key": "${key}",
                    "data": ${jsonData}
                }, window.location.href);
            `;

            chrome.devtools.inspectedWindow.eval(command, function() {
                if(_subscribers.has(key)) {
                    _subscribers.get(key).forEach(function(callback){
                        callback(data);
                    });
                }
            });
        };

        /**
         * Listen for a published message through the system.
         *
         * @param  {String} key Unique MessageId that would be broadcast through the system.
         * @param  {Function} callback function to be executed when the message is published.
         */
        this.subscribe = function(key, callback) {
            if(!_subscribers.has(key)) {
                _subscribers.set(key, []);
            }

            _subscribers.get(key).push(callback);
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

        /**
         * Shows the little spinning blocks.
         */
        this.showLoading = function() {
            document.getElementById("loading").style.display="block";
        };

        /**
         * Hides the spinning blocks.
         */
        this.hideLoading = function() {
            document.getElementById("loading").style.display="none";
        };

        /**
         * Gets the mode that Aura is running in. Usually either DEV or PROD.
         * Try to avoid using this method and try to get everything working in production mode.
         *
         * @param  {Function} callback Since the eval call to get the value is async, you need to provide a callback which has the value as the first parameter to process the mode.
         *
         * @example
         * this.getMode(function(mode){ console.log("The mode is: " + mode)});
         */
        this.getMode = function(callback) {
            chrome.devtools.inspectedWindow.eval("$A.getContext().getMode();", callback);
        };


        /*
         =========== BEGIN REFACTOR! ===============
         Can we move some of these to the individual panels themselves?
         */
        this.highlightElement = function(globalId) {
            this.publish("AuraInspector:OnHighlightComponent", globalId);
        };

        this.removeHighlightElement = function() {
            this.publish("AuraInspector:OnHighlightComponentEnd");
        };

        this.addLogMessage = function(msg) {
            this.publish("AuraInspector:ConsoleLog", msg);
        };

        this.updateComponentView = function(globalId) {
            panels.get("component-view").setData(globalId);
        };

        this.getComponent = function(globalId, callback, configuration) {
            if(typeof callback !== "function") { throw new Error("callback is required for - getComponent(globalId, callback)"); }
            if(globalId.startsWith(COMPONENT_CONTROL_CHAR)) { globalId = globalId.substr(1);}
            var command;

            if(configuration && typeof configuration === "object") {
                var configParameter = JSON.stringify(configuration);
                command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configParameter});`; 
            } else {
                command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}');`; 
            }

            chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
                if(exceptionInfo) { 
                    console.error(command, " resulted in ", exceptionInfo); 
                }
                if(!response) { return; }
                var component = JSON.parse(response);

                // RESOLVE REFERENCES
                component = ResolveJSONReferences(component);

                callback(component);
            });
        };

        this.getComponents = function(globalIds, callback) {
            if(!Array.isArray(globalIds)) { throw new Error("globalIds was not an array - getComponents(globalIds, callback)");}
            var count = globalIds.length;
            var processed = 0;
            var returnValue = [];
            for(var c=0;c<count;c++) {
                this.getComponent(globalIds[c], function(index, component){
                    returnValue[index] = component;
                    if(++processed == count) {
                        callback(returnValue);
                    }
                }.bind(this, c));
            }
        };

        this.getRootComponent = function(callback) {
            if(typeof callback !== "function") { throw new Error("callback is required for - getRootComponent(callback)"); }
            var command = "window.$A && $A.getRoot() && window[Symbol.for('AuraDevTools')].Inspector.getComponent($A.getRoot().getGlobalId());"; 
            chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
                if(exceptionInfo) { console.error(exceptionInfo); }
                if(!response) { return; }
                var component = JSON.parse(response);

                // RESOLVE REFERENCES
                component = ResolveJSONReferences(component);

                callback(component);
            });
        };

        this.isComponentId = function(id) {
            return typeof id === "string" && id.startsWith(COMPONENT_CONTROL_CHAR);
        };

        this.isActionId = function(id) {
            return typeof id === "string" && id.startsWith(ACTION_CONTROL_CHAR);
        }

        this.cleanId = function(id) {
            return typeof id === "string" && (id.startsWith(COMPONENT_CONTROL_CHAR) || id.startsWith(ACTION_CONTROL_CHAR)) ? id.substr(1) : id;
        };

        /**
         * Localized Events.
         * Should probably just move to the publish and subscribe methods.
         */
        this.attach = function(eventName, eventHandler) {
            if(!events.has(eventName)) {
                events.set(eventName, new Set());
            }
            events.get(eventName).add(eventHandler);
        };

        /**
         * Localized event notification.
         * Should probably be replaced with pub/sub.
         */
        this.notify = function(eventName, data) {
             if(events.has(eventName)) {
                var eventInfo = { "data": data };
                events.get(eventName).forEach(function(item){
                    item(eventInfo);
                });
             }
        };


        /**
         * Should show a message of a different type obviously.
         */
        this.addErrorMessage = function(msg) {
            console.error(msg);
        };

        /*
         =========== END REFACTOR! ===============
         */

        /* Event Handlers */
        function HeaderActions_OnClick(event){
            var target = event.target;
            if(target.id.indexOf("tabs-") !== 0) { return; }
            this.showPanel(target.id);
        }

        function DevToolsPanel_OnMessage(message) {
            if(!message) { return; }
            if(message.action === BOOTSTRAP_KEY) {
                this.publish("AuraInspector:OnBootstrapEnd", {});
            } else if(message.action === PUBLISH_KEY) {
                callSubscribers(message.key, message.data);
            } else if(message.action === PUBLISH_BATCH_KEY) {
                var data = message.data || [];
                for(var c=0,length=data.length;c<length;c++) {
                    callSubscribers(data[c].key, data[c].data);
                }
            } 
        }

        function callSubscribers(key, data) {
            if(_subscribers.has(key)) {
                _subscribers.get(key).forEach(function(callback){
                    //console.log("SUCCESS:", key, " with data ", data, " had a subscribers");
                    try {
                        callback(data);
                    } catch(e) {
                        console.error(e);
                    }
                });
            }
            //  else {
            //     console.warn("FAIL:", key, " with data ", data, " had no subscribers.");
            // }
        }

        function AuraInspector_OnShowComponentInTree() {
            this.showPanel("component-tree");
        }

        function AuraInspector_OnAddPanel(message) {
            // If we don't have this check, anyone one the web page who
            // reverse enginers our plugin could add a panel to the aura inspector
            // in which case they would have full access to the page.
            // By limiting it to chrome-extension url's only, we are assuming
            // the extension trying to add the panel is already trusted and has access to the page.
            if(message.scriptUrl.indexOf("chrome-extension://") !== 0) {
                return;
            }

            // Security fix.
            // We instantiate a panel using a global window[] reference,
            // and we don't want people to call any function, just the panel 
            // constructors.
            if(!message.classConstructor.startsWith("InspectorPanel")) {
                return;
            }

            var script = document.createElement("script");
                script.src = message.scriptUrl;
                script.onload = function() {
                    var panelConstructor = window[message.classConstructor];
                    if(!panelConstructor) {
                        this.addLogMessage(`Tried to create the panel ${message.panelId} with constructor ${message.classConstructor} which did not exist.`);
                        return;
                    }
                    this.addPanel(message.panelId, new panelConstructor(this), message.title);
                }.bind(this);

            document.body.appendChild(script);

            if(message.hasOwnProperty("stylesheetUrl")) {
                var link = document.createElement("link");
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("href", message.stylesheetUrl);

                document.head.appendChild(link);
            }
        }

        function AuraInspector_OnAuraInitialized() {
            // The initialize script ran.
            this.publish("AuraInspector:OnPanelConnect", {});
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
    }

})(this);
