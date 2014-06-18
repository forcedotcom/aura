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
package org.auraframework.impl.library;

import java.io.ByteArrayOutputStream;

import org.auraframework.Aura;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.AuraImplTestCase;

import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Charsets;

/**
 * @hierarchy Aura.Unit Tests.Components.LibraryDef
 * @priority medium
 */
public class LibraryDefTest extends AuraImplTestCase {

    public LibraryDefTest(String name) {
        super(name);
    }

    /**
     * Verify the loading of libraryDefs.
     * 
     * @priority high
     * @throws Exception
     */
    public void testGetLibraryInstance() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_Library", LibraryDef.class);
        assertNotNull(libDef);
        
        assertEquals(3, libDef.getIncludes().size());
        
        IncludeDef dependency = libDef.getIncludes().get(0);
        IncludeDef tp = libDef.getIncludes().get(1);
        IncludeDef test = libDef.getIncludes().get(2);
        
        assertEquals("Dependency", dependency.getLibraryName());
        assertNull(dependency.getImports());
        
        assertEquals("tp", tp.getLibraryName());
        assertEquals("tp", tp.getExports());
        
        assertEquals("TestInclude", test.getLibraryName());
        assertEquals("Dependency", test.getImports().get(0));        
    }
    
    /**
     * Tests the ordering logic of the {@link LibraryDef} to ensure that imports will be serialized in order.
     * @throws Exception
     */
    public void testIncludeOrdering() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_LibraryOrdering", LibraryDef.class);
        assertNotNull(libDef);
        
        assertEquals(5, libDef.getIncludes().size());
        assertEquals("e", libDef.getIncludes().get(0).getLibraryName());
        assertEquals("d", libDef.getIncludes().get(1).getLibraryName());
        assertEquals("c", libDef.getIncludes().get(2).getLibraryName());
        assertEquals("b", libDef.getIncludes().get(3).getLibraryName());
        assertEquals("a", libDef.getIncludes().get(4).getLibraryName());
    }
    
    /**
     * Tests the exception thrown when a cycle exists in the lib's dependency tree.
     * @throws Exception
     */
    public void testIncludeNotOrderable() throws Exception {
	    try {
	    	Aura.getDefinitionService().getDefinition("test:test_LibraryNotOrderable", LibraryDef.class);
	    	fail("Getting library should fail because it is malformed.");
	    } catch (QuickFixException quickFixException) {
	    	assertTrue(quickFixException.getMessage().endsWith(
    			"aura:lbrary: Unable to order include statements by dependency tree."
			));
	    }
    }
    
    /**
     * Tests the {@link LibraryDef} (and {@link IncludeDef}) serialization.
     * @throws Exception
     */
    public void testSerialization() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_Library", LibraryDef.class);
        assertNotNull(libDef);
        
        String expected = "{\"descriptor\":\"markup://test:test_Library\",\"includes\":{\"Dependency\":function(define){define(\"test:test_Library:Dependency\",function(){returnfunction(){return\"DEPENDENCY\";}});},\"tp\":function(define){define(\"test:test_Library:tp\",function(){vartp=function(){return\"Iwillbecomeashimmedlibrary\";}returntp;});},\"TestInclude\":function(define){define(\"test:test_Library:TestInclude\",\"Dependency\",function(Dependency){returnfunction(){return\"TEST:\"+Dependency();}});}}}";
   

        ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        Json json = Json.createJsonStream(baos, false, false, false);
        libDef.serialize(json);
        json.close();
        assertEquals(expected.replaceAll("\\s", ""), new String(baos.toByteArray(), Charsets.UTF_8).replaceAll("\\s", ""));
    }
    
    /**
     * Tests to ensure that validation is done on define statements.
     * @throws Exception
     */
    public void testNoIncludeName() throws Exception {
	    try {
	    	Aura.getDefinitionService().getDefinition("test:test_LibraryNoIncludeName", LibraryDef.class);
	    	fail("Getting library should fail because it is malformed.");
	    } catch (QuickFixException quickFixException) {
	    	assertTrue(quickFixException.getMessage(), quickFixException.getMessage().endsWith("aura:include must specify a valid library name."));
	    }
    }
    
    /**
     * Tests to ensure that validation is done to enforce the inclusion of at least 1 library definition.
     * @throws Exception
     */
    public void testNoIncludes() throws Exception {
	    try {
	    	Aura.getDefinitionService().getDefinition("test:test_LibraryNoIncludes", LibraryDef.class);
	    	fail("Getting library should fail because it contains no includes.");
	    } catch (QuickFixException quickFixException) {
	    	assertEquals("aura:library must contain at least one aura:include attribute", quickFixException.getMessage());
	    }
    }
    
    /**
     * Tests to ensure non-functions are rejected from being imported as libraries.
     * @throws Exception
     */
    public void testBadLibrary() throws Exception {
	    try {
	    	Aura.getDefinitionService().getDefinition("test:test_LibraryBadImport", LibraryDef.class);
	    	fail("Getting library should fail because it contains an invalid library definition.");
	    } catch (QuickFixException quickFixException) {
	    	assertEquals("Library: Malformed does not represent a function, use \"exports\" to wrap third party libraries.", quickFixException.getMessage());
	    }
    }
}
