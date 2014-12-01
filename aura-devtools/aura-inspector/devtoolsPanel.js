(function(global){

    var panel = new AuraInspectorDevtoolsPanel();
        panel.init();

        // Probably the default we want
        panel.showPanel("component-tree");
        //panel.showPanel("event-log");


        //panel.notify("onevent", { message: "Test Message" });
        // This necessary?
        //panel.updateComponentTree();
        // Doesn't seem like it

        // devtools.js has a reference to window.refresh()
        global.refresh = function() {
            panel.updateComponentTree();
        };


    // Move component tree drawing into here.
    function AuraInspectorComponentTree(devtoolsPanel) {

        this.init = function() {};

        this.render = function(items) {
            var treeElement = document.getElementById("tree");
                treeElement.innerHTML = "";

             try {
                var treeNodes = generateTreeNodes(items);
            } catch(e) {
                alert(e.message);
            }

            var treeComponent = new AuraInspectorTreeView();
                treeComponent.addChildren(treeNodes);
                treeComponent.render(treeElement);

                treeComponent.attach("onhover", TreeComponent_OnHover.bind(this));
            //     Update side panels and stuff
            //     treeComponent.addEvent("onselect", TreeComponent_OnSelect);
            //     Handle reference nodes, possibly already built into the tree
            //     treeComponent.addEvent("onexpand", TreeComponent_OnExpand);

        }

        function TreeComponent_OnHover(event) {
            if(event && event.data) {
                var domNode = event.data.domNode;
                var treeNode = event.data.treeNode;
                var globalId = treeNode && treeNode.getRawLabel().globalId;
                // TODO: Figure out how best to return the treeNode so I can get at the raw data.
                //devtoolsPanel.addLogMessage("OnHover:" + globalId);
                if(globalId) {
                    devtoolsPanel.highlightElement(globalId);
                }
            }
        }

        function generateTreeNodes(structure) {
            var allnodes = new Set();
            var root = new TreeNode();
            var formatters = {
                ComponentDefFormatter: function(value){ return value+""; },
                ComponentFormatter: function(value){
                    value.tagName = value.tagName.split("://")[1] || value.tagName;
                    var pattern = [
                        '<span class="component-tree-tagname">&lt;{tagName}</span>'
                        //,' <span class="component-tree-attribute">globalId</span>="{globalId}"'
                    ];
                    if(value.attributes) {
                        for(var attr in value.attributes) {
                            pattern.push(' <span class="component-tree-attribute">' + attr + '</span>="' + value.attributes[attr] + '"');
                        }   
                    }
                    // if(value.localId) {
                    //     pattern.push(' <span class="component-tree-attribute">aura:id</span>="{localId}"/&gt;');
                    // } else {
                    pattern.push("&gt;");
                    //}
                    return format(pattern.join(''), value);
                },
                HtmlComponentFormatter: function(value) {
                    value.tagName = value.attributes.tag;
                    delete value.attributes.tag;
                    var pattern = [
                        '<span class="component-tree-tagname">&lt;{tagName}</span>'
                        //,' <span class="component-tree-attribute">globalId</span>="{globalId}"'
                    ];
                    if(value.attributes["aura:id"]) {
                        pattern.push(' <span class="component-tree-attribute">aura:id</span>="' + value.attributes["aura:id"] + '"');
                        for(var attr in value.attributes.HTMLAttributes) {
                            pattern.push(' <span class="component-tree-attribute">' + attr + '</span>="' + value.attributes.HTMLAttributes[attr] + '"');
                        }   
                    }
                    // if(value.localId) {
                    //     pattern.push(' <span class="component-tree-attribute">aura:id</span>="{localId}"/&gt;');
                    // } else {
                    pattern.push("&gt;");
                    //}
                    return format(pattern.join(''), value);
                },
                TextComponentFormatter: function(value) {
                    var text = value.attributes.value;
                    // Whats the point of returning empty text nodes anyway?
                    // Should probably show /n for carriage returns
                    if(!text || text.trim().length == 0) {
                        text = '&quot;&quot;';
                    }
                    return text;
                },
                ExpressionComponentFormatter: function(value) {
                    return value.attributes.value;
                },
                KeyValueFormatter: function(value){
                    if(value.value && value.value.toString().indexOf("function (") === 0){
                        value.value = formatters.FunctionFormatter(value.value);
                    }

                    return format('<span class="component-tree-property">{key}</span>:<span class="component-tree-property-value">{value}</span>', value);
                },
                PropertyFormatter: function(value){ 
                    return '<span class="component-tree-property">' + value + '</span>';
                },
                FunctionFormatter: function(value){
                    return '<span>function(){...}</span>';
                },
                FacetFormatter: function(value){
                    return '<span class="component-tree-property">' + value.property + '</span>:' + formatters.ComponentFormatter(value);
                }
            };

            // Generates the whole tree
            generateTreeNodeForConcreteComponent(null, structure, root);
            //generateTreeNodeForComponent(null, structure, root);
            
            return root.getChildren();

            function generateTreeNodeForConcreteComponent(property, component, parent) {
                if(!component || !component.descriptor) { return; }

                var attributes = {
                    property: property,
                    tagName: component.descriptor,
                    globalId: component.globalId || "",
                    attributes: {}
                };

                if(component.localId) {
                    attributes.attributes["aura:id"] = component.localId;
                }
                
                var id = component.globalId;
                var value;
                var body = [];

                if(component.attributes) {
                    for(var property in component.attributes) {
                        if(!component.attributes.hasOwnProperty(property)) { continue; }

                        if(property === "body") {
                            getBody(body, component);
                        }
                        else if(component.expressions && component.expressions.hasOwnProperty(property)) {
                            //attributes.attributes[property] = component.expressions[property];
                            attributes.attributes[property] = component.expressions[property];
                        }
                        else {
                            attributes.attributes[property] = component.attributes[property];
                        }
                    }
                }
                var node = new TreeNode(attributes, id);

                                // is Html?
                if(attributes.tagName==="markup://aura:html") {
                    node.setFormatter(formatters.HtmlComponentFormatter);
                } else if(attributes.tagName==="markup://aura:text") {
                    node.setFormatter(formatters.TextComponentFormatter);
                } else if(attributes.tagName==="markup://aura:expression") {
                    node.setFormatter(formatters.ExpressionComponentFormatter);
                } else if(component.globalId) {
                    node.setFormatter(formatters.ComponentFormatter);
                } else {
                    node.setFormatter(formatters.ComponentDefFormatter);
                }

                if(!allnodes.has(component.globalId)) {
                    allnodes.add(component.globalId);
                    
                    for(var c=0;c<body.length;c++) {
                        generateTreeNodeForConcreteComponent(null, body[c], node);
                    }
                }
                
                parent.addChild(node);
            }

            function getBody(collection, component) {
                if(!component || !component.attributes || !component.attributes.body) { return; }
                var body = component.attributes.body;
                //for(var id in body) {
                    for(var c=0;c<body.length;c++){
                        collection.push(body[c]);
                    }   
                //}
                if(component.super) {
                    getBody(collection, component.super);
                }
                return collection;
            }

            function generateTreeNodeForComponent(property, component, parent) {
                var attributes = {
                    property: property,
                    tagName: component.descriptor,
                    globalId: component.globalId || "",
                    attributes: {}
                };
                
                if(component.localId) {
                    attributes.attributes["aura:id"] = component.localId;
                }

                var id = parent && property ? parent.getId() + "_" + property + "_" + component.globalId : component.globalId;
                var node = new TreeNode(attributes, id);

                if(property) {
                    node.setFormatter(formatters.FacetFormatter);
                } else if(component.globalId) {
                    node.setFormatter(formatters.ComponentFormatter);
                } else {
                    node.setFormatter(formatters.ComponentDefFormatter);
                }

                if(!allnodes.has(component.globalId)) {
                    allnodes.add(component.globalId);
                    var value;
                    for(var property in component) {
                        value = component[property];
                        if(!component.hasOwnProperty(property)) { continue; }

                        if(isComponent(value)) {
                            generateTreeNodeForComponent(property, value, node);
                        } else {
                            generateTreeNodeForNativeType(property, component[property], node);
                        }
                    
                    }
                }
                
                parent.addChild(node);
            }

            function generateTreeNodeForNativeType(key, value, parent) {

                var node;
                
                if(typeof value === "object") {
                    node = new TreeNode(key, parent.getId()+"_"+key);
                    node.setFormatter(formatters.PropertyFormatter);
                    for(var property in value) {
                        // Already output as part of the component label
                        if(!value.hasOwnProperty(property)) { continue; }

                        if(isComponent(value[property])) {
                            generateTreeNodeForComponent(property, value[property], node);
                        } else {
                            generateTreeNodeForNativeType(property, value[property], node);
                        }
                    }
                } else {
                    node = new TreeNode({ key: key, value: value+"" });
                    node.setFormatter(formatters.KeyValueFormatter);
                }

                parent.addChild(node);
            }

            function isComponent(component) {
                if(!component) { return false; }
                return typeof component === "object" && component.hasOwnProperty("descriptor") && component.descriptor.indexOf("markup://") === 0;
            }

            function isComponentDef(component) {
                if(!component) { return false; }
                return typeof component === "object" && component.hasOwnProperty("componentDef") && component.componentDef.descriptor.indexOf("markup://") === 0;
            }

        }

        function format(str, o) {
            return str.replace(
                /\{([^{}]*)\}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        }

        function TreeNode(text, id) {
            var _text = text;
            var _id = id;
            var _children = [];
            var _formatter = null;

            // ?
            this.addChild = function(node) {
                _children.push(node);
            };

            this.getId = function() {
                return _id;
            };

            this.getChildren = function() {
                return _children;
            };

            this.getLabel = function() {
                if(_formatter) {
                    return _formatter(_text);
                }
                return _text;
            };

            this.getRawLabel = function() {
                return _text;
            };

            this.hasChildren = function() {
                return _children.length > 0;
            };

            this.hasFormatter = function() {
                return !!_formatter;
            };

            this.getFormatter = function() {
                return _formatter;
            };

            this.setFormatter = function(formatter) {
                _formatter = formatter;
            };
        }



        function AuraInspectorTreeView() {
            var _children = [];
            var _childrenIndex = new Map();
            var events = new Map();
            var htmlToTreeNode = new WeakMap();

            this.addChild = function(child) {
                _children.push(child);
            };

            this.addChildren = function(children) {
                _children = _children.concat(children);
            };

            this.getChildren = function () {
                return _children;
            };

            this.render = function(div) {
                var container = document.createElement("ul");
                    container.className = "tree-view";

                for(var c=0;c<_children.length;c++) {
                    container.appendChild(renderNode(_children[c]));
                }

                if(div) {
                   div.appendChild(container);
                }

                // Events
                container.addEventListener("mouseover", Container_MouseOver.bind(this));

                return container;
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

            /* Event Handlers */
            function Container_MouseOver(event) {
                // LI?
                var target = event.target;
                while(target && target.parentNode && target.tagName != "LI" && target.tagName != "UL") {
                    target = target.parentNode;
                }
                // We hovered a list item
                if(target && target.tagName == "LI") {
                    // var previous = event.currentTarget.getElementsByClassName("tree-view-hover");
                    // for(var c=previous.length-1;c>=0;c--) {
                    //     previous[c].classList.remove("tree-view-hover");
                    // }

                    this.notify("onhover", { domNode: target, treeNode: htmlToTreeNode.get(target) });
                    //target.classList.add("tree-view-hover");
                }
            }

            /* Private Methods */
            function renderNode(node) {
                var span = document.createElement("span");
                var li = document.createElement("li");
                    li.appendChild(span);

                if(node.getId() && _childrenIndex.has(node.getId())) {
                    // Circular Reference
                    var label = node.getLabel() + " [[ReferenceTo]]";
                    if(node.hasFormatter()) {
                        span.innerHTML = label;
                    } else {
                        span.appendChild(document.createTextNode(label));
                    }
                } else {
                    if(node.hasFormatter()) {
                        span.innerHTML = node.getLabel();
                    } else {
                        span.appendChild(document.createTextNode(node.getLabel()));
                    }
                    _childrenIndex.set(node.getId(), node);

                    if(node.hasChildren()) {
                        // Add Expand box
                        var ul = document.createElement("ul");

                        var children = node.getChildren();
                        for(var c=0;c<children.length;c++) {
                            ul.appendChild(renderNode(children[c]));
                        }

                        li.appendChild(ul);
                    }

                }

                htmlToTreeNode.set(li, node);
                return li;
            }
        }
    }

    /* Listens for events and shows them in the event log */
    function AuraInspectorEventLog(devtoolsPanel) {
        var ol;
        this.init = function() {
            ol = document.getElementById("event-log");

            // Start listening for events to draw
            devtoolsPanel.attach("onevent", DevToolsPanel_OnEvent.bind(this));
        };

        this.addLogItem = function(message) {
            if(!message) { return; }
            var date = new Date();

            // <span class="event-log-timestamp">{hour}:{minute}</span> {message}
            var span = document.createElement("span");
                span.className = "event-log-timestamp";
                //span.innerHTML = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                span.innerHTML = date.toLocaleTimeString({}, { hour12: false});

            var li = document.createElement("li");
                li.appendChild(span);
                li.appendChild(document.createTextNode(message));
            ol.appendChild(li);
        };

        function DevToolsPanel_OnEvent(event) {
            var message = event.data && event.data.message || event.data;
            if(message) {
                this.addLogItem(message);
            }
        }
    }


    function AuraInspectorDevtoolsPanel() {
        var EXTENSIONID = "mhfgenmncdnmcoonglmkepfdnjjjcpla";
        var runtime = null;
        var actions = new Map();
        // For Drawing the Tree, eventually to be moved into it's own component
        var nodeId = 0; 
        var events = new Map();
        var panels = new Map();
        var _name = "AuraInspectorDevtoolsPanel" + Date.now() 

        this.connect = function(){
            if(runtime) { return; }
            var tabId = chrome.devtools.inspectedWindow.tabId;

            runtime = chrome.runtime.connect(EXTENSIONID, {"name": _name });
            runtime.onMessage.addListener(DevToolsPanel_OnMessage.bind(this));

            // This should work too
            var events = [
                "AuraInspector.DevToolsPanel.PublishComponentTree", 
                "AuraInspector.DevToolsPanel.OnEvent"
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

            actions.set("AuraInspector.DevToolsPanel.PublishComponentTree", new PublishComponentTree(this));
            actions.set("AuraInspector.DevToolsPanel.HighlightElement", new HighlightElement(this));
            actions.set("AuraInspector.DevToolsPanel.GetComponentTree", new GetComponentTree(this));
            actions.set("AuraInspector.DevToolsPanel.OnEvent", new GeneralNotify(this, "onevent"));

            //-- Attach Event Listeners
            var header = document.querySelector("header.header-actions");
            header.addEventListener("click", HeaderActions_OnClick.bind(this));

            // Initialize Panels
            var eventLog = new AuraInspectorEventLog(this);
            this.addPanel("event-log", eventLog);

            var tree = new AuraInspectorComponentTree(this);
            this.addPanel("component-tree", tree);
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

        this.addPanel = function(key, component) {
            if(!panels.has(key)) {
                component.init();
                panels.set(key, component);
            }
        };

        /*
         * Which panel to show to the user in the dev tools.
         * Currently: Component Tree (component-tree), and Event Log (event-log)
         */
        this.showPanel = function(key) {
            if(!key) { return; }
            var buttons = document.querySelectorAll("header.header-actions button");
            var sections = document.querySelectorAll("section.action-section");
            var buttonKey = key.indexOf("header-action-")==0?key:"header-action-"+key;

            for(var c=0;c<buttons.length;c++){ 
                if(buttons[c].id===buttonKey) {
                    buttons[c].classList.add("selected");
                    sections[c].classList.add("selected");
                } else {
                    buttons[c].classList.remove("selected");
                    sections[c].classList.remove("selected");
                }
            }

        };

        /* Panel Specific stuff */
        this.highlightElement = function(globalId) {
            //actions.get("AuraInspector.DevToolsPanel.HighlightElements").run(globalId);
            //runtime.postMessage({action : "highlightElement", params : globalId});
            chrome.devtools.inspectedWindow.eval("AuraInspector.ContentScript.highlightElement('" + globalId + "')", { useContentScriptContext: true} );
        };

        this.addLogMessage = function(msg) {
            panels.get("event-log").addLogItem(msg);
        };
        
        this.updateComponentTree = function(json) {
            if(json) {
                var tree = JSON.parse(json);
                
                // RESOLVE REFERENCES
                tree = ResolveJSONReferences(tree);

                panels.get("component-tree").render(tree);
                panels.get("event-log").addLogItem("Component Tree Updated");

                //this.addLogMessage("Component Tree Updated: " + new Date());
            } else {
                chrome.devtools.inspectedWindow.eval("AuraInspector.ContentScript.updateComponentTree()", { useContentScriptContext: true} );
            }
        };


        /* Event Handlers */
        function HeaderActions_OnClick(event){
            var target = event.target;
            if(target.id.indexOf("header-action") !== 0) { return; }
            this.showPanel(target.id);
        }

        /* PRIVATE */
        function DevToolsPanel_OnMessage(message) {
            //alert(JSON.stringify(message));
            var action = actions.get(message.action);
            if(!action) {
                alert("No action with the id: ", message.action);
                return;
            }
            action.run(message.params);
        }



        function ResolveJSONReferences(object) {
            if(!object) { return object; }
            
            var serializationMap = new Map();

            function resolve(current) {
                if(!current) { return current; }
                if(typeof current === "object") {
                    if(current.hasOwnProperty("$serRefId")) { 
                        return serializationMap.get(current["$serRefId"]);
                    }

                    if(current.hasOwnProperty("$serId")) {
                        serializationMap.set(current["$serId"], current);
                        delete current["$serId"];
                    }

                    for(var property in current) {
                        if(current.hasOwnProperty(property)) {
                            current[property] = resolve(current[property]);
                        }
                    }
                }
                return current;
            }

            return resolve(object);
        }


        function isObject(obj){
            return !!obj && Object.prototype.toString.apply(obj) === '[object Object]';
        }

        function isString(obj){
            return typeof obj === 'string';
        }


        /* Actions */
        function PublishComponentTree(service){

            this.run = function(params) {
                // Uncomment to see how many times this is called. 
                // it's to much, should only be done once
                //alert("PublishComponentTree");
                service.updateComponentTree(params);
            };
        }

        function HighlightElement(service){

            this.run = function(globalId) {
                //AuraInspectorDevtoolsPanel.port.postMessage({action : "highlightElements", params : globalId});
                service.highlightElement(globalId);
            };
        }

        function GetComponentTree(service){

            this.run = function() {
                // Initiates a request to the content script to request the new component tree.
                // This gets returned and the PublishComponentTree action handles the return value
                service.updateComponentTree();
                //AuraInspectorDevtoolsPanel.port.postMessage({action : "requestComponentTree"});
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




    function format(str, o) {
        return str.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    }

})(this);


// var AuraInspectorDevtoolsPanel = {
//     port : null,

//     connect : function(){
//         this.port = chrome.runtime.connect("mhfgenmncdnmcoonglmkepfdnjjjcpla", {name : "AuraInspectorDevtoolsPanel"});
//         this.port.onMessage.addListener(this.handleMessage.bind(this));
//         // Listen for these types of messages
//         this.port.postMessage({subscribe : ["AuraInspector.DevToolsPanel.PublishComponentTree"], port: this.port.name});
//     },

//     disconnect : function(port) {
//         // doh! what should we do?
//         global.AuraInspector.ContentScript.disconnect();
//         global.AuraInspector.ContentScript.init();

//         // Used to do this
//         //AuraInspectorContentScript.port = null;
//         //setTimeout(AuraInspectorContentScript.init, 1500);
//     },
    
//     handleMessage : function(message){
//         this.actions[message.action](message.params);
//     },
    
//     actions : {
//         getComponentTree : function(){
//             AuraInspectorDevtoolsPanel.port.postMessage({action : "requestComponentTree"});
//         },

//         "AuraInspector.DevToolsPanel.PublishComponentTree" : function(params){
//             var treeElement = document.getElementById("tree");
//             treeElement.innerHTML = "";
//             var tree = JSON.parse(params);
//             // RESOLVE REFERENCES

//             treeElement.appendChild(AuraInspectorDevtoolsPanel.createFolder({value:tree, expanded : true}));
//             //document.body.innerHTML = "tree : " + tree.toString();
//         },

//         highlightElements : function(globalId){
//             AuraInspectorDevtoolsPanel.port.postMessage({action : "highlightElements", params : globalId});
//         }
//     },

//     isObject : function(obj){
//         return !!obj && Object.prototype.toString.apply(obj) === '[object Object]';
//     },

//     isString : function(obj){
//         return typeof obj === 'string';
//     },

//     // Kris: Huh?
//     nodeId : 0,

//     createFolder : function(config){
//         config = config || {};
//         var root = document.createElement("li");

//         root.onmouseout = function(){
//             AuraInspectorDevtoolsPanel.actions.highlightElements();
//         };
        

//         var value = config.value;
//         var text = config.label || "" ;
//         if(text.indexOf ("_") === 0){
//             text = text.substring(1);
//         }

//         text = '<span class="label">'+text+'</span>';

//         var hasBody = false;
//         if(Array.isArray(value)){
//             text = text + " ["+value.length+"]";

//             if(value.length == 0){
//                 hasBody = false;
//                 value = undefined;
//             }else{
//                 hasBody = true;
//             }
//         }else if (AuraInspectorDevtoolsPanel.isObject(value)){
//             hasBody = true;

//             if(value._descriptor){
//                 if(text && text.length > 0){
//                     text = text + " : "
//                 }
//                 text += value._descriptor;
//             }
//         }

//         if(hasBody){
//             var label = document.createElement("label");
//             label.for = "folder"+(AuraInspectorDevtoolsPanel.nodeId++);

//             if(config.value && config.value.globalId){

//                 var globalId = config.value.globalId;
//                 label.onmouseover = function(){
//                     AuraInspectorDevtoolsPanel.actions.highlightElements(globalId);
//                 };
//             }

        
//             label.innerHTML = text;
//             root.appendChild(label);

//             var checkbox = document.createElement("input");
//             checkbox.type = "checkbox";
//             checkbox.id = label.for;


//             if(config.expanded){
//                 checkbox.checked = "checked";
//             }
//             if(config.disabled){
//                 checkbox.disabled = "disabled";
//             }
//             root.appendChild(checkbox);

//             var contents = document.createElement("ol");

//             function createContents(){
//                 if(AuraInspectorDevtoolsPanel.isObject(value)){
//                     for(var key in value){
//                         contents.appendChild(AuraInspectorDevtoolsPanel.createFolder({label : key, value : value[key]}));
//                     }
//                 }else if(Array.isArray(value)){
//                     for(var i=0;i<value.length;i++){
//                         contents.appendChild(AuraInspectorDevtoolsPanel.createFolder({label : "["+i+"]" , value : value[i]}));
//                     }
//                 }
//             }

//             if(!config.expanded){
//                 checkbox.onchange = function(){
//                     if(this.checked && !this.done){
//                         this.done = true;
//                         createContents();
//                         delete this.onchange;
//                     }
//                 }
//             }else{
//                 createContents();
//             }
//             root.appendChild(contents);
//         }else{
//             if(value !== undefined){
//                 text += " : ";
//                 if(AuraInspectorDevtoolsPanel.isString(value)){
//                         text += '"';
//                 }
//                 text += value;
//                 if(AuraInspectorDevtoolsPanel.isString(value)){
//                         text += '"';
//                 }
//             }
//             root.innerHTML = text;
//         }

//         return root;
//     }
// };



        // function createFolder(config, service){
        //     config = config || {};
        //     var root = document.createElement("li");

        //     root.onmouseout = function(){
        //         //AuraInspectorDevtoolsPanel.actions.highlightElements();
        //         service.highlightElement();
        //     };
            
        //     var value = config.value;
        //     var text = config.label || "" ;
        //     if(text.indexOf ("_") === 0){
        //         text = text.substring(1);
        //     }

        //     text = '<span class="label">'+text+'</span>';

        //     var hasBody = false;
        //     if(Array.isArray(value)){
        //         text = text + " ["+value.length+"]";

        //         if(value.length == 0){
        //             hasBody = false;
        //             value = undefined;
        //         }else{
        //             hasBody = true;
        //         }
        //     }else if (isObject(value)){
        //         hasBody = true;

        //         if(value._descriptor){
        //             if(text && text.length > 0){
        //                 text = text + " : "
        //             }
        //             text += value._descriptor;
        //         }
        //     }

        //     if(hasBody){
        //         var label = document.createElement("label");
        //         label.for = "folder"+(nodeId++);

        //         if(config.value && config.value.globalId){

        //             var globalId = config.value.globalId;
        //             label.onmouseover = function(){
        //                 service.highlightElement(globalId);
        //             };
        //         }

            
        //         label.innerHTML = text;
        //         root.appendChild(label);

        //         var checkbox = document.createElement("input");
        //         checkbox.type = "checkbox";
        //         checkbox.id = label.for;


        //         if(config.expanded){
        //             checkbox.checked = "checked";
        //         }
        //         if(config.disabled){
        //             checkbox.disabled = "disabled";
        //         }
        //         root.appendChild(checkbox);

        //         var contents = document.createElement("ol");

        //         function createContents(){
        //             if(isObject(value)){
        //                 for(var key in value){
        //                     contents.appendChild(createFolder({label : key, value : value[key]}, service));
        //                 }
        //             }else if(Array.isArray(value)){
        //                 for(var i=0;i<value.length;i++){
        //                     contents.appendChild(createFolder({label : "["+i+"]" , value : value[i]}, service));
        //                 }
        //             }
        //         }

        //         if(!config.expanded){
        //             checkbox.onchange = function(){
        //                 if(this.checked && !this.done){
        //                     this.done = true;
        //                     createContents();
        //                     delete this.onchange;
        //                 }
        //             }
        //         }else{
        //             createContents();
        //         }
        //         root.appendChild(contents);
        //     }else{
        //         if(value !== undefined){
        //             text += " : ";
        //             if(isString(value)){
        //                     text += '"';
        //             }
        //             text += value;
        //             if(isString(value)){
        //                     text += '"';
        //             }
        //         }
        //         root.innerHTML = text;
        //     }

        //     return root;
        // }

// AuraInspectorDevtoolsPanel.connect();
// window.refresh = function(){
//     AuraInspectorDevtoolsPanel.actions.getComponentTree();
// };

// window.refresh();
