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
package org.auraframework.integration.test.def;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.def.DefinitionTest;
import org.auraframework.impl.root.library.LibraryDefImpl;
import org.auraframework.impl.root.library.LibraryDefImpl.Builder;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.JsonEncoder;
import org.mockito.Mockito;

import com.google.common.base.Charsets;
import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class LibraryDefTest extends DefinitionTest<LibraryDef> {

    public LibraryDefTest(String name) {
        super(name);
    }

    /**
     * Verify the loading of libraryDefs.
     */
    public void testGetLibraryInstance() throws Exception {
        LibraryDef libDef = definitionService.getDefinition("test:test_Library", LibraryDef.class);
        assertNotNull(libDef);

        List<IncludeDefRef> includes = libDef.getIncludes();
        assertEquals(9, includes.size());
        assertInclude(includes.get(0), "basicFirst", null, null);
        assertInclude(includes.get(1), "basicSecond", null, null);
        assertInclude(includes.get(2), "expectsImport", "basicFirst", null);
        assertInclude(includes.get(3), "expectsImportAlso", "expectsImport", null);
        assertInclude(includes.get(4), "reusesImport", "basicFirst", null);
        assertInclude(includes.get(5), "hasVars", null, "firstVar");
        assertInclude(includes.get(6), "importsAndExport", "basicFirst", "anExport");
        assertInclude(includes.get(7), "handlesMultipleImports", "basicFirst,basicSecond,undefined", "anExport");
        assertInclude(includes.get(8), "undefined", null, null);
    }

    /**
     * Tests that all includes have been defined and in the same order.
     */
    public void testIncludeOrdering() throws Exception {
        LibraryDef libDef = definitionService.getDefinition("test:test_LibraryOrdering", LibraryDef.class);
        assertNotNull(libDef);

        List<IncludeDefRef> includes = libDef.getIncludes();
        assertEquals(5, includes.size());
        assertEquals("a", includes.get(0).getName());
        assertEquals("b", includes.get(1).getName());
        assertEquals("c", includes.get(2).getName());
        assertEquals("d", includes.get(3).getName());
        assertEquals("e", includes.get(4).getName());
    }

    /**
     * Tests the {@link LibraryDef} (and {@link IncludeDefRef}) serialization.
     */
    public void testSerialization() throws Exception {
        LibraryDef libDef = definitionService.getDefinition("test:test_Library", LibraryDef.class);
        assertNotNull(libDef);

        ByteArrayOutputStream baos = new ByteArrayOutputStream(512);
        JsonEncoder json = JsonEncoder.createJsonStream(baos, false, false, false);
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

        LibraryDef libraryDef = builder.build();

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

        LibraryDef libraryDef = builder.build();

        try {
            libraryDef.validateDefinition();
            fail("LibraryDef requires an IncludeDef");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    "aura:include with duplicate name found in library: included");
        }
    }

    public void testSerializationWithAuraProdCompression() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("uncompressed",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(libDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeDesc.getName()));
        addSourceAutoCleanup(includeDesc,
                "function(){\n\tvar renamed = 'truth';\n\tif(window.blah)\n\t\t{renamed+=' hurts'}\n\treturn renamed}");

        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Authentication.AUTHENTICATED);

        Set<DefDescriptor<?>> descs = ImmutableSet.<DefDescriptor<?>> of(libDesc);
        Writer writer = new StringWriter();
        Aura.getServerService().writeDefinitions(descs, writer);
        String actual = writer.toString();
        String expected = "function(){var a=\"truth\";window.blah&&(a+=\" hurts\");return a}";
        if (!actual.contains(expected)) {
            fail(String.format("library code was not compressed - expected <%s> but got <%s>", expected, actual));
        }
    }

    private void assertInclude(IncludeDefRef include, String name, String importList, String export) {
      assertEquals("Unexpected name for include", name, include.getName());
      assertEquals("Unexpected export for " + name, export, include.getExport());

      List<DefDescriptor<IncludeDef>> actualImports = include.getImports();
      if (actualImports == null) {
          assertNull("Unexpected imports for " + name, importList);
      } else {
         String actualList = String.join(",",
                 Lists.transform(actualImports, new Function<DefDescriptor<IncludeDef>, String>() {
                     @Override
                     public String apply(DefDescriptor<IncludeDef> input) {
                         return input.getName();
                     }
                 }));
         assertEquals(importList, actualList);
      }
  }
}
