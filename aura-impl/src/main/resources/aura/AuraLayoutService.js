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
/*jslint sub: true */
/**
 * @description The Aura Layout Service, accessible using $A.layoutService.
 *            Manages Layouts. Internet Explorer 7 and 8 are not supported for
 *            this service.
 * @constructor
 */
var AuraLayoutService = function() {

	// #include aura.AuraLayoutService_private

	var layoutService = {
		/**
		 * @private
		 */
		handleLocationChange : function(event) {
			// Always having a hash means that the page won't reload when we go
			// back this point.
			if (window.location.toString()["indexOf"]("#") == -1) {
				window.location.replace(window.location + "#");
				// layoutService.changeLocation("");
				return;
			}

			var token = event.getParam("token");
			if (!token) {
				token = priv.layouts.getDefault().getName();
			}

			// The presence of a semaphore in here makes me think a class-level
			// markName might cause trouble, but...
			$A.Perf.mark("LayoutService.handleLocationChange (" + token + ")");
			$A.Perf.mark("Container Action Callback Initiated");
			// $A.Perf.mark("Container Action Callback Initiated: " +
			// item.getContainer());
			// $A.Perf.mark("Giving control to aura:layoutHandler (" +
			// layoutHandler.toString() + ")");
			$A.Perf.mark("Giving control to aura:layoutHandler");
			$A.Perf.mark("Layout Actions Callback Complete");
			// $A.Perf.mark("Container Layout Complete: "+
			// layoutItem.getContainer());
			$A.Perf.mark("Container Layout Complete");

			var curr = priv.peek();

			var layout = priv.layouts.getLayout(token);
			if (!layout) {
				layout = priv.layouts.getCatchall();
			}

			if (curr && curr.layout === layout && (layout !== priv.layouts.getCatchall()) && !layout.match) {
				// There is a current layout and it is the same as the one we're
				// on
				var oldParams = curr.params;
				var params = event.getParams();
				if ($A.util.json.encode(oldParams) === $A.util.json.encode(params)) {
					// The params are the same - we're already where we need to
					// be.
					$A.finishInit();
					priv.fireOnload();
					$A.Perf.endMark("LayoutService.handleLocationChange (" + token + ")");
					return;
				}
			}

			layoutService.layout(token, event.getParams());
		},

		/**
		 * Refreshes the current layout.
		 *
		 * @memberOf AuraLayoutService
		 * @public
		 */
		refreshLayout : function() {
			var curr = priv.peek();
			layoutService.layout(curr.layout.getName(), curr.params, true);
		},

		/**
		 * Loads the previous layout and updates the history, or the default
		 * layout.
		 *
		 * @memberOf AuraLayoutService
		 * @public
		 */
		back : function() {
			// Is there something in the stack to go back to?
			if (priv.history.length > 1) {
				this.pop();
				this.refreshLayout();
				historyService.back();
			} else {
				historyService.set(priv.layouts.getDefault().getName());
			}
		},

		/**
		 * Clears the history.
		 *
		 * @memberOf AuraLayoutService
		 * @public
		 */
		clearHistory : function() {
			priv.clear();
		},

		/**
		 * Removes the layout from the stack.
		 *
		 * @memberOf AuraLayoutService
		 * @private
		 */
		pop : function() {
			priv.pop();
		},

		/**
		 * Gets the requested layout.
		 *
		 * @param {String}
		 *            name The name of the layout to be retrieved
		 * @param {Object}
		 *            params Set params only for actions specified in the
		 *            layouts file
		 * @param {Boolean}
		 *            noTrack If set to true, the service does not track the
		 *            layout
		 * @memberOf AuraLayoutService
		 * @private
		 */
		layout : function(name, params, noTrack) {
			var layout = priv.layouts.getLayout(name);

			if (!layout) {
				layout = priv.layouts.getCatchall();
			}

			aura.assert(layout, "Named layout '" + name + "' not found");

			var cmp = priv.cmp;

			var config = [];
			var actions = [];
			var layoutErrorFired = false;
			layout.each(function(item) {
				var root = priv.cmp;
				var container = root.find(item.getContainer());
				if (container) {
					if (item.getCache() !== "loaded" || container._layoutItem !== item) {
						container._layoutItem = item;
						var defaultAction = function() {
							var action = item.getAction(cmp);

							action.setStorable();

							// Only set params for actions specified in the
							// layouts file. components requests will already
							// have the params set properly.
							if (!item.getBody() || item.getBody().length === 0) {
								action.setParams(params);
							}

							action.setCallback(this, function(a) {
								// $A.Perf.endMark("Container Action Callback
								// Initiated: " + item.getContainer());
								$A.Perf.endMark("Container Action Callback Initiated");
								if (a.getState() === "SUCCESS") {
									var ret = a.getReturnValue();
									layoutService.layoutCallback(ret ? componentService.newComponentDeprecated(ret, null, false, true) : null, item, layout,
											params, noTrack);
								} else {
									if (!layoutErrorFired) {
										var evt = $A.get("e.aura:layoutFailed");
										evt.fire();
										layoutErrorFired = true;
									}
								}
							});

							actions.push(action);
						};

						// See if body implements aura:layoutHandler and give it
						// a chance to handle the layout request specially
						var oldBody = container.get("v.body");
						if (oldBody.length === 1 && oldBody[0].isInstanceOf("aura:layoutHandler")) {
							var layoutHandler = oldBody[0];

							var event = layoutHandler.get("e.layout");

							var layoutInfo = {
								"layout" : layout,
								"params" : params
							};

							event.setParams({
								"layoutInfo" : layoutInfo,
								"defaultAction" : defaultAction
							});

							// $A.Perf.endMark("Giving control to
							// aura:layoutHandler (" + layoutHandler.toString()
							// + ")");
							$A.Perf.endMark("Giving control to aura:layoutHandler");

							event.fire();
						} else {
							defaultAction();
						}
					}
				}
			});

			// Push the new layout before running actions to allow
			// render/rerender etc to interact with the current layout
			if (!noTrack) {
				priv.push(layout, params);
			}
			priv.fireLayoutChangeEvent(true);

			if (actions.length > 0 || config.length > 0) {
				window.scrollTo(0, 0);
				clientService.runActions(actions, cmp, function(msg) {
					/**
					 * This function gets called in
					 * AuraClientService.runActions(). After all server actions
					 * are batched and sent to server, the response is handled
					 * in actionResponse(). This 'callback' argument in
					 * AuraClientService.runActions() refers to this function.
					 */
					if (!msg["errors"] || msg["errors"].length === 0) {
						priv.fireLayoutChangeEvent();
					}
					$A.Perf.endMark("Layout Actions Callback Complete");

					$A.finishInit();
					priv.fireOnload();
				});
			}
		},

		/**
		 * @private
		 */
		layoutCallback : function(components, layoutItem, layout, params, noTrack) {
			if (components === null || components === undefined) {
				components = [];
			} else if (!$A.util.isArray(components)) {
				components = [ components ];
			}

			var root = priv.cmp;
			var container = root.find(layoutItem.getContainer());
			var body = container.get("v.body");
			var defaultAction = function() {
				container.set("v.body", components);
			};

			// See if either body or the first new component implements
			// aura:layoutHandler
			// if so, give them a chance to handle the layout request specially
			var layoutHandler;
			var firstNewComponent = components.length > 0 ? components[0] : null;
			if (body.length === 1 && body[0].isInstanceOf("aura:layoutHandler")) {
				layoutHandler = body[0];
			} else if (firstNewComponent && firstNewComponent.isInstanceOf && firstNewComponent.isInstanceOf("aura:layoutHandler")) {
				layoutHandler = firstNewComponent;
			}

			if (layoutHandler) {
				var event = layoutHandler.get("e.layout");
				event.setParams({
					"components" : components,
					"defaultAction" : defaultAction
				});

				event.fire();
			} else {
				defaultAction();
			}

			// $A.Perf.endMark("Container Layout Complete: "+
			// layoutItem.getContainer());
			$A.Perf.endMark("Container Layout Complete");
		},

		/**
		 * Sets the current layout title. For example,
		 * <code>$A.layoutService.setCurrentLayoutTitle(cmp.get("v.title"));</code>
		 * sets the title based on an attribute.
		 *
		 * @param {Object}
		 *            title The title of the layout
		 * @memberOf AuraLayoutService
		 * @public
		 */
		setCurrentLayoutTitle : function(title) {
			var current = priv.peek();
			if (current && priv.getTitle(current) !== title) {
				var oldTitle = priv.getTitle(current);
				current.title = title;

				var params = {
					"title" : title,
					"prevTitle" : oldTitle
				};

				var evt = $A.get("e.aura:titleChange");
				evt.setParams(params);
				evt.fire();
			}
		},

		/**
		 * @private
		 */
		init : function(cmp) {
			if (cmp) {
				priv.layouts = cmp.getDef().getLayouts();
				if (priv.layouts) {
					priv.cmp = cmp;

					$A.eventService.addHandler({
						"event" : 'aura:locationChange',
						"globalId" : "AuraLayoutService",
						"handler" : this.handleLocationChange
					});
				}
			}

			delete this.init;
		}

		// #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
		,
		priv : priv
	// #end
	};
	// #include aura.AuraLayoutService_export
	return layoutService;
};
