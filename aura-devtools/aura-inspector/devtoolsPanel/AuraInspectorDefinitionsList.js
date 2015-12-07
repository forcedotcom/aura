/* Listens for events and shows them in the event log */
function AuraInspectorDefinitionsList(devtoolsPanel) {
    var list;
    var detail;
    var container;
    var initial = true;
    var _componentDescriptors = [];
    var _eventDescriptors = [];
    var _definitions = new Map();
    var _typeMap = new Map();
    var tree;


    var markup = [
        '<div class="tab-body-settings">',
        '    <button id="refresh-button"><span>Refresh</span></button>',
        '</div>'
    ].join("");

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        container = document.createElement("div");
        container.className = "definitions";
        tabBody.appendChild(container);

        list = document.createElement("div");
        list.className = list.id = "definitions-list";
        container.appendChild(list);

        detail = document.createElement("section");
        detail.className = detail.id = "definitions-detail";
        container.appendChild(detail);

        // Add Refresh Button
        var refresh = tabBody.querySelector("#refresh-button");
        refresh.addEventListener("click", RefreshButton_OnClick.bind(this));

        //list.addEventListener("click", DefinitionsList_OnClick.bind(this));

        tree = new AuraInspectorTreeView(list);
        tree.attach("onselect", DefinitionsList_OnClick.bind(this));
        tree.attach("ondblselect", DefinitionsList_OnDblClick.bind(this));
    };

    this.render = function() {
        devtoolsPanel.hideSidebar();

        if(!initial) { return; }
        initial = false;
        
        // Get the Data
        getAllDefinitions(function(data, exceptionInfo){
            if(exceptionInfo && exceptionInfo.isException) {
                devtoolsPanel.addErrorMessage(exceptionInfo.value);
                alert(exceptionInfo.value);
                return;
            }
            if(data) {
                data = JSON.parse(data);
                _componentDescriptors = data[0];
                _eventDescriptors = data[1];

                // Draw
                var nodes = generateTreeNodesForDescriptorList(_componentDescriptors, _eventDescriptors);
                tree.clearChildren();
                tree.addChildren(nodes);
                tree.render({ "collapsable" : true });
            }
        });
    };

    this.getDef = function(descriptor, callback) {
        getDefinition(descriptor, callback);
    };

    /* Event Handlers */
    function DefinitionsList_OnClick(event) {
        if(event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;

            var descriptor = treeNode.getId();
            if(descriptor) {
                drawDefinition(descriptor);
            }
        }
    }

    function DefinitionsList_OnDblClick(event) {
        if(event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;

            var descriptor = treeNode.getId();
            if(descriptor) {
                var command;
                if(isComponentDef(descriptor)) {
                    command = "$auraTemp = $A.componentService.getDef('" + descriptor + "'); console.log('$auraTemp = ', $auraTemp);";
                } else {
                    command = "$auraTemp = $A.eventService.getEventDef('" + descriptor + "'); console.log('$auraTemp = ', $auraTemp);";
                }
                chrome.devtools.inspectedWindow.eval(command);
            }
        }
    }

    function RefreshButton_OnClick(event) {
        initial = true;
        this.render();
        devtoolsPanel.addLogMessage("Refreshing Component and Event Definitions List");
    }

    /* Private Helpers */
    function getDefinition(descriptor, callback) {
        if(_definitions.has(descriptor)) {
            callback(_definitions.get(descriptor));
            return;
        }
        var command;

        if(isComponentDef(descriptor)) {
            command = "$A.util.json.encode($A.componentService.getDef('" + descriptor + "'));";
        } else if(isEventDef(descriptor)) {
            command = "$A.util.json.encode($A.eventService.getEventDef('" + descriptor + "'));";
        }

        chrome.devtools.inspectedWindow.eval(command, function(data, exceptionInfo){
            if(exceptionInfo && exceptionInfo.isException) {
                devtoolsPanel.addErrorMessage(exceptionInfo.value);
                alert(exceptionInfo.value);
                return;
            }

            if(data) {
                data = JSON.parse(data);
                _definitions.set(descriptor, data);
            }
            callback(data);
        });
    }

    function getAllDefinitions(callback) {
        var command = [
            "var descriptors = [",
            "    $A.componentService.getRegisteredComponentDescriptors(),",
            "    $A.eventService.getRegisteredEvents()",
            "];",
            "$A.util.json.encode(descriptors);"
        ].join("");
        
        chrome.devtools.inspectedWindow.eval(command, callback);
    }

    function drawDefinition(descriptor) {
        getDefinition(descriptor, function(definition) {
            if(isComponentDef(descriptor)) {
                drawComponentDefinition(descriptor, definition);
            } else {
                drawEventDefinition(descriptor, definition);
            }
        });
    }

    function drawEventDefinition(descriptor, definition) {
        var data = [];
        var current;
        // Probably not in DEV mode
        if(!definition || !definition.$attributeDefs$) { return; }

        var formattedDescriptor = formatDescriptor(descriptor);
        detail.innerHTML = `
            <header>
                <h1>${formattedDescriptor}</h1>
                <h3>${definition.type} Event</h3>
            </header>
            <section>
                <h2>Inheritance</h2>
                <div id="event-definition-inheritance" class="definition-inheritance"></div>
            </section>
            <section>
                <h2>Parameters</h2>
                <div id="event-definition-parameters"></div>
            </section>
        `;

        var attributes = definition.$attributeDefs$; // Map
        data = [];
        for(var attribute in attributes) {
            current = attributes[attribute];
            data.push([attribute, current.type, current["default"]||"" ])
        }

        var parametersParent = document.getElementById("event-definition-parameters");
        parametersParent.appendChild(generateTable(["Parameter Name", "Type", "Default Value"], data));

        data = [];
        current = definition;
        do {
            data.push("<ul><li>" + formatDescriptor(current.$descriptor$.$qualifiedName$));
        } while(current = current.$superDef$);
        // Add the proper amount of closing tags at the end.
        data.push(new Array(data.length+1).join("</li></ul>"))

        var inheritanceParent = document.getElementById("event-definition-inheritance");
        inheritanceParent.innerHTML = data.join("");
    }

    function drawComponentDefinition(descriptor, definition) {
        var data = [];
        var current;
        // Probably not in DEV mode
        if(!definition || !definition.$attributeDefs$) { return; }

        var formattedDescriptor = formatDescriptor(descriptor);
        detail.innerHTML = `
            <header>
                <h1>${formattedDescriptor}</h1>
            </header>
            <section>
                <h2>Inheritance</h2>
                <div id="component-definition-inheritance" class="definition-inheritance"></div>
            </section>
            <section>
                <h2>Implements</h2>
                <div id="component-definition-interfaces"></div>
            </section>
            <section>
                <h2>Attributes</h2>
                <div id="component-definition-attributes"></div>
            </section>
            <section>
                <h2>Actions</h2>
                <div id="component-definition-actions"></div>
            </section>
            <section>
                <h2>Helper</h2>
                <div id="component-definition-helper"></div>
            </section>
            <section>
                <h2>Event Handlers</h2>
                <div id="component-definition-eventhandlers"></div>
            </section>
            <section>
                <h2>Value Handlers</h2>
                <div id="component-definition-valuehandlers"></div>
            </section>

        `;

        // Attributes
        var attributes = definition.$attributeDefs$.$values$;
        data = [];
        for(var attribute in attributes) {
            current = attributes[attribute];
            data.push([attribute, current.required, current.$typeDefDescriptor$, current.defaultValue && JSON.stringify(current.defaultValue) || "" ])
        }
        var section = generateTable(["Attribute Name", "Required", "Type", "Default Value"], data);
        document.getElementById("component-definition-attributes").appendChild(section);

        // Inheritance
        data = [];
        current = definition;
        do {
            data.push("<ul><li>" + formatDescriptor(current.$descriptor$.$qualifiedName$));
        } while(current = current.$superDef$);
        // Add the proper amount of closing tags at the end.
        data.push(new Array(data.length+1).join("</li></ul>"))
        document.getElementById("component-definition-inheritance").innerHTML = data.join("");

        // Implements (interfaces)
        var interfaces = Object.keys(definition.$interfaces$ || {}); //Map
        if(interfaces.length) {
            var interfacesOutput = interfaces.map(formatDescriptor).join("</li><li>"); 
            var interfacesMarkup = `<ul><li>${interfacesOutput}</li></ul>`;
            var interfacesContainer = document.getElementById("component-definition-interfaces");
                interfacesContainer.innerHTML = interfacesMarkup;
        }

        // Actions
        var actions = definition.$controllerDef$ && definition.$controllerDef$.$actionDefs$ || {}; // Map
        data = [];
        for(var action in actions) {
            if(!actions.hasOwnProperty(action)) { continue; }
            current = actions[action];
            data.push([`{!c.${action}}`, current.$actionType$, current.$caboose$, current.background, Object.keys(current.$paramDefs$)])
        }
        var actionsTable = generateTable(["Action", "Type", "Is Caboose", "Is Background", "Parameters"], data);
        document.getElementById("component-definition-actions").appendChild(actionsTable);

        // Helper Methods
        var helpers = definition.$helperDef$ || {}; // Map
        data = [];
        for(var helper in helpers) {
            if(!helpers.hasOwnProperty(helper)) { continue; }
            data.push([helper, helpers[helper]])
        }
        var helperTable = generateTable(["Method", "Function"], data);
        document.getElementById("component-definition-helper").appendChild(helperTable);

        // Events
        var eventHandlers = definition.$appHandlerDefs$ || []; // Array
        data = [];
        for(var c=0;c<eventHandlers.length;c++) {
            data.push([eventHandlers[c].action, formatDescriptor(eventHandlers[c].eventDef.$descriptor$.$qualifiedName$)]);
        }
        var handlersTable = generateTable(["Action", "Event"], data);
        document.getElementById("component-definition-eventhandlers").appendChild(handlersTable);

        // Value Events
        var valueHandlers = definition.$valueHandlerDefs$ || [];
        data = [];
        for(var c=0;c<valueHandlers.length;c++) {
            data.push([valueHandlers[c].name, valueHandlers[c].action, valueHandlers[c].value]);
        }
        var valueHandlersTable = generateTable(["Type", "Action", "Value"], data);
        document.getElementById("component-definition-valuehandlers").appendChild(valueHandlersTable);


    }

    function generateTable(columns, data) {
        var fragment = document.createDocumentFragment();
        var columnLength = columns.length;

        var table = document.createElement("table");
        var thead = document.createElement("thead");
        var tbody = document.createElement("tbody");
        var tr = document.createElement("tr");

        var th;
        for(var c=0;c<columnLength;c++) {
            th = document.createElement("th");
            th.appendChild(document.createTextNode(columns[c]));
            tr.appendChild(th);
        }

        thead.appendChild(tr);

        var td;
        for(var c=0;c<data.length;c++) {
            tr = document.createElement("tr");
            for(var d=0;d<columnLength;d++) {
                td = document.createElement("td");
                td.innerHTML = data[c][d];
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        fragment.appendChild(table);

        return fragment;
    }

    function generateTreeNodesForDescriptorList(components, events) {
        var li;
        var a;
        var formattedDescriptor;

        components = components.sort(definitionSorter);
        events = events.sort(definitionSorter);

        var componentTreeNode = new TreeNode("Component Definitions [" + components.length + "]");
        var treeNode;
        for(var c=0,length=components.length;c<length;c++) {
            treeNode = TreeNode.create(components[c], components[c], "descriptor");
            componentTreeNode.addChild(treeNode);
            _typeMap.set(components[c], "component");
        }

        var eventTreeNode = new TreeNode("Event Definitions [" + events.length + "]");       
        for(var c=0,length=events.length;c<length;c++) {
            treeNode = TreeNode.create(events[c], events[c], "descriptor");
            eventTreeNode.addChild(treeNode);
            _typeMap.set(events[c], "event");
        }


        return [componentTreeNode, eventTreeNode];
    }

    function formatDescriptor(descriptor) {
        var replacer = /(?:markup:\/\/)*(\w+):(\w+)/;
        return descriptor.replace(replacer, '<span class="component-prefix">$1</span>:<span class="component-tagname">$2</span>');
    }


    function definitionSorter(a, b) { 
        if(a === b) { return 0; }
        return a > b ? 1 : -1; 
    }

    function isComponentDef(descriptor) {
        return _typeMap.get(descriptor) === "component";
    }

    function isEventDef(descriptor) {
        return _typeMap.get(descriptor) === "event";
    }
}