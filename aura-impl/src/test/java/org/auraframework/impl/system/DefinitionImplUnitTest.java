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
package org.auraframework.impl.system;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.Definition.Visibility;
import org.auraframework.impl.system.DefinitionImpl.RefBuilderImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.test.UnitTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.text.Hash;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.ImmutableMap;

public abstract class DefinitionImplUnitTest<I extends DefinitionImpl<D>, D extends Definition, R extends Definition, B extends RefBuilderImpl<D, R>>
        extends UnitTestCase {

    protected String qualifiedDescriptorName;
    @Mock
    protected DefDescriptor<D> descriptor;
    @Mock
    protected Location location;
    protected Map<SubDefDescriptor<?, D>, Definition> subDefs;
    protected String description;
    protected Visibility visibility = Visibility.PUBLIC;
    @Mock
    protected Hash sourceHash;
    protected String ownHash;

    protected AuraContext testAuraContext;

    public DefinitionImplUnitTest(String name) {
        super(name);
    }

    public void testGetDescription() throws Exception {
        this.description = "this is a test Definition";
        String actual = buildDefinition().getDescription();
        assertEquals(this.description, actual);
    }

    public void testGetDescriptor() throws Exception {
        Object actual = buildDefinition().getDescriptor();
        assertEquals(this.descriptor, actual);
    }

    public void testGetLocation() throws Exception {
        Location actual = buildDefinition().getLocation();
        assertEquals(this.location, actual);
    }

    public void testGetName() throws Exception {
        String actual = buildDefinition().getName();
        assertEquals(this.qualifiedDescriptorName, actual);
    }

    public void testGetNameNullDescriptor() throws Exception {
        this.descriptor = null;
        R instance = buildDefinition();
        String expected = instance.getClass().getName();
        String actual = buildDefinition().getName();
        assertEquals(expected, actual);
    }

    public void testGetOwnHashWithSourceHash() throws Exception {
        Mockito.doReturn("myhash").when(this.sourceHash).toString();
        String actual = buildDefinition().getOwnHash();
        assertEquals("myhash", actual);
    }

    public void testGetOwnHashWithOwnHashAndNoSourceHash() throws Exception {
        this.sourceHash = null;
        this.ownHash = "ownhash";
        String actual = buildDefinition().getOwnHash();
        assertEquals(this.ownHash, actual);
    }

    public void testGetSubDefinition() throws Exception {
        @SuppressWarnings("unchecked")
        SubDefDescriptor<?, D> subdesc = Mockito.mock(SubDefDescriptor.class);
        Definition def = Mockito.mock(Definition.class);
        this.subDefs = ImmutableMap.<SubDefDescriptor<?, D>, Definition> of(subdesc, def);
        Object actual = buildDefinition().getSubDefinition(subdesc);
        assertEquals(def, actual);
    }

    public void testGetSubDefinitionNull() throws Exception {
        this.subDefs = ImmutableMap.of();
        Definition actual = buildDefinition().getSubDefinition(null);
        assertNull(actual);
    }

    public void testGetSubDefinitionWithoutSubDefinitions() throws Exception {
        SubDefDescriptor<?, ?> subdesc = Mockito.mock(SubDefDescriptor.class);
        this.subDefs = null;
        Object actual = buildDefinition().getSubDefinition(subdesc);
        assertNull(actual);
    }

    public void testGetSubDefinitionNotFound() throws Exception {
        SubDefDescriptor<?, ?> subdesc = Mockito.mock(SubDefDescriptor.class);
        this.subDefs = ImmutableMap.of();
        Object actual = buildDefinition().getSubDefinition(subdesc);
        assertNull(actual);
    }

    public void testGetVisibilityNull() throws Exception {
        this.visibility = null;
        Visibility actual = buildDefinition().getVisibility();
        assertEquals(Visibility.PUBLIC, actual);
    }

    public void testGetVisibilityNotNull() throws Exception {
        this.visibility = Visibility.PRIVATE;
        Visibility actual = buildDefinition().getVisibility();
        assertEquals(visibility, actual);
    }

    public void testIsValid() throws Exception {
        boolean actual = buildDefinition().isValid();
        assertFalse(actual);
    }

    public void testMarkValid() throws Exception {
        R def = buildDefinition();
        def.markValid();
        boolean actual = def.isValid();
        assertTrue(actual);
    }

    public void testValidateDefinition() throws Exception {
        buildDefinition().validateDefinition();
    }

    public void testValidateDefinitionNullDescriptor() throws Exception {
        this.descriptor = null;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for null descriptor");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "No descriptor");
        }
    }

    public void testValidateDefinitionInvalidVisibility() throws Exception {
        this.visibility = Visibility.INVALID;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for Visibility.INVALID");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Invalid visibility value");
        }
    }

    // used to setup references to be validated by subclasses
    public void testValidateReferences() throws Exception {
        setupValidateReferences();
        buildDefinition().validateReferences();
    }

    @Override
    public void tearDown() throws Exception {
        if (testAuraContext != null) {
            Aura.getContextService().endContext();
        }
    }

    protected void setupValidateReferences() throws Exception {
    }

    /**
     * Get a Builder instance to use for building test instances
     */
    protected abstract B getBuilder();

    /**
     * Get a DefinitionImpl instance to test
     */
    protected R buildDefinition() throws Exception {
        return buildDefinition(getBuilder());
    }

    protected R buildDefinition(B builder) throws Exception {
        if (this.qualifiedDescriptorName != null && this.descriptor != null) {
            Mockito.doReturn(this.qualifiedDescriptorName).when(this.descriptor).getName();
        }
        builder.setDescriptor(this.descriptor);
        builder.setLocation(this.location);
        builder.subDefs = this.subDefs;
        builder.setDescription(this.description);
        builder.setVisibility(this.visibility);
        builder.hash = this.sourceHash;
        builder.ownHash = this.ownHash;
        return builder.build();
    }
}