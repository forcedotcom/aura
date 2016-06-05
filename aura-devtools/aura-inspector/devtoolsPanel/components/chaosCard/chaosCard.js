(function() {
	var ownerDocument = document.currentScript.ownerDocument;

	var chaosCard = Object.create(HTMLElement.prototype);

	chaosCard.attachedCallback = function() {
		this.shadowRoot.querySelector("#element_textContent").textContent = this.getAttribute("textContent");
		//this.shadowRoot.querySelector("#cssPath").textContent = this.getAttribute("cssPath");
		if(this.getAttribute("locatorRoot")) {
			this.shadowRoot.querySelector("#element_locator_root").textContent = 'Root:'+this.getAttribute("locatorRoot");	
		}
		if(this.getAttribute("locatorParent")) {
			this.shadowRoot.querySelector("#element_locator_parent").textContent = 'Parent:'+this.getAttribute("locatorParent");	
		}
	};

	/*
		New Chaos Card created, update it's body
	 */
	chaosCard.createdCallback = function(){
    	var template = ownerDocument.querySelector("template");
    	//console.log(template);

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.createShadowRoot();
    		shadowRoot.appendChild(clone);

    	//shadowRoot.querySelector("#select_dropOrModify").addEventListener('change', dropOrModifyChanged.bind(this));
	};

	chaosCard.attributeChangedCallback = function(attrName, oldVal, newVal) {
		//console.log("The attribute %s changed from %s to %s", attrName, oldVal, newVal);
	};


	var chaosCardConstructor = document.registerElement('aurainspector-chaosCard', {
		prototype: chaosCard
	});


})();
