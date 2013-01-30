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
var p = ComponentDef.prototype;
exp(p,
    "auraType", p.auraType,
    "getDescriptor", p.getDescriptor,
    "isAbstract", p.isAbstract,
    "isTemplate", p.isTemplate,
    "getSuperDef", p.getSuperDef,
    "getHelperDef", p.getHelperDef,
    "getHelper", p.getHelper,
    "getRendererDef", p.getRendererDef,
    "getProviderDef", p.getProviderDef,
    "getThemeDef", p.getThemeDef,
    "getAttributeDefs", p.getAttributeDefs,
    "getFacets", p.getFacets,
    "getControllerDef", p.getControllerDef,
    "getModelDef", p.getModelDef,
    "getEventDef", p.getEventDef,
    "toString", p.toString,
    "getLayouts", p.getLayouts,
    "getLocationChangeEvent", p.getLocationChangeEvent,
    "getAppHandlerDefs", p.getAppHandlerDefs,
    "getCmpHandlerDefs", p.getCmpHandlerDefs,
    "isInstanceOf", p.isInstanceOf,
    "getAllEvents", p.getAllEvents
);
