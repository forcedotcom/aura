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
    
    function DragAndDropUtil() {}
    
    DragAndDropUtil.OperationStatus = {
    	"DRAGGING": "DRAGGING",
    	"DRAG_END": "DRAG_END",
    	"DROPPING": "DROPPING",
    	"DROP_SUCCESS": "DROP_SUCCESS",
    	"DROP_ERROR": "DROP_ERROR"
    };
    
    DragAndDropUtil.prototype.$dndTypeMap$ = {};
    
    DragAndDropUtil.prototype.register = function(component) {
    	var types, ns;
    	if (component.isInstanceOf("ui:draggable")) {
    		types = [component.get("v.type")];
    		ns = "ui:draggable";
    	} else if (component.isInstanceOf("ui:dropzone")) {
    		types = component.get("v.types");
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
    
    DragAndDropUtil.prototype.deregister = function(component) {
    	var types, ns;
    	if (component.isInstanceOf("ui:draggable")) {
    		types = [component.get("v.type")];
    		ns = "ui:draggable";
    	} else if (component.isInstanceOf("ui:dropzone")) {
    		types = component.get("v.types");
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
    
    DragAndDropUtil.prototype.getDropzoneComponents = function(type) {
    	var globalIds = this.$dndTypeMap$[type]["ui:dropzone"];
    	var components = [];
    	$A.util.forEach(globalIds, function(globalId) {
    		components.push($A.componentService.get(globalId));
    	});
    	return components;
    };
    
    DragAndDropUtil.prototype.$resolveContext$ = function(component) {
    	var context = component.get("v.context");
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
     * Add data being transferred. 
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent.
     */
    DragAndDropUtil.prototype.addDataTransfer = function(dragEvent) {
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
     * Remove data being transferred.
     * @param {Aura.Event} dragEvent - the drop event that is occurred. Must be of type ui:dragEvent
     * @param {Function} comparator - comparator used for comparison to find data to be removed
     */
    DragAndDropUtil.prototype.removeDataTransfer = function(dragEvent, comparator) {
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

    DragAndDropUtil.prototype.moveDataTransfer = function(dragEvent, comparator) {
    	this.addDataTransfer(dragEvent);
    	this.removeDataTransfer(dragEvent, comparator);
    };
    
    w.$A["dragAndDropService"] = new DragAndDropUtil();
    w.$A["dragAndDropService"]["OperationStatus"] = DragAndDropUtil.OperationStatus;
}
