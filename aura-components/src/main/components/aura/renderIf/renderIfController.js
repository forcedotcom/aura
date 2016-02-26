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
    facetChange: function(component, event) {
    	var value = event.getParam("value");
    	if (!$A.util.isArray(value)) {
    	    value = [value];
    	}
    	var oldValue = event.getParam("oldValue");
    	if (!$A.util.isArray(oldValue)) {
    	    oldValue = [oldValue];
    	}
    	var facets=[value, oldValue];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(true);
            }
        }
    },

    init: function(component) {
        var facets=[component.get("v.body"),component.get("v.else")];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(false);
            }
        }
    },

    destroy:function(component){
        var facets=[component.get("v.body"),component.get("v.else")];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].destroy();
            }
        }
    }
})// eslint-disable-line semi
