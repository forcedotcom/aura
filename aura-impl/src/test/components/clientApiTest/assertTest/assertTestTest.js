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
     * Just sanity check a simple usage.
     */
    testAssertPass : {
        test : function(cmp) {
            $A.userAssert(true, "You shall never see me pass");
        }
    },

    /**
     * Just sanity check an assert fail.
     */
    testAssertFail : {
        test : function(cmp) {
            var orig = "This message will appear";
            var returned = "Assertion Failed!: "+orig + " : false";
            try {
                $A.userAssert(false, orig);
                $A.test.fail("The assertion did not intterupt flow");
            } catch (e) {
                $A.test.assertEquals(returned, e.message);
            }
            $A.test.assertEquals(returned, aura.util.getElement("auraErrorMessage").innerHTML);
        }
    }
})
