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
package org.auraframework.integration.test.clientlibrary;

import java.io.ByteArrayOutputStream;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ResourceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.clientlibrary.ResourceDefImpl;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.base.Charsets;

public class ResourceDefImplTest extends AuraImplTestCase {
    public ResourceDefImplTest(String name){
        super(name);
    }
    
    public void testGetResourceDefWithDefaultPrefix(){
        DefDescriptor<ResourceDef> resourceDef = definitionService.getDefDescriptor("clientLibraryTest.clientLibraryTest", ResourceDef.class);
        assertEquals(DefDescriptor.JAVASCRIPT_PREFIX,resourceDef.getPrefix());
    }
    
    public void testGetComponentJSResourceDef()throws Exception{
        DefDescriptor<ResourceDef> jsResourceDef = definitionService.getDefDescriptor("js://clientLibraryTest.clientLibraryTest", ResourceDef.class);
        assertNotNull(jsResourceDef);
        ResourceDef def = definitionService.getDefinition(jsResourceDef);
        assertNotNull("Unable to locate Javascript resource def", def);
        assertTrue("Component resources should be combinable.", ((ResourceDefImpl)def).canCombine());
    }
    
    public void testGetComponentCSSResourceDef()throws Exception{
        DefDescriptor<ResourceDef> cssResourceDef = definitionService.getDefDescriptor("css://clientLibraryTest.clientLibraryTest", ResourceDef.class);
        assertNotNull(cssResourceDef);
        ResourceDef def = definitionService.getDefinition(cssResourceDef);
        assertNotNull("Unable to locate css resource def", def);
        assertTrue("Component resources should be combinable.", ((ResourceDefImpl)def).canCombine());
        assertTrue("Failed to load style resource", ((ResourceDefImpl)def).getContents().contains(".clientLibraryTestStyle"));
    }

    public void testResourceDefAsPartOfComponentDef()throws Exception{
        DefDescriptor<ApplicationDef> cmpDesc = definitionService.getDefDescriptor("clientLibraryTest:clientLibraryTest", ApplicationDef.class);
        ApplicationDef def = definitionService.getDefinition(cmpDesc);

        Set<ResourceDef> resourceDefs = def.getResourceDefs();

        DefDescriptor<ResourceDef> jsResourceDefDesc = definitionService.getDefDescriptor("js://clientLibraryTest.clientLibraryTest", ResourceDef.class);
        ResourceDef jsResourceDef = definitionService.getDefinition(jsResourceDefDesc);
        DefDescriptor<ResourceDef> cssResourceDefDesc = definitionService.getDefDescriptor("css://clientLibraryTest.clientLibraryTest", ResourceDef.class);
        ResourceDef cssResourceDef = definitionService.getDefinition(cssResourceDefDesc);

        assertTrue("JS resource should be in component", resourceDefs.contains(jsResourceDef));
        assertTrue("CSS resource should be in component", resourceDefs.contains(cssResourceDef));

        ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false, false);
        jsResourceDef.serialize(json);
        cssResourceDef.serialize(json);
        json.close();
        assertEquals("ResourceDefs are not serialized.", "", new String(baos.toByteArray(), Charsets.UTF_8));
    }
    
}
