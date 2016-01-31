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
		//console.log("----------->",(this.getAttribute("isStorable") === "true" ? this.getAttribute("storageKey"):"-") );
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
			returnError:    this.getAttribute("returnError"),
			fromStorage:	this.getAttribute("isStorable") === "true" ? this.getAttribute("isFromStorage") : "-",
            //storageKey could be very long, I want people be able to see it when they want to, hide it like other JSON object when no one cares
			storageKey:	this.getAttribute("isStorable") === "true" ? "{\"storageKey\":"+JSON.stringify(this.getAttribute("storageKey"))+"}" : "-",
			// storageKey: this.getAttribute("isStorable") === "true" ? this.getAttribute("storageKey") : "-",
			storableSize:	this.getAttribute("isStorable") === "true" ? (JSON.stringify(this.getAttribute("returnValue")).length / 1024).toFixed(1) + " KB" : "-"
		};

		// I'm still working on what the best pattern is here
		// This seems sloppy
    	this.shadowRoot.querySelector("#div_actionName").textContent 		= model.actionName;
    	this.shadowRoot.querySelector(".parameters").textContent 	= model.parameters;
    	this.shadowRoot.querySelector(".result").textContent 		= model.returnValue;
    	this.shadowRoot.querySelector(".storageKey").textContent = model.storageKey;
    	this.shadowRoot.querySelector("#actionError").textContent = model.returnError;
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
    		this.shadowRoot.querySelector(".span_removeActionCard").style.display = "inline-block";
    		this.shadowRoot.querySelector(".dropOrModify").style.display = "block";
			this.shadowRoot.querySelector(".card").classList.add("watch");
    		if(this.getAttribute("dropOrModify") === "modifyResponse") {//non-error response next time
    			this.shadowRoot.querySelector(".div_editActionResult").style.display = "block";
				this.shadowRoot.querySelector(".div_errorResponse").style.display = "none";
    		} else if(this.getAttribute("dropOrModify") === "errorResponseNextTime"){//error response next time
				this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
				this.shadowRoot.querySelector(".div_errorResponse").style.display = "block";	
    		} else {//drop action
    			this.shadowRoot.querySelector(".div_errorResponse").style.display = "none";	
				this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
    		}
    	} else {
    		this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
			this.shadowRoot.querySelector(".div_errorResponse").style.display = "none";	
    		this.shadowRoot.querySelector(".dropOrModify").style.display = "none";
    	}
    	//Edit action parameter is not working yet, hide it
    	//this.shadowRoot.querySelector("#button_editActionParameter").style.display = "none";
		//this.shadowRoot.querySelector(".matchActionParameter").style.display = "none";
		//this.shadowRoot.querySelector(".div_editActionParameter").style.display = "none";
		//this.shadowRoot.querySelector(".textarea_ActionParameter").style.display = "none";
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
    	shadowRoot.querySelector("#span_removeActionCard").addEventListener('click', removeActionCard.bind(this));
    	
	};

	actionCard.attributeChangedCallback = function(attrName, oldVal, newVal) {
		//console.log("The attribute %s changed from %s to %s", attrName, oldVal, newVal);
	};

	var actionCardConstructor = document.registerElement('aurainspector-actionCard', {
		prototype: actionCard
	});

	//we don't want to watch this action any more, remove it from pendding overrides
	function removeActionCard() {
		var actionId = this.getAttribute("id");
		var actionName = this.getAttribute("name");
		
		if(actionId) {
			//var actionParameter = JSON.parse(actionParameter);//obj
			var dataToPublish = {
							'actionName': actionName//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
							};
            dataToPublish = JSON.stringify(dataToPublish);
            //console.log('dropNextAction, dataToPublish = ', dataToPublish);
            //call AuraInspectorActionsView_OnEnqueueNextResponseForAction in AuraInspectorActionsView
            var command = `
               window[Symbol.for('AuraDevTools')].Inspector.
                	publish("AuraInspector:RemoveActionFromWatchList", '${dataToPublish}');
            `;
            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
	            if (exception) {
	            	console.log('ERROR from removeActionCard, CMD:', command, exception);
	            }
	        });
		} else {
			console.err("removeActionCard, couldn't find actionId");
		}
		var that = this;
		this.parentNode.removeChild(that);
	}


	//This return true if the object is an array, and it's not empty
    function isNonEmptyArray(obj) {
        if(obj && typeof obj === "object" && obj instanceof Array && obj.length && obj.length > 0) {
            return true;
        } else {
            return false;
        }
    }

	//This return true if the object is with type Object, but not an array or null/undefined
    function isTrueObject(obj) {
        if(obj && typeof obj === "object" && !(obj instanceof Array)) {
            return true;
        } else {
            return false;
        }
    }

	//given an object, go through each property (if it's an object itself, keep digging in), return an array of key --> value
	function getArrayOfObject(obj, resultArray, nextKey) {
		if(typeof obj === "string" || typeof obj === "boolean" || typeof obj === "number" || obj === null || obj === undefined) {
			if(nextKey != null && nextKey != undefined) {
				var tmpObj = {}; 
				tmpObj[nextKey] = obj;
				resultArray.push(tmpObj);
				//console.log("push "+nextKey+" --> "+obj+" to arr", resultArray);
			}
		} else if (isTrueObject(obj)) {
			for (var key in obj) {
				var value = obj[key];
				//console.log("call getArray with key:"+key,value,resultArray);
				getArrayOfObject(value, resultArray, key);
			}
		} else if (isNonEmptyArray(obj)) {
			for(var i = 0; i < obj.length; i ++) {
                var obji = obj[i];
                getArrayOfObject(obji, resultArray, null);
            }
		}
	}

	function dropOrModifyChanged() {
		var dropOrModify = this.shadowRoot.querySelector("#select_dropOrModify").value;
		this.setAttribute("dropOrModify", dropOrModify);
		if(dropOrModify === "dropAction") {
			this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
			this.shadowRoot.querySelector(".div_errorResponse").style.display = "none";
		} else if (dropOrModify === "modifyResponse") {
			this.shadowRoot.querySelector(".div_editActionResult").style.display = "block";
			this.shadowRoot.querySelector(".div_errorResponse").style.display = "none";
			//get an array of key->value from response, fill them into the picklist -- save this to actionCard itself?
			var returnValue = this.getAttribute("returnValue");
			returnValue = JSON.parse(returnValue);
			var returnValueArray = [];
			getArrayOfObject(returnValue, returnValueArray, null);
			var select_actionResultKey = this.shadowRoot.querySelector("#select_actionResultKey");
			for( i = 0; i < returnValueArray.length; i++) {
				returnValueArrayi = returnValueArray[i];
		    	var key = Object.keys(returnValueArrayi)[0];
		    	//var value = returnValueArrayi[key];
				var option = document.createElement("option");
				option.text = key;
		    	select_actionResultKey.add(option);
			}
			//show save/cancel button, and wire up logic
			this.shadowRoot.querySelector(".div_editActionResult").style.display = "block";
			this.shadowRoot.querySelector("#button_saveActionResult").
			addEventListener('click',  saveNextResponse.bind(this));
			this.shadowRoot.querySelector("#button_cancelChangeActionResult").
			addEventListener('click',  cancelNextResponse.bind(this));
		} else if (dropOrModify === "errorResponseNextTime") {
			this.shadowRoot.querySelector(".div_editActionResult").style.display = "none";
			this.shadowRoot.querySelector(".div_errorResponse").style.display = "block";
			this.shadowRoot.querySelector("#button_saveError").
			addEventListener('click',  saveErrorResponse.bind(this));
			this.shadowRoot.querySelector("#button_cancelError").
			addEventListener('click',  cancelErrorResponse.bind(this));
		} else {
			console.log("unknown choice for dropOrModify, we need a handler for it !!!");
		}
	}

	function saveErrorResponse() {
		var actionId = this.getAttribute("id");
		if(actionId) {
			var nextErrorMsg = this.shadowRoot.querySelector("#textarea_actionErrorMessage").value;
			nextErrorMsg = nextErrorMsg.trim();
			var nextErrorStack = this.shadowRoot.querySelector("#textarea_actionErrorStack").value;
			nextErrorStack = nextErrorStack.trim();
			var nextError = {};
			nextError["message"] = nextErrorMsg;
			nextError["stack"] = nextErrorStack;
			if(nextErrorMsg && nextErrorMsg.length && nextErrorMsg.length > 0) {
				var dataToPublish = {
					'actionName': this.getAttribute("name"),//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
					'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
					'nextResponse': undefined,
					'nextError': nextError
				};
				dataToPublish = JSON.stringify(dataToPublish);
	            //console.log('saveNextResponse, dataToPublish = ', dataToPublish);
	            //call AuraInspectorActionsView_OnEnqueueNextErrorForAction in AuraInspectorActionsView
	            var command = `
	               window[Symbol.for('AuraDevTools')].Inspector.
	                	publish("AuraInspector:EnqueueNextErrorForAction", '${dataToPublish}');
	            `;
	            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
		            if (exception) {
		            	console.log('ERROR from saveNextResponse, CMD:', command, exception);
		            }
		        });
		        //make the textara readonly
		        this.shadowRoot.querySelector("#textarea_actionErrorMessage").setAttribute('readonly','readonly');
		        this.shadowRoot.querySelector("#textarea_actionErrorStack").setAttribute('readonly','readonly');
		        //hide save/cancel button
		        this.shadowRoot.querySelector("#button_saveError").style.display="none";
		        this.shadowRoot.querySelector("#button_cancelError").style.display="none";
			} else {
				console.log("nextErrorMsg cannot be empty");
			}
		}
	}

	function cancelErrorResponse() {
		//hide next error response area
		var div_errorResponse = this.shadowRoot.querySelector(".div_errorResponse");
		div_errorResponse.style.display = "none";
		//change select back to default, which is drop action
		this.shadowRoot.querySelector("#select_dropOrModify").value = "dropAction";
	}

	function cancelNextResponse() {
		//hide next response area
		var div_editActionResult = this.shadowRoot.querySelector(".div_editActionResult");
		div_editActionResult.style.display = "none";
		//change select back to default, which is drop action
		this.shadowRoot.querySelector("#select_dropOrModify").value = "dropAction";
	}

	function dropNextAction() {
		var actionId = this.getAttribute("id");
		var actionName = this.getAttribute("name");
		var actionParameter = this.getAttribute("parameters");
		var actionIsStorable = this.getAttribute("isStorable");

		if(actionId) {
			var actionParameter = JSON.parse(actionParameter);//obj
			var dataToPublish = {
							'actionName': actionName,//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
							'actionParameter':actionParameter,
							'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
							'actionIsStorable': actionIsStorable,
							//'actionStorageKey': actionStorageKey, //it's not parse-able by Json, as it's not Json to begin with
                            'nextResponse': undefined,
                        	'nextErrorMsg': undefined};
            dataToPublish = JSON.stringify(dataToPublish);
            //console.log('dropNextAction, dataToPublish = ', dataToPublish);
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
		var actionName = this.getAttribute("name");//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
		var actionParameter = this.getAttribute("parameters");
		var actionIsStorable = this.getAttribute("isStorable");//to remove

		//for now, let's only allow modify one set of key->value in response, and key has to be an string
		var nextResponseKey = this.shadowRoot.querySelector("#select_actionResultKey").value;
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
							'nextResponse': nextResponse,
							'nextErrorMsg': undefined};
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

	/*function editActionParameter() {
		toggleActionParameter.call(this);
		this.shadowRoot.querySelector("#textarea_ActionParameter").value =
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
	}*/


})();
