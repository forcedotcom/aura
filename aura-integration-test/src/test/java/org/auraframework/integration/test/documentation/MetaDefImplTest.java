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
package org.auraframework.integration.test.documentation;

import org.auraframework.def.MetaDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.MetaDefImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class MetaDefImplTest extends AuraImplTestCase {

    @Test
    public void testGetName() throws Exception {
        MetaDef def = buildDef("foo", "bar");
        
        String expected = "foo";
        String actual = def.getName();
        
        assertEquals("MetaDef did not have expected name", expected, actual);
    }

    @Test
    public void testGetValue() throws Exception {
        MetaDef def = buildDef("foo", "bar");

        String expected = "bar";
        String actual = def.getEscapedValue();

        assertEquals("MetaDef did not have expected value", expected, actual);
    }
    
    @Test
    public void testGetEscapedValue() throws Exception {
        MetaDef def = buildDef("foo", "foo&foo");

        String expected = "foo&amp;foo";
        String actual = def.getEscapedValue();

        assertEquals("MetaDef did not have expected value", expected, actual);
    }


    @Test
    public void validatesName() throws Exception {
        try {
            buildDef("1", "bar").validateDefinition();  
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Invalid name");
        }
    }

    @Test
    public void validatesValueIsSet() throws Exception {
        try {
            buildDef("foo", null).validateDefinition();  
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing value");
        }
    }

    private MetaDef buildDef(String name, String value) throws Exception {
        MetaDefImpl.Builder builder = new MetaDefImpl.Builder();
        builder.setDescriptor(definitionService.getDefDescriptor(name, MetaDef.class));
        builder.setValue(value);
        return builder.build();
    }
}
