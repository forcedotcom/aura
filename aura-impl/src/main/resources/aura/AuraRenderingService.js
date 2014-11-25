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
 * @class The Aura Rendering Service, accessible using $A.renderingService.
 *        Renders components. The default behaviors can be customized in a
 *        client-side renderer.
 * @constructor
 */
var AuraRenderingService = function AuraRenderingService(){
    //#include aura.AuraRenderingService_private

    var renderingService = {
        /** State to avoid double-visiting components during rerender. */
        visited : undefined,
        afterRenderStack:[],

            /**
         * Renders a component by calling its renderer.
         *
         * @param {Component}
         *            components The component or component array to be rendered
         * @param {Component}
         *            parent Optional. The component's parent
         * @memberOf AuraRenderingService
         * @public
         */
        render : function AuraRenderingService$Render(components, parent) {
            //#if {"modes" : ["STATS"]}
            var startTime = (new Date()).getTime();
            //#end

            components = priv.getArray(components);
            var elements = [];

            for (var i=0; i < components.length; i++){
                var cmp = components[i];
                //JBUCH: HALO: FIXME: WE SHOULD REFUSE TO RENDER THINGS THAT AREN'T COMPONENTS
                //KRIS: HALO: This might be for component configs.
                if (!$A.util.isComponent(cmp)) {
                    // If someone passed a config in, construct it.
                    cmp = $A.componentService.newComponentDeprecated(cmp, null, false, true);
                    // And put the constructed component back into the array.
                    components[i] = cmp;
                }
                // JBUCH: HALO: TODO: END REMOVE ME

                if(!$A.util.isComponent(cmp)) {
                    $A.error("AuraRenderingService.render: 'cmp' must be a valid Component, found '" + cmp + "'.");
                }
                if (cmp.isValid()) {
                    var renderedElements = cmp.render();
                    renderedElements=priv.finishRender(cmp, renderedElements);
                    elements=elements.concat(renderedElements);
                }

            }

            priv.insertElements(elements, parent);

            //#if {"modes" : ["STATS"]}
            $A.renderingService.statsIndex["render"].push({
                'component' : components,
                'startTime' : startTime,
                'endTime' : (new Date()).getTime()
            });
            //#end

            return elements;
        },

        /**
         * The default rerenderer for components affected by an event. Call
         * superRerender() from your customized function to chain the
         * rerendering to the components in the body attribute.
         *
         * @param {Component}
         *            components The component or component array to be rerendered
         * @memberOf AuraRenderingService
         * @public
         */
        rerender : function(components) {
            //#if {"modes" : ["STATS"]}
            var startTime = (new Date()).getTime();
            //#end

            var topVisit = false;
            var visited = $A.renderingService.visited;
            if(!visited) {
                visited = $A.renderingService.visited = {};
                topVisit = true;
            }


            var elements = [];

            components = priv.getArray(components);
            for (var i = 0; i < components.length; i++) {
                var cmp = components[i];
                var id = cmp.getGlobalId();
                if (cmp.isValid()){
                    var renderedElements=[];
                    var addExistingElements=visited[id];
                    if(!visited[id]) {
                        if (cmp.isRendered()) {
                            var renderer = cmp.getRenderer();
                            var rerenderedElements=renderer.def.rerender(renderer.renderable);
                            if(rerenderedElements!=undefined){
                                renderedElements=renderedElements.concat(rerenderedElements);
                            }else{
                                addExistingElements=true;
                            }
                        } else {
                            $A.error("Aura.RenderingService.rerender: attempt to rerender component that has not been rendered.");
//                            renderedElements = this.render(cmp,referenceNode);
                        }
                        visited[id] = true;
                    }
                    if(addExistingElements){
                        renderedElements=renderedElements.concat(cmp.getElements());
                    }
                    elements=elements.concat(renderedElements);
                }
                priv.cleanComponent(id);
            }

            //#if {"modes" : ["STATS"]}
            $A.renderingService.statsIndex["rerender"].push({
                'component' : components,
                'startTime' : startTime,
                'endTime' : (new Date()).getTime()
            });
            //#end

            if (topVisit) {
                $A.renderingService.visited = undefined;
                $A.afterRender($A.renderingService.afterRenderStack);
                $A.renderingService.afterRenderStack.length=0;
            }

            return elements;
        },

        /**
         * The default behavior after a component is rendered.
         *
         * @param {component}
         *            components The component or component array that has finished rendering
         * @memberOf AuraRenderingService
         * @public
         */
        afterRender : function(components) {
            //#if {"modes" : ["STATS"]}
            var startTime = (new Date()).getTime();
            //#end

            components = priv.getArray(components);
            for(var i=0;i<components.length;i++){
                var cmp = components[i];
                if(!$A.util.isComponent(cmp)){
                    $A.error("AuraRenderingService.afterRender: 'cmp' must be a valid Component, found '"+cmp+"'.");
                }
                if(cmp.isValid()) {
                    var renderer = cmp.getRenderer();
                    renderer.def.afterRender(renderer.renderable);
                }
            }

            //#if {"modes" : ["STATS"]}
            $A.renderingService.statsIndex["afterRender"].push({
                'component' : components,
                'startTime' : startTime,
                'endTime' : (new Date()).getTime()
            });
            //#end
        },

        /**
         * The default unrenderer that deletes all the DOM nodes rendered by a
         * component's render() function. Call superUnrender() from your
         * customized function to modify the default behavior.
         *
         * @param {Component}
         *            components The component or component array to be unrendered
         * @memberOf AuraRenderingService
         * @public
         */
        unrender : function(components) {
            if (!components) {
                return;
            }

            //#if {"modes" : ["STATS"]}
            var startTime = (new Date()).getTime();
            //#end
            var visited = $A.renderingService.visited;

            components = priv.getArray(components);
            for (var i = 0; i < components.length; i++){
                var cmp = components[i];
                if (cmp.isValid() && cmp.isRendered()) {
                        var renderer = cmp.getRenderer();
                        cmp.setUnrendering(true);
                        try {
                            if(cmp.isValid()&&cmp.isRendered()) {
                                renderer.def.unrender(renderer.renderable);
                                cmp.setRendered(false);
                                if (visited) {
                                    visited[cmp.getGlobalId()] = true;
                                }
                            }
                        } finally {
                            cmp.setUnrendering(false);
                        }
                }
            }

            //#if {"modes" : ["STATS"]}
            $A.renderingService.statsIndex["unrender"].push({
                'component' : components,
                'startTime' : startTime,
                'endTime' : (new Date()).getTime()
            });
            //#end
        },

        /**
         * @protected
         *
         */
        storeFacetInfo : function(component, facet) {
            if(!$A.util.isComponent(component)) {
                $A.error("Aura.RenderingService.storeFacet: 'component' must be a valid Component. Found '" + component + "'.");
            }
            if($A.util.isComponent(facet)){
                facet=[facet];
            }
            if(!$A.util.isArray(facet)) {
                $A.error("Aura.RenderingService.storeFacet: 'facet' must be a valid Array. Found '" + facet + "'.");
            }
            component._facetInfo=facet.slice(0);
        },

        /**
         * @protected
         *
         */
        getUpdatedFacetInfo : function(component, facet) {
            if(!$A.util.isComponent(component)) {
                $A.error("Aura.RenderingService.getUpdatedFacet: 'component' must be a valid Component. Found '" + component + "'.");
            }
            if($A.util.isComponent(facet)){
                facet=[facet];
            }
            if(!$A.util.isArray(facet)){
                $A.error("Aura.RenderingService.getUpdatedFacet: 'facet' must be a valid Array. Found '"+facet+"'.");
            }
            var updatedFacet={
                components:[],
                facetInfo:[],
                useFragment:false,
                fullUnrender:false
            };
            var renderCount=0;
            if(component._facetInfo) {
                for (var i = 0; i < facet.length; i++) {
                    var child = facet[i];
                    var found = false;
                    for (var j = 0; j < component._facetInfo.length; j++) {
                        if (child && child === component._facetInfo[j]) {
                            updatedFacet.components.push({action:"rerender",component: child, oldIndex: j, newIndex: i});
                            if(j!=(i-renderCount)){
                                updatedFacet.useFragment=true;
                            }
                            found = true;
                            component._facetInfo[j] = undefined;
                            break;
                        }
                    }
                    if (!found) {
                        updatedFacet.components.push({action:"render",component: child, oldIndex: -1, newIndex: i});
                        renderCount++;
                    }
                    updatedFacet.facetInfo.push(child);
                }
                if(!updatedFacet.components.length){
                    updatedFacet.fullUnrender=true;
                }
                for (var x = 0; x < component._facetInfo.length; x++) {
                    if (component._facetInfo[x]) {
                        updatedFacet.components.unshift({action: "unrender",component: component._facetInfo[x], oldIndex: x, newIndex: -1});
                    }
                }
            }
            return updatedFacet;
        },

        renderFacet:function(component,facet,parent){
            this.storeFacetInfo(component, facet);
            var ret=this.render(facet,parent);
            if(!ret.length){
                component._marker=ret[0]=priv.createMarker(null,"render facet: " + component.getGlobalId());
            }else{
                component._marker=ret[0];
            }
            return ret;
        },
        /**
         * @protected
         */

        rerenderFacet:function(component,facet,referenceNode){
            var updatedFacet=this.getUpdatedFacetInfo(component,facet);
            var ret=[];
            var components=updatedFacet.components;
            var target=referenceNode||component._marker.parentNode;
            var calculatedPosition=0;
            var positionMarker=component._marker;
            var nextSibling=null;
            while(positionMarker.previousSibling){
                calculatedPosition++;
                positionMarker=positionMarker.previousSibling;
            }
            for(var i=0;i<components.length;i++){
                var info=components[i];
                var renderedElements=null;
                switch(info.action){
                    case "render":
                        renderedElements=this.render(info.component);
                        if(updatedFacet.useFragment){
                            ret=ret.concat(renderedElements);
                        }else if(renderedElements.length){
                            ret=ret.concat(renderedElements);
                            if(priv.isMarker(component._marker)){
                                $A.util.removeElement(component._marker);
                            }
                            component._marker=ret[0];
                            nextSibling=target.childNodes[calculatedPosition];
                            priv.insertElements(renderedElements,nextSibling||target,nextSibling,nextSibling);
                        }
                        calculatedPosition+=renderedElements.length;
                        this.afterRenderStack.push(info.component);
                        break;
                    case "rerender":
                        if(this.hasDirtyValue(info.component)){
                            renderedElements=this.rerender(info.component);
                        }else{
                            renderedElements=info.component.getElements();
                        }
                        info.component.disassociateElements();
                        priv.associateElements(info.component, renderedElements);
                        ret = ret.concat(renderedElements);
                        calculatedPosition+=renderedElements.length;
                        //JBUCH: HALO: TODO: STILL NECESSARY?
                        for(var r=0;r<renderedElements.length;r++){
                            priv.addAuraClass(component, renderedElements[r]);
                        }
                        break;
                    case "unrender":
                        if (!priv.isMarker(component._marker)) {
                            if (updatedFacet.fullUnrender || !component._marker.nextSibling) {
                                component._marker = priv.createMarker(component._marker,"unrender facet: " + component.getGlobalId());
                            } else if (info.component.isValid() && info.component.getElement() === component._marker) {
                                component._marker = component._marker.nextSibling;
                            }
                        }

                        //JBUCH: HALO: TODO: FIND OUT WHY THIS CAN BE UNRENDERING A COMPONENTDEFREF AND FIX IT
                        if ($A.util.isComponent(info.component) && info.component.isValid()) {
                            this.unrender(info.component);
                            info.component.disassociateElements();
                            priv.cleanComponent(info.component.getGlobalId());
                            if(info.component.autoDestroy()){
                               info.component.destroy();
                            }
                        }
                        break;
                }
            }
            this.storeFacetInfo(component, updatedFacet.facetInfo);
            if(updatedFacet.useFragment) {
                nextSibling = target.childNodes[calculatedPosition];
                priv.insertElements(ret,nextSibling || target, nextSibling, nextSibling);
            }

            // JBUCH: HALO: FIXME: THIS IS SUB-OPTIMAL, BUT WE NEVER WANT TO REASSOCIATE HTML COMPONENTS
            if (!component.isInstanceOf("aura:html")){
                component.disassociateElements();
                priv.associateElements(component, ret);
            }
            return ret;
        },

        unrenderFacet:function(cmp,facet){
            this.unrender(cmp._facetInfo);
            this.unrender(facet);
            this.storeFacetInfo(cmp, []);

            var elements = cmp.getElements();
            if(elements) {
                while(elements.length){
                    $A.util.removeElement(elements.pop());
                }
            }
            cmp.disassociateElements();
        },

        getMarker:function(cmp){
            return cmp._marker;
        },

        /**
         * @protected
         */
        addDirtyValue : function(expression, cmp) {
            priv.needsCleaning = true;
            if (cmp && cmp.isValid() && cmp.isRendered()) {
                var id = cmp.getConcreteComponent().getGlobalId();
                var list = priv.dirtyComponents[id];
                if (!list) {
                    list = priv.dirtyComponents[id] = {};
                }
                while(expression.indexOf('.')>-1){
                    list[expression]=true;
                    expression=expression.substring(0,expression.lastIndexOf('.'));
                }
            }
        },

        hasDirtyValue : function(cmp){
           return priv.dirtyComponents.hasOwnProperty(cmp.getConcreteComponent().getGlobalId());
        },

        /**
         * @protected
         *
         */
        isDirtyValue : function(expression, cmp) {
            if (cmp && cmp.isValid()) {
                var id = cmp.getConcreteComponent().getGlobalId();
                var list = priv.dirtyComponents[id];
                if (list && list[expression]){
                    return true;
                }
            }
            return false;
        },

        /**
         * @private
         */
        rerenderDirty : function(stackName) {
            if (priv.needsCleaning) {
                var maxiterations = 1000;
                var num = aura.getContext().incrementRender();
                var initialMarkName = "Rerendering-" + num;
                $A.Perf.mark(initialMarkName);
                $A.Perf.mark("Fired aura:doneRendering event");

                // #if {"modes" : ["PTEST","STATS"]}
                var allRerendered = [],
                    startTime,
                    cmpsWithWhy = {
                    "stackName" : stackName,
                    "components" : {}
                };
                // #end

                //KRIS: HALO:
                // If any components were marked dirty during a component rerender than
                // priv.needsCleaning will be true.
                // maxiterations to prevent run away rerenderings from crashing the browser.
                while(priv.needsCleaning && maxiterations) {
                    var dirty = [];
                    priv.needsCleaning = false;
                    maxiterations--;

                    for ( var id in priv.dirtyComponents) {
                        var cmp = $A.componentService.get(id);

                        // uncomment this to see what's dirty and why. (please don't delete me again. it burns.)
                        // $A.log(cmp.toString(), priv.dirtyComponents[id]);

                        if (cmp && cmp.isValid() && cmp.isRendered()) {
                            // We assert that we are not unrendering, as we should never be doing that, but we then check again, as in production we want to
                            // avoid the bug.
                            // JBUCH: HALO: TODO: INVESTIGATE THIS, IT SEEMS BROKEN
                            // For the moment, don't fail miserably here. This really is bad policy to allow things to occur on unrender that cause a re-render,
                            // but putting in the assert breaks code, so leave it out for the moment.

                            // aura.assert(!cmp.isUnrendering(), "Rerendering a component during unrender");
                            if (!cmp.isUnrendering()) {
                                dirty.push(cmp);

                                // KRIS: HALO:
                                // Since we never go through the renderFacet here, we don't seem
                                // to be calling afterRender
                                // But I could just be wrong, its complicated.
                                // Leaving this commented out for now till I can talk it over with JBUCH
                                //this.afterRenderStack.push(cmp);

                                // #if {"modes" : ["PTEST","STATS"]}
                                allRerendered.push(cmp);

                                cmpsWithWhy["components"][id] = {
                                    "id" : id,
                                    "descr" : cmp.getDef().getDescriptor().toString(),
                                    "why" : priv.dirtyComponents[id]
                                };
                                // #end
                            }
                        } else {
                            priv.cleanComponent(id);
                        }
                    }

                    // #if {"modes" : ["STATS"]}
                    startTime = startTime || (new Date()).getTime();
                    // #end

                    if (dirty.length) {
                        this.rerender(dirty);
                    }
                }

                //KRIS: HALO:
                // Somehow we did over 1000 rerenderings. Not just 1000 components, but one
                // component caused a rerender that caused a rerender, and on and on for 1000 times.
                if(!maxiterations) {
                    $A.error("Max Callstack Exceeded: Rerendering loop resulted in to many rerenderings.");
                }
                // #if {"modes" : ["PTEST","STATS"]}
                if(allRerendered.length) {
                    cmpsWithWhy["renderingTime"] = (new Date()).getTime() - startTime;
                    $A.renderingService.statsIndex["rerenderDirty"].push(cmpsWithWhy);
                }
                // #end


                $A.Perf.endMark(initialMarkName);
                $A.get("e.aura:doneRendering").fire();
                $A.Perf.endMark("Fired aura:doneRendering event");

                // update the mark info after the fact to avoid unnecessary hits early to get cmp info
                // #if {"modes" : ["PTEST","STATS"]}
                var markDescription = initialMarkName + ": [";
                for (var m = 0; m < allRerendered.length; m++) {
                    var rerenderedCmpDef = allRerendered[m].getDef();
                    if (rerenderedCmpDef) {
                        markDescription += "'" + rerenderedCmpDef.descriptor.getQualifiedName() + "'";
                    }
                    if (m < dirty.length - 1) {
                        markDescription += ",";
                    }
                }
                markDescription += "]";
                $A.Perf.updateMarkName(initialMarkName, markDescription);
                // #end
            }
        },

        /**
         * @deprecated
         * @protected
         */
        removeDirtyValue: function(value) {
            var cmp = value.owner;
            if(cmp && cmp.isValid()){
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

        //#if {"modes" : ["PTEST","STATS"]}
        ,
        statsIndex : {
            "afterRender": [],
            "render": [],
            "rerender": [],
            "rerenderDirty": [],
            "unrender": []
        }
        //#end
    };

    //#include aura.AuraRenderingService_export

    return renderingService;
};
