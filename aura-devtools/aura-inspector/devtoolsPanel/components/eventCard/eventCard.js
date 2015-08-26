(function() {
	var ownerDocument = document.currentScript.ownerDocument;

	var eventCard = Object.create(HTMLElement.prototype);

	/**
	 * The element has been attached to the DOM, update the structure.
	 *
	 * Kris: This probably wouldn't even be necessary if we configured the
	 * attributeChangedCallback correctly.
	 * 
	 * @return {[type]} [description]
	 */
	eventCard.attachedCallback = function() {
		var model = {
			eventName: 		this.getAttribute("name"),
			eventSourceId: 	this.getAttribute("sourceId"),
			eventDuration: 	this.getAttribute("duration"),
			eventType: 		this.getAttribute("type") === "APPLICATION" ? "APP" : "CMP",
			eventCaller: 	this.getAttribute("caller"),
			parameters: 	this.getAttribute("parameters"),
			handledBy: 		this.getAttribute("handledBy")
		};

		// remove markup:// from the event name if present
		if(model.eventName.startsWith("markup://")) {
			model.eventName = model.eventName.substr(9);
		}

		// I'm still working on what the best pattern is here
		// This seems sloppy    	
    	this.shadowRoot.querySelector("h1").textContent 			= model.eventName;
		this.shadowRoot.querySelector("h6").textContent				= model.eventType;
    	this.shadowRoot.querySelector(".caller").textContent 		= model.eventCaller;
    	this.shadowRoot.querySelector("#eventDuration").textContent = model.eventDuration+"ms";
    	this.shadowRoot.querySelector(".parameters").textContent 	= model.parameters;

		var collapsed = this.getAttribute("collapsed");
		if(collapsed === "true" || collapsed === "collapsed") {
			var section = this.shadowRoot.querySelector("section");
			section.classList.add("hidden");
		}

		var source = this.shadowRoot.querySelector("#eventSource");
		if(model.eventSourceId) {
			source.textContent 	= model.eventSourceId;
		} else {
			source.classList.add("hidden");
		}

	};

	/*
		New Action Card created, update it's body
	 */
	eventCard.createdCallback = function(){
    	var template = ownerDocument.querySelector("template");

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.createShadowRoot();
    		shadowRoot.appendChild(clone);
	};

	eventCard.attributeChangedCallback = function(attr, oldValue, newValue) {
		if(attr === "collapsed") {
			var section = this.shadowRoot.querySelector("section");
			var isCollapsed = this.isCollapsed();
			if(newValue === "true" || newValue === "collapsed" && !isCollapsed) {
				section.classList.add("hidden");
			} else if(newValue !== "true" && newValue !== "collapsed" && isCollapsed) {
				section.classList.remove("hidden");
				renderHandledBy(this);
			}

		}
	};

	eventCard.isCollapsed = function() {
		return this.shadowRoot.querySelector("section").classList.contains("hidden");
	};

	var eventCardConstructor = document.registerElement('aurainspector-eventCard', {
		prototype: eventCard
	});

	function renderHandledBy(element) {
		var handledBy = element.getAttribute("handledBy");

		// build the handled collection
		var handledContainer = element.shadowRoot.querySelector("#eventHandledBy");
		handledContainer.removeChildren();
		handledContainer.appendChild(buildHandledBy(handledBy));
	}
	// This will improve. 
	// I need to account for doing a deep network graph here too.
	function buildHandledBy(dataString) {
		if(!dataString || dataString === "[]") { 
			var span = document.createElement("span");
			span.textContent = "None";
			return span;
		}

		var data = JSON.parse(dataString);
		var dl = document.createElement("dl");
		var dt;
		var auracomponent;
		var dd;
		for(var c=0;c<data.length;c++) {
			auracomponent = document.createElement("aurainspector-auracomponent");
			auracomponent.setAttribute("globalId", data[c].scope);
			
			dt = document.createElement("dt");
			dt.appendChild(auracomponent);

			dd = document.createElement("dd");
			dd.textContent = "c." + data[c].name;

			dl.appendChild(dt);
			dl.appendChild(dd);
		}

		return dl;
	}
})();