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
     * Component event is handled only by handlers on the firing component and its container.
     */
    testComponent:{
        test:function(cmp){
            cmp.find("Charlie").getEvent("A").fire();
            aura.test.assertEquals("", $A.test.getText(cmp.find("events").getElement()));
            aura.test.assertEquals("", $A.test.getText(cmp.find("Martin").find("events").getElement()));
            aura.test.assertEquals("", $A.test.getText(cmp.find("Brooke").find("events").getElement()));
            aura.test.assertEquals("", $A.test.getText(cmp.find("Bob").find("events").getElement()));
            aura.test.assertEquals("", $A.test.getText(cmp.find("Max").find("events").getElement()));
            var text = $A.test.getText(cmp.find("Charlie").find("events").getElement());
            aura.test.assertTrue(text=="AB" || text=="BA");
        }
    },

    /**
     * Application event is handled by all handlers.
     */
    testApplication:{
        test:function(cmp){
            $A.get("e.handleEventTest:applicationEvent").fire();
            aura.test.assertEquals("A", $A.test.getText(cmp.find("events").getElement()));
            aura.test.assertEquals("C", $A.test.getText(cmp.find("Martin").find("events").getElement()));
            aura.test.assertEquals("C", $A.test.getText(cmp.find("Charlie").find("events").getElement()));
            aura.test.assertEquals("C", $A.test.getText(cmp.find("Brooke").find("events").getElement()));
            aura.test.assertEquals("C", $A.test.getText(cmp.find("Bob").find("events").getElement()));
            aura.test.assertEquals("C", $A.test.getText(cmp.find("Max").find("events").getElement()));
        }
    }
})
