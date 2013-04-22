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
 * @class The Aura Rendering Service, accessible using $A.renderingService.  Renders components. 
 * The default behaviors can be customized in a client-side renderer.
 * @constructor
 */
var AuraRenderingService = function AuraRenderingService(){
    //#include aura.AuraRenderingService_private

    var renderingService = {
    		/**
    		 * @private
    		 */
        rerenderDirty : function(){
            if (priv.needsCleaning) {
                $A.mark("RenderingService.rerenderDirty");
                priv.needsCleaning = false;

                var cmps = [];
                for (var id in priv.dirtyComponents) {
                    var cmp = $A.componentService.get(id);
                    // uncomment this to see what's dirty and why.  (please don't delete me again.  it burns.)
//                    $A.log(cmp.toString(), priv.dirtyComponents[id]);
                    if (cmp && cmp.isValid() && cmp.isRendered()) {
                        //
                        // We assert that we are not unrendering, as we should never be doing that,
                        // but we then check again, as in production we want to avoid the bug.
                        //
                        // For the moment, don't fail miserably here. This really is bad policy to allow
                        // things to occur on unrender that cause a re-render, but putting in the assert
                        // breaks code, so leave it out for the moment.
                        //
                        // aura.assert(!cmp.isUnrendering(), "Rerendering a component during unrender");
                        if (!cmp.isUnrendering()) {
                            cmps.push(cmp);
                        }
                    }else{
                        priv.cleanComponent(id);
                    }
                }
                this.rerender(cmps);

                $A.measure("Finished rerendering", "RenderingService.rerenderDirty");
                $A.get("e.aura:doneRendering").fire();
                $A.measure("Fired aura:doneRendering event", "RenderingService.rerenderDirty");
            }
        },

        /**
         * Renders a component by calling its renderer. 
         * @param {Component} component
         * 				The component to be rendered
         * @param {Component} parent
         * 				Optional. The component's parent
         * @memberOf AuraRenderingService
         * @public
         */
        render: function AuraRenderingService$Render(component, parent) {
            if (component._arrayValueRef) {
                component = component._arrayValueRef;
            }

            if (component.auraType === "Value" && component.toString() === "ArrayValue"){
                return component.render(parent, priv.insertElements);
            }

            var ret = [];
            var array = priv.getArray(component);

            for (var x=0; x < array.length; x++){
                var cmp = array[x];

                if (!cmp["getDef"]) {
                    // If someone passed a config in, construct it.
                    cmp = $A.componentService.newComponent(cmp, null, false, true);

                    // And put the constructed component back into the array.
                    array[x] = cmp;
                }

                var renderer = cmp.getRenderer();
                var elements = renderer.def.render(renderer.renderable) || [];

                priv.finishRender(cmp, elements, ret, parent);
            }

            priv.insertElements(ret, parent);

            return ret;
        },

        /**
         * The default behavior after a component is rendered.
         * @param {Component} component
         * 				The component that has finished rendering
         * @memberOf AuraRenderingService
         * @public
         */
        afterRender: function(component){
            var array = priv.getArray(component);
            for(var i=0;i<array.length;i++){
                var cmp = array[i];
                if (cmp.isValid()) {
                    var renderer = cmp.getRenderer();
                    renderer.def.afterRender(renderer.renderable);
                }
            }

        },

        /**
         * The default rerenderer for components affected by an event.
         * Call superRerender() from your customized function to chain the rerendering to the components in the body attribute.
         * @param {Component} component
         * 				The component to be rerendered
         * @param {Component} referenceNode
         * 				The reference node for the component
         * @param {Component} appendChild
         * 				The child component
         * @memberOf AuraRenderingService
         * @public
         */
        rerender: function(component, referenceNode, appendChild) {
            if (component._arrayValueRef) {
                component = component._arrayValueRef;
            }

            if (component.auraType === "Value" && component.toString() === "ArrayValue"){
                component.rerender(referenceNode, appendChild, priv.insertElements);
                return;
            }

            var array = priv.getArray(component);
            for (var i = 0; i < array.length; i++){
                var cmp = array[i];
                var renderer = cmp.getRenderer();
                renderer.def.rerender(renderer.renderable);
                priv.cleanComponent(cmp.getGlobalId());
            }
        },

        /**
         * The default unrenderer that deletes all the DOM nodes rendered by a component's render() function.
         * Call superUnrender() from your customized function to modify the default behavior.
         * @param {Component} component
         * 				The component to be unrendered
         * @memberOf AuraRenderingService
         * @public
         */
        unrender: function(component){
            if (!component){
                return;
            }

            if (component.auraType === "Value" && component.toString() === "ArrayValue"){
            	component.unrender();
            }

            var array = priv.getArray(component);
            for (var i = 0; i < array.length; i++){
                var c = array[i];
                if (c.isValid() && c.isRendered()) {
                    var renderer = c.getRenderer();
                    c.setUnrendering(true);
                    try {
                        renderer.def.unrender(renderer.renderable);
                        c.setRendered(false);
                    } finally {
                        c.setUnrendering(false);
                    }
                }
            }
        },

        /**
         * @protected
         */
        addDirtyValue: function(value) {
            priv.needsCleaning = true;
            var cmp = value.owner;
            if(cmp){
                var id = cmp.getConcreteComponent().getGlobalId();
                var list = priv.dirtyComponents[id];
                if (!list) {
                    list = [value];
                    priv.dirtyComponents[id] = list;
                } else {
                    list.push(value);
                }
            }
        },

        /**
         * @protected
         */
        removeDirtyValue: function(value) {
            var cmp = value.owner;
            if(cmp){
                var id = cmp.getConcreteComponent().getGlobalId();
                var a = priv.dirtyComponents[id];
                if (a) {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i] === value) {
                            a.splice(i, 1);
                            break;
                        }
                    }
                    if (a.length === 0) {
                        delete priv.dirtyComponents[id];
                    }
                }
            }
        }
    };
    //#include aura.AuraRenderingService_export

    return renderingService;
};
