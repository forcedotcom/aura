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
// CAUTION!
// IF YOU MODIFY THIS LIST OF METHODS, YOU MUST ALSO MODIFY THE RESERVED_METHODS LIST IN AuraTextUtil.java
var p = Component.prototype;
exp(p,
    "auraType", p.auraType,
    "getDef", p.getDef,
    "index", p.index,
    "deIndex", p.deIndex,
    "find", p.find,
    "destroy", p.destroy,
    "getGlobalId", p.getGlobalId,
    "getLocalId", p.getLocalId,
    "getRenderable", p.getRenderable,
    "getRendering", p.getRendering,
    "isRendered", p.isRendered,
    "getHelper", p.getHelper,
    "getSuper", p.getSuper,
    "associateElement", p.associateElement,
    "disassociateElements", p.disassociateElements,
    "getElements", p.getElements,
    "getElement", p.getElement,
    "get", p.get,
    "getReference", p.getReference,
    "clearReference", p.clearReference,
    "getConcreteComponent", p.getConcreteComponent,
    "isConcrete", p.isConcrete,
    "markDirty", p.markDirty,
    "markClean", p.markClean,
    "isDirty", p.isDirty,
    "isValid", p.isValid,
    "setValid", p.setValid,
    "addErrors", p.addErrors,
    "clearErrors", p.clearErrors,
    "getErrors", p.getErrors,
    "set", p.set,
    "autoDestroy", p.autoDestroy,
    "getEventDispatcher", p.getEventDispatcher,
    "getModel", p.getModel,
    "getEvent", p.getEvent,
    "toString", p.toString,
    "addHandler" , p.addHandler,
    "addValueProvider", p.addValueProvider,
    "addDocumentLevelHandler" , p.addDocumentLevelHandler,
    "removeDocumentLevelHandler" , p.removeDocumentLevelHandler,
    "isInstanceOf", p.isInstanceOf,
    "getHandledEvents", p.getHandledEvents,
    "hasEventHandler", p.hasEventHandler,
    "addValueHandler", p.addValueHandler,
    "removeValueHandler", p.removeValueHandler,
    "getFacets", p.getFacets,

    "isFlavorable", p.isFlavorable,
    "getFlavorName", p.getFlavorName,
    "getFlavorNamespace", p.getFlavorNamespace,
    

    "render", p.render,
    "afterRender", p.afterRender,
    "rerender", p.rerender,
    "unrender", p.unrender,
    "superRender", p.superRender,
    "superAfterRender", p.superAfterRender,
    "superRerender", p.superRerender,
    "superUnrender", p.superUnrender,

    // DCHASMAN TODO Kill these once we figure out how to replace them in Halo
    "getAttributeValueProvider", p.getAttributeValueProvider,
    "getComponentValueProvider", p.getComponentValueProvider,
    "mergeAttributes", p.mergeAttributes,
    
    "getRenderable", p.getRenderable
);

exp(Component,
	"registerMethods", Component.registerMethods);

$A["Component"] = Component;


