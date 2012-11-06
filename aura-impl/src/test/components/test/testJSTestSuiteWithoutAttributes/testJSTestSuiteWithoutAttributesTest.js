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
    testHelloWorld: {
        attributes : {num : '2'},
        test: function(component){
            aura.test.assertTrue(component.getAttributes().getRawValue('num') == 2, "very bad things.");
        }
    },

    testHelloWorld3: {
        test: function(){
            aura.log(location);
        }
    }
})
