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
    testSerializeTo : {
        test : [function(cmp) {
            // try to create a new component needing server trip
            $A.run(function(){
                cmp.get("c.newComponent").run()
            });
            $A.test.addWaitFor(true, $A.test.allActionsComplete);
        }, function(cmp) {
            var newcmp = cmp.find("target").get("v.body")[0];
            $A.test.assertEquals("bulk", newcmp.get("v.both"));
            $A.test.assertEquals("hulk", newcmp.get("v.server"));
            $A.test.assertEquals("sulk", newcmp.get("v.none"));
            $A.test.assertEquals("bilk", newcmp.get("v.bothDefault"));
            $A.test.assertEquals("milk", newcmp.get("v.serverDefault"));
            $A.test.assertEquals("silk", newcmp.get("v.noneDefault"));

            // try to create another new component which doesn't need a server trip now
            cmp.find("newComponent").get("e.press").fire();
            var newercmp = cmp.find("target").get("v.body")[0];
            $A.test.assertFalse(newcmp.getGlobalId() === newercmp.getGlobalId());
            $A.test.assertEquals("bulk", newercmp.get("v.both"));
            $A.test.assertEquals("hulk", newercmp.get("v.server"));
            $A.test.assertEquals("sulk", newercmp.get("v.none"));
            $A.test.assertEquals("bilk", newercmp.get("v.bothDefault"));
            $A.test.assertEquals("milk", newercmp.get("v.serverDefault"));
            $A.test.assertEquals("silk", newercmp.get("v.noneDefault"));
        }]
    }
})
