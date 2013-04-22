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
    runNextTest : function(cmp){
        var tests = cmp.find("test");
        tests = $A.util.isArray(tests) ? tests : [tests];
        var index = parseInt(cmp.get("v.index"));
        if(index >= tests.length){
            return;
        }
        var test = tests[index];
        test.getDef().getHelper().loadTest(test);
        cmp.getValue("v.index").setValue(index + 1);
    }
})
