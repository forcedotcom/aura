// Move component tree drawing into here.
function AuraInspectorComponentTree(devtoolsPanel) {
    var treeElement;
    var treeComponent;
    var _items = {};
    var isDirty = false;

    this.init = function() {
        treeComponent = new AuraInspectorTreeView();
        treeComponent.attach("onhoverout", TreeComponent_OnHoverOut.bind(this));
        treeComponent.attach("onhover", TreeComponent_OnHover.bind(this));
        treeComponent.attach("onselect", TreeComponent_OnSelect.bind(this));
       
        treeElement = document.getElementById("tree");

        var refreshButton = document.getElementById("refresh-button");
            refreshButton.addEventListener("click", RefreshButton_OnClick.bind(this));

        var showglobalidsCheckbox = document.getElementById("showglobalids-checkbox");
            showglobalidsCheckbox.addEventListener("change", ShowGlobalIdsCheckBox_Change.bind(this));
    };

    this.setData = function(items) {
        if(items != _items || JSON.stringify(items) != JSON.stringify(_items)) {
            isDirty = true;
            _items = items;
            this.render();
        }
    };

    this.render = function() {
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
        treeComponent.render(treeElement);
    };

    function RefreshButton_OnClick(event) {
        devtoolsPanel.updateComponentTree();
    }

    function ShowGlobalIdsCheckBox_Change(event) {
        var showGlobalIds = event.srcElement.checked;
        AuraInspectorOptions.set("showGlobalIds", false, function(options) {
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

            var node = TreeNode.parse(attributes);

            if(!allnodes.has(component.globalId)) {
                allnodes.add(component.globalId);
                
                for(var c=0;c<body.length;c++) {
                    generateTreeNodeForConcreteComponent(body[c], node);
                }
            }
            
            parent.addChild(node);
        }

        function getBody(collection, component) {
            if(!component || !component.attributes || !component.attributes.body) { return; }
            var body = component.attributes.body;
            for(var c=0;c<body.length;c++){
                collection.push(body[c]);
            }

            // KRIS:
            // I'm not sure if this is actually right. 
            // We do a lot of composting in the framework, with this quick and dirty hack,
            // we might be circumventing a level of logic.
            if(component.super) {
                getBody(collection, component.super);
            }
            return collection;
        }

    }
}