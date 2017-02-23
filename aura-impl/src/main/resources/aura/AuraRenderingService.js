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
/**
 * @class The Aura Rendering Service, accessible using <code>$A.renderingService</code>.
 *        Renders components. The default behaviors can be customized in a
 *        client-side renderer.
 * @constructor
 * @export
 */
function AuraRenderingService() {
    this.visited = undefined;
    this.afterRenderStack = [];
    this.dirtyComponents = {};
    // KRIS: HALO: HACK:
    // IE11 is not returning the Object.keys() for dirtyComponents in the order they were added.
    // So we rerender dirty out of order.
    // This array assures we rerender in the order that we add keys to the array.
    // Ideally, we shouldn't care what order we rerender in, but that's a more difficult bug to track down in 194/patch
    this.dirtyComponentIds = [];
    this.needsCleaning = false;
    this.markerToReferencesMap = {};

    // For elements that do not have a data-aura-rendered-by attribute, we'll add a unique identifier.
    this.DATA_UID_KEY = "data-rendering-service-uid";
    this.uid = 1;
}

/**
 * Renders a component by calling its renderer.
 *
 * @param {Component}
 *            components The component or component array to be rendered
 * @param {Component}
 *            parent Optional. The component's parent
 * @memberOf AuraRenderingService
 * @public
 * @export
 */
AuraRenderingService.prototype.render = function(components, parent) {
    //#if {"modes" : ["STATS"]}
    var startTime = (new Date()).getTime();
    //#end

    components = this.getArray(components);
    var elements = [];

    for (var i=0; i < components.length; i++){
        var cmp = components[i];
        //JBUCH: HALO: FIXME: WE SHOULD REFUSE TO RENDER THINGS THAT AREN'T COMPONENTS
        //KRIS: HALO: This might be for component configs.
        if (!$A.util.isComponent(cmp)) {
            // If someone passed a config in, construct it.
            cmp = $A.componentService.createComponentPriv(cmp);
            // And put the constructed component back into the array.
            components[i] = cmp;

            if(!$A.util.isComponent(cmp)) {
                throw new $A.auraError("AuraRenderingService.render: 'cmp' must be a valid Component, found '" + cmp + "'.", null, $A.severity.QUIET);
            }
        }
        // JBUCH: HALO: TODO: END REMOVE ME

        if (cmp.isValid()) {
            $A.getContext().setCurrentAccess(cmp);
            try {
                var renderedElements = cmp["render"]();
                renderedElements=this.finishRender(cmp, renderedElements);
                elements = elements.concat(renderedElements);
            } catch (e) {
                if (e instanceof $A.auraError && e["component"]) {
                    throw e;
                } else {
                    var descriptor = cmp.getDef().getDescriptor().toString();
                    var ae = new $A.auraError("render threw an error in '" + descriptor + "'", e);
                    ae.setComponent(descriptor);
                    ae["componentStack"] = $A.util.getComponentHierarchy(cmp);
                    $A.lastKnownError = ae;
                    throw ae;
                }
            } finally {
                $A.getContext().releaseCurrentAccess();
            }
        }
    }

    if(parent) {
        $A.util.appendChild(elements, parent);
    }

    //#if {"modes" : ["STATS"]}
    this.statsIndex["render"].push({
        'component' : components,
        'startTime' : startTime,
        'endTime' : (new Date()).getTime()
    });
    //#end

    return elements;
};

/**
 * The default rerenderer for components affected by an event. Call
 * superRerender() from your customized function to chain the
 * rerendering to the components in the body attribute.
 *
 * @param {Component}
 *            components The component or component array to be rerendered
 * @memberOf AuraRenderingService
 * @public
 * @export
 */
