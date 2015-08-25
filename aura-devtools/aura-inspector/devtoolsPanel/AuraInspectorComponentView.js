function AuraInspectorComponentView(devtoolsPanel) {
    var container;
    var propertyMap = {
        "globalId": "Global ID",
        "rendered": "IsRendered",
        "valid": "IsValid",
        "localId": "aura:id",
        "descriptor": "Descriptor",
        "elementCount": "HTML Elements"
    }
    var treeComponent;
    var _items = {};
    var _isDirty = false;

    this.init = function(tabBody){
        container = document.createElement("DIV");
        container.className="component-view";
        container.id="component-view";
        tabBody.appendChild(container);

        tabBody.classList.add("sidebar");

        treeComponent = new AuraInspectorTreeView();
        treeComponent.attach("ondblselect", TreeComponent_OnDblSelect.bind(this));
    };

    this.setData = function(items) {
        if(items != _items || JSON.stringify(items) != JSON.stringify(_items)) {
            _isDirty = true;
            _items = items;
            this.render();
        }
    };

    this.render = function(){
        try {
            var c = 0;
            container.innerHTML = "";
            treeComponent.clearChildren();

            var current = _items;
            var bodies = current.attributes && current.attributes.body || {};
            var attributeValueProvider;
            var attributeNodesContainer;

            if(!current.attributes) {
                current.attributes = {};
            }


            while(current) {
                // Add Header for Super Levels
                if(current != _items) {
                    treeComponent.addChild(TreeNode.create("[[Super]]", "Super" + c++, "header"));
                }

                treeComponent.addChildren(generateGeneralNodes(current));

                // Should probably use a FacetFormatter, but how do I easily specify that info to TreeNode.create()
                // that is compatible with every other TreeNode.create() call.
                attributeValueProvider = TreeNode.create("Attribute Value Provider", "attributeValueProvider");
                treeComponent.addChild(attributeValueProvider);

                attributeValueProvider.addChild(TreeNode.parse(current.attributeValueProvider));

                // Do attributes only at the concrete level
                if(current === _items) {
                    treeComponent.addChild(TreeNode.create("Attributes", "Attributes", "header"));

                    current.attributes.body = bodies[current.globalId] || [];
                    attributeNodesContainer = TreeNode.create();
                    generateNodes(current.attributes, attributeNodesContainer);
                    treeComponent.addChildren(attributeNodesContainer.getChildren());
                } else {
                    // We still want to inspect the body at the super levels,
                    // since they get composted together and output.
                    var body = bodies[current.globalId] || [];
                    attributeNodesContainer = TreeNode.create({ key: "body", value: body }, "", "keyvalue");
                    generateNodes(body, attributeNodesContainer);
                    treeComponent.addChild(attributeNodesContainer);
                }
                
                current = current.super;
            }

            treeComponent.render(container);
        } catch(e) {
            alert([e.message, e.stack]);
        }
    };


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
    

    function generateNodes(json, parentNode) {
        var node;

        for(var prop in json) {
            if(json.hasOwnProperty(prop)) {
                if(typeof json[prop] === "object") {
                    if(prop === "body") {
                        node = TreeNode.create({key: "body", value: json[prop]}, "", "keyvalue");
                        var body = json[prop];
                        for(var c=0;c<body.length;c++) {
                            node.addChild(TreeNode.parse(body[c]));
                        }
                    
                    } else if(json[prop] && ('descriptor' in json[prop] || 'componentDef' in json[prop])) {
                        node = TreeNode.parse(json[prop]);
                    } else {
                        node = TreeNode.create({ key:prop, value: json[prop] }, parentNode.getId() + "_" + prop, "keyvalue");
                        generateNodes(json[prop], node);
                    }
                } else {
                    node = TreeNode.create({key: prop, value: json[prop]}, parentNode.getId() + "_" + prop, "keyvalue");
                }
                
                parentNode.addChild(node);
            }
        }
        return parentNode;
    }

    function generateGeneralNodes(json) {
        var nodes = [];
        for(var prop in json) {
            if(propertyMap.hasOwnProperty(prop)) {
                nodes.push(TreeNode.create({key: propertyMap[prop], value: json[prop] }, prop, "keyvalue"));
            }
        }

        return nodes;
    }
}