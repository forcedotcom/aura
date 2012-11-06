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
            aura.assert(component.getAttributes().getValue('num') == 2, "very bad things.");
        }
    },

    testHelloWorld2: {
        attributes : {num : '3'},

        test: "This will cause the exception, yay",
    },
})
