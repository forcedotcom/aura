/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    "getRendering", p.getRendering,
    "isRendered", p.isRendered,
    "getSuper", p.getSuper,
    "associateElement", p.associateElement,
    "getElements", p.getElements,
    "getElement", p.getElement,
    "getAttributes", p.getAttributes,
    "getValue", p.getValue,
    "get", p.get,
    "getConcreteComponent", p.getConcreteComponent,
    "isConcrete", p.isConcrete,
    "isValid", p.isValid,
    "setValue", p.setValue,
    "getEventDispatcher", p.getEventDispatcher,
    "getModel", p.getModel,
    "getEvent", p.getEvent,
    "toString", p.toString,
    "addHandler" , p.addHandler,
    "isInstanceOf", p.isInstanceOf,
    "unwrap", p.unwrap,
    "addClass", p.addClass,
    "removeClass", p.removeClass,
    "getHandledEvents", p.getHandledEvents,
    "hasEventHandler", p.hasEventHandler,
    "addValueHandler", p.addValueHandler
);
