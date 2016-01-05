(function() {
	var ownerDocument = document.currentScript.ownerDocument;

	var actionCard = Object.create(HTMLElement.prototype);

	/**
	 * The element has been attached to the DOM, update the structure.
	 *
	 * Kris: This probably wouldn't even be necessary if we configured the
	 * attributeChangedCallback correctly.
	 *
	 * @return {[type]} [description]
	 */
	actionCard.attachedCallback = function() {
		var model = {
			id: 			this.getAttribute("actionId"),
			actionName: 	this.getAttribute("name"),
			parameters: 	this.getAttribute("parameters"),
			state: 			this.getAttribute("state"),
			isBackground: 	this.getAttribute("isBackground"),
			isStorable: 	this.getAttribute("isStorable"),
			isRefresh: 		this.getAttribute("isStorable") === "true" ? this.getAttribute("isRefresh") : "-",
			isAbortable:	this.getAttribute("isAbortable"),
			returnValue:	this.getAttribute("returnValue"),
			fromStorage:	this.getAttribute("isStorable") === "true" ? this.getAttribute("isFromStorage") : "-",
                        //storageKey could be very long, I want people be able to see it when they want to, hide it like other JSON object when no one cares
			storageKey:	this.getAttribute("isStorable") === "true" ? "{\"storageKey\":"+JSON.stringify(this.getAttribute("storageKey"))+"}" : "-",
			storableSize:	this.getAttribute("isStorable") === "true" ? (JSON.stringify(this.getAttribute("returnValue")).length / 1024).toFixed(1) + " KB" : "-"
		};

		// I'm still working on what the best pattern is here
		// This seems sloppy
    	this.shadowRoot.querySelector("header").textContent 		= model.actionName;
    	this.shadowRoot.querySelector(".parameters").textContent 	= model.parameters;
    	this.shadowRoot.querySelector(".result").textContent 		= model.returnValue;
    	this.shadowRoot.querySelector(".storageKey").textContent = model.storageKey;
    	this.shadowRoot.querySelector("#actionId").textContent 		= model.id;
    	this.shadowRoot.querySelector("#actionState").textContent 	= model.state;
    	this.shadowRoot.querySelector("#actionIsAbortable").textContent = model.isAbortable;
    	this.shadowRoot.querySelector("#actionIsBackground").textContent = model.isBackground;
    	this.shadowRoot.querySelector("#actionIsStorable").textContent 	= model.isStorable;
    	this.shadowRoot.querySelector("#actionStorableSize").textContent = model.storableSize;
    	this.shadowRoot.querySelector("#actionIsRefresh").textContent 	= model.isRefresh;
    	this.shadowRoot.querySelector("#actionFromStorage").textContent = model.fromStorage;
    	
	};

	/*
		New Action Card created, update it's body
	 */
	actionCard.createdCallback = function(){
    	var template = ownerDocument.querySelector("template");

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.createShadowRoot();
    		shadowRoot.appendChild(clone);

	};

	actionCard.attributeChangedCallback = function(attr) {
		//console.log("The attribute %s changed", attr);
	};

	var actionCardConstructor = document.registerElement('aurainspector-actionCard', {
		prototype: actionCard
	});

})();
