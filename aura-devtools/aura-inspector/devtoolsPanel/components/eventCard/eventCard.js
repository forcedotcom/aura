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
			parameters: 	this.getAttribute("parameters")//,
			// handledBy: 		this.getAttribute("handledBy"),
			// handledByTree: 	this.getAttribute("handledByTree")
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
			var auracomponent = document.createElement("aurainspector-auracomponent");
			auracomponent.setAttribute("globalId", model.eventSourceId);
			source.appendChild(auracomponent);
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

    	var toggleButton = shadowRoot.querySelector("#gridToggle");
    	toggleButton.addEventListener("click", ToggleButton_OnClick.bind(this));
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
				if(this.getAttribute("showGrid") === "true") {
					renderHandledByTree(this);
				}
			}
		}
		if(attr === "showgrid" || attr === "showGrid") {
			if(newValue === "true") {
				renderHandledByTree(this);
			} else {
				this.shadowRoot.querySelector("#eventHandledByGrid").classList.add("hidden");
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
		var data = getData(element.getAttribute("handledBy"));
		var handledContainer = element.shadowRoot.querySelector("#eventHandledBy");
		handledContainer.removeChildren();

		if(!data || data.length === 0) { 
			var span = document.createElement("span");
			span.textContent = "None";
			handledContainer.appendChild(span);
			return;
		}

		var dl = document.createElement("dl");
		var dt;
		var auracomponent;
		var dd;
		for(var c=0;c<data.length;c++) {
			if(data[c].scope) {
				auracomponent = document.createElement("aurainspector-auracomponent");
				auracomponent.setAttribute("globalId", data[c].scope);
				
				dt = document.createElement("dt");
				dt.appendChild(auracomponent);

				dd = document.createElement("dd");
				dd.textContent = "c." + data[c].name;

				dl.appendChild(dt);
				dl.appendChild(dd);
			} else {				
				dt = document.createElement("dt");
				dt.appendChild(document.createTextNode("{Bubbled Event}"));

				dd = document.createElement("dd");
				dd.textContent = data[c].name;

				dl.appendChild(dt);
				dl.appendChild(dd);
			}
		}

		// build the handled collection
		handledContainer.appendChild(dl);

		// Show Toggle Button
		var gridToggle = element.shadowRoot.querySelector("#gridToggle");
		gridToggle.classList.remove("hidden");

	}

	function renderHandledByTree(element) {
		var handledByTree = getData(element.getAttribute("handledByTree")) || [];

		// Empty, or just itself? Don't draw
		if(handledByTree.length < 2) {
			return;
		}

		var gridContainer = element.shadowRoot.querySelector("#eventHandledByGrid");
		gridContainer.removeChildren();
		gridContainer.classList.remove("hidden");

		var eventId = element.id;
		var rawEdges = [];
		var rawNodes = [];

		for(var c = 0; c < handledByTree.length;c++) {
			var handled = handledByTree[c];
			if(handled.type === "action") {
			  	rawNodes.push({ "id": handled.id, "label": `{${handled.data.scope}} c.${handled.data.name}`, "color": "maroon" });
			} else {
				var label = handled.data.sourceId ? `{${handled.data.sourceId}} ${handled.data.name}` : handled.data.name;
			  	var data = { "id": handled.id, "label": label, "color": "steelblue" };
			  	if(handled.id === eventId) {
			  		data.size = 60;
			  		data.color = "#333";
			  	}
			  	rawNodes.push(data);
			}
			if(handled.parent) {
			  	rawEdges.push( { "from": handled.id, "to": handled.parent, arrows: "from" } );
			}
		}

		  var nodes = new vis.DataSet(rawNodes);
		  var edges = new vis.DataSet(rawEdges);
		  var options = {
		  	nodes: {
		  		borderWidth: 1,
		  		shape: "box",
		  		size: 50,
		  		font: {
		  			color: "#fff"
		  		},
		  		color: {
		  			border: "#222"
		  		}
		  	},
		  	layout: {
		  		hierarchical: {
			      enabled: true,
			      //levelSeparation: 70,
			      direction: 'DU',   // UD, DU, LR, RL
			      sortMethod: 'directed' // hubsize, directed
			    }
		  	},
		  	interaction: {
		  		dragNodes: true
		  	}
		  };

		  var network = new vis.Network(gridContainer, { "nodes": nodes, "edges": edges }, options);
	}

	function getData(data) {
		if(!data) { return data; }
		if(data.length === 0) { return data; }
		if(typeof data === "string") { 
			return JSON.parse(data);
		} 
		return data;
	}

	function ToggleButton_OnClick(event) {
		var showGrid = this.getAttribute("showGrid");
		this.setAttribute("showGrid", (!showGrid || showGrid !== "true") ? "true" : "false");
	}
})();
