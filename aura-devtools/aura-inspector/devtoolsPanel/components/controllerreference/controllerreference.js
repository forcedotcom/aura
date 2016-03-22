(function(){

	var ownerDocument = document.currentScript.ownerDocument;

	var controllerreference = Object.create(HTMLDivElement.prototype);

    controllerreference.createdCallback = function() {
        // Had two different modes, one that works on textContent, the other that works on expression, componentid combination
        var expression = this.getAttribute("expression");
        var componentid = this.getAttribute("component");

        if(expression && componentid) {
            var template = ownerDocument.querySelector("template");
            //console.log(template);

            var clone = document.importNode(template.content, true);

            clone.querySelector("aurainspector-auracomponent").setAttribute("globalId", componentid);

            var expression_element = clone.querySelector("#expression");
            expression_element.appendChild(document.createTextNode(expression));
            expression_element.addEventListener("click", ControllerReference_OnClick.bind(this));

            var shadowRoot = this.createShadowRoot();
                shadowRoot.appendChild(clone);
        } else {
            this.addEventListener("click", ControllerReference_OnClick.bind(this));
        }
    }

    function parse(reference) {
        if(!reference) { return null; }
        var parts = reference.split("$");
        return {
            "prefix": parts[0],
            "component": parts[1],
            "method": parts[3]
        };
    }

    function ControllerReference_OnClick(event) {
        var command;
        var reference = this.textContent;
        if(reference) {
            var info = parse(reference);
            if(!info) { return; }

            command = `
                (function(definition) {
                    if(definition) {
                        inspect(definition.prototype.controller["${info.method}"]);
                    }
                })($A.componentService.getComponentClass("markup://${info.prefix}:${info.component}"))`;
            chrome.devtools.inspectedWindow.eval(command);
        } else {
            // expression, component combination
            var expression = this.getAttribute("expression");
            var componentid = this.getAttribute("component");

            if(expression && componentid) {
                expression = expression.substring(4, expression.length - 1); 
                command = `
                    (function(cmp){
                        if(!cmp){ return; }
                        var reference = cmp.controller["${expression}"];
                        if(reference) {
                            inspect(reference);
                        }
                    })($A.getComponent("${componentid}"));
                `;
                chrome.devtools.inspectedWindow.eval(command)
            }
        }
    }

	document.registerElement("aurainspector-controllerreference", {
		prototype: controllerreference
	});

})();