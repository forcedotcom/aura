// Move component tree drawing into here.
function AuraInspectorComponentTree(devtoolsPanel) {
    var treeElement;
    var treeComponent;
    var _items = {};
    var isDirty = false;
    var initial = true;

    var markup = `
        <menu type="toolbar">
            <li><button id="refresh-button"><span>Refresh</span></button></li>
            <li><input type="checkbox" id="showglobalids-checkbox"> Show Global IDs</li>
        </menu>
        <div class="component-tree" id="tree"></div>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        treeComponent = new AuraInspectorTreeView();
        treeComponent.attach("onhoverout", TreeComponent_OnHoverOut.bind(this));
        treeComponent.attach("onhover", TreeComponent_OnHover.bind(this));
        treeComponent.attach("onselect", TreeComponent_OnSelect.bind(this));
        treeComponent.attach("ondblselect", TreeComponent_OnDblSelect.bind(this));
       
        treeElement = tabBody.querySelector("#tree");

        var refreshButton = tabBody.querySelector("#refresh-button");
            refreshButton.addEventListener("click", RefreshButton_OnClick.bind(this));

        var showglobalidsCheckbox = tabBody.querySelector("#showglobalids-checkbox");
            showglobalidsCheckbox.addEventListener("change", ShowGlobalIdsCheckBox_Change.bind(this));

        AuraInspectorOptions.getAll({ "showGlobalIds": false }, function(options){
            tabBody.querySelector("#showglobalids-checkbox").checked = options.showGlobalIds;
        });
    };

    this.setData = function(items) {
        if(items != _items || JSON.stringify(items) != JSON.stringify(_items)) {
            isDirty = true;
            _items = items;
            this.render();
        }
    };

    this.render = function() {
        if(initial) {
            initial = false;
            return devtoolsPanel.updateComponentTree();
        }

        if(!isDirty) {
            return;
        }

        var treeNodes;

        try {
            treeNodes = generateTreeNodes(_items);
        } catch(e) {
            alert([e.message, e.stack]);
        }

        treeComponent.clearChildren();
        treeComponent.addChildren(treeNodes);
        treeComponent.render(treeElement, { "collapsable" : true });
        isDirty = false;
    };

    function RefreshButton_OnClick(event) {
        devtoolsPanel.updateComponentTree();
    }

    function ShowGlobalIdsCheckBox_Change(event) {
        var showGlobalIds = event.srcElement.checked;
        AuraInspectorOptions.set("showGlobalIds", showGlobalIds, function(options) {
            devtoolsPanel.updateComponentTree(); 
        });
    }

    function TreeComponent_OnHoverOut(event) {
        devtoolsPanel.removeHighlightElement();
    }

    function TreeComponent_OnHover(event) {
        if(event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var globalId = treeNode && treeNode.getRawLabel().globalId;
            
            if(globalId) {
                devtoolsPanel.highlightElement(globalId);
            }
        }
    }

    function TreeComponent_OnSelect(event) {
        if(event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var globalId = treeNode && treeNode.getRawLabel().globalId;
            
            if(globalId) {
                devtoolsPanel.updateComponentView(globalId);
                devtoolsPanel.showSidebar();
            }
        }
    }

    function TreeComponent_OnDblSelect(event) {
        if(event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var globalId = treeNode && treeNode.getRawLabel().globalId;
            
            if(globalId) {
                var command = "$auraTemp = $A.getCmp('" + globalId + "'); console.log('$auraTemp = ', $auraTemp);";
                chrome.devtools.inspectedWindow.eval(command);
            }
        }
    }

    function generateTreeNodes(structure) {
        var allnodes = new Set();
        var root = new TreeNode();

        // Generates the whole tree
        generateTreeNodeForConcreteComponent(structure, root);
        
        return root.getChildren();

        function generateTreeNodeForConcreteComponent(component, parent) {
            if(!component || !component.descriptor) { return; }

            var attributes = {
                descriptor: component.descriptor,
                globalId: component.globalId || "",
                attributes: {}
            };

            if(component.localId) {
                attributes.attributes["aura:id"] = component.localId;
            }
            
            var body = [];
            if(component.attributes) {
                for(var property in component.attributes) {
                    if(!component.attributes.hasOwnProperty(property)) { continue; }

                    if(property === "body") {
                        body = getBody(component);
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

            var node = TreeNode.parse(attributes);

            if(!allnodes.has(component.globalId)) {
                allnodes.add(component.globalId);
                
                for(var c=0;c<body.length;c++) {
                    generateTreeNodeForConcreteComponent(body[c], node);
                }
            }
            
            parent.addChild(node);
        }

        function getBody(component) {
            if(!component) { return []; }

            var ids = [];
            var current = component;
            do {
                if(current.globalId) {
                    ids.unshift(current.globalId);
                }
            } while(current = current.super);

            return composeComponentBodies(ids, component);
        }

        function composeComponentBodies(hierarchy, cmp) {
            if(!hierarchy.length) { return; }
            var bodies;
            var collection = [];
            if(isExpression(cmp)) {
                bodies = cmp.attributeValueProvider.attributes && cmp.attributeValueProvider.attributes.body || {};
            } else {
                bodies = cmp.attributes && cmp.attributes.body || {};
            }

            var currentGlobalId = hierarchy.shift();
            var currentBody = bodies[currentGlobalId] || [];
            for(var c=0;c<currentBody.length;c++) {
                if(isExpression(currentBody[c]) && currentBody[c].expressions.value === "{!v.body}") {
                    // Get the body from the valueProvider
                    if(cmp !== currentBody[c].attributeValueProvider) {
                        var expressionBodies = composeComponentBodies([currentBody[c].attributeValueProvider.globalId], currentBody[c].attributeValueProvider);
                        collection = collection.concat(expressionBodies);
                    }
                    // Must reference the Attribute Value provider for it's v.body
                    collection = collection.concat(composeComponentBodies(hierarchy, currentBody[c]));
                } else {
                    collection.push(currentBody[c]);       
                }
            }
            return collection;
        }

        function isExpression(cmp) {
            return cmp && cmp.descriptor === "markup://aura:expression";
        }

    }
}