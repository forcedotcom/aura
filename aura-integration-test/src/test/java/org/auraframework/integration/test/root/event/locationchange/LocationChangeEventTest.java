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
package org.auraframework.integration.test.root.event.locationchange;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Application;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

/**
 * Unit test to verify the implementation of LocationChange event.
 */
public class LocationChangeEventTest extends AuraImplTestCase {
    /**
     * A basic test to demonstrate how every application is registered to fire the LocationChange event. The
     * definition(tree) of the application has a section called "locationChangeEventDef".
     */
    @Test
    public void testApplicationDefWithLocationChange() throws Exception {
        Application cmp = instanceService.getInstance("test:test_LocChng_SimpleComponent",
                ApplicationDef.class);
        this.serializeAndGoldFile(cmp, "simpleComponent");
        // References to LocationChangeEvent in children refer back to the first
        // definition of LocationChangeEvent using serRefId
        cmp = instanceService.getInstance("test:test_LocChng_CompositeComponent", ApplicationDef.class);
        this.serializeAndGoldFile(cmp, "compositeComponent");
    }

    /**
     * Negative test case: Check that events used to handle location change always extend aura:locationChange.
     */
    @Test
    public void testRegisteredLocationChangeEventExtendsAuraLocationChange() throws Exception {
        DefDescriptor<ApplicationDef> desc = definitionService.getDefDescriptor(
                "test:test_LocChng_NoExtends", ApplicationDef.class);
        try {
            instanceService.getInstance(desc);
            fail("Should have not fetched this component because the location change event does not extend aura:locationChange");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "markup://test:test_LocChng_NoExtendsEvt must extend aura:locationChange", getSource(desc));
        }
    }
}
