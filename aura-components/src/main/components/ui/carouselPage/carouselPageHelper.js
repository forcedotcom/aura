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
	initialize: function (cmp) {
		var contentCmp     = cmp.get('v.content'),
			placeholder    = cmp.get('v.placeholder'),
			placeholderDef = placeholder && placeholder[0];

		// Unless we have a component here, we want to use a placeholder
		if ($A.util.isComponent(contentCmp)) {
			this.injectComponent(cmp, contentCmp);
		} else if (placeholderDef) {
			this.injectPlaceholder(cmp, placeholder);
		}

		this._initScrollerPagePlugin(cmp);
	},
	_buildScrollerPagePlugin: function () {
		function S() {}

		S.prototype = {
			_setNormalizedXY: function (x, y) {
				if (this.scrollVertical) {
	                this.x = 0;
	                this.y =  y > 0 ? 0 : y;
	            } else {
	                this.x = x;
	                this.y = 0;
	            }
			},
			/*
			 * Override the computation of snap to avoid have "snap" when scrolling to the top
			*/
			_computeSnap: function (start, end, velocity, current) {
	            var destination = start === 0 ? 0 : start + (end / 2) * (velocity / 8);
	            return {
	                destination : destination,
	                time        : Math.abs((destination - current) / velocity)
	            };

			}
		};
		return S;
	},
	_initScrollerPagePlugin: function (cmp) {
        var scroller = cmp.find('scroller');
        if (!scroller.isPluginRegistered('CarouselPage')) {
            scroller.registerPlugin('CarouselPage', this._buildScrollerPagePlugin(cmp));
        }
	},
	loadComponent: function (cmp) {
        var content              = cmp.get('v.content'),
            cmpDef               = content.executionComponent || content,
            ignoreExistingAction = cmp.get("v.ignoreExistingAction");

		if (cmpDef.isClientSideCreatable){
		    // copy skip cache onto hosted component
	        if (cmpDef.attributes && ignoreExistingAction) {
	            cmpDef.attributes.ignoreExistingAction = ignoreExistingAction;
	        }

			this.injectComponent(cmp, $A.newCmp({
				"componentDef": cmpDef.descriptor,
				"attributes": {values: cmpDef.attributes}
			}));
			return;
		}

		var isPreloaded  = false,
			serverAction = cmp.get("c.getServerSideComponent");

		serverAction.setParams({
			"descriptor": cmpDef.descriptor,
			"attributes": cmpDef.attributes
		});

        serverAction.setCallback(this, function(action) {
        	isPreloaded = this.onLoadComponent(cmp, action, content.isCachable && isPreloaded);
        });

        if (content.isCachable) {
            if (content.reloadOnActivation) {
                serverAction.setStorable({"refresh": 0, ignoreExisting: true});
            } else  {
                var storableConfig  = {"executeCallbackIfUpdated": false};

                if (ignoreExistingAction) {
                    storableConfig["ignoreExisting"] = true;
                }
                // check if a record we are about to display has been locally updated (say, by a row-level action),
                // and thus we need to ignore any cached action.
                else if (cmpDef.attributes && cmpDef.attributes.recordId) {
                    var event = $A.get("e.force:localRecordChangeCheck");
                    var staleRecordIds = [];
                    event.setParams({
                        name: cmpDef.descriptor,
                        recordIds: cmpDef.attributes.recordId,
                        staleRecordIds: staleRecordIds
                    });
                    event.fire();

                    if (staleRecordIds.length > 0) {
                        storableConfig["ignoreExisting"] = true;
                    }
                }

                serverAction.setStorable(storableConfig);
            }
            serverAction.setAbortable();
        } else {
            serverAction.setAbortable();
        }
        $A.enqueueAction(serverAction);
	},

	/**
	 * Handles the load action result building the hosted component.
	 * @return {Boolean} true if the component was successfully loaded and false otherwise.
	 */
	onLoadComponent: function (cmp, action, isAlreadyLoaded) {
		var actionState = action.getState(),
			isLoadSuccessful = false,
			contentCmp, cmpDef, ignoreExistingAction;

		if (actionState === 'SUCCESS') {
		    var config = action.getReturnValue();

	        // copy skip cache onto hosted component
            if (ignoreExistingAction && config && config.attributes && config.attributes.values) {
                config.attributes.values.ignoreExistingAction = ignoreExistingAction;
            }

			contentCmp = $A.newCmp(config);
			isLoadSuccessful = true;
			this.injectComponent(cmp, contentCmp, !isLoadSuccessful);
			return isLoadSuccessful;

		} else if (actionState === "INCOMPLETE") { // user is offline
			if (!isAlreadyLoaded) {
				cmpDef = {
					componentDef: "markup://one:retryPanel",
	            	attributes: { values : { "retryAction" : [action] } }
	        	};
	        	contentCmp = $A.newCmp(cmpDef);
	        	this.injectComponent(cmp, contentCmp, !isLoadSuccessful);
				return isLoadSuccessful;
			}	
		}
	},
	injectComponent: function (cmp, content, noMore) {
		cmp.set('v.isContentLoaded', true);
		if (!noMore){
			this.setPullToLoadMoreDelegation(cmp, content);
		}
		cmp.set('v.body', [content]);
	},
	injectPlaceholder: function (cmp, placeholderDef) {
		var content     = cmp.get('v.content'),
			name        = content ? content.label || content.title : '',
			placeholder;

		placeholderDef = placeholderDef[0] || placeholderDef;
		placeholderDef.attributes = {values: {name: name.toLowerCase()}};
		placeholder = $A.newCmp(placeholderDef);
		cmp.set('v.body', placeholder);
	},
	setPullToLoadMoreDelegation: function (cmp, contentCmp) {
		var canHandleShowMore = contentCmp.isInstanceOf("ui:handlesShowMore"),
			canShowMore       = canHandleShowMore && contentCmp.get('v.canShowMore');
		cmp.find('scroller').set('v.canShowMore', canShowMore);
		if (canShowMore) {
		    contentCmp.addHandler('noMoreContent', cmp, 'c.handleNoMoreContent');
		}
	},
	afterRenderCarouselPage: function (cmp) {
		var scroller = cmp.find('scroller').getScrollerInstance(),
			updateEventExists = !!$A.getEvt('force:updateHighlights');

			if (updateEventExists) {
				scroller.on('scrollMove', function (action) {
					var y = this.y;
					var updateHighlightsEvt = $A.getEvt('force:updateHighlights');
					if (action === 'gestureMove' || action === 'scroll') {
						if (y < 0) {
							updateHighlightsEvt.setParams({action: 'hide', block: true}).fire();
						} else if (y >= 0) {
							updateHighlightsEvt.setParams({action: 'show', block: true}).fire();
						}
					}
				});
				scroller.on('scrollEnd', function () {
					var updateHighlightsEvt = $A.getEvt('force:updateHighlights');
					if (scroller.y >= 0 && scroller.scrollerHeight > scroller.wrapperHeight) {
						updateHighlightsEvt.setParams({action: 'show'}).fire();
					}
				});
			}
		// This is to ensure the carousel div itself doesn't scroll
		// Its commented out right now cause of issues with tests.
		//this.addScrollLock(cmp);
	},

	/**
	 * Do not let the component's element scroll. For the asyncCarouselPage, we
	 * want to defer that to the parent scroller.
	 *
	 * A little bit of a hack, but we need to do it to work around Webkit issues.
	 */
	addScrollLock: function(component) {
		if (component) {
			var dom = component.getElement();
			dom.addEventListener("scroll", function(){
				this.scrollTop = 0;
			});
		}
	}
	
})// eslint-disable-line semi
