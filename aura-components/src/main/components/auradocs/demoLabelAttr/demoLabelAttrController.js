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
    setLabel:function(cmp){
        var attr = cmp.getAttributes();
        attr.setValue('_label', 'new label');
    	
        //cmp.setValue("v.label", "new label");

    },
    createButton : function(cmp) {
        $A.componentService.newComponentAsync(
            this,
            function(newButton){
                //Pass an event handler to the new button
                newButton.addHandler('press', cmp, 'c.someHandler');
                cmp.getValue("v.body").push(newButton);
            },
            {
                "componentDef": "markup://ui:button",
                "attributes": {
                    "values": { label: "Submit" }
                }
            }
        );
    }
})
