// Move component tree drawing into here.
function AuraInspectorComponentTree(devtoolsPanel) {
    var treeElement;
    var treeComponent;
    var _items = {};
    var isDirty = false;
    var initial = true;
    var COMPONENT_CONTROL_CHAR = "\u263A"; // This value is a component Global Id
    var ESCAPE_CHAR = "\u2353"; // This value was escaped, unescape before using.

    var markup = `
        <menu type="toolbar">
            <li><button id="refresh-button"><span>Refresh</span></button></li>
            <li><button id="expandall-button"><span>Expand All</span></button></li>
            <li class="divider"></li>
            <li><input type="checkbox" id="showglobalids-checkbox"><label for="showglobalids-checkbox">Show Global IDs</label></li>
        </menu>
        <div class="component-tree" id="tree"></div>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;
        treeElement = tabBody.querySelector("#tree");

        treeComponent = new AuraInspectorTreeView(treeElement);
        treeComponent.attach("onhoverout", TreeComponent_OnHoverOut.bind(this));
        treeComponent.attach("onhover", TreeComponent_OnHover.bind(this));
        treeComponent.attach("onselect", TreeComponent_OnSelect.bind(this));
        treeComponent.attach("ondblselect", TreeComponent_OnDblSelect.bind(this));
       
        var refreshButton = tabBody.querySelector("#refresh-button");
            refreshButton.addEventListener("click", RefreshButton_OnClick.bind(this));

        var expandAllButton = tabBody.querySelector("#expandall-button");
            expandAllButton.addEventListener("click", ExpandAllButton_OnClick.bind(this));

        var showglobalidsCheckbox = tabBody.querySelector("#showglobalids-checkbox");
            showglobalidsCheckbox.addEventListener("change", ShowGlobalIdsCheckBox_Change.bind(this));

        AuraInspectorOptions.getAll({ "showGlobalIds": false }, function(options){
            tabBody.querySelector("#showglobalids-checkbox").checked = options.showGlobalIds;
        });


        devtoolsPanel.subscribe("AuraInspector:OnInspectElement", function(id) {
            treeComponent.selectById(id);
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
            return this.refresh();
        }

        if(!isDirty) {
            return;
        }

        try {
            generateTree(_items, new TreeNode(), function(treeNode){
                treeComponent.clearChildren();
                treeComponent.addChild(treeNode);
                treeComponent.render({ "collapsable" : true });
                isDirty = false;

                devtoolsPanel.hideLoading();
            });
        } catch(e) {
            alert([e.message, e.stack]);
        }

    };

    this.refresh = function() {
        devtoolsPanel.showLoading();
        devtoolsPanel.getRootComponent(function(component){
            this.setData(component);
        }.bind(this));
    };

    function RefreshButton_OnClick(event) {
        this.refresh();
    }

    function ExpandAllButton_OnClick(event) {
        treeComponent.expandAll();
    }

    function ShowGlobalIdsCheckBox_Change(event) {
        var showGlobalIds = event.srcElement.checked;
        AuraInspectorOptions.set("showGlobalIds", showGlobalIds, function(options) {
            this.refresh(); 
        }.bind(this));
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

    function generateTree(rootComponent, currentTreeNode, callback) {
        var allnodes = new Set();

        // Generates the whole tree
        generateTreeRecusively(rootComponent, currentTreeNode, callback);
        
        function generateTreeRecusively(component, treeNode, callback) {
            var globalId = component.globalId;
            if(allnodes.has(globalId)) { return callback(null); }

            var newTreeNode = createTreeNodeForComponent(component);
            treeNode.addChild(newTreeNode);
            allnodes.add(globalId);
        
            // Get Body ID's
            getBodyFromComponent(component, function(bodyComponents){
                var count = bodyComponents.length;
                var processed = 0;

                if(!count) {
                    return callback(newTreeNode);
                }

                for(var c=0;c<bodyComponents.length;c++) {
                    generateTreeRecusively(bodyComponents[c], newTreeNode, function(){
                        if(++processed === count) {
                            callback(newTreeNode);
                        }
                    });
                }
            });
        }

        function getBodyFromComponent(component, callback) {
            var body = component.attributes.body;
            var globalId = component.globalId;
            var returnValue = [];
            callback = callback || function(){}; // able to specify defaults in ES6?
            if(body) {
                var count;
                var processed = 0;
                var id;

                // Start body building at the base component level and work your way up to the concrete.
                var currentId = component.supers ? component.supers.reverse()[0] : component.globalId;
                var currentBody = body[currentId];

                getBodyFromIds(currentBody, function(bodyNodes){
                    callback(flattenArray(bodyNodes))
                });
            } else if(isExpression(component) && isFacetArray(component.attributes.value)) {
                
                // Is an expression and a facet.    
                getBodyFromIds(component.attributes.value, function(bodyNodes){
                    callback(flattenArray(bodyNodes));
                });
            
            } else  {
                callback(returnValue);
            }
        }

        function getBodyFromIds(ids, callback) {
            var bodies = [];
            var processed = 0;
            var count = ids && ids.length;
            
            if(!count) {
                return callback([]);
            }

            devtoolsPanel.getComponents(ids, function(components){
                for(var c=0;c<components.length;c++) {
                    bodies[c] = components[c];
                    if(++processed === count) {
                        callback(bodies);
                    }
                }
            });

        }

        function isFacetArray(array) {
            if(!Array.isArray(array)) { return false; }
            for(var c=0;c<array.length;c++) {
                if(!devtoolsPanel.isComponentId(array[c])) { return false; }
            }
            return true;
        }

        function flattenArray(array) {
            var returnValue = [];
            for(var c=0,length=array.length;c<length;c++) {
                if(Array.isArray(array[c])) {
                    returnValue = returnValue.concat(flattenArray(array[c]));
                } else {
                    returnValue.push(array[c]);
                }
            }
            return returnValue;
        }

        function isComponentId(id) {
            return id && id.startsWith(COMPONENT_CONTROL_CHAR);
        }

        function isExpression(cmp) {
            return cmp && cmp.descriptor === "markup://aura:expression";
        }

        function cleanComponentId(id) {
            return id && id.startsWith(COMPONENT_CONTROL_CHAR) ? id.substr(1) : id;
        }

        function createTreeNodeForComponent(component) {
            if(!component) { return null; }

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

                    if(property === "body") {}
                    else if(component.expressions && component.expressions.hasOwnProperty(property)) {
                        //attributes.attributes[property] = component.expressions[property];
                        attributes.attributes[property] = component.expressions[property];
                    }
                    else {
                        attributes.attributes[property] = component.attributes[property];
                    }
                }
            }

            if(isExpression(component)) {
                attributes.attributes.expression = component.expressions.value;
            }

            return TreeNode.parse(attributes);
        }
    
    }
}
