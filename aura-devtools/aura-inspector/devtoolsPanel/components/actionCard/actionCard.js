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
		console.log("----------->",(this.getAttribute("isStorable") === "true" ? this.getAttribute("storageKey"):"-") );
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
			// storageKey: this.getAttribute("isStorable") === "true" ? this.getAttribute("storageKey") : "-",
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
    	if(this.hasAttribute("stats")) {
    		var statsInfo = JSON.parse(this.getAttribute("stats"));

    		this.shadowRoot.querySelector("#statsCreated").textContent = statsInfo.created;
    	}
    	//let people decide what they would like to do once the actionCard is created inside watch list
    	if(this.getAttribute("toWatch") === "true") {
    		this.shadowRoot.querySelector(".dropOrModify").style.display = "block";
			//this.shadowRoot.querySelector(".div_actionButtons").style.display = "none";
			this.shadowRoot.querySelector(".card").classList.add("watch");
    		if(this.getAttribute("dropOrModify") === "modifyResponse") {
    			this.shadowRoot.querySelector("#button_editActionResponse").style.display = "block";
    			this.shadowRoot.querySelector("#button_editActionParameter").style.display = "block";
				this.shadowRoot.querySelector("#textarea_actionParameter").style.display = "none";
				this.shadowRoot.querySelector(".div_textarea_ActionResult").style.display = "block";
    		} else {
    			this.shadowRoot.querySelector("#button_editActionResponse").style.display = "none";
    			this.shadowRoot.querySelector("#button_editActionParameter").style.display = "block";
				this.shadowRoot.querySelector("#textarea_actionParameter").style.display = "none";//change this to block once modify parameter is working
    		}
    	} else {
    		this.shadowRoot.querySelector("#button_editActionResponse").style.display = "none";
    		this.shadowRoot.querySelector("#button_editActionParameter").style.display = "none";

				this.shadowRoot.querySelector("#actionParameter").style.display = "none";
				this.shadowRoot.querySelector("#textarea_actionParameter").style.display = "none";
				this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
    		this.shadowRoot.querySelector(".dropOrModify").style.display = "none";
				//this.shadowRoot.querySelector(".div_actionButtons").style.display = "none";
    	}
	};

	/*
		New Action Card created, update it's body
	 */
	actionCard.createdCallback = function(){
    	var template = ownerDocument.querySelector("#actionCardTemplate");
    	//console.log(template);

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.createShadowRoot();
    		shadowRoot.appendChild(clone);

    	shadowRoot.querySelector("#select_dropOrModify").addEventListener('change', dropOrModifyChanged.bind(this));
    	
	};

	actionCard.attributeChangedCallback = function(attrName, oldVal, newVal) {
		//console.log("The attribute %s changed from %s to %s", attrName, oldVal, newVal);
	};

	var actionCardConstructor = document.registerElement('aurainspector-actionCard', {
		prototype: actionCard
	});

	function dropOrModifyChanged() {
		var dropOrModify = this.shadowRoot.querySelector("#select_dropOrModify").value;
		this.setAttribute("dropOrModify", dropOrModify);
		if(dropOrModify === "dropAction") {
			this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
		} else if (dropOrModify == "modifyResponse") {
			//this.shadowRoot.querySelector(".div_actionButtons").style.display = "block";
			this.shadowRoot.querySelector(".div_editActionResult").style.display = "block";
			this.shadowRoot.querySelector("#button_saveActionResult").
			addEventListener('click',  saveNextResponse.bind(this));
			this.shadowRoot.querySelector("#button_cancelChangeActionResult").
			addEventListener('click',  hideTexareaActionResult.bind(this));
		} else {
			console.log("unknown choice for dropOrModify, we need a handler for it !!!");
		}
	}

	function editActionParameter() {
		toggleActionParameter.call(this);
		this.shadowRoot.querySelector("#text_actionParameter").value =
			JSON.stringify(JSON.parse( this.shadowRoot.querySelector(".parameters").textContent ), undefined, 2);
		this.shadowRoot.querySelector(".div_actionButtons").style.display = "block";
		this.shadowRoot.querySelector(".div_actionParameter").style.display = "none";
		//bind save button
		var dropOrModify = this.shadowRoot.querySelector("#select_dropOrModify").value;
		if(dropOrModify === "dropAction") {
			this.shadowRoot.querySelector("#button_saveActionParameter").
			addEventListener('click',  dropNextAction.bind(this));
		} else if (dropOrModify == "modifyResponse") {
			this.shadowRoot.querySelector("#button_saveActionParameter").
			addEventListener('click',  saveNextResponse.bind(this));
		} else {
			console.log("unknown choice for dropOrModify, we need a handler for it !!!");
		}
		//bind cancel button
		this.shadowRoot.querySelector("#button_cancelChangeActionParameter").
		addEventListener('click',  function(){
			//Remove the action from the watch list. OR reset inputs to their original values.
		});
	}

	function toggleActionParameter() {
		var button_editActionParameter = this.shadowRoot.querySelector(".button_editActionParameter");
		var div_editActionParameter = this.shadowRoot.querySelector(".div_editActionParameter");
		if( button_editActionParameter.classList.contains("expanded") ){
			button_editActionParameter.classList.remove("expanded");
			div_editActionParameter.style.display = "none";
		} else {
			button_editActionParameter.classList.add("expanded");
			div_editActionParameter.style.display = "block";
		}
	}

	function hideTexareaActionResult() {
		var div_editActionResult = this.shadowRoot.querySelector(".div_editActionResult");
		div_editActionResult.style.display = "none";
	}

	function hideTexareaActionParameter() {
		var div_editActionParameter = this.shadowRoot.querySelector(".div_editActionParameter");
		div_editActionParameter.style.display = "none";
	}

	function dropNextAction() {
		var actionId = this.getAttribute("id");
		var actionName = this.getAttribute("name");//to remove
		var actionParameter = this.getAttribute("parameters");
		var nextResponse = undefined;
		var actionIsStorable = this.getAttribute("isStorable");

		if(actionId) {
			var actionParameter = JSON.parse(actionParameter);//obj
			var dataToPublish = {
							'actionName': actionName,
							'actionParameter':actionParameter,
							'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
							'actionIsStorable': actionIsStorable,
							//'actionStorageKey': actionStorageKey, //it's not parse-able by Json, as it's not Json to begin with
                            'nextResponse': nextResponse};
            dataToPublish = JSON.stringify(dataToPublish);
            console.log('dropNextAction, dataToPublish = ', dataToPublish);
            //call AuraInspectorActionsView_OnEnqueueNextResponseForAction in AuraInspectorActionsView
            var command = `
               window[Symbol.for('AuraDevTools')].Inspector.
                	publish("AuraInspector:EnqueueNextResponseForAction", '${dataToPublish}');
            `;
            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
	            if (exception) {
	            	console.log('ERROR from dropNextAction, CMD:', command, exception);
	            }
	        });
		}
	}


	function saveNextResponse() {
		var actionId = this.getAttribute("id");//necessary
		var actionName = this.getAttribute("name");//to remove
		var actionParameter = this.getAttribute("parameters");
		var actionIsStorable = this.getAttribute("isStorable");//to remove

		//for now, let's only allow modify one set of key->value in response, and key has to be an string
		var nextResponseKey = this.shadowRoot.querySelector("#textarea_actionResultKey").value;
		if(nextResponseKey) {
			nextResponseKey = nextResponseKey.trim();
		} else {
			nextResponseKey = undefined;
		}
		var nextResponseValue = this.shadowRoot.querySelector("#textarea_actionResultValue").value;
		var nextResponse = {};
		if(actionId && nextResponseKey && nextResponseKey.length && nextResponseKey.length > 0 && nextResponseValue) {
			try { //see if we can parse it to Json
				var nextResponseValueObj = JSON.parse(nextResponseValue);
				nextResponseValue = nextResponseValueObj;
			} catch(e) {
				//nothing, if we cannot, just trim it.
				nextResponseValue = nextResponseValue.trim();
			}
			nextResponse[nextResponseKey] = nextResponseValue;
			//console.log("nextActionResponse:", nextResponse);
			//publish data to AuraInspectorActionsView
			var actionParameter = JSON.parse(actionParameter);
			var dataToPublish = { 
							'actionName': actionName, 
							'actionParameter':actionParameter, 
							'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
							//'actionIsStorable': actionIsStorable, no need
							'nextResponse': nextResponse};
            dataToPublish = JSON.stringify(dataToPublish);
            console.log('saveNextResponse, dataToPublish = ', dataToPublish);
            //call AuraInspectorActionsView_OnEnqueueNextResponseForAction in AuraInspectorActionsView
            var command = `
               window[Symbol.for('AuraDevTools')].Inspector.
                	publish("AuraInspector:EnqueueNextResponseForAction", '${dataToPublish}');
            `;
            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
	            if (exception) {
	            	console.log('ERROR from saveNextResponse, CMD:', command, exception);
	            }
	        });
	        //make the textara readonly
	        this.shadowRoot.querySelector("#textarea_actionResultKey").setAttribute('readonly','readonly');
	        this.shadowRoot.querySelector("#textarea_actionResultValue").setAttribute('readonly','readonly');
	        //hide save/cancel button
	        this.shadowRoot.querySelector("#button_saveActionResult").style.display="none";
	        this.shadowRoot.querySelector("#button_cancelChangeActionResult").style.display="none";
	        
		} else {
			console.log("saveNextResponse, either actionId is bogus, or bad value of key/value in nextResponse", 
				actionId, nextResponseKey, nextResponseValue);
		}
	}

	function parseJSON(jsonString, errorMsg) {
		var extraMsg = ""; 
		if(errorMsg) { extraMsg = ''+errorMsg; }
		try {
			return JSON.parse(jsonString);
		} catch(e) {
			console.error(extraMsg+" error out during passing JSON string:"+jsonString);
		}
	}

})();
