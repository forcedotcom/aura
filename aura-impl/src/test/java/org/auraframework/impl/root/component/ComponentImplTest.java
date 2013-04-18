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
package org.auraframework.impl.root.component;

import java.util.Collections;

import org.auraframework.def.AttributeDefRef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;

public class ComponentImplTest extends AuraImplTestCase {

    public ComponentImplTest(String name) {
        super(name);
    }

    public void testComponentAttributeMap() throws Exception {
        ComponentImpl cmp = vendor.makeComponent("test:child1", "meh");
        AttributeDefRef adr = vendor.makeAttributeDefRef("attr", "some value", new Location("meh", 0));
        cmp.getAttributes().set(Collections.singleton(adr));

        assertEquals(1, cmp.getAttributes().size());

        assertEquals("some value", cmp.getAttributes().getExpression("attr"));

        try {
            AttributeDefRef adr2 = vendor.makeAttributeDefRef("badAttr", "blubber", new Location("meh", 0));
            cmp.getAttributes().set(Collections.singleton(adr2));
            fail("Should have thrown AuraException(Attribute not Defined)");
        } catch (AttributeNotFoundException expected) {
        }
    }

    public void testSerialize() throws Exception {
        Component testComponent = vendor.makeComponent("test:parent", "fuh");
        testComponent.getClass();
        serializeAndGoldFile(testComponent);
    }

}
