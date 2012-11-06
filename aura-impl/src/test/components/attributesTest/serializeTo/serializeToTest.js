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
    testSerializeTo : {
        attributes : { both : "hi", server : "bye", none : "shy", serverDefault : "why", noneDefault : "cry" },
        test : function(cmp) {
            $A.test.assertEquals("hi", cmp.get("v.both"), "BOTH not serialized from server");
            $A.test.assertEquals(undefined, cmp.get("v.server"), "SERVER should not have been serialized from server");
            $A.test.assertEquals(undefined, cmp.get("v.none"), "NONE should not have been serialized from server");
            $A.test.assertEquals("public", cmp.get("v.bothDefault"), "BOTH default should have been overridden from server");
            $A.test.assertEquals("package", cmp.get("v.serverDefault"), "SERVER default should not have been overridden from server");
            $A.test.assertEquals("private", cmp.get("v.noneDefault"), "NONE default should not have been overridden from server");

            // try to create a new local component
            cmp.get("c.newComponent").run();
            var newcmp = cmp.find("target").get("v.body")[0];
            $A.test.assertEquals("double", newcmp.get("v.both"));
            $A.test.assertEquals("single", newcmp.get("v.server"));
            $A.test.assertEquals("strikeout", newcmp.get("v.none"));
            $A.test.assertEquals("double again", newcmp.get("v.bothDefault"));
            $A.test.assertEquals("single again", newcmp.get("v.serverDefault"));
            $A.test.assertEquals("strikeout again", newcmp.get("v.noneDefault"));
        }
    }
})
