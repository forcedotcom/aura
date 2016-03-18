(function() {
	var ATTRIBUTE_NAME = "key";

	var labelPrototype = Object.create(HTMLSpanElement.prototype);

	labelPrototype.createdCallback = function(){
    	var shadowRoot = this.shadowRoot || this.createShadowRoot();
    	shadowRoot.appendChild(document.createTextNode(getLabel(this)));
	};

	labelPrototype.attributeChangedCallback = function(attr, oldValue, newValue) {
		var shadowRoot = this.shadowRoot || this.createShadowRoot();
		shadowRoot.innerHTML = "";
		shadowRoot.appendChild(document.createTextNode(getLabel(this)));
	};

	function getLabel(element) {
		if(element.hasAttribute(ATTRIBUTE_NAME)) {
			var key = element.getAttribute(ATTRIBUTE_NAME);
			return chrome.i18n.getMessage(key) || "[" + key + "]";
		}
	};

	document.registerElement('aurainspector-label', {
		prototype: labelPrototype
	});

})();