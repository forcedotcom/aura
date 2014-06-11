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
    render : function(component){
        var ret = document.createElement('div');
        ret.id = component.getGlobalId();
        ret.innerHTML = component.get('v.label');
        ret.style.backgroundColor = component.get('v.color');
        ret.className = component.get('v.class');
        return [ret];
    },
    rerender : function(component){
        if (component.isDirty('v.color')) {
            var div = component.getElements().element;
            //Have something in the label to indicate the number of times this re-render function is called for the button
            var rerenderCount = 0;
            //Note I could have used an attribute to track this count, but then it would have to be set in the re-render function.
            //This would cause an infinite loop because setVlaue is suppose to call re-render.
            var label = div.innerHTML;
            if (label.indexOf('#') > -1) {
                rerenderCount = label.substring(label.indexOf('#') + 1);
            }
            rerenderCount++;
            div.innerHTML = component.get('v.label') + '#' + rerenderCount;
            div.className = component.get('v.class');
            div.style.backgroundColor = component.get('v.color');
            $A.services.rendering.addDirtyValues(color);
        }
    }

})
