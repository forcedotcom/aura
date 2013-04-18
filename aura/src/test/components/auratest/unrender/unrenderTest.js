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
    /**
     * Destroying a single component should call unrender only once.
     */
    // W-1130639
    _testDestroySingleComponent: {
        attributes : {},
        test: function(component){
            component.find("alone").destroy();
            var logs = component.find("log").getElement();
            $A.test.assertEquals(1, logs.childNodes.length);
            $A.test.assertEquals("unrender alone", logs.firstChild.innerText);
        }
    },

    /**
     * Destroying the root of a tree should call unrender only once for the root.
     */
    // W-1130639
    _testDestroyRootComponent: {
        attributes : {},
        test: function(component){
            component.find("root").destroy();
            var logs = component.find("log").getElement();
            $A.test.assertEquals(1, logs.childNodes.length);
            $A.test.assertEquals("unrender root", logs.firstChild.innerText);
        }
    },

    /**
     * Destroying a tree should call unrender only once for the children.
     */
    // W-1130639
    _testDestroyNestedComponent: {
        attributes : {},
        test: function(component){
            component.find("nested").destroy();
            var logs = component.find("log").getElement();
            $A.test.assertEquals(1, logs.childNodes.length);
            $A.test.assertEquals("unrender nested", logs.firstChild.innerText);
        }
    }
})

