(function() {
	var ownerDocument = document.currentScript.ownerDocument;

	var outputFunction = Object.create(HTMLDivElement.prototype);

	outputFunction.createdCallback = function(){
    	var template = ownerDocument.querySelector("template");

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.shadowRoot || this.createShadowRoot();
    		shadowRoot.appendChild(clone);

    	var oldValue = this.textContent;
    	var observer = new MutationObserver(function(mutations) {
    		mutations.forEach(function(mutation) {
    			var target = mutation.target;
    			var newValue = target.textContent;
    			if(oldValue !== newValue) {
    				target.update();
    			}
    			oldValue = newValue;
    		})
    	});

    	observer.observe(this, {
    		attributes: false,
    		childList: true,
    		characterData: true
    	});
	};

	outputFunction.update = function() {
		var shadowRoot = this.shadowRoot || this.createShadowRoot();
		//shadowRoot.querySelector("pre").remove();

		var text = this.textContent;
		
		var pre = document.createElement("pre");
		pre.innerHTML = js_beautify(text);
		
		shadowRoot.appendChild(pre);
	};

	document.registerElement('aurainspector-outputFunction', {
		prototype: outputFunction
	});

})();