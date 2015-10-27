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
function lib(w) { //eslint-disable-line no-unused-vars
	'use strict';
	w || (w = window);
    
    function DragAndDropService() {}
    
    DragAndDropService.prototype.$dndTypeMap$ = {};
    
    /**
     * Register a drag and drop component.
     * @param {String[]} types - drag and drop operations type that the component should be registered as
     * @param {Aura.Component} component - the drag and drop component
     */
    DragAndDropService.prototype.register = function(types, component) {
    	var ns;
    	if (component.isInstanceOf("ui:draggable")) {
    		ns = "ui:draggable";
    	} else if (component.isInstanceOf("ui:dropzone")) {
    		ns = "ui:dropzone";
    	}
    	
    	if (ns) {
    		var globalId = component.getGlobalId();
    		$A.util.forEach(types, function(type) {
    			if (this.$dndTypeMap$[type] === undefined) {
    				this.$dndTypeMap$[type] = {
    					"ui:draggable": [],
    					"ui:dropzone": []
    				};
        		}
    			this.$dndTypeMap$[type][ns].push(globalId);
    		}, this);
    	}
    };
    
    /**
     * Deregister a drag and drop component.
     * @param {String[]} types - drag and drop operations type that the component should be registered as
     * @param {Aura.Component} component - the drag and drop component
     */
    DragAndDropService.prototype.deregister = function(types, component) {
    	var ns;
    	if (component.isInstanceOf("ui:draggable")) {
    		ns = "ui:draggable";
    	} else if (component.isInstanceOf("ui:dropzone")) {
    		ns = "ui:dropzone";
    	}
    	
    	if (ns) {
    		var globalId = component.getGlobalId();
    		$A.util.forEach(types, function(type) {
    			var removeIndex = this.$dndTypeMap$[type][ns].indexOf(globalId);
    			if (removeIndex > -1) {
    				this.$dndTypeMap$[type][ns].splice(removeIndex, 1);
        		}
    		}, this);
    	}
    };
    
    /**
     * Get dropzone components that can handle drop operation of the specified type.
     * @return {Aura.Component[]} dropzone components of specified type
     */
    DragAndDropService.prototype.getDropzoneComponents = function(type) {
    	var globalIds = this.$dndTypeMap$[type]["ui:dropzone"];
    	var components = [];
    	$A.util.forEach(globalIds, function(globalId) {
    		components.push($A.componentService.get(globalId));
    	});
    	return components;
    };
    
    /**
     * Fire a drop complete event.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent.
     * @param {boolean} isSuccess - true if the drop has been completed successfully or false otherwise
     */
    DragAndDropService.prototype.fireDropComplete = function(dragEvent, isSuccess) {
      var dropComponent = dragEvent.getParam("dropComponent");
      var dragComponent = dragEvent.getParam("dragComponent");
      var type = dragEvent.getParam("type");
      
      var dropCompleteEvent = dragComponent.getEvent("dropComplete");
      dropCompleteEvent.setParams({
         "type": type,
         "dropComponent": dropComponent,
         "dropComplete": isSuccess
      });
      dropCompleteEvent.fire();
    };
    
    /**
     * Resolve context component for drag and drop component.
     * @return {Aura.Component} context component or null/ undefined if there is none
     */
    DragAndDropService.prototype.getContext = function(component) {
    	if ($A.util.isUndefinedOrNull(component)) {
    		return null;
    	}
    	
    	var context = component.get("v.inContextOf");
    	if (context) {
    		if ($A.util.isComponent(context)) {
    			return context;
    		}
    		
    		var globalId;
    		var valueProvider = component.getAttributeValueProvider();
    		var refCmp = valueProvider.find(context);
    		if (refCmp) {
    			refCmp = refCmp.length ? refCmp[0] : refCmp;
    			globalId = refCmp.getGlobalId();
    		} else {
    			globalId = $A.componentService.get(context) ? context : null;
    		}
    		
    		if (!$A.util.isEmpty(globalId)) {
    			return $A.componentService.get(globalId);
    		}
    	}
    	
    	// no context defined so returned the original component
    	return component.getConcreteComponent();
    };

    /**
     * Add data being transferred to dropzone component.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent.
     * @param {Object} addParams - parameter for adding data transfer. See ui:addRemove.
     */
    DragAndDropService.prototype.addDataTransfer = function(dragEvent, addParams) {
    	var dropComponent = dragEvent.getParam("dropComponent");
    	var context = this.getContext(dropComponent);
    	
    	if (context) {
    		if (context.getEvent("addRemove")) {
    			// fire addRemove event
    			var addRemoveEvent = context.getEvent("addRemove");
    			addRemoveEvent.setParams(addParams);
    			addRemoveEvent.fire();
    		} else if (context.get("v.dataProvider[0]")) {
    			// fire onchange event on dataProvider -- this will only add to last index
    			var dataProvider = context.get("v.dataProvider[0]");
    	    	var onChangeEvent = dataProvider.getEvent("onchange");
    	    	onChangeEvent.setParams({
    				"data" : addParams["items"]
    			});
    	    	onChangeEvent.fire();
    		}
    	}
    };

    /**
     * Remove data being transferred from a draggable component.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent
     * @param {Object} removeParams - parameter for adding data transfer. See ui:addRemove.
     */
    DragAndDropService.prototype.removeDataTransfer = function(dragEvent, removeParams) {
    	var dragComponent = dragEvent.getParam("dragComponent");
    	var context = this.getContext(dragComponent);
    	
    	if (context) {
    		if(context.getEvent("addRemove")) {
    			var addRemoveEvent = context.getEvent("addRemove");
				addRemoveEvent.setParams(removeParams);
				addRemoveEvent.fire();
    		}
    	}
    };
    
    /**
     * Move data being transferred from a draggable component to a dropzone component.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent
     * @param {Object} addParams - parameter for adding data transfer. See ui:addRemove.
     * @param {Object} removeParams - parameter for adding data transfer. See ui:addRemove.
     */
    DragAndDropService.prototype.moveDataTransfer = function(dragEvent, addParams, removeParams) {
    	if (addParams) {
    		this.addDataTransfer(dragEvent, addParams);
    	}
    	
    	if (removeParams) {
    		this.removeDataTransfer(dragEvent, removeParams);
    	}
    };
    
    w.$A["dragAndDropService"] = new DragAndDropService();
}
