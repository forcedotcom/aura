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
	createComponentForIndex : function(cmp, itemsval, index, afterCreationCallback) {
		var helper = this;
		
		function createCallback(collector, index) {
			return function(newComponent) {
				collector.components[index] = newComponent;

				//$A.renderingService.requestRerender(newComponent);

				if (--collector.expectedCount === 0) {
					helper.trackItem(collector.cmp, collector.itemval, collector.targetIndex, collector.components);

					var realbody = helper.createFacetFromTrackingInfo(collector.cmp);
					
					collector.cmp.set("v.realbody", realbody);
					
					if (afterCreationCallback) {
						afterCreationCallback();
					}
					
					// DCHASMAN TODO Figure out the best way to deal with the coupling between ArrayValue.commit() and rerendering -> auto Component.destroy()
					//$A.renderingService.removeDirtyValue(collector.cmp.getValue("v.realbody"));
				}
			};
		}

		var itemval = itemsval.getValue(index);

		// Clone the body for this row
		var body = cmp.get("v.body");
		
		var forceServer = cmp.get("v.forceServer");
		var collector = {
			targetIndex: index,
			itemval : itemval,
			components : [],
			cmp : cmp,
			expectedCount : body.length
		};
		
		this.createComponents(cmp, itemsval, index, function(cdr, ivp, n) {
			$A.componentService.newComponentAsync(helper, createCallback(collector, n), cdr, ivp, false, false, forceServer);
		});
	},
	
	createRealBodyServer : function(cmp) {
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

		// Although this is becoming an anti-pattern, we actually DO want
		// getValue() here.  With it, we end up sharing model objects (under
		// a PassthroughValue for sub-component ownership).  Without it,
		// ValueFactory makes us a NEW object for child components, and we
		// don't share a data model.
		var itemsval = cmp.getValue("v.items");

		if (itemsval && itemsval.getLength && itemsval.getLength() > 0) {
			$A.pushCreationPath("realbody");

			this.resetItemTracking(cmp);

			var startIndex = this.getStart(cmp);
			var endIndex = this.getEnd(cmp);

			for (var i = startIndex; i < endIndex; i++) {
				var components = createComponentsForIndexFromServer(cmp, itemsval, i);

				this.trackItem(cmp, itemsval.getValue(i), i, components);
			}

			$A.popCreationPath("realbody");
		}

		return this.getUpdatedRealBody(cmp);
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
		function PickOperation(itemval, sourceIndex, targetIndex, components, indexVar, varName) {
			this.itemval = itemval;
			this.sourceIndex = sourceIndex;
			this.targetIndex = targetIndex;
			this.components = components;
			this.indexVar = indexVar;
			this.varName = varName;
		}

		var helper = this;
		
		PickOperation.prototype.run = function(cmp) {
			var moved = this.sourceIndex !== this.targetIndex;
			
			helper.trackItem(cmp, this.itemval, this.targetIndex, this.components);
			
			for (var n = 0; n < this.components.length; n++) {
				var component = this.components[n];

				if (moved) {
					// Update the index to match the new position in the facet
					var vp = component.getAttributeValueProvider();
					if (vp) {
						vp.set(indexVar, this.targetIndex);
					}
					
					$A.renderingService.requestRerender(component);
				}
			}
		}

		PickOperation.prototype.toString = function() {
			return "pick(" + this.sourceIndex + ") to " + this.targetIndex;
		}

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
			// Although this is becoming an anti-pattern, we actually DO want
			// getValue() here.  With it, we end up sharing model objects (under
			// a PassthroughValue for sub-component ownership).  Without it,
			// ValueFactory makes us a NEW object for child components, and we
			// don't share a data model.
			var itemsval = cmp.getValue("v.items");
			helper.createComponentForIndex(cmp, itemsval, this.index, function() {
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

		var itemInfos = this.getItemTracking(cmp).slice();
		var pendingCreates = cmp._pendingCreates ? cmp._pendingCreates.slice() : undefined;
		var operations = [];

		for (var i = start; i < end; i++) {
			var itemval = itemsval.getValue(i);

			// Find existing itemInfo for this item
			var found = false;
			for (var j = 0; j < itemInfos.length; j++) {
				var info = itemInfos[j];
				if (info && itemval === info.itemval) {
					operations.push(new PickOperation(itemval, j, i, info.components, indexVar, varName));

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
					if ($A.util.equalBySource(itemval, op.itemval)) {
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
				operations.push(new CreateOperation(i, itemval, cmp));
			}
		}
		
		return operations;
	},

	updateRealBody : function(cmp) {
		var realbody = this.getUpdatedRealBody(cmp);

		cmp.set("v.realbody", realbody);
		
		// DCHASMAN TODO Rename this horrible misnomer that has nothing to do with rendering and everything to do with updating the contents of the iteration!!!
		cmp.getEvent("rerenderComplete").fire();

		// DCHASMAN TODO Figure out the best way to deal with the coupling between ArrayValue.commit() and rerendering -> auto Component.destroy()
		//$A.renderingService.removeDirtyValue(cmp.getValue("v.realbody"));
	},

	getUpdatedRealBody : function(cmp) {
        // Although this is becoming an anti-pattern, we actually DO want
        // getValue() here.  With it, we end up sharing model objects (under
        // a PassthroughValue for sub-component ownership).  Without it,
        // ValueFactory makes us a NEW object for child components, and we
        // don't share a data model.
        var itemsval = cmp.getValue("v.items");
        var varName = cmp.get("v.var");
		var indexVar = cmp.get("v.indexVar");

		var operations = this.getTransformation(cmp, itemsval, indexVar, varName, this.getStart(cmp), this.getEnd(cmp));
				
		this.resetItemTracking(cmp);
		// Clean previous components before replacing the body
		for (var n = 0; n < operations.length; n++) {
			operations[n].run(cmp);
		}
		
		return this.createFacetFromTrackingInfo(cmp);
	},

	createFacetFromTrackingInfo : function(cmp) {
		var realbody = [];
		var trackingInfo = this.getItemTracking(cmp);
		for (var n = 0; n < trackingInfo.length; n++) {
			var info = trackingInfo[n];
			if (info) {
				realbody = realbody.concat(info.components);
			}
		}
		
		return realbody;
	},

	getStart : function(cmp) {
		var start = cmp.get("v.start");
		return !$A.util.isEmpty(start) ? Math.max(0, this.getNumber(start)) : 0;
	},

	getEnd : function(cmp) {
	    // Although this is becoming an anti-pattern, we actually DO want
        // getValue() here.  With it, we end up sharing model objects (under
        // a PassthroughValue for sub-component ownership).  Without it,
        // ValueFactory makes us a NEW object for child components, and we
        // don't share a data model.
        var itemsval = cmp.getValue("v.items");
		var length = itemsval && itemsval.getLength ? itemsval.getLength() : 0;
		var end = cmp.get("v.end");
		
		return !$A.util.isEmpty(end) ? Math.min(length, this.getNumber(end)) : length;
	},
	
	createComponents : function(cmp, itemsval, index, behavior) {
		function createExtraProviders(cmp, itemval, index) {
			var varName = cmp.get("v.var");
			var indexVar = cmp.get("v.indexVar");
			var extraProviders = {};
			
			extraProviders[varName] = $A.expressionService.create(cmp, itemval);
			if (indexVar) {
				extraProviders[indexVar] = $A.expressionService.create(cmp, index);
			}

			return extraProviders;
		}

		var ivp;
		var body = cmp.get("v.body");
		for (var n = 0; n < body.length; n++) {
			var cdr = body[n];
			if (!ivp) {
				var extraProviders = createExtraProviders(cmp, itemsval.getValue(index), index);
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
