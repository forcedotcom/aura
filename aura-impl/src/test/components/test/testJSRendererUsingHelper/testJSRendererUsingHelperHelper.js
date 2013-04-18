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
    /*Multi line Comments
     **/
    //Single line Comments
    renderHelper : function(component){
    /*Multi line Comments
     **/
    //Single line Comments
        var ret = document.createElement('div');
        ret.className = 'button \t \'div\'';
        ret.id = component.getGlobalId();
        ret.innerHTML = component.getAttributes().getValue('label').getValue();
        return [ret];
    },
    /*Multi line Comments
     **/
    //Single line Comments
    rerenderHelper: function(component) {
        var div = component.getElements().element;
        div.innerHTML = component.getAttributes().getValue('label').getValue();
    }
})
