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
{
    layoutChanged : function(cmp, event) {
        $A.log("layoutChange: "+event.getParam("prevTitle") + " -> "+event.getParam("title"));
        cmp.find("lastLayoutTitle").getElement().innerHTML = event.getParam("prevTitle");
        cmp.find("currLayoutTitle").getElement().innerHTML = event.getParam("title");
        $A.util.addClass(cmp.find("ready").getElement(),"layoutChanged");
    },

    titleChanged : function(cmp, event) {
        $A.log("titleChange: "+event.getParam("prevTitle") + " -> "+event.getParam("title"));
        cmp.find("lastTitle").getElement().innerHTML = event.getParam("prevTitle");
        cmp.find("currTitle").getElement().innerHTML = event.getParam("title");
        $A.util.addClass(cmp.find("ready").getElement(),"titleChanged");
    }
}
