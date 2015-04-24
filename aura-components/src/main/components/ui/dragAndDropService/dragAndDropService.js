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
function (w) {
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
     * Resolve context component for drag and drop component.
     * @return {Aura.Component} context component or null/ undefined if there is none
     */
    DragAndDropService.prototype.$resolveContext$ = function(component) {
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
    	
    	return context;
    };

    /**
     * Add data being transferred to dropzone component.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent.
     */
    DragAndDropService.prototype.addDataTransfer = function(dragEvent) {
    	var dropComponent = dragEvent.getParam("dropComponent");
    	var context = this.$resolveContext$(dropComponent);
    	
    	if (context) {
    		var dragComponent = dragEvent.getParam("dragComponent");
    		var dataTransfer = dragComponent.get("v.dataTransfer");
    		
    		if (context.hasEventHandler("addRemove")) {
    			// fire addRemove event -- addRemove event in ui:abstractList is unsupported yet!
//    			var addRemoveEvent = context.getEvent("addRemove");
//    			addRemoveEvent.setParams({
//    				"index": 0
//    				"items": [dataTransfer]
//    			});
//    			addRemoveEvent.fire();
    		} else if (context.get("v.dataProvider[0]")) {
    			// fire onchange event on dataProvider -- this will only add to last index
    			var dataProvider = context.get("v.dataProvider[0]");
    	    	var onChangeEvent = dataProvider.getEvent("onchange");
    	    	onChangeEvent.setParams({
    				"data" : [dataTransfer]
    			});
    	    	onChangeEvent.fire();
    		}
    	}
    };

    /**
     * Remove data being transferred from a draggable component.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent
     * @param {Function} comparator - comparator used for comparison to find data to be removed
     */
    DragAndDropService.prototype.removeDataTransfer = function(dragEvent, comparator) {
    	var dragComponent = dragEvent.getParam("dragComponent");
    	var context = this.$resolveContext$(dragComponent);
    	
    	if (context) {
    		if(context.get("v.items") && context.getEvent("addRemove")) {
    			// Calculate index to be removed
    			var record = dragEvent.getParam("data");
    			var items = context.get("v.items");
    			
    			var removeIndex = -1;
    			for (var i = 0; i < items.length; i++) {
    				if (comparator(record, items[i]) === 0) {
    					removeIndex = i;
    					break;
    				}
    			}
    			
    			// fire addRemove event
    			if (removeIndex > -1) {
    				var addRemoveEvent = context.getEvent("addRemove");
    				addRemoveEvent.setParams({
    					"index": removeIndex,
    					"count": 1,
    					"remove": true
    				});
    				addRemoveEvent.fire();
    			}
    		}
    	}
    };
    
    /**
     * Move data being transferred from a draggable component to a dropzone component.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent
     * @param {Function} comparator - comparator used for comparison to find data to be removed
     */
    DragAndDropService.prototype.moveDataTransfer = function(dragEvent, comparator) {
    	this.addDataTransfer(dragEvent);
    	this.removeDataTransfer(dragEvent, comparator);
    };
    
    w.$A["dragAndDropService"] = new DragAndDropService();
}
