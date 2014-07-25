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

import org.auraframework.Aura;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.root.library.LibraryDefImpl;
import org.auraframework.impl.root.library.LibraryDefImpl.Builder;

import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.Json;
import org.mockito.Mockito;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;

public class LibraryDefTest extends DefinitionTest<LibraryDef> {

    public LibraryDefTest(String name) {
        super(name);
    }

    /**
     * Tests the ordering logic of the {@link LibraryDef} to ensure that imports will be serialized in order.
     */
    public void testIncludeOrdering() throws Exception {
        LibraryDef libDef = Aura.getDefinitionService().getDefinition("test:test_LibraryOrdering", LibraryDef.class);
        assertNotNull(libDef);

        assertEquals(5, libDef.getIncludes().size());
        assertEquals("e", libDef.getIncludes().get(0).getName());
        assertEquals("d", libDef.getIncludes().get(1).getName());
        assertEquals("c", libDef.getIncludes().get(2).getName());
        assertEquals("b", libDef.getIncludes().get(3).getName());
        assertEquals("a", libDef.getIncludes().get(4).getName());
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
