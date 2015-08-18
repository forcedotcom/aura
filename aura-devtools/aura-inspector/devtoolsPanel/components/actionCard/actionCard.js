(function() {
	var ownerDocument = document.currentScript.ownerDocument;

	var prototype = Object.create(HTMLElement.prototype);

	/**
	 * The element has been attached to the DOM, update the structure.
	 *
	 * Kris: This probably wouldn't even be necessary if we configured the
	 * attributeChangedCallback correctly.
	 * 
	 * @return {[type]} [description]
	 */
	prototype.attachedCallback = function() {
		var model = {
			id: 			this.getAttribute("actionId"),
			actionName: 	this.getAttribute("name"),
			parameters: 	this.getAttribute("parameters"),
			state: 			this.getAttribute("state"),
			isStorable: 	this.getAttribute("isStorable"),
			isRefresh: 		this.getAttribute("isRefresh"),
			isAbortable:	this.getAttribute("isAbortable"),
			isBackground: 	this.getAttribute("isBackground"),
			returnValue:	this.getAttribute("returnValue"),
			fromStorage:	this.getAttribute("isFromStorage")
		};

		// I'm still working on what the best pattern is here
		// This seems sloppy    	
    	this.shadowRoot.querySelector("header").textContent 		= model.actionName;
    	this.shadowRoot.querySelector(".parameters").textContent 	= model.parameters;
    	this.shadowRoot.querySelector(".result").textContent 		= model.returnValue;
    	this.shadowRoot.querySelector("#actionId").textContent 		= model.id;
    	this.shadowRoot.querySelector("#actionState").textContent 	= model.state;
    	this.shadowRoot.querySelector("#actionIsAbortable").textContent = model.isAbortable;
    	this.shadowRoot.querySelector("#actionIsStorable").textContent 	= model.isStorable;
    	this.shadowRoot.querySelector("#actionIsBackground").textContent = model.isBackground;
    	this.shadowRoot.querySelector("#actionIsRefresh").textContent 	= model.isRefresh;
    	this.shadowRoot.querySelector("#actionFromStorage").textContent = model.fromStorage;
	};

	/*
		New Action Card created, update it's body
	 */
	prototype.createdCallback = function(){
    	var template = ownerDocument.querySelector("template");

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.createShadowRoot();
    		shadowRoot.appendChild(clone);
    	
	};

	prototype.attributeChangedCallback = function(attr) {
		//console.log("The attribute %s changed", attr);
	};

	var actionCardConstructor = document.registerElement('aurainspector-actionCard', {
		prototype: prototype
	});

})();