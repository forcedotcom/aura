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
    /**
     * Verify setting disabled attribute.
     */
    testDisabled: {
        attributes : {disabled: true},
        test: function(component){
            aura.test.assertTrue(component.find("select").getElement().disabled, "Element not correctly disabled");
        }
    },
    /**
     * Verify not setting disabled attribute.
     */
    testNotDisabled: {
        attributes : {disabled: false},
        test: function(component){
            aura.test.assertFalse(component.find("select").getElement().disabled, "Element not correctly enabled");
        }
    },
    /**
     * Verify setting name attribute.
     */
    testName:{
        attributes : {name: 'select'},
        test: function(component){
            aura.test.assertEquals('select', component.find("select").getElement().name, "Name attribute not correct");
        }
    },
    /**
     * Verify setting multiple attribute.
     */
    testMultiple: {
        attributes : {name: 'select', multiple: true},
        test: function(component){
            aura.test.assertEquals(true, component.find("select").getElement().multiple, "Multiple attribute not correct");
        }
    },
    /**
     * Verify setting size attribute.
     */
    testSize: {
        attributes : {name: 'select', size: '5'},
        test: function(component){
            aura.test.assertEquals(5, component.find("select").getElement().size, "Size attribute not correct");
        }
    }
})
