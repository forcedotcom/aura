package org.auraframework.impl.library;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ImportDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

public class ImportDefTest extends AuraImplTestCase {

    public ImportDefTest(String name) {
        super(name);
    }

    /**
     * Tests to ensure that the imported librarys are properly compiled with the component.
     * @throws Exception
     */
    public void testImport() throws Exception {
        ComponentDef cmpDef = Aura.getDefinitionService().getDefinition("test:test_Import", ComponentDef.class);
        assertNotNull(cmpDef);
        
        List<ImportDef> importDefs = Lists.newLinkedList(cmpDef.getImportDefs());
        assertNotNull(importDefs);
        assertEquals(1, importDefs.size());
        assertEquals("test:test_Library", importDefs.get(0).getLibraryName());
    }
    
    /**
     * Tests to ensure that the library attribute must be specified.
     * @throws Exception
     */
    public void testImportNoLibrary() throws Exception {
    	try {
    		Aura.getDefinitionService().getDefinition("test:test_ImportNoLibrary", ComponentDef.class);
    		fail("QuickFixException expected. Library parameter is missing.");
    	} catch (QuickFixException quickFixException) {
    		assertTrue(quickFixException.getMessage().endsWith("Import must specify a valid library name."));
    	}
    }
    
    
    /**
     * Tests to ensure that the property attribute must be specified.
     * @throws Exception
     */
    public void testImportNoProperty() throws Exception {
    	try {
    		Aura.getDefinitionService().getDefinition("test:test_ImportNoProperty", ComponentDef.class);
    		fail("QuickFixException expected. property parameter is missing.");
    	} catch (QuickFixException quickFixException) {
    		assertEquals("aura:import must specify property=\"…\"", quickFixException.getMessage());
    	}
    }
}
