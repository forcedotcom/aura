(function(){

	var ownerDocument = document.currentScript.ownerDocument;

	var controllerreference = Object.create(HTMLSpanElement.prototype);

    controllerreference.createdCallback = function() {
        this.addEventListener("click", ControllerReference_OnClick.bind(this));
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
        var reference = this.textContent;
        var info = parse(reference);
        var command = `
            (function(definition) {
                if(definition) {
                    inspect(definition.prototype.controller["${info.method}"]);
                }
            })($A.componentService.getComponentClass("markup://${info.prefix}:${info.component}"))`;
        chrome.devtools.inspectedWindow.eval(command);
    }

	document.registerElement("aurainspector-controllerreference", {
		prototype: controllerreference
	});

})();