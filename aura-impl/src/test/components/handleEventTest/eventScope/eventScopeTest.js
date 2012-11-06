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
     * Component event is handled only by handlers on the firing component and its container.
     */
    testComponent:{
        test:function(cmp){
            cmp.find("Charlie").getEvent("A").fire();
            aura.test.assertEquals("", cmp.find("events").getElement().textContent);
            aura.test.assertEquals("", cmp.find("Martin").find("events").getElement().textContent);
            aura.test.assertEquals("", cmp.find("Brooke").find("events").getElement().textContent);
            aura.test.assertEquals("", cmp.find("Bob").find("events").getElement().textContent);
            aura.test.assertEquals("", cmp.find("Max").find("events").getElement().textContent);
            var text = cmp.find("Charlie").find("events").getElement().textContent;
            aura.test.assertTrue(text=="AB" || text=="BA");
        }
    },

    /**
     * Application event is handled by all handlers.
     */
    testApplication:{
        test:function(cmp){
            $A.get("e.handleEventTest:applicationEvent").fire();
            aura.test.assertEquals("A", cmp.find("events").getElement().textContent);
            aura.test.assertEquals("C", cmp.find("Martin").find("events").getElement().textContent);
            aura.test.assertEquals("C", cmp.find("Charlie").find("events").getElement().textContent);
            aura.test.assertEquals("C", cmp.find("Brooke").find("events").getElement().textContent);
            aura.test.assertEquals("C", cmp.find("Bob").find("events").getElement().textContent);
            aura.test.assertEquals("C", cmp.find("Max").find("events").getElement().textContent);
        }
    }
})
