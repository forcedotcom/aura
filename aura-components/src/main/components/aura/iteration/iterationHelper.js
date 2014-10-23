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
	_initializeOperations: function (cmp) {
		return {
			PickOperation   : this._initializePickOperation(),
			CreateOperation : this._initializeCreateOperation()
		};
	},
	getOperations: function () {
		if (!this._initializedOperations) {
			this._operations = this._initializeOperations();
			this._initializedOperations = true;
		}
		return this._operations;
	},
	_initializeCreateOperation: function () {
		var helper = this;

		function CreateOperation(index, itemval, cmp) {
			this.index = index;
			this.itemval = itemval;
			
			if (cmp._pendingCreates) {
				cmp._pendingCreates.push(this);
			} else {
				cmp._pendingCreates = [this];
			}
		}

		CreateOperation.prototype.run = function(cmp) {
			if (this.running) {
				// Create is mid flight just return and wait for the operation to complete
				return;
			} 
			
			this.running = true;
			
			var that = this;

			var items = cmp.get("v.items");
			helper.createComponentForIndex(cmp, items, this.index, function() {
				// Remove this create op from the set of pending creates
				var i = $A.util.arrayIndexOf(cmp._pendingCreates, that);
				if (i >= 0) {
					cmp._pendingCreates.splice(i, 1);
				}
				
				this.running = false;
			});
		}

		CreateOperation.prototype.toString = function() {
			return "create(" + this.index + ")";
		}

		return CreateOperation;
	},
	_initializePickOperation: function () {
		var helper = this;

		function PickOperation(itemval, sourceIndex, targetIndex, components, indexVar, varName) {
			this.itemval = itemval;
			this.sourceIndex = sourceIndex;
			this.targetIndex = targetIndex;
			this.components = components;
			this.indexVar = indexVar;
			this.varName = varName;
		}

		PickOperation.prototype.run = function(cmp) {
			var moved = this.sourceIndex !== this.targetIndex;
			
			helper.trackItem(cmp, this.itemval, this.targetIndex, this.components);
			
			for (var n = 0; n < this.components.length; n++) {
				var component = this.components[n];

				if (moved) {
					// Update the index to match the new position in the facet
					//var vp = component;//.getAttributeValueProvider();
					// Just can't see how you wouldn't want the attributeValueProvider here
                    var vp = component.getAttributeValueProvider();
					if (vp) {
						vp.set(this.indexVar, this.targetIndex);
                        //JBUCH: HALO: FIXME: THIS IS TO DEAL WITH THE CHANGE TO PTVs BELOW:
                        // extraProviders[varName] = cmp.getReference("v.items[" + index + "]");
                        vp.set(this.varName, cmp.getReference("v.items[" + this.targetIndex + "]"));
                    }
					
//					$A.renderingService.requestRerender(component);
				}
			}
		}

		PickOperation.prototype.toString = function() {
			return "pick(" + this.sourceIndex + ") to " + this.targetIndex;
		}

		return PickOperation;

	},
	createComponentForIndex : function(cmp, itemsval, index, afterCreationCallback) {
		var helper = this;
		
		function createCallback(collector, index) {
			return function(newComponent) {
				collector.components[index] = newComponent;

				//$A.renderingService.requestRerender(newComponent);

				if (--collector.expectedCount === 0) {
					helper.trackItem(collector.cmp, collector.itemval, collector.targetIndex, collector.components);

					var body = helper.createFacetFromTrackingInfo(collector.cmp);
					
					collector.cmp.set("v.body", body);
					
					if (afterCreationCallback) {
						afterCreationCallback();
					}
				}
			};
		}

		var itemval = itemsval[index];

		// Clone the body for this row
		var template = cmp.get("v.template");
		
		var forceServer = cmp.get("v.forceServer");
		var collector = {
			targetIndex: index,
			itemval : itemval,
			components : [],
			cmp : cmp,
			expectedCount : template.length
		};
		
		this.createComponents(cmp, itemsval, index, function(cdr, ivp, n) {
			$A.componentService.newComponentAsync(helper, createCallback(collector, n), cdr, ivp, false, false, forceServer);
		});
	},
	
	createBodyServer : function(cmp) {
		var helper = this;
		
		function createComponentsForIndexFromServer(cmp, itemsval, index) {
			var ret = [];
			
			$A.setCreationPathIndex(index);
			$A.pushCreationPath("body");
			
			helper.createComponents(cmp, itemsval, index, function(cdr, ivp, n) {
				ret.push($A.componentService.newComponentDeprecated(cdr, ivp, false, true));
			});

			$A.popCreationPath("body");

			return ret;
		}

		var items = cmp.get("v.items");
		if (items && items.length > 0) {
			$A.pushCreationPath("body");
			
			this.resetItemTracking(cmp);

			var startIndex = this.getStart(cmp);
			var endIndex = this.getEnd(cmp);

			for (var i = startIndex; i < endIndex; i++) {
				var components = createComponentsForIndexFromServer(cmp, items, i);

				this.trackItem(cmp, items[i], i, components);
			}

			$A.popCreationPath("body");
		}

		return this.getUpdatedBody(cmp);
	},
	
	resetItemTracking : function(cmp) {
		cmp._itemInfos = [];
	},

	getItemTracking : function(cmp) {
		if (!cmp._itemInfos) {
			this.resetItemTracking(cmp);
		}
		
		return cmp._itemInfos;
	},

	trackItem : function(cmp, itemval, index, components) {
		// Track the components associated with this item for future v.items delta calculations
		cmp._itemInfos[index] = {
			index : index,
			itemval : itemval,
			components : components
		};
	},

	getTransformation : function(cmp, itemsval, indexVar, varName, start, end) {
		var OperationConstructors = this.getOperations();
		var itemInfos = this.getItemTracking(cmp).slice();
		var pendingCreates = cmp._pendingCreates ? cmp._pendingCreates.slice() : undefined;
		var operations = [];

		for (var i = start; i < end; i++) {
			var itemval = itemsval[i];

			// Find existing itemInfo for this item
			var found = false;
			for (var j = 0; j < itemInfos.length; j++) {
				var info = itemInfos[j];
				if (info && itemval === info.itemval) {
					operations.push(new OperationConstructors.PickOperation(itemval, j, i, info.components, indexVar, varName));

					// Consume the item
					itemInfos[j] = undefined;
					found = true;
					break;
				}
			}

			// Check to see if we already have a pending create and update its target index
			if (!found && pendingCreates) {
				for (var n = 0; n < pendingCreates.length; n++) {
					var op = pendingCreates[n];
					if (itemval===op.itemval) {
						op.index = i;
						
						operations.push(op);
						
						// Consume the item
						pendingCreates.splice(n, 1);
						found = true;
					}
				}
			}
			
			if (!found) {
				// Add a create to the list operations to be satisfied
				operations.push(new OperationConstructors.CreateOperation(i, itemval, cmp));
			}
		}
		
		return operations;
	},

	updateBody : function(cmp) {
		var body = this.getUpdatedBody(cmp);
		cmp.set("v.body", body);
		cmp.getEvent("rerenderComplete").fire();
	},

	getUpdatedBody : function(cmp) {
        var items = cmp.get("v.items")||[];
        var varName = cmp.get("v.var");
		var indexVar = cmp.get("v.indexVar");

        if($A.util.isExpression(items)){
            items=items.evaluate();
        }
        if(!$A.util.isArray(items)){
            $A.warning("ui:iteration.update: 'v.items' must be a valid Array. Found '"+items+"'. Resetting to empty Array.");
            items=[];
        }
		var operations = this.getTransformation(cmp, items, indexVar, varName, this.getStart(cmp), this.getEnd(cmp));
				
		this.resetItemTracking(cmp);
		for (var n = 0; n < operations.length; n++) {
			operations[n].run(cmp);
		}
		
		return this.createFacetFromTrackingInfo(cmp);
	},

	createFacetFromTrackingInfo : function(cmp) {
		var body = [];
		var trackingInfo = this.getItemTracking(cmp);
		for (var n = 0; n < trackingInfo.length; n++) {
			var info = trackingInfo[n];
			if (info) {
				body = body.concat(info.components);
			}
		}
		
		return body;
	},

	getStart : function(cmp) {
		var start = cmp.get("v.start");
		return !$A.util.isEmpty(start) ? Math.max(0, this.getNumber(start)) : 0;
	},

	getEnd : function(cmp) {
	    var items = cmp.get("v.items");
		var length = items && items.length || 0;
		var end = cmp.get("v.end");
		
		return !$A.util.isEmpty(end) ? Math.min(length, this.getNumber(end)) : length;
	},
	
	createComponents : function(cmp, items, index, behavior) {
		function createExtraProviders(cmp, itemval, index) {
			var varName = cmp.get("v.var");
			var indexVar = cmp.get("v.indexVar");
			var extraProviders = {};
			
			//extraProviders[varName] = $A.expressionService.create(cmp, itemval);
			extraProviders[varName] = cmp.getReference("v.items[" + index + "]"); 
			if (indexVar) {
				extraProviders[indexVar] = $A.expressionService.create(cmp, index);
			}

			return extraProviders;
		}

		var ivp;
		var body = cmp.get("v.template");
		for (var n = 0; n < body.length; n++) {
			var cdr = body[n];
			if (!ivp) {
				var extraProviders = createExtraProviders(cmp, items[index], index);
				ivp = $A.expressionService.createPassthroughValue(extraProviders, cdr.valueProvider || cmp.getAttributeValueProvider());
			}

			$A.setCreationPathIndex(n);
			
			behavior(cdr, ivp, n);
		}
	},

	// temp workaround when strings get passed in until typedef takes care of this for us
	getNumber : function(value) {
		return aura.util.isString(value) ? parseInt(value, 10) : value;
	}
})