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
    open : function(cmp, event){

        event.preventDefault();
        var defModel = cmp.getAttributes().getValue("defModel");

        var evt = $A.get("e.auraide:openDef");
        evt.setParams({
            descriptor : defModel.getRawValue("descriptor"),
            defType : defModel.getRawValue("defType")
        });
        evt.fire();
    }
}
