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
    render: function(component){
        var value = component.get("v.value");
        
        var trunc = component.get("v.truncate");
        var truncateByWord = $A.util.getBooleanValue(component.get("v.truncateByWord"));
        var ellipsis = $A.util.getBooleanValue(component.get("v.ellipsis"));
        
        if(trunc){
            trunc = 1 * trunc;
            value = aura.util.truncate(value, trunc, ellipsis, truncateByWord);
        }
        return [document.createTextNode($A.util.isUndefinedOrNull(value)?'':value)];
    },
    rerender:function(component){
        var element=component.getElement();
        // Check for unowned node so IE doesn't crash
        if (element && element.parentNode) {
        	var textValue = component.get("v.value");
            textValue = $A.util.isUndefinedOrNull(textValue) ? '' : textValue;
            
            if (element.nodeValue !== textValue) {
                element.nodeValue = textValue;
            }
        }
    }
})
