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
    testDestroySingleComponent: {
        attributes : {},
        test: function(component){
            var expected = "unrender alone";

            component.find("alone").destroy();
            var logs = component.find("log").getElement();
            var actual = $A.util.getText(logs);

            $A.test.assertEquals(1, logs.childNodes.length);
            $A.test.assertEquals(expected, actual);
        }
    },

    /**
     * Destroying the root of a tree should call unrender only once for the root.
     */
    testDestroyRootComponent: {
        attributes : {},
        test: function(component){
            var expected = "unrender root";

            component.find("root").destroy();
            var logs = component.find("log").getElement();
            var actual = $A.util.getText(logs);
            
            $A.test.assertEquals(1, logs.childNodes.length);
            $A.test.assertEquals(expected, actual);
        }
    },

    /**
     * Destroying a tree should call unrender only once for the children.
     */
    testDestroyNestedComponent: {
        attributes : {},
        test: function(component){
            var expected = "unrender nested";

            component.find("nested").destroy();
            var logs = component.find("log").getElement();
            var actual = $A.util.getText(logs);
            
            $A.test.assertEquals(1, logs.childNodes.length);
            $A.test.assert(expected, actual);
        }
    },

    /**
     * We can remove the dom nodes before calling unrender, but that causes problems with Modules.
     * Primarily that now components can't fire events to communicate they've been unrendered since those
     * dom events won't bubble correctly through the dom.
     */
    testUnrenderInTheDocument: {
        attributes: {},
        test: function(component) {
            var expected = "true";
            component.find("nested").destroy();

            var actual = $A.util.getText(component.find("isInDomLog").getElement());

            $A.test.assertEquals(expected, actual);
        }
    }
})

