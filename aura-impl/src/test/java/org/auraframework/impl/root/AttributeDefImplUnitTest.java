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
package org.auraframework.impl.root;

import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.Definition.Visibility;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.AttributeDefImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.Json;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.Sets;

public class AttributeDefImplUnitTest extends
        DefinitionImplUnitTest<AttributeDefImpl, AttributeDef, AttributeDef, Builder> {

    @Mock
    protected DefDescriptor<? extends RootDefinition> parentDescriptor;
    @Mock
    protected DefDescriptor<TypeDef> typeDefDescriptor;
    @Mock
    protected AttributeDefRef defaultValue;
    protected boolean required;
    protected SerializeToType serializeTo;

    public AttributeDefImplUnitTest(String name) {
        super(name);
        this.qualifiedDescriptorName = "testAttribute";
    }

    public void testAppendDependenciesNullDefaultValue() throws Exception {
        Set<DefDescriptor<?>> dependencies = Mockito.spy(Sets.<DefDescriptor<?>> newHashSet());
        this.defaultValue = null;
        buildDefinition().appendDependencies(dependencies);
        Mockito.verifyNoMoreInteractions(dependencies);
        assertTrue(dependencies.isEmpty());
    }

    public void testAppendDependenciesDefaultValue() throws Exception {
        Set<DefDescriptor<?>> dependencies = Mockito.spy(Sets.<DefDescriptor<?>> newHashSet());
        buildDefinition().appendDependencies(dependencies);
        Mockito.verify(this.defaultValue).appendDependencies(dependencies);
    }

    public void testGetSerializeToNull() throws Exception {
        this.serializeTo = null;
        SerializeToType actual = buildDefinition().getSerializeTo();
        assertEquals(SerializeToType.BOTH, actual);
    }

    public void testGetSerializeToNotNull() throws Exception {
        this.serializeTo = SerializeToType.NONE;
        SerializeToType actual = buildDefinition().getSerializeTo();
        assertEquals(this.serializeTo, actual);
    }

    public void testGetTypeDef() throws Exception {
        TypeDef expected = Mockito.mock(TypeDef.class);
        Mockito.doReturn(expected).when(this.typeDefDescriptor).getDef();
        TypeDef actual = buildDefinition().getTypeDef();
        assertEquals(expected, actual);
    }

    public void testSerializeDescriptor() throws Exception {
        Json json = Mockito.mock(Json.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeMapBegin();
        inOrder.verify(json).writeMapEntry("descriptor", this.descriptor);
        inOrder.verify(json).writeMapEnd();
    }

    public void testSerializeTypeDefDescriptor() throws Exception {
        Json json = Mockito.mock(Json.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeMapBegin();
        inOrder.verify(json).writeMapEntry("typeDefDescriptor", this.typeDefDescriptor);
        inOrder.verify(json).writeMapEnd();
    }

    public void testSerializeDefaultValue() throws Exception {
        Json json = Mockito.mock(Json.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeMapBegin();
        inOrder.verify(json).writeMapEntry("defaultValue", this.defaultValue);
        inOrder.verify(json).writeMapEnd();
    }

    public void testSerializeRequired() throws Exception {
        Json json = Mockito.mock(Json.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeMapBegin();
        inOrder.verify(json).writeMapEntry("required", this.required);
        inOrder.verify(json).writeMapEnd();
    }

    public void testSerializeSerializeTo() throws Exception {
        Json json = Mockito.mock(Json.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeMapBegin();
        inOrder.verify(json).writeMapEntry("serializeTo", this.serializeTo);
        inOrder.verify(json).writeMapEnd();
    }

    public void testSerializeVisibility() throws Exception {
        Json json = Mockito.mock(Json.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeMapBegin();
        inOrder.verify(json).writeMapEntry("visibility", this.visibility);
        inOrder.verify(json).writeMapEnd();
    }

    public void testValidateDefinitionNullTypeDefDescriptor() throws Exception {
        this.typeDefDescriptor = null;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for null typeDefDescriptor");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Invalid typeDefDescriptor: null");
        }
    }

    public void testValidateDefinitionInvalidName() throws Exception {
        this.qualifiedDescriptorName = "i'm invalid";
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for invalid descriptor name");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class,
                    String.format("Invalid attribute name: '%s',", this.qualifiedDescriptorName));
        }
    }

    public void testValidateDefinitionInvalidSerializeToType() throws Exception {
        this.serializeTo = SerializeToType.INVALID;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for SerializeToType.INVALID");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Invalid serializeTo value");
        }
    }

    @Override
    public void testValidateDefinitionInvalidVisibility() throws Exception {
        super.testValidateDefinitionInvalidVisibility();
    }

    public void testValidateDefinitionRequiredAndPublicVisibility() throws Exception {
        this.required = true;
        this.visibility = Visibility.PUBLIC;
        buildDefinition().validateDefinition();
    }

    public void testValidateDefinitionNotRequiredAndPrivateVisibility() throws Exception {
        this.required = false;
        this.visibility = Visibility.PRIVATE;
        buildDefinition().validateDefinition();
    }

    public void testValidateDefinitionRequiredAndPrivateVisibility() throws Exception {
        this.required = true;
        this.visibility = Visibility.PRIVATE;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for a required and private attribute");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class,
                    "Cannot set an attribute as required and private");
        }
    }

    public void testValidateReferencesDefaultValue() throws Exception {
        TypeDef typeDef = Mockito.mock(TypeDef.class);
        Mockito.doReturn(typeDef).when(this.typeDefDescriptor).getDef();
        AttributeDef attributeDef = buildDefinition();
        Mockito.verifyZeroInteractions(this.defaultValue);
        attributeDef.validateReferences();
        Mockito.verify(this.defaultValue).parseValue(typeDef);
        Mockito.verify(this.defaultValue).validateReferences();
    }

    public void testValidateReferencesReferenceThrowsClassNotFound() throws Exception {
        Throwable t = new AuraRuntimeException(new ClassNotFoundException());
        Mockito.doThrow(t).when(this.typeDefDescriptor).getDef();
        Mockito.doReturn(DefType.ATTRIBUTE).when(this.typeDefDescriptor).getDefType();
        Mockito.doReturn("something").when(this.typeDefDescriptor).getQualifiedName();
        try {
            buildDefinition().validateReferences();
            fail("Expected a DefinitionNotFoundException if class not found for a reference");
        } catch (Exception e) {
            assertExceptionMessage(e, DefinitionNotFoundException.class, "No ATTRIBUTE named something found");
        }
    }

    public void testValidateReferencesReferenceThrowsOtherException() throws Exception {
        Throwable expected = new AuraRuntimeException("");
        Mockito.doThrow(expected).when(this.typeDefDescriptor).getDef();
        try {
            buildDefinition().validateReferences();
            fail("Expected an exception for failed reference validation");
        } catch (Exception actual) {
            assertEquals(expected, actual);
        }
    }

    @Override
    protected Builder getBuilder() {
        return new Builder();
    }

    @Override
    protected AttributeDef buildDefinition(Builder builder) throws Exception {
        builder.setParentDescriptor(this.parentDescriptor);
        builder.setTypeDefDescriptor(this.typeDefDescriptor);
        builder.setDefaultValue(this.defaultValue);
        builder.setRequired(this.required);
        builder.setSerializeTo(this.serializeTo);
        return super.buildDefinition(builder);
    }
}