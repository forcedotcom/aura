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
	createComponentForIndex : function(cmp, items, index) {
		var helper = this;
		
		function createCallback(collector, index) {
			return function(newComponent) {
				collector.components[index] = newComponent;

				//$A.renderingService.requestRerender(newComponent);

				if (--collector.expectedCount === 0) {
					helper.trackItem(collector.cmp, collector.item, collector.targetIndex, collector.components);

					var realbody = helper.createFacetFromTrackingInfo(collector.cmp);
					
					collector.cmp.set("v.realbody", realbody);
					
					// DCHASMAN TODO Figure out the best way to deal with the coupling between ArrayValue.commit() and rerendering -> auto Component.destroy()
					//$A.renderingService.removeDirtyValue(collector.cmp.getValue("v.realbody"));
				}
			};
		}

		var item = items[index];

		// Clone the body for this row
		var body = cmp.get("v.body");
		
		var forceServer = cmp.get("v.forceServer");
		var collector = {
			targetIndex: index,
			item : item,
			components : [],
			cmp : cmp,
			expectedCount : body.length
		};
		
		this.createComponents(cmp, items, index, function(cdr, ivp, n) {
			$A.componentService.newComponentAsync(helper, createCallback(collector, n), cdr, ivp, false, false, forceServer);
		});
	},
	
	createRealBodyServer : function(cmp) {
		var helper = this;
		
		function createComponentsForIndexFromServer(cmp, items, index) {
			var ret = [];
			
			$A.setCreationPathIndex(index);
			$A.pushCreationPath("body");
			
			helper.createComponents(cmp, items, index, function(cdr, ivp, n) {
				ret.push($A.componentService.newComponentDeprecated(cdr, ivp, false, true));
			});

			$A.popCreationPath("body");

			return ret;
		}

		var items = cmp.get("v.items");

		if (items && items.length > 0) {
			$A.pushCreationPath("realbody");

			this.resetItemTracking(cmp);

			var startIndex = this.getStart(cmp);
			var endIndex = this.getEnd(cmp);

			for (var i = startIndex; i < endIndex; i++) {
				var components = createComponentsForIndexFromServer(cmp, items, i);

				this.trackItem(cmp, items[i], i, components);
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

	trackItem : function(cmp, item, index, components) {
		// Track the components associated with this item for future v.items delta calculations
		cmp._itemInfos[index] = {
			index : index,
			item : item,
			components : components
		};
	},

	getTransformation : function(cmp, items, indexVar, varName, start, end) {
		function PickOperation(item, sourceIndex, targetIndex, components, indexVar, varName) {
			this.item = item;
			this.sourceIndex = sourceIndex;
			this.targetIndex = targetIndex;
			this.components = components;
			this.indexVar = indexVar;
			this.varName = varName;
		}

		var helper = this;
		
		PickOperation.prototype.run = function(cmp) {
			var moved = this.sourceIndex !== this.targetIndex;
			
			helper.trackItem(cmp, this.item, this.targetIndex, this.components);
			
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

		function CreateOperation(index, item) {
			this.index = index;
			this.item = item;
		}

		CreateOperation.prototype.run = function(cmp) {
			var items = cmp.get("v.items")
			helper.createComponentForIndex(cmp, items, this.index);
		}

		CreateOperation.prototype.toString = function() {
			return "create(" + this.index + ")";
		}

		var itemInfos = this.getItemTracking(cmp).slice();
		var operations = [];

		for (var i = start; i < end; i++) {
			var item = items[i];

			// Find existing itemInfo for this item
			var found = false;
			for (var j = 0; j < itemInfos.length; j++) {
				var info = itemInfos[j];
				if (info && $A.util.equalBySource(item, info.item)) {
					operations.push(new PickOperation(item, j, i, info.components, indexVar, varName));

					// Consume the item
					itemInfos[j] = undefined;
					found = true;
					break;
				}
			}

			if (!found) {
				// Add a create to the list operations to be satisfied
				operations.push(new CreateOperation(i, item));
			}
		}
		
		return operations;
	},

	updateRealBody : function(cmp) {
		var realbody = this.getUpdatedRealBody(cmp);

		cmp.set("v.realbody", realbody);
		
		// DCHASMAN TODO Figure out the best way to deal with the coupling between ArrayValue.commit() and rerendering -> auto Component.destroy()
		//$A.renderingService.removeDirtyValue(cmp.getValue("v.realbody"));
	},

	getUpdatedRealBody : function(cmp) {
		var items = cmp.get("v.items")
		var varName = cmp.get("v.var");
		var indexVar = cmp.get("v.indexVar");

		var operations = this.getTransformation(cmp, items, indexVar, varName, this.getStart(cmp), this.getEnd(cmp));
		
		this.resetItemTracking(cmp);
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
		var items = cmp.get("v.items");
		var length = items ? items.length : 0;
		var end = cmp.get("v.end");
		
		return !$A.util.isEmpty(end) ? Math.min(length, this.getNumber(end)) : length;
	},
	
	createComponents : function(cmp, items, index, behavior) {
		function createExtraProviders(cmp, item, index) {
			var varName = cmp.get("v.var");
			var indexVar = cmp.get("v.indexVar");
			var extraProviders = {};
			
			extraProviders[varName] = $A.expressionService.create(null, item);
			if (indexVar) {
				extraProviders[indexVar] = $A.expressionService.create(null, index);
			}

			return extraProviders;
		}

		var ivp;
		var body = cmp.get("v.body");
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
