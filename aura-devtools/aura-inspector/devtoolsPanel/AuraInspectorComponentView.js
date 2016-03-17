function AuraInspectorComponentView(devtoolsPanel) {
    var container;
    // Generic properties to show for the concrete component
    var concretePropertyMap = {
        "globalId": chrome.i18n.getMessage("componentview_globalid"),
        "rendered": chrome.i18n.getMessage("componentview_isrendered"),
        "valid": chrome.i18n.getMessage("componentview_isvalid"),
        "localId": "aura:id",
        "descriptor": chrome.i18n.getMessage("componentview_descriptor"),
        "elementCount": chrome.i18n.getMessage("componentview_elements"),
        "rerender_count": chrome.i18n.getMessage("componentview_rerendered")
    };
    // When we render the super, show these properties instead of the ones above.
    var superPropertyMap = {
        "globalId": chrome.i18n.getMessage("componentview_globalid"),
        "localId": "aura:id",
        "descriptor": chrome.i18n.getMessage("componentview_descriptor")
    };
    var treeComponent;
    var _componentId = null;
    var _isDirty = false;

    this.init = function(tabBody){
        container = document.createElement("DIV");
        container.className="component-view";
        container.id="component-view";
        tabBody.appendChild(container);

        tabBody.classList.add("sidebar");

        treeComponent = new AuraInspectorTreeView(container);
    };

    this.setData = function(globalId) {
        _isDirty = true;
        _componentId = globalId;
        this.render();
    };

    this.render = function(){
        if(_isDirty && _componentId) {
            container.innerHTML = "";
            treeComponent.clearChildren();

            devtoolsPanel.getComponent(_componentId, function(component) {
                renderForComponent(component);
                renderForComponentSuper(component, function(){
                    treeComponent.render();              
                });
            }, {
                elementCount: true,
                model: true
            });
        }
    };

    function renderForComponent(current) {

        var componentId;
        var parentNode;

        treeComponent.addChildren(generateGeneralNodes(current));

        // Should probably use a FacetFormatter, but how do I easily specify that info to TreeNode.create()
        // that is compatible with every other TreeNode.create() call.
        if(current.attributeValueProvider == current.facetValueProvider) {
            var attributeValueProvider = TreeNode.create(chrome.i18n.getMessage("componentview_avpfvp"), "attributeValueProvider");
            treeComponent.addChild(attributeValueProvider);

            componentId = devtoolsPanel.cleanId(typeof current.attributeValueProvider == "string" ? current.attributeValueProvider : current.attributeValueProvider.globalId);
            
            attributeValueProvider.addChild(TreeNode.create(componentId, "attributeValueProvider_" + current.globalId, "globalId"));
        } else {
            var attributeValueProvider = TreeNode.create(chrome.i18n.getMessage("componentview_avp"), "attributeValueProvider");
            treeComponent.addChild(attributeValueProvider);

            componentId = devtoolsPanel.cleanId(typeof current.attributeValueProvider == "string" ? current.attributeValueProvider : current.attributeValueProvider.globalId);
            attributeValueProvider.addChild(TreeNode.create(componentId, "attributeValueProvider_" + current.globalId, "globalId"));

            var facetValueProvider = TreeNode.create(chrome.i18n.getMessage("componentview_fvp"), "facetValueProvider");
            treeComponent.addChild(facetValueProvider);

            componentId = devtoolsPanel.cleanId(typeof current.facetValueProvider == "string" ? current.facetValueProvider : current.facetValueProvider.globalId);
            facetValueProvider.addChild(TreeNode.create(componentId, "facetValueProvider_" + current.globalId, "globalId"));
        }

        var bodies = current.attributes.body || {};
        // Do attributes only at the concrete level
        if(current.isConcrete) {
            treeComponent.addChild(TreeNode.create(chrome.i18n.getMessage("componentview_attributes"), "Attributes", "header"));

            current.attributes.body = bodies[current.globalId] || [];
            parentNode = TreeNode.create();
            generateAttributeNodes(current, parentNode);
            treeComponent.addChildren(parentNode.getChildren());
        } else {
            treeComponent.addChild(TreeNode.create(chrome.i18n.getMessage("componentview_attributes"), "Attributes", "header"));
            // We still want to inspect the body at the super levels,
            // since they get composted together and output.
            var body = bodies[current.globalId] || [];
            parentNode = TreeNode.create({ key: "body", value: body }, "", "keyvalue");
            generateNodes(body, parentNode);
            treeComponent.addChild(parentNode);
        }

        if(current.model) {
            treeComponent.addChild(TreeNode.create(chrome.i18n.getMessage("componentview_model"), "Model", "header"));
            parentNode = TreeNode.create();
            generateNodes(current.model, parentNode);
            treeComponent.addChildren(parentNode.getChildren());
        }
    }

    function renderForComponentSuper(component, callback) {
        if(component.supers && component.supers.length) {
            devtoolsPanel.getComponent(component.supers[0], function(superComponent) {
                treeComponent.addChild(TreeNode.create("[[" + chrome.i18n.getMessage("componentview_super") + "]]", "Super" + superComponent.globalId, "header"));
                renderForComponent(superComponent);
                renderForComponentSuper(superComponent, function() {
                    if(callback) { 
                        callback();
                    }
                });
            }, {
                attributes: false,
                body: true,
                elementCount: false,
                model: true
            });
        } else if(callback) { 
            callback();
        }     
    }

    function generateAttributeNodes(component, parentNode) {
        var node;
        var value;
        var attributes = component.attributes;
        var expressions = component.expressions;
        for(var prop in attributes) {
            value = attributes[prop];
            if(expressions.hasOwnProperty(prop)) {
                node = TreeNode.create({key: prop, value: expressions[prop]}, "", "keyvalue");
                if(typeof value === "object") {
                    generateNodes(attributes[prop], node);
                } else if(devtoolsPanel.isComponentId(value)) {
                    node.addChild(TreeNode.create(devtoolsPanel.cleanId(value), parentNode.getId() + "_" + prop, "globalId"));
                } else if(devtoolsPanel.isActionId(value)) {
                    node.addChild(TreeNode.create(devtoolsPanel.cleanId(value), parentNode.getId() + "_" + prop, "controllerref"));                    
                } else {
                    node.addChild(TreeNode.create(value, parentNode.getId() + "_" + prop));
                }
                parentNode.addChild(node);
                continue;
            }
            if(attributes.hasOwnProperty(prop)) {
                if(typeof value === "object") {
                    if(prop === "body") {
                        node = TreeNode.create({key: "body", value: value}, "", "keyvalue");
                        for(var c=0;c<value.length;c++) {
                            node.addChild(TreeNode.parse(value[c]));
                        }
                    } else if(attributes[prop] && ('descriptor' in value || 'componentDef' in value)) {
                        node = TreeNode.parse(value);
                    } else {
                        node = TreeNode.create({ key:prop, value: value }, parentNode.getId() + "_" + prop, "keyvalue");
                        generateNodes(value, node);
                    }
                } else if(devtoolsPanel.isComponentId(value)) {
                    node = TreeNode.create(devtoolsPanel.cleanId(value), parentNode.getId() + "_" + prop, "globalId");
                } else {
                    node = TreeNode.create({key: prop, value: value}, parentNode.getId() + "_" + prop, "keyvalue");
                }
                
                parentNode.addChild(node);
            }
        }
        return parentNode;
    }

    function generateNodes(json, parentNode) {
        var node;
        var value;
        for(var prop in json) {
            if(json.hasOwnProperty(prop)) {
                value = json[prop];
                if(typeof value === "object") {
                    if(prop === "body") {
                        node = TreeNode.create({key: "body", value: value}, "", "keyvalue");
                        for(var c=0;c<value.length;c++) {
                            node.addChild(TreeNode.parse(value[c]));
                        }                    
                    } else if(json[prop] && ('descriptor' in value || 'componentDef' in value)) {
                        node = TreeNode.parse(value);
                    } else {
                        node = TreeNode.create({ key:prop, value: value }, parentNode.getId() + "_" + prop, "keyvalue");
                        generateNodes(value, node);
                    }
                } else if(devtoolsPanel.isComponentId(value)) {
                        node = TreeNode.create(devtoolsPanel.cleanId(value), parentNode.getId() + "_" + prop, "globalId");
                } else {
                    node = TreeNode.create({key: prop, value: value}, parentNode.getId() + "_" + prop, "keyvalue");
                }
                
                parentNode.addChild(node);
            }
        }
        return parentNode;
    }

    function generateGeneralNodes(json) {
        var propertyMap = json.isConcrete ? concretePropertyMap : superPropertyMap;
        var nodes = [];
        for(var prop in json) {
            if(propertyMap.hasOwnProperty(prop)) {
                nodes.push(TreeNode.create({key: propertyMap[prop], value: json[prop] }, prop, "keyvalue"));
            }
        }

        return nodes;
    }

}