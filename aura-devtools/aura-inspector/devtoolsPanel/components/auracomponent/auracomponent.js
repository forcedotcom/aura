(function(){

	var ownerDocument = document.currentScript.ownerDocument;

	var auracomponent = Object.create(HTMLDivElement.prototype);

    auracomponent.createdCallback = function() {
        
        this.addEventListener("dblclick", AuraComponent_OnDblClick.bind(this));
    }

	auracomponent.attachedCallback = function() {
		var _data = this.getAttribute("componentData");
		if(!_data) {
			getComponentData(this.getAttribute("globalId"), function(data) {
				_data = data;
				this.setAttribute("componentData", _data);
				render(this, _data);
			}.bind(this));
		} else {
            // If we do a setAttribute("componentData", "JSONSTRING"); 
            // It would be nice if it just worked.
            try {
                if(typeof _data === "string") {
                    _data = ResolveJSONReferences(JSON.parse(_data));
                }
    			render(this, _data);
            } catch(e) {
                // Something went wrong with the rendering or the parsing of the data?
                // Just show the globalId, at least its something.
                var shadowRoot = this.shadowRoot || this.createShadowRoot();
                shadowRoot.appendChild(document.createTextNode(globalId));
            }
		}
	};
	
	function render(element, data) {
		var descriptor = data.descriptor;
		descriptor = descriptor.split("://")[1] || descriptor;

        var pattern = [
            `&lt;<span class="component-tagname">${descriptor}</span>
            <span class="component-attribute">globalId</span>="${data.globalId}"`
        ];

        if(data.attributes) {
            var current;
            for(var attr in data.attributes) {
                if(attr !== "body") {
                    current = data.attributes[attr];

                    if(current && Array.isArray(current)) {
                        current = current.length ? '[<i class="component-array-length">' + current.length + '</i>]' : "[]";
                    } else if(current && typeof current === "object") {
                        current = Object.keys(current).length ? "{...}" : "{}"
                    }

                    pattern.push(' <span class="component-attribute">' + attr + '</span>="' + current + '"');
                }
            }   
        }

        pattern.push("&gt;");

        var template = document.createElement("template");
        template.innerHTML = pattern.join('');

        var shadowRoot = element.shadowRoot || element.createShadowRoot();
        // Import CSS
        shadowRoot.appendChild(document.importNode(ownerDocument.querySelector("template").content, true));
        shadowRoot.appendChild(template.content);
	}

	function getComponentData(globalId, callback) {		
		var cmd = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', {'body':false, 'elementCount': false});`;

        chrome.devtools.inspectedWindow.eval(cmd, function(response, exceptionInfo) {
            if(exceptionInfo) {
                console.error("AuraInspector: ", exceptionInfo);
            }
            if(!response) { return; }
            var tree = JSON.parse(response);

            // RESOLVE REFERENCES
            tree = ResolveJSONReferences(tree);

            callback(tree);
        }.bind(this));
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

    function AuraComponent_OnDblClick(event) {
        var globalId = this.getAttribute("globalId");
        if(globalId) {
            var command = "$auraTemp = $A.getCmp('" + globalId + "'); console.log('$auraTemp = ', $auraTemp);";
            chrome.devtools.inspectedWindow.eval(command);
        }
    }

	document.registerElement("aurainspector-auracomponent", {
		prototype: auracomponent
	});

})();