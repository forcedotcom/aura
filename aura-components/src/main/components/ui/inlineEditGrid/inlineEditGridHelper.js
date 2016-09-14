/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	cellStatuses : ['edited', 'disabled', 'hasErrors'],
	PANEL_SUBMIT_ON_DEFAULT : 'keydown',
	
	initializeColumns : function(cmp) {
	    var columns = cmp.get("v.columns");
	    var itemVar = cmp.get("v.itemVar");
	    
	    for (var i = 0; i < columns.length; i++) {
            this.initializeCellStates(columns[i], itemVar);
        }
        
        cmp.find("grid").set("v.columns", columns);
	},
	
	initializeCellStates : function(cellComponentDef, itemVar) {
		var values = cellComponentDef.attributes.values;
		
		// May need some sort of interface to make sure we have these values?
		if (values.name) {
			var name = values.name.value;
			
			for (var i = 0; i < this.cellStatuses.length; i++) {
				var status = this.cellStatuses[i];
				if (!values[status]) {
					values[status] = this.generateStatusExpressionObj(itemVar, name, status);
				}
			}
		}
	},
	
	generateStatusExpressionObj : function(itemVar, name, status) {
		return {
			descriptor : status,
			value : '{!' + itemVar + '.status.' + name + '.' + status + '}'
		};
	},
	
	handleEditAction : function(cmp, evt) {
	    var index = evt.getParam("index");
        var payload = evt.getParam("payload");
        
        var editLayouts = cmp.get("v.editLayouts") || {};
        var editLayout = editLayouts[payload.name];
        
        if (editLayout) {

        	var targetElement = this.getTargetElement(cmp, payload);

        	if (targetElement===null){
        		return;
        	}

			this.getKeyboardManager(cmp).pauseKeyboardMode();

            // TODO: Need check that editLayout follows a certain interface so we can attach the appropriate
            // attributes and events.
            if (!editLayout.attributes) {
                editLayout.attributes = { values : {} };
            }

			editLayout.attributes.values.value = payload.value;
			// We have to create the component first because ui:input doesn't render the errors on
			// creation time, but only when being triggered through a change handler.
			// so, we set the errors via cmp.set in order to trigger the change handler
			var inputComponent = $A.createComponentFromConfig(editLayout);
			inputComponent.set("v.errors", payload.errors);

            var panelBodyConfig = this.getPanelBodyConfig(cmp, payload.name);
            var panelBodyAttributes = {
                    index : index,
                    submitOn : panelBodyConfig.submitOn,
                    updateMap : panelBodyConfig.updateMap,
                    inputComponent : inputComponent
            };
            
            this.displayEditPanel(cmp, panelBodyAttributes, targetElement);
        }
	},

	getTargetElement: function(cmp, payload) {
		// special handling in case the row was re-rendered and the targetElement is no longer valid
		var tableRootNode = cmp.getElement(),
			targetElement = payload.targetElement,
			partOfTable = (tableRootNode)?tableRootNode.contains(targetElement):null;

		if (!partOfTable) {
			// get the new current targetElement based on the old row and cell index
			tableRootNode = tableRootNode.querySelector('table');
			if (!tableRootNode) {
				return null;
			}
			
			return tableRootNode.rows[payload.targetRowIndex].cells[payload.targetCellIndex];	
			
		}

		return targetElement;
	},
	
	createEditPanel : function(cmp, newPanelBody, referenceElement) {
		var config = this.getPanelConfig(cmp, referenceElement);
		
		newPanelBody.addHandler('submit', cmp, 'c.handlePanelSubmit');
		config.body = newPanelBody;
		
		$A.get('e.ui:createPanel').setParams({
			panelType : 'inlinePanel',
			visible : true,
			panelConfig : config,
			onCreate : function(panel) {
				cmp._panelCmp = panel;
			},
			onDestroy : function(){
				cmp._panelCmp = null;
				if (cmp._delayedEditEvent) {
					window.requestAnimationFrame($A.getCallback(function() {
						this.handleEditAction(cmp, cmp._delayedEditEvent);
						cmp._delayedEditEvent = null;
					}.bind(this)));
				}
			}.bind(this)
		}).fire();
	},
	displayEditPanel : function(cmp, panelBodyAttributes, referenceElement) {
		var self = this;
		
		// TODO: Unable to reuse panels due to W-2802284
		/*if (cmp._panelCmp && cmp._panelCmp.isValid()) {
			var panelCmp = cmp._panelCmp;
			var panelBody = cmp._panelBody;
			
			panelCmp.set("v.referenceElement", referenceElement);
			
			panelBody.set("v.index", panelBodyAttributes.index);
			panelBody.set("v.key", panelBodyAttributes.key);
			panelBody.set("v.inputComponent", panelBodyAttributes.inputComponent);
			
			panelCmp.show();
		} else {*/
		try{
			$A.createComponent('markup://ui:inlineEditPanelBody',
					panelBodyAttributes,
					function(newPanelBody, status) {
						if (status === "SUCCESS") {
							cmp._panelBody = newPanelBody;
							self.createEditPanel(cmp, newPanelBody, referenceElement);
						}
					});
		} catch (e) {
			//added for trouble-shooting
            var moreInfo = "when inlineEditGridHelper creates inlineEditPanelBody cmp"; 
            
            if(!e.message) {
                e.message = moreInfo;
            } else {
                e.message +=  moreInfo;
            }
            throw e;
		}
	},
	
	getPanelBodyConfig: function(cmp, name) {
	    var config = cmp.get("v.editPanelConfigs");
	    var panelBodyConfig = config ? (config[name] || {}) : {};   
	    
	    if ($A.util.isEmpty(panelBodyConfig.updateMap)) {
	        panelBodyConfig.updateMap = this.getDefaultUpdateMap(name);
	    }
	    
	    if ($A.util.isEmpty(panelBodyConfig.submitOn)) {
	        panelBodyConfig.submitOn = this.PANEL_SUBMIT_ON_DEFAULT;
	    }
	    
	    return panelBodyConfig;
	},
	
	getPanelConfig: function(cmp, referenceElement) {
        return {
            referenceElement: referenceElement,
            closeOnClickOut: true,
			closeAction: $A.getCallback(function(panel, closeBehavior) {
				if (closeBehavior !== "closeOnEsc") {
					panel.get("v.body")[0].submitValues(closeBehavior);
				}
				else {
					panel.close($A.getCallback(function() {
						this.getKeyboardManager(cmp).resumeKeyboardMode();
					}.bind(this)));
				}
			}.bind(this))
        };
    },

	initKeyboardEntry: function(cmp){
		this.getKeyboardManager(cmp).initKeyboardEntry(cmp);
	},
	destroyKeyboard: function(cmp){
		this.getKeyboardManager(cmp).destroyKeyboard(cmp);
	},
	handleEnableKeyboardMode: function(cmp){
		if (cmp.get("v.enableKeyboardMode")) {
			this.initKeyboardEntry(cmp);
		}
		else {
			this.destroyKeyboard(cmp);
		}
	},
	updateItem: function(cmp, item, index){
		cmp.find('grid').updateItem(item, index);
	},
	updateHeaderColumns: function(cmp) {
	    cmp.find("grid").set("v.headerColumns", cmp.get("v.headerColumns"));
	},
	getDefaultUpdateMap: function(name) {
	    var map = {};
	    map[name] = 'value';
	    return map;
	},
	/*
	 * Retrieving the status object, testing to see if the value has been edited by comparing the new value to the
	 * original value. Returns an object with the name and edited set to true or false:
	 * Example:
	 * Name = "Account.Id"
	 * returned object will be { "Account" :{ "Id": { edited: true }}} 
	 * @param item  - contains the original value
	 * @param updateMap - Map used to get the name of cell that has been updated, we need the dot notation if it is present.
	 * @param values - new values
	 * @return object 
	 */
	getEditedStatus: function(item, values, updateMap){
		// Here we are testing to see if the value has been edited (changed from its previous value)
		var editedStatus = {};
		var edited;

		// Using the updateMap because it will not be a nested object at this point so if there is dot notation present, it is preserved here
		for (var name in updateMap){
			var value = values[name];

			// Checking to see if the value has been edited
			// Preparing to test for any keys that have dot notation
			var keys = name.split('.');
			var keysLen = keys.length;
			var originalValue = item;

			// Construct the "originalValue"
			for (var i=0;i<keysLen;i++){
				// If the original value is an object continue drilling down
				if ($A.util.isObject(originalValue)) {
					originalValue = originalValue[keys[i]];
				}
			}						

			// If the value has changed set edited to true. 
			if(originalValue!==value){
				edited = true;
			} else {
				edited = false;
			}	

			this.updateNestedMap(editedStatus, name+".edited", edited);

			return editedStatus;

		}
	},
	updateNestedMap : function(inputMap, name, value) {
		var keys = name.split(".");
		var map = inputMap;
		
		// In case the name is in dot notation (ex. record.Account.Name), we need to create nested mappings
		for (var i = 0; i < keys.length - 1; i++) {
			var key = keys[i];
			map[key] = map[key] || {};
			map = map[key];
		}
		map[keys[keys.length - 1]] = value;
	},

	/* UTILITY FUNCTIONS */
	bubbleEvent : function(cmp, evt, eventName) {
		cmp.getEvent(eventName).setParams(evt.getParams()).fire();
	},
	fireEditEvent : function(cmp, params) {
	    cmp.getEvent("onEdit").setParams({
            index : params.index,
            values : params.values
        }).fire();
	},
	fireKeyboardModeEnterEvent: function(cmp) {
 		cmp.getEvent("onKeyboardModeEnter").setParams({
			action : "keyboardModeEnter",
			payload : {}
		}).fire();
 	},
	/**
	 * @param exitAction - the exitAction such as exitOnEsc or exitOnBlur
	 */
 	fireKeyboardModeExitEvent: function(cmp, exitAction) {
 		cmp.getEvent("onKeyboardModeExit").setParams({
			action : "keyboardModeExit",
			payload : {
				"exitAction": exitAction
			}
		}).fire();
 	},
	fireShortcutSaveEvent: function(cmp) {
		cmp.getEvent("onKeyboardShortcut").setParams({
			action : "shortcut",
			payload : "save"
		}).fire();
	},
	fireShortcutCancelEvent: function(cmp) {
		cmp.getEvent("onKeyboardShortcut").setParams({
			action : "shortcut",
			payload : "cancel"
		}).fire();
	},
	getKeyboardManager: function(cmp) {
		if (!cmp._keyboardManager) {
			cmp._keyboardManager = this.lib.keyNav.createKeyboardManager();
		}
		return cmp._keyboardManager;
	}
})// eslint-disable-line semi