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
({
    checkForErrors: function(cmp){
        while(cmp && cmp.getDef().toString() !== "markup://expressionTest:suite"){
            cmp = cmp.getSuper();
        }
        var errors = $A.util.trim(cmp.find("errors").getElement().textContent);
        if(errors !== ""){
            throw new Error("Unexpected expression evaluation(s):\n" + errors);
        }
    }
})
