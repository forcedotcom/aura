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
function manualTestValidation() {

    /**
     * Given a set of defs, verify if a root component is available then all its dependencies are also available.
     *
     * @param {Array} defs An array of def names, for example ["markup://ui:scroller", "markup://ui:scopedScroll", "markup://ui:scrollerLib"]
     */
    function validateTree(defs) {
        var dependenciesMap = [
            {
                root: "markup://ui:scroller",
                dependencies: ["markup://ui:scopedScroll", "markup://ui:scrollerLib", "markup://ui:scrollBy", "markup://ui:scrollTo", "markup://ui:updateSize", "markup://ui:resizeObserver"]
            },
            {
                root: "markup://ui:tree",
                // interfaces: "markup://ui:visitable"
                dependencies: ["markup://ui:getChildren", "markup://ui:makeVisitor", "markup://ui:traverseEvent", "markup://ui:treeNode"]
            },
            {
                root: "markup://ui:carousel",
                // interfaces: markup://ui:handlesRefresh, markup://ui:handlesShowMore, markup://ui:scrollerEmbeddable
                // ui:label sent down in app.js
                dependencies: ["markup://ui:carouselIndicator", "markup://ui:carouselPage", "markup://ui:command", "markup://ui:noMoreContent", "markup://ui:pagerClicked", "markup://ui:refresh", "markup://ui:resizeObserver", "markup://ui:scopedScroll", "markup://ui:scrollBy", "markup://ui:scroller", "markup://ui:scrollerLib", "markup://ui:scrollTo", "markup://ui:showMore", "markup://ui:updateSize"]
            },
            {
                root: "markup://auraStorageTest:manualTesterBigCmp",
                dependencies: ["markup://auraStorageTest:manualTesterBigCmp", "markup://test:test_Library", "markup://ui:baseDOMEvent", "markup://ui:baseKeyboardEvent", "markup://ui:baseMouseEvent", "markup://ui:blur", "markup://ui:button", "markup://ui:containerManagerLib", "markup://ui:contentTypeLibrary", "markup://ui:crossTabLib", "markup://ui:dragAndDropLib", "markup://ui:focus", "markup://ui:focusManagerLib", "markup://ui:inputNumberLibrary", "markup://ui:keydown", "markup://ui:mouseout", "markup://ui:mouseover", "markup://ui:panelPositioningLib", "markup://ui:press", "markup://ui:scrollerLib", "markup://ui:stackManagerLib"]
            }
        ];

        // If root component is in tree, verify all its dependencies are as well
        for (var j = 0; j < dependenciesMap.length; j++) {
            if (defs.indexOf(dependenciesMap[j].root) > -1) {
                var deps = dependenciesMap[j].dependencies;
                for (var k = 0; k < deps.length; k++) {
                    if (defs.indexOf(deps[k]) === -1) {
                        // The root component is in storage but not one of its dependencies
                        return "Root component " + dependenciesMap[j].root + " present in def tree "
                                + "but not dependency " + deps[k];
                    }
                }
            }
        }
    };

    function getContextLoadedKeys(global) {
        var loaded = global.$A.getContext().getLoaded();
        var loadedKeys = [];
        for (var key in loaded) {
            var trimmed = key.substring(key.indexOf("@")+1);
            loadedKeys.push(trimmed);
        }
        return loadedKeys;
    };

    function getErrorBoxText(global) {
        var errorText = "";
        if (global.$A.util.hasClass(global.document.body, "auraError")) {
            errorText = global.$A.util.getText(global.$A.util.getElement("auraErrorMessage"));
        }
        return errorText;
    };

    function validateContextLoaded(loaded, availableDefs) {
        for (var i = 0; i < loaded.length; i++) {
            var loadedKey = loaded[i];
            if (availableDefs.indexOf(loadedKey) === -1) {
                return "Context.loaded entry [" + loadedKey + "] not present in available set of defs";
            }
        }
    };

    return {
        /**
         * Check validity of things in memory that we can do quickly and synchronously
         * - Contents of this.loaded is in memory on AuraComponentService
         * - Defs in memory on AuraComponentService have complete tree
         * - in-memory actions have necessary defs
         */
        inMemoryValidationFull: function(global, failCallback) {
            global = global || window;
            var loaded = getContextLoadedKeys(global);
            var componentDefRegistry = Object.keys(global.$A.componentService.$componentDefRegistry$);
            var savedComponentConfigs = Object.keys(global.$A.componentService.$savedComponentConfigs$);
            var libraryRegistry = Object.keys(global.$A.componentService.$libraryRegistry$.$libraries$);
            var eventRegistry = Object.keys(global.$A.eventService.$eventDefRegistry$);
            var savedEventConfigs = Object.keys(global.$A.eventService.$savedEventConfigs$);

            var errorBoxText = getErrorBoxText(global);
            if (errorBoxText) {
                failCallback(errorBoxText);
                return;
            }

            // Whatever is in Context.loaded should also be available in-memory
            var componentDefs = componentDefRegistry.concat(savedComponentConfigs);
            var contextLoadedError = validateContextLoaded(loaded, componentDefs);
            if (contextLoadedError) {
                failCallback(errorBoxText);
                return;
            }

            // Grab all defs available on client and verify the trees are complete
            var combinedDefs = componentDefRegistry.concat(savedComponentConfigs).concat(libraryRegistry).concat(eventRegistry).concat(savedEventConfigs);
            var validateTreeError = validateTree(combinedDefs);
            if (validateTreeError) {
                failCallback(validateTreeError);
                return;
            }
        }
    };
}