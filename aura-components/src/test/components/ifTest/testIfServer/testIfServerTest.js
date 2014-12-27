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
    // mostly the same tests as testIfTest
    testEmpty: {
        attributes : {thang : ''},
        test: function(component){
            this.whatItIs(component, "Empty string", false);
        }
    },

    testUndefined: {
        test: function(component){
            this.whatItIs(component, "Undefined", false);
        }
    },

    testTrue: {
        attributes : {thang : 'true'},
        test: function(component){
            this.whatItIs(component, "true", true);
        }
    },

    testFalse: {
        attributes : {thang : 'false'},
        test: function(component){
            this.whatItIs(component, "false", false);
        }
    },

    testLiterals: {
        test: function(component){
            $A.test.assertNull($A.test.getElementByClass("itIsLiterallyFalse"), "Literal false didn't evaluate as false");
            $A.test.assertNotNull($A.test.getElementByClass("itIsLiterallyNotFalse"), "Literal true evaluated as false");
        }
    },

    whatItIs : function(component, name, value){
        if (!value) {
            $A.test.assertNotNull($A.test.getElementByClass("itIsFalse"), name+" didn't evaluate as false");
            $A.test.assertNull($A.test.getElementByClass("itIsTrue"), name+" evaluated as true");
        }else{
            $A.test.assertNotNull($A.test.getElementByClass("itIsTrue"), name+" didn't evaluate as true");
            $A.test.assertNull($A.test.getElementByClass("itIsFalse"), name+" evaluated as false");
        }
    }
})