AuraRenderingService.prototype.rerender = function(components) {
    //#if {"modes" : ["STATS"]}
    var startTime = (new Date()).getTime();
    //#end

    var topVisit = false;
    var visited = this.visited;
    if(!visited) {
        visited = this.visited = {};
        topVisit = true;
    }


    var elements = [];

    components = this.getArray(components);
    var context=$A.getContext();
    for (var i = 0; i < components.length; i++) {
        var cmp = components[i];
        var id = cmp.getGlobalId();
        if (cmp.isValid()){
            var renderedElements=[];
            var addExistingElements=visited[id];
            if(!visited[id]) {
                if(!cmp.isRendered()) {
                    throw new $A.auraError("Aura.RenderingService.rerender: attempt to rerender component that has not been rendered.", null, $A.severity.QUIET);
                }
                var rerenderedElements = undefined;
                context.setCurrentAccess(cmp);
                try {
                    rerenderedElements=cmp["rerender"]();
                } catch (e) {
                    if (e instanceof $A.auraError && e["component"]) {
                        throw e;
                    } else {
                        var descriptor = cmp.getDef().getDescriptor().toString();
                        var ae = new $A.auraError("rerender threw an error in '" + descriptor + "'", e);
                        ae.setComponent(descriptor);
                        ae["componentStack"] = $A.util.getComponentHierarchy(cmp);
                        $A.lastKnownError = ae;
                        throw ae;
                    }
                } finally {
                    context.releaseCurrentAccess();
                    if(rerenderedElements!=undefined){//eslint-disable-line eqeqeq
                        renderedElements=renderedElements.concat(rerenderedElements);
                    }else{
                        addExistingElements=true;
                    }
                }
                visited[id] = true;
            }
            if(addExistingElements){
                renderedElements=renderedElements.concat(this.getElements(cmp));
            }
            elements=elements.concat(renderedElements);
        }
        this.cleanComponent(id);
    }
    //#if {"modes" : ["STATS"]}
    this.statsIndex["rerender"].push({
        'component' : components,
        'startTime' : startTime,
        'endTime' : (new Date()).getTime()
    });
    //#end

    if (topVisit) {
        this.visited = undefined;
        this.afterRender(this.afterRenderStack);
        this.afterRenderStack.length=0;
        for(var r=0;r<components.length;r++){
            components[r].fire("render");
        }
    }

    return elements;
};

/**
 * The default behavior after a component is rendered.
 *
 * @param {component}
 *            components The component or component array that has finished rendering
 * @memberOf AuraRenderingService
 * @public
 * @export
 */
AuraRenderingService.prototype.afterRender = function(components) {
    //#if {"modes" : ["STATS"]}
    var startTime = (new Date()).getTime();
    //#end

    components = this.getArray(components);
    var context=$A.getContext();
    for(var i=0;i<components.length;i++){
        var cmp = components[i];
        if(!$A.util.isComponent(cmp)) {
            throw new $A.auraError("AuraRenderingService.afterRender: 'cmp' must be a valid Component, found '"+cmp+"'.", null, $A.severity.QUIET);
        }
        if(cmp.isValid()) {
            context.setCurrentAccess(cmp);
            try {
                cmp["afterRender"]();
                cmp.fire("render");
            } catch (e) {
                // The after render routine threw an error, so we should
                //  (a) log the error
                if (e instanceof $A.auraError && e["component"]) {
                        throw e;
                } else {
                    var descriptor = cmp.getDef().getDescriptor().toString();
                    var ae = new $A.auraError("afterRender threw an error in '" + descriptor + "'", e);
                    ae.setComponent(descriptor);
                    ae["componentStack"] = $A.util.getComponentHierarchy(cmp);
                    $A.lastKnownError = ae;
                    throw ae;
                }
                //  (b) mark the component as possibly broken.
                //  FIXME: keep track of component stability
            } finally {
                context.releaseCurrentAccess(cmp);
            }
        }
    }

    //#if {"modes" : ["STATS"]}
    this.statsIndex["afterRender"].push({
        'component' : components,
        'startTime' : startTime,
        'endTime' : (new Date()).getTime()
    });
    //#end
};

/**
 * The default unrenderer that deletes all the DOM nodes rendered by a
 * component's render() function. Call superUnrender() from your
 * customized function to modify the default behavior.
 *
 * @param {Component}
 *            components The component or component array to be unrendered
 * @memberOf AuraRenderingService
 * @public
 * @export
 */
AuraRenderingService.prototype.unrender = function(components) {
    if (!components) {
        return;
    }

    //#if {"modes" : ["STATS"]}
    var startTime = (new Date()).getTime();
    //#end
    var visited = this.visited;

    components = this.getArray(components);
    var context=$A.getContext();
    var cmp;
    var container;
    var beforeUnrenderElements;
    for (var i = 0,length=components.length; i < length; i++){
        cmp = components[i];
        if ($A.util.isComponent(cmp) && cmp.destroyed!==1 && cmp.isRendered()) {
            cmp.setUnrendering(true);
            context.setCurrentAccess(cmp);

                // Use the container to check if we're in the middle of unrendering a parent component.
                // Sometimes that is not available, so otherwise move to considering the owner.
                container = cmp.getContainer() || cmp.getOwner();

                // If the parent is NOT unrendering, then remove these and unrender it's children.
                // In the unrenderFacets function, those elements won't be removed from the DOM since their parents here
                // are getting removed.
                if(container && !container.getConcreteComponent().isUnrendering()) {
                    // This is the top of the unrendering tree.
                    // Save the elements we want to remove, so they can be deleted after the unrender is called.
                    beforeUnrenderElements = cmp.getElements();
                } else {
                    beforeUnrenderElements = null;
                }

            try {
                cmp["unrender"]();
            } catch (e) {
                if (e instanceof $A.auraError && e["component"]) {
                    throw e;
                } else {
                    var descriptor = cmp.getDef().getDescriptor().toString();
                    var ae = new $A.auraError("unrender threw an error in '" + descriptor + "'", e);
                    ae.setComponent(descriptor);
                    ae["componentStack"] = $A.util.getComponentHierarchy(cmp);
                    $A.lastKnownError = ae;
                    throw ae;
                }
            } finally {
                context.releaseCurrentAccess(cmp);

                this.removeElement(this.getMarker(cmp), container);

                // If we have beforeUnrenderElements, then we're in a component that should have its
                // elements removed, and those elements are the ones in beforeUnrenderElements.
                if(beforeUnrenderElements && beforeUnrenderElements.length) {
                    for(var c=0,len=beforeUnrenderElements.length;c<len;c++) {
                        $A.util.removeElement(beforeUnrenderElements[c], container);
                    }
                }

                if (cmp.destroyed!==1) {
                    cmp.setRendered(false);
                    if (visited) {
                        visited[cmp.getGlobalId()] = true;
                    }
                    cmp.setUnrendering(false);
                }
            }
        }
    }

    //#if {"modes" : ["STATS"]}
    this.statsIndex["unrender"].push({
        'component' : components,
        'startTime' : startTime,
        'endTime' : (new Date()).getTime()
    });
    //#end
};

