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
    handleClick : function(component, event) {
        var attributes = component.getAttributes();
        var attributeValue = attributes.getRawValue("text");
        aura.log("current text: " + attributeValue);

        var target;
        if (event.getSource) {
            // handling an Aura event
            target = event.getSource(); // this is an Aura Component object
            attributes.setValue("text", target.getAttributes().getValue("label").getValue());
        } else {
            // handling a native browser event
            target = event.target.value; // this is a DOM element
            attributes.setValue("text", event.target.value);
        }
    }
}
