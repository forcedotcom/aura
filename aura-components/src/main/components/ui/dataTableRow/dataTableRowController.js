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
{
    /* This examines what element inside a data table row was clicked on, and decides if we should bubble the event
     * up to rowPress or not. If an "A" was clicked, then we don't fire rowPress.
     */
    rowPress : function(cmp, e){
        var el = cmp.getElement();
        var target = e.target;
        while(el != target){
            if(target.tagName == "A"){
                return;
            }
            target = target.parentNode;
        }
        cmp.getEvent("rowPress").fire();
    }
}
