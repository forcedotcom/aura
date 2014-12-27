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
     * Verify case sensitivity when a cmp tries to access data on the model.
     * 
     * TODO(W-1446515): Note the weirdness in the case sensitivity between a cmp and it's model. m.foo will map to
     * getFoo() on the model but not getfoo(). m.Foo will map to neither.
     */
    testServerModelCaseSensitivity: {
        test: function(cmp) {
            $A.test.assertEquals("Model", $A.test.getText(cmp.find("string1").getElement()));
            $A.test.assertEquals("", $A.test.getText(cmp.find("string2").getElement()));
            $A.test.assertEquals("", $A.test.getText(cmp.find("string3").getElement()));
            $A.test.assertEquals("", $A.test.getText(cmp.find("string4").getElement()));

            $A.test.assertEquals("Model - lowercase method", $A.test.getText(cmp.find("stringLowercase1").getElement()));
            $A.test.assertEquals("", $A.test.getText(cmp.find("stringLowercase2").getElement()));
            $A.test.assertEquals("", $A.test.getText(cmp.find("stringLowercase3").getElement()));
        }
    }
})