/**
 * @private
 * @memberOf AuraRenderingService
 *
 * @param {Component} component the component for which we are storing the facet.
 * @param {Object} facet the component or array of components to store.
 */
AuraRenderingService.prototype.storeFacetInfo = function(component, facet) {
    if(!$A.util.isComponent(component)) {
        throw new $A.auraError("Aura.RenderingService.storeFacet: 'component' must be a valid Component. Found '" + component + "'.", null, $A.severity.QUIET);
    }
    if($A.util.isComponent(facet)){
        facet=[facet];
    }
    if(!$A.util.isArray(facet)) {
        throw new $A.auraError("Aura.RenderingService.storeFacet: 'facet' must be a valid Array. Found '" + facet + "'.", null, $A.severity.QUIET);
    }
    component._facetInfo=facet.slice(0);
};

/**
 * @private
 * @memberOf AuraRenderingService
 */
AuraRenderingService.prototype.getUpdatedFacetInfo = function(component, facet) {
    if(!$A.util.isComponent(component)) {
        throw new $A.auraError("Aura.RenderingService.getUpdatedFacetInfo: 'component' must be a valid Component. Found '" + component + "'.", null, $A.severity.QUIET);
    }
    if($A.util.isComponent(facet)){
        facet=[facet];
    }
    if(!$A.util.isArray(facet)){
        //#if {"excludeModes" : ["PRODUCTION"}
        $A.warning("Aura.RenderingService.getUpdatedFacetInfo: 'facet' should be a valid Array. Found '" +
            facet + "' in '" + component + "'.");
        //#end
        facet = [];
    }
    var updatedFacet={
        components:[],
        facetInfo:[],
        useFragment:false,
        fullUnrender:false
    };
    var renderCount=0;
    if(component._facetInfo) {
        var jmax = 0;
        for (var i = 0; i < facet.length; i++) {
            var child = facet[i];
            // Guard against undefined/null facets, as these will cause troubles later.
            if (child) {
                var found = false;
                for (var j = 0; j < component._facetInfo.length; j++) {
                    if (child === component._facetInfo[j]) {
                        updatedFacet.components.push({action:"rerender",component: child, oldIndex: j, newIndex: i});
                        // If the child is in a different position AND the order is different
                        if((j!==(i-renderCount)) && (j < jmax)){
                            updatedFacet.useFragment=true;
                        }
                        jmax = j;
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
};

/**
 * @public
 * @param {Component} component the component for which we are rendering the facet.
 * @param {Component} facet the facet to render.
 * @param {Component} parent (optional) the parent for the facet.
 * @export
 */
AuraRenderingService.prototype.renderFacet = function(component, facet, parent) {
    var ret = this.render(facet, parent);
    this.storeFacetInfo(component, facet);

    if(!ret.length) {
        if(parent) {
            this.setMarker(component, parent);
        } else {
            this.setMarker(component, ret[0]=this.createMarker(null,"render facet: " + component.getGlobalId()));
        }
    }else if(parent) {
        this.setMarker(component, parent);
    } else {
        this.setMarker(component, ret[0]);
    }
    return ret;
};

/**
 * @public
 * @param {Component} component the component for which we are rendering the facet.
 * @param {Component} facet the facet to render.
 * @param {HTMLElement} referenceNode the reference node for insertion
 * @export
 */
AuraRenderingService.prototype.rerenderFacet = function(component, facet, referenceNode) {
    var updatedFacet=this.getUpdatedFacetInfo(component,facet);
    var ret=[];
    var marker = this.getMarker(component);
    var components=updatedFacet.components;
    var target=referenceNode||marker.parentNode;
    var calculatedPosition=0;
    var positionMarker=marker;
    var nextSibling=null;
    // If the parent is NOT my marker then look inside to find it's position.
    if(positionMarker !== target) {
        while(positionMarker.previousSibling){
            calculatedPosition++;
            positionMarker=positionMarker.previousSibling;
        }
    }
    for(var i=0;i<components.length;i++){
        var info=components[i];
        var renderedElements=null;
        if (!info.component.isValid() && info.action !== 'unrender') {
            continue;
        }
        switch(info.action){
            case "render":
                renderedElements=this.render(info.component);
                if(updatedFacet.useFragment){
                    ret=ret.concat(renderedElements);
                }else if(renderedElements.length){
                    ret=ret.concat(renderedElements);
                    marker = this.getMarker(component);
                    if(this.isCommentMarker(marker)){
                        this.removeElement(marker);
                    }
                    this.setMarker(component, ret[0]);
                    nextSibling=target.childNodes[calculatedPosition];
                    this.insertElements(renderedElements,nextSibling||target,nextSibling,nextSibling);
                }
                calculatedPosition+=renderedElements.length;
                this.afterRenderStack.push(info.component);
                break;
            case "rerender":
                // rerender on every aura:expression is a hack.
                // rerender is needed here when aura:expression has newly rendered elements in its facet
                // to make the containing component be able to associate with the new elements.
                if (this.hasDirtyValue(info.component) || info.component.getType() === "aura:expression") {
                    renderedElements=this.rerender(info.component);
                } else {
                    // This must use component.getElements() not this.getElements()
                    // Since we need a copy of the array.
                    renderedElements=this.getAllElementsCopy(info.component);
                }
                info.component.disassociateElements();
                this.associateElements(info.component, renderedElements);
                ret = ret.concat(renderedElements);
                calculatedPosition+=renderedElements.length;
                break;
            case "unrender":
                marker = this.getMarker(component);
                if (!this.isCommentMarker(marker)) {
                    if (updatedFacet.fullUnrender || !marker.nextSibling) {
                        this.setMarker(component, this.createMarker(marker,"unrender facet: " + component.getGlobalId()));
                    } else {
                        var allElements = this.getAllElements(info.component);
                        if (info.component.isValid() && allElements[0] === marker) {
                            // We can't just assume the nextSibling, it could belong to what we're unrendering.
                            // Find the next element that this unrendering component does not own.
                            var count = allElements.length - 1;
                            nextSibling = marker.nextSibling;
                            while(count && nextSibling.nextSibling) {
                                nextSibling = nextSibling.nextSibling;
                                count--;
                            }
                            this.setMarker(component, nextSibling);
                        }
                    }
                }

                //JBUCH: HALO: TODO: FIND OUT WHY THIS CAN BE UNRENDERING A COMPONENTDEFREF AND FIX IT
                if ($A.util.isComponent(info.component) && info.component.isValid()) {
                    this.unrender(info.component);
                    info.component.disassociateElements();
                    this.cleanComponent(info.component.getGlobalId());
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
        this.insertElements(ret,nextSibling || target, nextSibling, nextSibling);
    }

    // JBUCH: HALO: FIXME: THIS IS SUB-OPTIMAL, BUT WE NEVER WANT TO REASSOCIATE HTML COMPONENTS
    var type = component.getType();
    if (type!=="aura:html"){
        component.disassociateElements();
        this.associateElements(component, ret);
    }
    return ret;
};

/**
 * @public
 * @param {Component} cmp the component for which we are unrendering the facet.
 * @param {Component} facet the facet to unrender.
 * @export
 */
AuraRenderingService.prototype.unrenderFacet = function(cmp,facet){
    if (cmp._facetInfo) {
        this.unrender(cmp._facetInfo);
        cmp._facetInfo = null;
    }

    if(facet) {
        this.unrender(facet);
    }

    var elements = this.getAllElements(cmp);
    var element;
    if(elements) {
        var globalId = cmp.getGlobalId();
        for(var c=elements.length-1;c>=0;c--) {
            element = elements[c];
            this.removeMarkerReference(element, globalId);
            this.removeElement(element, cmp);
        }
    }

    cmp.disassociateElements();
};

/**
 * Get a marker for a component.
 *
 * @public
 * @param {Component} cmp the component for which we want a marker.
 * @return the marker.
 * @export
 */
AuraRenderingService.prototype.getMarker = function(cmp){
    if(!cmp||cmp.destroyed===1) { return null; }

    return cmp.getConcreteComponent()._marker;
};

AuraRenderingService.prototype.setMarker = function(cmp, newMarker) {
    if(!cmp) { return; }
    var concrete = cmp.getConcreteComponent();
    var oldMarker = this.getMarker(concrete);

    // Shouldn't hit this. I can't hit it anymore.
    if(oldMarker === newMarker) {
        return;
    }

    // Html and Text Markers are special parts of the framework.
    // They always have a 1 to 1 mapping from component to element|textnode, and will never
    // use a comment marker. So no need to add overhead of tracking markers just for these component types.
    var type = cmp.getType();
    if(type!=="aura:html") {
        $A.renderingService.addMarkerReference(newMarker, concrete.getGlobalId());
    }
    if(oldMarker) {
        $A.renderingService.removeMarkerReference(oldMarker, concrete.getGlobalId());
    }

    // Clear it out!
    if(!newMarker) {
        concrete._marker = null;
    } else {
        concrete._marker = newMarker;
    }
};

/**
 * @protected
 * @param expression the expression to mark as dirty.
 * @param cmp the owning component.
 */
AuraRenderingService.prototype.addDirtyValue = function(expression, cmp) {
    this.needsCleaning = true;
    if (cmp && cmp.isValid() && cmp.isRendered()) {
        var id = cmp.getGlobalId();
        var list = this.dirtyComponents[id];
        if (!list) {
            list = this.dirtyComponents[id] = {};
            this.dirtyComponentIds.push(id);
        }
        while(expression.indexOf('.')>-1){
            list[expression]=true;
            expression=expression.substring(0,expression.lastIndexOf('.'));
        }
    }
};

/**
 * Does a component have a dirty value?.
 *
 * Only used by component to figure out if it is dirty... Maybe we should move this to component?
 *
 * @protected
 * @param cmp the component to check.
 */
AuraRenderingService.prototype.hasDirtyValue = function(cmp){
   return this.dirtyComponents.hasOwnProperty(cmp.getGlobalId());
};

/**
 * @protected
 */
AuraRenderingService.prototype.isDirtyValue = function(expression, cmp) {
    if (cmp && cmp.isValid()) {
        var id = cmp.getGlobalId();
        var list = this.dirtyComponents[id];
        if (list && list[expression]){
            return true;
        }
    }
    return false;
};

/**
 * Rerender all dirty components.
 *
 * Called from ClientService when we reach the top of stack.
 *
 * @protected
 * @export
 */
AuraRenderingService.prototype.rerenderDirty = function(stackName) {
    if (this.needsCleaning) {
        var maxiterations = 1000;

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
        // this.needsCleaning will be true.
        // maxiterations to prevent run away rerenderings from crashing the browser.
        while(this.needsCleaning && maxiterations) {
            var dirty = [];
            this.needsCleaning = false;
            maxiterations--;

            while(this.dirtyComponentIds.length) {
                var id = this.dirtyComponentIds.shift();
                var cmp = $A.componentService.get(id);

                // uncomment this to see what's dirty and why. (please don't delete me again. it burns.)
                // $A.log(cmp.toString(), this.dirtyComponents[id]);

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
                            "why" : this.dirtyComponents[id]
                        };
                        // #end
                    }
                } else {
                    this.cleanComponent(id);
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
        $A.assert(maxiterations, "Max Callstack Exceeded: Rerendering loop resulted in to many rerenderings.");

        // #if {"modes" : ["PTEST","STATS"]}
        if (allRerendered.length) {
            cmpsWithWhy["renderingTime"] = (new Date()).getTime() - startTime;
            this.statsIndex["rerenderDirty"].push(cmpsWithWhy);
        }
        // #end
        $A.eventService.getNewEvent("markup://aura:doneRendering").fire();
    }
};

/**
 * @deprecated
 * @protected
 */
AuraRenderingService.prototype.removeDirtyValue = function(value, cmp) {
    if (cmp && cmp.isValid()) {
        var id = cmp.getGlobalId();
        var dirtyAttributes = this.dirtyComponents[id];
        if (dirtyAttributes) {
            if (dirtyAttributes[value]) {
                delete dirtyAttributes[value];
            }

            if ($A.util.isEmpty(dirtyAttributes)) {
                delete this.dirtyComponents[id];
                for (var i = 0; i < this.dirtyComponentIds.length; i++) {
                    if (this.dirtyComponentIds[i] === id) {
                        return this.dirtyComponentIds.splice(i, 1);
                    }
                }
            }
        }
    }
};

//#if {"modes" : ["PTEST","STATS"]}
AuraRenderingService.prototype.statsIndex = {
    "afterRender": [],
    "render": [],
    "rerender": [],
    "rerenderDirty": [],
    "unrender": []
};
//#end
//
AuraRenderingService.prototype.cleanComponent = function(id) {
    delete this.dirtyComponents[id];
};

/**
 * @private
 * @param things either an array or an item.
 * @return an array.
 */
AuraRenderingService.prototype.getArray = function(things) {
    if (!$A.util.isArray(things)) {
        return things?[things]:[];
    }
    return things;
};

/**
 * If a renderer returned a string, create html elements from that string.
 *
 * Returns an elements array, either the original one passed in or a new one
 * if "elements" passed in was a string, not an array.
 *
 * @private
 */
AuraRenderingService.prototype.evalStrings = function(elements) {
    if ($A.util.isString(elements)) {
        elements=$A.util.createElementsFromMarkup(elements);
    }
    return elements || [];
};

AuraRenderingService.prototype.finishRender = function(cmp, elements) {
    elements = this.evalStrings(elements);

    this.associateElements(cmp, elements);

    cmp.setRendered(true);

    this.cleanComponent(cmp.getGlobalId());

    return elements;
};

/**
 * Insert elements to the DOM, relative to a reference node,
 * by default as its last child.
 *
 * @private
 */
AuraRenderingService.prototype.insertElements = function(elements, refNode, asSibling, asFirst) {
    if (refNode) {
        if (asSibling) {
            if (asFirst) {
                $A.util.insertBefore(elements, refNode);
            } else {
                $A.util.insertAfter(elements, refNode);
            }
        } else {
            if (asFirst) {
                $A.util.insertFirst(elements, refNode);
            } else {
                $A.util.appendChild(elements, refNode); // Default
            }
        }
    }
};

/**
 * Calculates the flavor css class name for a component instance and element.
 * @private
 */
AuraRenderingService.prototype.getFlavorClass = function(cmp) {
    var flavor = null; // keep in mind here, flavor may get set to "" if it was given a value of {!remove}
    var staticFlavorable = cmp.isFlavorable(); // aura:flavorable="true" on html elements
    var dynamicFlavorable = cmp.getDef().isDynamicallyFlavorable(); // dynamicallyFlavorable="true" on cmp def
    var valueProvider = dynamicFlavorable ? cmp : cmp.getComponentValueProvider();

    if (valueProvider && (staticFlavorable || dynamicFlavorable)) {
        if (valueProvider.getConcreteComponent()) { // check if flavor of an extensible cmp was set on child cmp instance
            flavor = valueProvider.getConcreteComponent().getFlavor();
        }

        if ($A.util.isUndefinedOrNull(flavor)) {
            flavor = valueProvider.getFlavor();
        }

        if (!$A.util.isUndefinedOrNull(flavor) && $A.util.isExpression(flavor)) { // deal with expressions
            flavor = flavor.evaluate();
        }

        if (staticFlavorable && !$A.util.isUndefinedOrNull(flavor)) {
            return $A.util.buildFlavorClass(valueProvider, flavor);
        } else if (dynamicFlavorable) {
            var flavorClasses = [];
            var dynamicallyFlavorableDefs = cmp.getDef().getDynamicallyFlavorable();
            for (var i = 0, len = dynamicallyFlavorableDefs.length; i < len; i++) {
                var def = dynamicallyFlavorableDefs[i];
                var defFlavor = !$A.util.isUndefinedOrNull(flavor) ? flavor : def.getDefaultFlavor();
                if (!$A.util.isUndefinedOrNull(defFlavor)) {
                    flavorClasses.push($A.util.buildFlavorClass(def, defFlavor));
                }
            }

            return flavorClasses.join(" ");
        }
    }

    return null;
};

AuraRenderingService.prototype.addAuraClass = function(cmp, element){
    var concrete = cmp.getConcreteComponent();
    var className = concrete.getDef().getStyleClassName(); // the generic class name applied to all instances of this component
    var flavorClassName;

    if (className) {
        flavorClassName = this.getFlavorClass(concrete);
        if (flavorClassName) {
            className = className + flavorClassName;
        }

        $A.util.addClass(element, className);
        if (element["tagName"]) {
            element.setAttribute("data-aura-class",$A.util.buildClass(element.getAttribute("data-aura-class"),className));
        }
    } else if (concrete.isInstanceOf("aura:html")) { // only check html cmps (presuming this is faster) TODONM find a better way to short-circuit here
        // this is for nested flavorable elements (not at top level of cmp).
        flavorClassName = this.getFlavorClass(concrete, element);
        if (flavorClassName) {
            $A.util.addClass(element, flavorClassName);
            if (element["tagName"]) {
                element.setAttribute("data-aura-class",$A.util.buildClass(element.getAttribute("data-aura-class"),flavorClassName));
            }
        }
    }
};

/**
 * Associate all of the elements with the component, and return a list of
 * pure elements - with no association objects wrapped around them.
 *
 * @private
 */
AuraRenderingService.prototype.associateElements = function(cmp, elements) {
    elements = this.getArray(elements);

    var len = elements.length;
    var element;
    for (var i = 0; i < len; i++) {
        element = elements[i];

        if(!this.isCommentMarker(element)){
            this.addAuraClass(cmp,element);
        }
        cmp.associateElement(element);
    }
};

/**
 * Create a new Comment marker optinally before the specified target and for the specified reason.
 * Often the reason is something relating to what was unrendered or rendered such as a globalId.
 *
 * @private
 */
AuraRenderingService.prototype.createMarker = function(target,reason){
    var node = document.createComment(reason);
    node.aura_marker=true;
    if(target){
        $A.util.insertBefore(node, target);
    }
    return node;
};

/**
 * Basically was this node created by the createMarker() function above.
 * Since we use comment markers as placement in the dom for non-rendered components and expressions
 * We often branch logic on wether the element is a comment marker or not.
 * @private
 */
AuraRenderingService.prototype.isCommentMarker = function(node){
    return node&&node.aura_marker;
};

/**
 * If you use component.getElements() it will normalize the array, but also slice it to give you a copy.
 * When in trusted code that is aware of this situation, we can avoid the cost of slicing the array.
 *
 * @private
 */
AuraRenderingService.prototype.getElements = function(component) {
    // avoid a slice of the elements collection
    return component.getConcreteComponent().elements || [];
};

/**
 * Includes all the DOM elements the component output as part of its rendering cycle. 
 * This method also returns the comment markers output as part of the component rendering cycle.
 * If you do not want the comment nodes returned to you (your known set of dom nodes), use cmp.getElements() or renderingService.getElements(component)
 */
AuraRenderingService.prototype.getAllElements = function(component) {
    return component.getConcreteComponent().allElements || [];
};

/**
 * Similar to getAllElements, but this method will copy the allElements collection and return it. This allows you to modify the collection for processing
 * during the renderingService without worring about mutating the component elements collection. 
 */
AuraRenderingService.prototype.getAllElementsCopy = function(component) {
    return component.getConcreteComponent().allElements.slice(0) || [];
};

/**
 * Get a uniqueID to identify different HTML elements by.
 * This method tries to use the data-rendered-by attribute first if possible.
 * If not (such as comment nodes) then we'll just append our own data attribute.
 * We need this so we can maintain a map of references to a component without a reference to the component.
 *
 * @private
 */
AuraRenderingService.prototype.getUid = function(element) {
    if(element.nodeType === 1) {
        // Try to use the rendered-by attribute which should be on almost everything
        // The times it won't will probably be elements generated in the renderer by the component developer
        var id = $A.util.getDataAttribute(element, $A.componentService.renderedBy);
        if(id !== null) {
            return id;
        }

        // Try to use data attributes for our unique ID of our own creation to the element as the fallback.
        id = $A.util.getDataAttribute(element, this.DATA_UID_KEY);
        if(id!==null) {
            return id;
        }
    }
    return element[this.DATA_UID_KEY];
};

/**
 * Assign a new unique id to the specified element.
 * The unique ID is just an incrementing number on the service.
 *
 * @private
 */
AuraRenderingService.prototype.newUid = function(element) {
    var nextUid = this.uid++;
    var success = null;

    if(element.nodeType === 1) {
        success = $A.util.setDataAttribute(element, this.DATA_UID_KEY, nextUid);
    }

    // Couldn't set the data attribute, happens for some HTML elements.
    if(success === null) {
        element[this.DATA_UID_KEY] = nextUid;
    }

    return nextUid;
};

/**
 * Get the unique id for an element. If it does not have one, generate one and return that.
 * Uses a combination of getUid() and newUid().
 *
 * @private
 */
AuraRenderingService.prototype.resolveUid = function(element) {
    var uid = this.getUid(element);
    if(uid === null || uid === undefined) {
        return this.newUid(element);
    }
    return uid;
};

/**
 * The marker can be any dom node. This method tracks that that dom node is being
 * referenced by the component with the specified globalid
 *
 * @private
 */
AuraRenderingService.prototype.addMarkerReference = function(marker, globalId) {
    if(!marker||!globalId) {
        return;
    }
    var uid = this.resolveUid(marker);
    var existing = this.markerToReferencesMap[uid];
    if(!existing) {
        this.markerToReferencesMap[uid] = existing = new this.ReferenceCollection();
    }
    existing.add(globalId);
};

/**
 * The specified dom node (marker) is no longer being used by the component with the specified global id.
 *
 * @private
 */
AuraRenderingService.prototype.removeMarkerReference = function(marker, globalId) {
    if(!marker||!globalId) { return; }
    var references = this.markerToReferencesMap[this.resolveUid(marker)];

    if(references) {
        references.delete(globalId);
    }
};

/**
 * Get a collection of IDs who are using the specified element as a marker.
 * If the element is being removed, we'll want to move those references to another element or a comment marker.
 *
 * @private
 */
AuraRenderingService.prototype.getMarkerReferences = function(marker) {
    if(!marker) {
        return null;
    }
    return this.markerToReferencesMap[this.resolveUid(marker)];
};

/**
 * Carefully remove the marker from the container.
 * If we're trying to remove a shared comment marker, we do nothing since others are using it.
 * If the parent isn't unrendering or is being destroyed, we won't do anything either since the container will have its dom node removed and that will remove all its children from the dom.
 *
 * @private
 */
AuraRenderingService.prototype.removeElement = function(marker, container) {
    //var container = component.getConcreteComponent().getContainer();
    //if(!container || !container.getConcreteComponent().isUnrendering()) {
    var concrete = container && container.getConcreteComponent();
    if(!concrete || !concrete.isUnrendering()) {
        if(this.isSharedMarker(marker)) {
            // No point in moving everything to another comment marker.
            if(this.isCommentMarker(marker)) { return; }

            // Move all the past references to a comment!
            this.moveReferencesToMarker(marker);
        } else if(concrete && concrete.destroyed===-1 && !this.isCommentMarker(marker)) {
            // this element is going away anyway since the container is being destroyed.
            return;
        }

        $A.util.removeElement(marker);
    }
};

/**
 * All the components who are using the specified dom node as a marker need to now be moved to a comment marker.
 * This method doesn't check if you're moving from one comment node to another. That would be a waste of time, so
 * be aware you should verify that first.
 *
 * @private
 */
AuraRenderingService.prototype.moveReferencesToMarker = function(marker) {
    var references = this.getMarkerReferences(marker);
    var newMarker = this.createMarker(null, "unrender marker: " + marker.nodeValue);

    if(references) {
        var collection = references.get();
        for(var c=collection.length;c>=0;c--) {
            var cmp = $A.getComponent(collection[c]);
            if(cmp && !cmp.destroyed) {
                this.setMarker(cmp, newMarker);
            }
        }
    }

    // If the marker is actually being used by others, then go ahead and put it in the dom.
    if(this.isSharedMarker(newMarker)) {
        $A.util.insertBefore(newMarker, marker);
    }
};

/**
 * Are multiple components using this as a marker?
 * Shared markers need to have their other references moved before being able to remove the marker node from the dom.
 *
 * @private
 */
AuraRenderingService.prototype.isSharedMarker = function(marker) {
    var references = this.getMarkerReferences(marker);
    if(references) {
        return references.size() > 0;
    }
    return false;
};

/**
 * The ReferenceCollection is a data structure for tracking references from components to dom nodes.
 * Since it is a many (components() to one element mapping, this is necessary to track whos using what.
 * The collection will optimize to not create an array at first. Only after you've added more than one reference
 * will the array be created.
 *
 * Lastly, this collecton acts just like a Set(). You cannot add the same value twice, which helps with our reference counting logic.
 *
 * @private
 */
AuraRenderingService.prototype.ReferenceCollection = function() {
    // this.references = "" || [];
};

AuraRenderingService.prototype.ReferenceCollection.prototype.isCollection = false;

AuraRenderingService.prototype.ReferenceCollection.prototype.add = function(value){
    // Only track references
    if(typeof value !== "string") { return; }

    if(this.has(value)) {
        // Either we act like a set, or we make sure it doesn't dupe in consumption.
        // Latter is better for perf, maybe throw and track if its an issue?
        return;
    }

    if(!this.references) {
        this.references = value;
    } else if(!this.isCollection) {
        if(this.references !== value) {
            this.references = [this.references, value];
            this.isCollection = true;
        }
    } else {
        this.references.push(value);
    }
};

AuraRenderingService.prototype.ReferenceCollection.prototype.delete = function(value){
    if(typeof value !== "string") {
        return;
    }
    if(this.isCollection) {
        var index = this.references.indexOf(value);
        if(index > -1) {
            this.references.splice(index, 1);
        }
    }
    if(this.references === value) {
        this.references = null;
    }
};

AuraRenderingService.prototype.ReferenceCollection.prototype.has = function(value){
    if(!this.isCollection) {
        return this.references === value;
    }
    if(this.references) {
        return this.references.indexOf(value) !== -1;
    }
    return false;
};

AuraRenderingService.prototype.ReferenceCollection.prototype.size = function(){
    if(this.references) {
        if(typeof this.references === "string") {
            return 1;
        } else {
            return this.references.length;
        }
    }
    return 0;
};

AuraRenderingService.prototype.ReferenceCollection.prototype.get = function(index) {
    if(index === undefined) {
        if(this.isCollection) {
            return this.references;
        } else {
            return [this.references];
        }
    }
    return this.references[index];
};

Aura.Services.AuraRenderingService = AuraRenderingService;
