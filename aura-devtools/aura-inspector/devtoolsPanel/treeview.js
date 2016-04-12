function TreeNode(text, id) {
    var _children = [];
    var _formatter = null;

    // ?
    this.addChild = function(node) {
        if(Array.isArray(node)) {
            _children = _children.concat(node);
        } else {
            _children.push(node);
        }
    };

    this.getId = function() {
        return id;
    };

    this.getChildren = function() {
        return _children;
    };

    this.getLabel = function() {
        if(this.getFormatter()) {
            return this.getFormatter()(this.getRawLabel());
        }
        return this.getRawLabel();
    };

    this.getRawLabel = function() {
        return text;
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

    this.toString = function() {
        return JSON.stringify(text) + " [" + this.getLabel() + "]";
    }
}

(function(){

    var formatters = {
        ComponentDefFormatter: function(value){ 
            // Needs Improvement
            // Just not doing now, because component defs are messed in the head.
            var text_node = document.createTextNode("[[ComponentDef]]");
            var fragment = formatters.ComponentFormatter(value);
            fragment.insertBefore(text_node, fragment.firstElementChild);
            return fragment;
        },
        ComponentFormatter: function(value){
            value.tagName = value.tagName.split("://")[1] || value.tagName;

            var fragment = document.createDocumentFragment();

            var tagname = document.createElement("span");
            tagname.className = "component-tagname";
            tagname.appendChild(document.createTextNode("<" + value.tagName));

            fragment.appendChild(tagname);

            // var pattern = [
            //     '<span class="component-tagname">&lt;{tagName}</span>'
            // ];

            // I doubt this will work once I switch over to google settings, so...
            var defaultOptions = {showGlobalIds: false};
            AuraInspectorOptions.getAll(defaultOptions, function(options){
                if(options.showGlobalIds) {
                    //pattern.push(' <span class="component-attribute">globalId</span>="{globalId}"');
                    var globalid = document.createElement("span");
                    globalid.className = "component-attribute";
                    globalid.appendChild(document.createTextNode(" globalId"));

                    fragment.appendChild(globalid);
                    fragment.appendChild(document.createTextNode('="'));
                    fragment.appendChild(document.createTextNode(value.globalId));
                    fragment.appendChild(document.createTextNode('"'));
                }
            });

            if(value.attributes) {
                var current;
                var count_element;
                var attribute_element;
                for(var attr in value.attributes) {
                    if(attr != "body") {
                        current = value.attributes[attr];

                        attribute_element =  document.createElement("span");
                        attribute_element.className = "component-attribute";
                        attribute_element.appendChild(document.createTextNode(attr));

                        fragment.appendChild(document.createTextNode(" "));
                        fragment.appendChild(attribute_element);
                        fragment.appendChild(document.createTextNode('="'));

                        if(current && Array.isArray(current)) {

                            if(current.lenght) {
                                fragment.appendChild(document.createTextNode("["));
                                count_element = document.createElement("i");
                                count_element.className = "component-array-length";
                                count_element.appendChild(document.createTextNode(count.length));
                                fragment.appendChild(count_element);
                                fragment.appendChild(document.createTextNode("]"));
                            } else {
                                fragment.appendChild(document.createTextNode("[]"));
                            }

                        } else if(current && typeof current === "object") {
                            fragment.appendChild(document.createTextNode(Object.keys(current).length ? "{...}" : "{}"));
                        } else if(isFCV(current)) {
                            fragment.appendChild(document.createTextNode(formatFCV(current)));
                        } else {
                            fragment.appendChild(document.createTextNode(current+""));
                        }
                        fragment.appendChild(document.createTextNode('"'));
                    }
                }   
            }

            fragment.appendChild(document.createTextNode(">"));
            return fragment;
        },
        HtmlComponentFormatter: function(value) {
            value.tagName = value.attributes.tag;
            delete value.attributes.tag;
            var pattern = [
                '<span class="component-tagname">&lt;{tagName}</span>'
            ];

            var defaultOptions = {showGlobalIds: false};
            AuraInspectorOptions.getAll(defaultOptions, function(options){
                if(options.showGlobalIds) {
                    pattern.push(' <span class="component-attribute">globalId</span>="{globalId}"');
                }
            });

            if(value.attributes["aura:id"]) {
                pattern.push(' <span class="component-attribute">aura:id</span>="' + value.attributes["aura:id"] + '"');
                for(var attr in value.attributes.HTMLAttributes) {
                    if(isFCV(value.attributes.HTMLAttributes[attr])) {
                        pattern.push(' <span class="component-attribute">' + attr + '</span>="' + String$escape(formatFCV(value.attributes.HTMLAttributes[attr])) + '"');
                    } else {
                        pattern.push(' <span class="component-attribute">' + attr + '</span>="' + String$escape(value.attributes.HTMLAttributes[attr]) + '"');
                    }
                }   
            }

            pattern.push("&gt;");
            return String$format(pattern.join(''), value);
        },
        TextComponentFormatter: function(value) {
            var text = value.attributes.value;
            // Whats the point of returning empty text nodes anyway?
            // Should probably show /n for carriage returns
            if(!text || text.trim().length == 0) {
                text = '&quot;&quot;';
            } else {
                text = "&quot;" + text + "&quot;";
            }
            return text;
        },
        ExpressionComponentFormatter: function(value) {
            var expression = value.attributes.expression;

            // ByReference {!...}
            if(expression) { 
                if(isFCV(expression)) {
                    return formatFCV(expression);
                }
                return expression;
            }

            var attributeValue = value.attributes.value;

            // ByValue {#...}
            return attributeValue;
        },
        KeyValueFormatter: function(config){
            var value = config.value;
            var key = config.key;

            // Function
            if(value && typeof value == "string" && value.toString().indexOf("function (") === 0 || typeof value === "function"){
                value = formatters.FunctionFormatter(value);
            } 
            // Empty String
            else if(typeof value === "string" && value.trim().length === 0) {
                value = '"' + value + '"';
            } 
            // Array
            else if(value && Array.isArray(value)) {
                if(value.length) {
                    var element = document.createElement("span");
                    element.appendChild(document.createTextNode("["));

                    var count = document.createElement("i");
                    count.className = "component-array-length";
                    count.appendChild(document.createTextNode(value.length));

                    element.appendChild(count);
                    element.appendChild(document.createTextNode("]"));
                    value = element;
                } else {
                    value = "[]";
                }
            } 
            // Non Dom object
            else if(value && typeof value === "object" && !("nodeType" in value)) {
                // {...} if it has content
                // {} if it is empty
                value = Object.keys(value).length ? "{...}" : "{}"
            }

            var propertyelement = document.createElement("span");
            propertyelement.className="component-property";
            propertyelement.appendChild(document.createTextNode(key));

            var valueelement = document.createElement("span");
            valueelement.className="component-property-value";
            valueelement.appendChild(value && value.nodeType ? value : document.createTextNode(value+""));

            var fragment = document.createDocumentFragment();
            fragment.appendChild(propertyelement);
            fragment.appendChild(document.createTextNode(":"));
            fragment.appendChild(valueelement);

            return fragment;
        },
        PropertyFormatter: function(value){ 
            return '<span class="component-property">' + value + '</span>';
        },
        FunctionFormatter: function(value){
            var span = document.createElement("span");
            span.appendChild(document.createTextNode("function(){...}"));
            span.setAttribute("title", value+"");
            return span;
        },
        FacetFormatter: function(value){
            var property_element = document.element("span");
            property_element.className = "component-property";
            property_element.appendChild(document.createTextNode(value.property));

            var fragment = formatters.ComponentFormatter(value);

            fragment.insertBefore(document.createTextNode(": "), fragment.firstElementChild);
            fragment.insertBefore(property_element, fragment.firstElementChild);
            return fragment;

            //return '<span class="component-property">' + value.property + '</span>:' + formatters.ComponentFormatter(value);
        },
        Header: function(value) {
            return '<h3>' + value + '</h3>';
        },
        DescriptorFormatter: function(value) {
            return value.replace( /markup:\/\/(\w+):(\w+)/, '<span class="component-prefix">$1</span>:<span class="component-tagname">$2</span>');
        },
        GlobalIdFormatter: function(value) {
            return `<aurainspector-auracomponent globalId='${value}'></aurainspector-auracomponent>`;
        },
        ControllerReference: function(value) {
            if(typeof value === "object") {
                return `<aurainspector-controllerreference expression="${value.expression}" component="${value.component}"></aurainspector-controllerreference>`;
            }
            return `<aurainspector-controllerreference>${value}</aurainspector-controllerreference>`;
        }
    };

    // Factory for creating known types of TreeNodes with their known formatters.
    TreeNode.create = function(data, id, format) {
        var node = new TreeNode(data, id);

        switch(format) {
            case "aura:html": 
                node.setFormatter(formatters.HtmlComponentFormatter);
                break;
            case "aura:text": 
                node.setFormatter(formatters.TextComponentFormatter);
                break;
            case "aura:expression": 
                node.setFormatter(formatters.ExpressionComponentFormatter);
                break;
            case "component":
                node.setFormatter(formatters.ComponentFormatter);
                break;
            case "componentdef": 
                node.setFormatter(formatters.ComponentDefFormatter);
                break;
            case "header":
                node.setFormatter(formatters.Header);
                break;
            case "keyvalue":
                node.setFormatter(formatters.KeyValueFormatter);
                break;
            case "descriptor":
                node.setFormatter(formatters.DescriptorFormatter);
                break;
            case "globalId":
                node.setFormatter(formatters.GlobalIdFormatter);
                break;
            case "controllerref":
                node.setFormatter(formatters.ControllerReference);
                break;
            case "property":
                node.setFormatter(formatters.PropertyFormatter);
                break;
        }

        return node;
    };

    /* 
     * Very SFDC specific. Takes a config def, and returns simply the node with the proper formatting.
     */
    TreeNode.parse = function(config) {
        var COMPONENT_CONTROL_CHAR = "\u263A"; // ☺ - This value is a component Global Id
        var ACTION_CONTROL_CHAR = "\u2744"; // ❄ - This is an action

        if(!config) {
            return new TreeNode();
        }

        if(typeof config === "string" && config.startsWith(COMPONENT_CONTROL_CHAR)) {
            return TreeNode.create(config.substr(1), config, "globalId");
        }

        if(typeof config === "string" && config.startsWith(ACTION_CONTROL_CHAR)) {
            return TreeNode.create(config.substr(1), config, "controllerref")
        }

        var id = config.globalId || "";
        var attributes = {
            globalId: id,
            attributes: {}
        };

        if(config.localId) {
            attributes.attributes["aura:id"] = config.localId;
        }
        
        var body = [];

        if(config.attributes) {
            for(var property in config.attributes) {
                if(!config.attributes.hasOwnProperty(property)) { continue; }

                if(config.expressions && config.expressions.hasOwnProperty(property)) {
                    attributes.attributes[property] = config.expressions[property];
                } else {
                    attributes.attributes[property] = config.attributes[property];
                }
            }
        }

        var node;

        // is Html?
        if(config.descriptor==="markup://aura:html") {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "aura:html");
        } else if(config.descriptor==="markup://aura:text") {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "aura:text");
        } else if(config.descriptor==="markup://aura:expression") {                    
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "aura:expression");
        } else if(config.globalId) {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "component");
        } else if(config.componentDef && config.componentDef.descriptor) {
            // TODO: Component Defs are broken
            attributes.tagName = config.componentDef.descriptor;
            node = TreeNode.create(attributes, id, "componentdef");
        }

        return node;
    };

    function String$format(str, o) {
        if(typeof str != "string") {
            throw new Error("String$format(str, o), you pass an invalid value as the str parameter, must be of type string.");
        }
        return str.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };

    function String$escape(string) {
        if(typeof string != "string") { return string; }
        return string.replace("<", "&lt;").replace(">", "&gt;");
    }

    function isFCV(compiledFcv) {
        var devFcvPrefix = "function (cmp, fn) { return ";
        var prodFcvPrefix = "function (a,b){return";

        return typeof compiledFcv === "string" && (compiledFcv.startsWith(devFcvPrefix) || compiledFcv.startsWith(prodFcvPrefix));
    }

    function formatFCV(compiledFcv) {
        var devFcvPrefix = "function (cmp, fn) { return ";
        var prodFcvPrefix = "function (a,b){return";

        // FCV in Dev Mode, code will be different in Prod Mode so we'll do a separate block for that.
        if(compiledFcv.startsWith(devFcvPrefix)) {
            // Lets try to clean up the Function a bit to make it easier to read.
            compiledFcv = "{! " + 
                // remove the initial function() { portion and the ending }
                compiledFcv.substr(devFcvPrefix.length, compiledFcv.length - devFcvPrefix.length - 1)
                // change fn.method, to just method
                .replace(/fn\.([a-zA-Z]+)\(/g, "$1(")
                // Change cmp.get("v.val") to just v.val
                .replace(/cmp\.get\(\"([a-zA-Z\._]+)\"\)/g, "$1")
                // ensure consistent ending
                .trim() + " }";

        } else if(compiledFcv.startsWith(prodFcvPrefix)) {
            compiledFcv = "{! " + 
                // Strip beginning function() { and ending }
                compiledFcv.substr(prodFcvPrefix.length, compiledFcv.length - prodFcvPrefix.length - 1)
                // In prod, it's not fn.method its b.method, so change it to just method
                .replace(/b\.([a-zA-Z]+)\(/g, "$1(")
                // Again in Prod, it's a.get, not cmp.get, so remove a.get and end up with just v.property
                .replace(/a\.get\(\"([a-zA-Z\._]+)\"\)/g, "$1")
                // consistent ending
                .trim() + " }";
        }

        return compiledFcv;
    }

})();

function AuraInspectorTreeView(treeContainer) {
    var _children = [];
    var nodeIdToHtml;
    var events = new Map();
    var htmlToTreeNode = new WeakMap();
    var container;
    var isRendered = false;
    var isCollapsable = false;

    // Constants
    var AUTO_EXPAND_LEVEL = 3;
    var AUTO_EXPAND_CHILD_COUNT = 2;

    this.addChild = function(child) {
        _children.push(child);
    };

    this.addChildren = function(children) {
        if(!Array.isArray(children)) {
            children = [children];
        }
        _children = _children.concat(children);
    };

    this.getChildren = function () {
        return _children;
    };

    this.clearChildren = function() {
        _children = [];
    };

    this.render = function(options) {
        if(!container) {
            container = document.createElement("ul");
            container.className = "tree-view";

            // Events
            container.addEventListener("mouseout", Container_MouseOut.bind(this));
            container.addEventListener("mouseover", Container_MouseOver.bind(this));
            container.addEventListener("click", Container_Click.bind(this));
            container.addEventListener("dblclick", Container_DblClick.bind(this));
        } else {
            container.innerHTML = "";
        }
        treeContainer.innerHTML = "";
        nodeIdToHtml = new Map();

        // Configurable rendering options
        options = Object.assign({ 
            "collapsable": false,
            selectedNodeId: undefined
        }, options);
        
        try {
            for(var c=0;c<_children.length;c++) {
                if(_children[c]) {
                    container.appendChild(renderNode(_children[c]));
                }
            }

            treeContainer.appendChild(container);
        } catch(e) {
            alert([e.message, e.stack]);
        }

        if(options.collapsable === true) {
            container.classList.add("collapsable");
            isCollapsable = true;
        }

        isRendered = true;

        if(options.selectedNodeId) {
            this.selectById(options.selectedNodeId);
        }

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

    this.expandAll = function() {
        var nodes = container.querySelectorAll("li.tree-view-parent");
        for(var c=0,length=nodes.length;c<length;c++) {
            expandNode(nodes[c]);
        }
    };

    this.selectById = function(nodeId) {
        if(!this.isRendered()) {
            return;
        }

        if(nodeIdToHtml.has(nodeId)) {
            var node = nodeIdToHtml.get(nodeId);
            if(node) {
                var current = node;
                while(current && !current.matches("ul.tree-view")) {
                    if(current.tagName === "LI") {
                        expandNode(current);
                    }
                    current = current.parentNode;
                }

                selectNode(node);
                this.notify("onselect", { domNode: node, treeNode: htmlToTreeNode.get(node) });
            }
        }
    };

    this.isRendered = function() {
        return isRendered;
    };

    this.isCollapsable = function() {
        return isCollapsable;
    };

    /* Event Handlers */
    function Container_MouseOut(event) {
        if(event.target == event.srcElement) {
            this.notify("onhoverout", { domNode: event.target });
        }
    }

    function Container_MouseOver(event) {
        // SPAN?
        var nodeClass = "tree-view-node";
        var target = event.target;
        while(target && target.parentNode && !target.classList.contains(nodeClass)) {
            target = target.parentNode;
        }
        // We hovered a list item
        if(target && target.parentNode && target.classList.contains(nodeClass)) {
            var li = target.parentNode;
            this.notify("onhover", { domNode: li, treeNode: htmlToTreeNode.get(li) });
        }
    }

    function Container_Click(event) {        
        var spanClass = "tree-view-node";
        var target = event.target;

        // Did we click the expand/collapse arrow?
        toggleExpandCollapse(event);

        while(target && target.parentNode) {
            // Did we click on the span?
            if(target.classList.contains(spanClass)) {
                var li = target.parentNode;
                selectNode(li);
                this.notify("onselect", { domNode: li, treeNode: htmlToTreeNode.get(li) });
                return;
            }
            target = target.parentNode;
        }
    }

    function Container_DblClick(event) {
        var nodeClass = "tree-view-node";
        var parentClass = "tree-view-parent";
        var expanded = "tree-view-expanded";
        var target = event.target;
        while(target && target.parentNode && !target.classList.contains(nodeClass)) {
            target = target.parentNode;
        }
        // We hovered a list item
        if(target && target.parentNode && target.classList.contains(nodeClass)) {
            var li = target.parentNode;
            selectNode(li);
            if(li.classList.contains(parentClass)) {
                li.classList.toggle(expanded);
            }
            this.notify("ondblselect", { domNode: li, treeNode: htmlToTreeNode.get(li) });
        }
    }

    /* Private Methods */
    function renderNode(node, autoExpandCounter) {
        autoExpandCounter = autoExpandCounter || 1;
        var span = document.createElement("span");
            span.className = "tree-view-node";
        var li = document.createElement("li");
            li.appendChild(span);
        var isAutoExpanded = autoExpandCounter < AUTO_EXPAND_LEVEL;
        var label = node.getLabel();

        if(node.hasFormatter()) {
            if(label && typeof label === "object" && "nodeType" in label) {
                span.appendChild(label);
            } else {
                span.innerHTML = label;
            }
        } else {
            span.appendChild(document.createTextNode(label));
        }

        if(autoExpandCounter === AUTO_EXPAND_LEVEL && node.getChildren().length <= AUTO_EXPAND_CHILD_COUNT) {
            autoExpandCounter--;
            isAutoExpanded = true;
        }
        nodeIdToHtml.set(node.getId(), li);

        if(node.hasChildren()) {
            // Add Expand box
            li.classList.add("tree-view-parent");
            if(isAutoExpanded) {
                li.classList.add("tree-view-expanded");
            }

            var ul = document.createElement("ul");

            var children = node.getChildren();
            for(var c=0;c<children.length;c++) {
                if(children[c]) {
                    ul.appendChild(renderNode(children[c], autoExpandCounter+1));
                }
            }

            li.appendChild(ul);
        }

        htmlToTreeNode.set(li, node);
        return li;
    }

    function toggleExpandCollapse(event) {
        var liClass = "tree-view-parent";
        var expanded = "tree-view-expanded";

        // Are we on the LI     
        if(event.target.classList.contains(liClass)) {
            // Inside the ::before boundry box?
            if(event.offsetX < 14 && event.offsetY < 14) {
                event.target.classList.toggle(expanded);
            }
        }
    }

    function expandNode(li) {
        if(!li.classList.contains("tree-view-expanded")) {
            li.classList.add("tree-view-expanded");
        }
    }

    function selectNode(node) {
        var previous = container.querySelector("li.tree-node-selected");
        if(previous) {
            previous.classList.remove("tree-node-selected");
        }
        if(node) {
            node.classList.add("tree-node-selected");
        }
    }

}