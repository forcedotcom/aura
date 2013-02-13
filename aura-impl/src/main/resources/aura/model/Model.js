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
/**
 * @namespace Creates a Model instance.
 * @constructor
 * @param {Object} def
 * @param {Object} data
 * @param {Component} component
 * @returns {Function}
 */
function Model(def, data, component){
	
	/** BEGIN HACK--MUST BE REMOVED **/
	if (def.getDescriptor().getQualifiedName() === "java://ui.aura.components.forceProto.FilterListModel") {

		for (var i in data["rowTemplate"]) {
			data["rowTemplate"][i] = new SimpleValue(data["rowTemplate"][i], def, component); 
		}
		
	}
	
	if (def.getDescriptor().getQualifiedName() === "java://org.auraframework.component.ui.DataTableModel") {
		for (var j in data["itemTemplate"]) {
			data["itemTemplate"][j] = new SimpleValue(data["itemTemplate"][j], def, component); 
		}
	}
	/** END HACK**/
	
    return new MapValue(data, def, component);
}
