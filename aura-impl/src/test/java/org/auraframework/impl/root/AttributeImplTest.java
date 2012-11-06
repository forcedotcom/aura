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
package org.auraframework.impl.root;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Attribute;

public class AttributeImplTest extends AuraImplTestCase {
    public AttributeImplTest(String name) {
        super(name);
    }

    public void testAttribute() throws Exception {
        Attribute testAttribute = vendor.makeAttribute("testAttribute");
        assertNotNull(testAttribute);

        Attribute testFakeAttribute = vendor.makeAttribute("fakeTestAttribute");
        assertNotNull(testFakeAttribute);
    }

    public void testGetName() throws Exception {
        Attribute testAttribute = vendor.makeAttribute("testAttribute");
        assertEquals("testAttribute", testAttribute.getName());
        assertEquals("fakeTestAttribute", vendor.makeAttribute("fakeTestAttribute").getName());
    }

    public void testSetAndGetValue() throws Exception {
        String valString = "-1";
        int valInt = -1;
        Attribute testAttribute = vendor.makeAttribute("testAttribute");

        testAttribute.setValue(null);
        assertNull(testAttribute.getValue());
        assertFalse(valString.equals(testAttribute.getValue()));
        assertFalse(Integer.valueOf(valInt).equals(testAttribute.getValue()));

        testAttribute.setValue(valString);
        assertNotNull(testAttribute.getValue());
        assertEquals(valString, testAttribute.getValue());
        assertFalse(Integer.valueOf(valInt).equals(testAttribute.getValue()));

        testAttribute.setValue(valInt);
        assertNotNull(testAttribute.getValue());
        assertFalse(valString.equals(testAttribute.getValue()));
        assertEquals(Integer.valueOf(valInt), testAttribute.getValue());
    }

    public void testSerialize() throws Exception {
        Attribute testAttribute = vendor.makeAttribute("testAttribute");
        testAttribute.setValue("hello");
        serializeAndGoldFile(testAttribute);
    }
}
