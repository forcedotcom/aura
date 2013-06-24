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
    getResizer: function() {
        // DCHASMAN TODO Switch this to a better singleton
        if ($A.util.isUndefined($A._resizerSingleton)) {
            $A._resizerSingleton = {};
        }

        return $A._resizerSingleton;
    },

    init : function(component) {
        var resizer = this.getResizer();
        if ($A.util.isUndefined(resizer._resizer)) {
            // Wire up global resizer that guarantees order of evaluation for
            // nested border layouts
            resizer._resizerComponentSet = {};
            resizer._resizing = false;

            var helper = this;
            resizer._resizer = function() {
                if (!resizer._resizing) {
                    resizer._resizing = true;

                    setTimeout(function() {
                        try {
                            for (var n in resizer._resizerComponentSet) {
                                var c = resizer._resizerComponentSet[n];
                                if (c.isValid()) {
                                    helper.update(c);
                                }
                            }
                        } catch (e) {
                        } finally {
                            resizer._resizing = false;
                        }
                    }, 0);
                }
            };

            $A.util.on(window, "resize", resizer._resizer, false, 400);
        }

        resizer._resizerComponentSet[component.getGlobalId()] = component;
    },

    update : function(component) {
        if (component.isValid()) {
            // Invoke this observer's onresize action
            var a = component.get("v.onresize");
            if (a) {
            	
            	//$A.log("ui:resizeObserver.update()", component);
            	
                a.runDeprecated();
            }
        }
    },

    remove : function(component) {
        // Remove this component from the resize list
        var resizer = this.getResizer();
        if (!$A.util.isUndefined(resizer._resizerComponentSet)) {
            var id = component.getGlobalId();
            if (!(delete resizer._resizerComponentSet[id])) {
                $A.error("os:resizeObserver.remove() called with unregistered component " + id);
            }
        }
    },

    updateSize : function(component) {
        var resizer = this.getResizer();
        if (component.isValid() && resizer._resizer) {
            var id = component.getGlobalId();
            if ($A.util.isUndefined(resizer._resizerComponentSet[id])) {
                return;
            }

            if (!resizer._resizing) {
                resizer._resizing = true;

                // Initial set of all expected components that should be calling in
                resizer._pendingUpdates = {};
                for (var n in resizer._resizerComponentSet) {
                    var c = resizer._resizerComponentSet[n];
                    if (c.isValid()) {
                        resizer._pendingUpdates[n] = c;
                    }
                }
            }

            delete resizer._pendingUpdates[id];

            // Check to see if all components have called in and we're ready to
            // actually perform the resizer() call
            for (var n in resizer._pendingUpdates) {
                return;
            }

            resizer._resizing = false;
            resizer._resizer();
        }
    }
})
