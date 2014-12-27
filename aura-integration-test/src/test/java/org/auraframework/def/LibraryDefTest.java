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
package org.auraframework.def;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.root.library.LibraryDefImpl;
import org.auraframework.impl.root.library.LibraryDefImpl.Builder;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.Json;
import org.mockito.Mockito;

import com.google.common.base.Charsets;
import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

public class LibraryDefTest extends DefinitionTest<LibraryDef> {

    public LibraryDefTest(String name) {
        super(name);
    }

    /**
     * Verify the loading of libraryDefs.
     */
    public void testGetLibraryInstance() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_Library", LibraryDef.class);
        assertNotNull(libDef);

        List<IncludeDefRef> includes = libDef.getIncludes();
        assertEquals(9, includes.size());
        assertInclude(includes.get(0), "basicFirst", null, null);
        assertInclude(includes.get(1), "basicSecond", null, null);
        assertInclude(includes.get(2), "hasVars", null, "firstVar");
        assertInclude(includes.get(3), "undefined", null, null);
        assertInclude(includes.get(4), "expectsImport", "basicFirst", null);
        assertInclude(includes.get(5), "reusesImport", "basicFirst", null);
        assertInclude(includes.get(6), "importsAndExport", "basicFirst", "anExport");
        assertInclude(includes.get(7), "handlesMultipleImports", "basicFirst,basicSecond,undefined", null);
        assertInclude(includes.get(8), "expectsImportAlso", "expectsImport", null);
    }

    private void assertInclude(IncludeDefRef include, String name, String importList, String export) {
        assertEquals("Unexpected name for include", name, include.getName());
        assertEquals("Unexpected export for " + name, export, include.getExport());

        List<DefDescriptor<IncludeDef>> actualImports = include.getImports();
        if (actualImports == null) {
            assertNull("Unexpected imports for " + name, importList);
        } else {
            String actualList = StringUtils.join(
                    Lists.transform(actualImports, new Function<DefDescriptor<IncludeDef>, String>() {
                        @Override
                        public String apply(DefDescriptor<IncludeDef> input) {
                            return input.getName();
                        }
                    }), ',');
            assertEquals(importList, actualList);
        }
    }

    /**
     * Tests the ordering logic of the {@link LibraryDef} to ensure that imports will be serialized in order.
     */
    public void testIncludeOrdering() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_LibraryOrdering", LibraryDef.class);
        assertNotNull(libDef);

        List<IncludeDefRef> includes = libDef.getIncludes();
        assertEquals(5, includes.size());
        assertEquals("e", includes.get(0).getName());
        assertEquals("d", includes.get(1).getName());
        assertEquals("c", includes.get(2).getName());
        assertEquals("b", includes.get(3).getName());
        assertEquals("a", includes.get(4).getName());
    }

    /**
     * Tests the exception thrown when a cycle exists in the lib's dependency tree.
     */
    public void testIncludeNotOrderable() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("test:test_LibraryNotOrderable", LibraryDef.class);
            fail("Getting library should fail because it is malformed.");
        } catch (Throwable t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "aura:library: Unable to order include statements by dependency tree.");
        }
    }

    /**
     * Tests the ordering logic of the {@link LibraryDef} to ensure that imports will be serialized in order.
     */
    public void testIncludeOrderingOneDependsOnRest() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition(
                "test:test_LibraryIncludeOrderingOneDependsOnRest", LibraryDef.class);
        assertNotNull(libDef);

        String libraryName1 = libDef.getIncludes().get(0).getName();
        String libraryName2 = libDef.getIncludes().get(1).getName();
        String libraryName3 = libDef.getIncludes().get(2).getName();

        assertEquals(4, libDef.getIncludes().size());

        // Ensure no dependency-included-twice malarkey:
        assertFalse(libraryName1.equals(libraryName2));
        assertFalse(libraryName2.equals(libraryName3));
        assertFalse(libraryName1.equals(libraryName3));

        // a, b, c are not required to be in any particular order since they have no dependencies:
        assertTrue(libraryName1.equals("a") || libraryName1.equals("b") || libraryName1.equals("c"));
        assertTrue(libraryName2.equals("a") || libraryName2.equals("b") || libraryName2.equals("c"));
        assertTrue(libraryName3.equals("a") || libraryName3.equals("b") || libraryName3.equals("c"));

        // d needs to be the last included dependency:
        assertEquals("d", libDef.getIncludes().get(3).getName());
    }

    /**
     * Tests the ordering logic of the {@link LibraryDef} to ensure a mix of external and internal dependencies work.
     */
    public void testLibraryOrderingInternalExternalMix() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_LibraryOrderingInternalExternalMix",
                LibraryDef.class);
        assertNotNull(libDef);

        // c only depends on something external, it has no library level dependencies and hence is first:
        assertEquals("c", libDef.getIncludes().get(0).getName());
        // b depends on c so it will be chosen second:
        assertEquals("b", libDef.getIncludes().get(1).getName());
        // a has both external and library dependencies, it depends on c and b and is therefore last:
        assertEquals("a", libDef.getIncludes().get(2).getName());
    }

    /**
     * Tests the {@link LibraryDef} (and {@link IncludeDefRef}) serialization.
     */
    public void testSerialization() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_Library", LibraryDef.class);
        assertNotNull(libDef);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        Json json = Json.createJsonStream(baos, false, false, false);
        libDef.serialize(json);
        json.close();

        String actual = new String(baos.toByteArray(), Charsets.UTF_8).replaceAll("\\s", "");
        goldFileJson(actual);
    }

    public void testValidateDefinitionWithoutIncludes() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        Builder builder = new LibraryDefImpl.Builder();
        builder.setDescriptor(libDesc);

        LibraryDefImpl libraryDef = builder.build();

        try {
            libraryDef.validateDefinition();
            fail("LibraryDef requires an IncludeDef");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    "aura:library must contain at least one aura:include attribute");
        }
    }

    public void testValidateDefinitionWithDuplicateIncludes() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        Builder builder = new LibraryDefImpl.Builder();
        builder.setDescriptor(libDesc);

        IncludeDefRef include = Mockito.mock(IncludeDefRef.class);
        Mockito.doReturn("included").when(include).getName();

        IncludeDefRef includeDupe = Mockito.mock(IncludeDefRef.class);
        Mockito.doReturn("included").when(includeDupe).getName();

        List<IncludeDefRef> includes = ImmutableList.of(include, includeDupe);
        builder.setIncludes(includes);

        LibraryDefImpl libraryDef = builder.build();

        try {
            libraryDef.validateDefinition();
            fail("LibraryDef requires an IncludeDef");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    "aura:include with duplicate name found in library: included");
        }
    }
}
