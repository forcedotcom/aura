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
    changeLabel: function(component, event) {
        /*Both controllers perform the same action. They have different names just to make sure that the mapping of Actions to Events is perfect*/
        var innerCmp = component.find('innerComp');
        innerCmp.getAttributes().setValue('label',"Event Properties." + "Source:"+event.getSource().toString()+ ".Action Invoked at:OuterComponent.Client Action:changeLabel");
    },
    changeLabel2: function(component, event) {
        var innerCmp = component.find('innerComp');
        innerCmp.getAttributes().setValue('label',"Event Properties." + "Source:"+event.getSource().toString()+ ".Action Invoked at:OuterComponent.Client Action:changeLabel2")
    }
}
