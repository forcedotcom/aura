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
function lib() { //eslint-disable-line no-unused-vars

    var SHARED_SINGLETON = null;

    function createContainerManagerInstance(wrapper) {
        var CONTAINERS_DEF = {}; // Definitions of registered panels 

        // Parent cmp that will hold all children containers
        // This needs to be set before any rendering operation
        var CONTAINER_WRAPPER_CMP = wrapper || null; 

        // Private methods
        function createInstanceFromDef(containerDef, containerConfig, containerVP) {

            // clone the config in case upstream callers re-use config
            var clonedConfig = $A.util.apply({}, containerConfig, true, true); 
            var clonedDef = $A.util.apply({}, containerDef, true, true); // clone the cmp def

            // Remove flavor from attrubutes before merge
            clonedDef.flavor = clonedConfig.flavor;
            delete clonedConfig.flavor; 

            $A.util.apply(clonedDef.attributes.values, clonedConfig); // merge panel config with DefRef
            clonedDef["attributes"]["valueProvider"] = containerVP;
            return $A.createComponentFromConfig(clonedDef);
        }

        function renderContainer(containerWrapper, newContainer) {
            if(containerWrapper.isValid()) {
                var children = containerWrapper.get('v.body'),
                    dom      = containerWrapper.getElement();

                $A.render(newContainer, dom);
                $A.afterRender(newContainer);
                children.push(newContainer);
                containerWrapper.set('v.body', children, true /* dont mark it dirty for rendering */);
            }
        }

        // Public methods
        return {
            // Register cmp definitions
            registerContainers: function (containersDefs) {
                var panels = containersDefs || [];
                for (var i = 0; i < panels.length; ++i) {
                    var panel = panels[i];
                    panel.attributes = panel.attributes || {values:{}};
                    var alias = panel.attributes && panel.attributes.values.alias;
                    var name  = alias && alias.value || panel.componentDef.descriptor.split(':').pop();
                    if (!CONTAINERS_DEF[name]) {
                        CONTAINERS_DEF[name] = panel;    
                    } else {
                        $A.warning('Container Definition already exist.');
                    }
                }
            },
            createContainer: function (config) {
                var container   = config.container,
                containerType   = config.containerType,
                containerVP     = config.containerValueProvider,
                containerDef    = containerType && CONTAINERS_DEF[containerType],
                containerConfig = config.containerConfig || {};

                $A.assert(container || containerDef, 'Invalid container');
                if (!container) { // ComponentDef
                    container = createInstanceFromDef(containerDef, containerConfig, containerVP);
                }

                $A.assert($A.util.isComponent(container), 'Container needs to be of the type Component');

                return container;
            },
            renderContainer: function (container, config) {
                config || (config = {});
                $A.assert(container, 'Container not provided');
                $A.assert(CONTAINER_WRAPPER_CMP, 'No cmp wrapper has been set');

                renderContainer(this.getContainerWrapper(), container);

                if (config.visible) {
                    config.onBeforeShow && config.onBeforeShow(container);
                    container.show(function () {
                        config.onAfterShow && config.onAfterShow(container);
                    });
                }
            },
            destroyContainer: function (container) {
                var containerWrapper  = this.getContainerWrapper(),
                    children = containerWrapper.get('v.body'),
                    index    = children.indexOf(container);

                children.splice(index, 1);
                containerWrapper.set('v.body', children, true);
                return container.destroy();
            },
            getContainerWrapper: function () {
                return CONTAINER_WRAPPER_CMP;
            },
            getRegisteredContainers: function () {
                return CONTAINERS_DEF;
            },
            setContainerWrapper: function (containerWrapperCmp) {
                $A.assert($A.util.isComponent(containerWrapperCmp), 'Container wrapper has to be a type Component');
                CONTAINER_WRAPPER_CMP = containerWrapperCmp;
            }
        };
    }

    return {
        getSharedInstance: function () {
            if (!SHARED_SINGLETON) {
                SHARED_SINGLETON = createContainerManagerInstance();
            }
            return SHARED_SINGLETON;
        },
        createInstance: function (wrapper) {
            return createContainerManagerInstance(wrapper);
        }
    };
}