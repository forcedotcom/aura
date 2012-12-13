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
package org.auraframework.impl.root.event.locationchange;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Application;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Unit test to verify the implementation of LocationChange event.
 *
 * @hierarchy Aura.Components.Events.Browser History Management
 * @priority high
 * @userStory a07B0000000EYU4
 */
public class LocationChangeEventTest extends AuraImplTestCase {
    public LocationChangeEventTest(String name){
        super(name);
    }
    /**
     * A basic test to demonstrate how every application is registered to fire the LocationChange event.
     * The definition(tree) of the application has a section called "locationChangeEventDef".
     * @throws Exception
     */
    public void testApplicationDefWithLocationChange() throws Exception{
        Application cmp = Aura.getInstanceService().getInstance("test:test_LocChng_SimpleComponent", ApplicationDef.class);
        this.serializeAndGoldFile(cmp,"simpleComponent");
        //References to LocationChangeEvent in children refer back to the first definition of LocationChangeEvent using serRefId
        cmp = Aura.getInstanceService().getInstance("test:test_LocChng_CompositeComponent", ApplicationDef.class);
        this.serializeAndGoldFile(cmp,"compositeComponent");
    }
    /**
     * Negative test case: Check that events used to handle location change always extend aura:locationChange.
     */
    public void testRegisteredLocationChangeEventExtendsAuraLocationChange() throws Exception{
        try{
            Aura.getInstanceService().getInstance("test:test_LocChng_NoExtends", ApplicationDef.class);
            fail("Should have not fetched this component because the location change event does not extend aura:locationChange");
        } catch(InvalidDefinitionException e) {
        }
    }
}
