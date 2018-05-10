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
import org.auraframework.def.AttributeDef.SerializeToType;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.AttributeDefImpl.Builder;
import org.auraframework.impl.system.DefinitionImplUnitTest;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Test;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.Sets;

public class AttributeDefImplUnitTest extends DefinitionImplUnitTest<AttributeDefImpl, AttributeDef, AttributeDef, Builder> {

    @Mock
    protected DefDescriptor<? extends RootDefinition> parentDescriptor;
    @Mock
    protected DefDescriptor<TypeDef> typeDefDescriptor;
    @Mock
    protected AttributeDefRef defaultValue;
    protected boolean required;
    protected SerializeToType serializeTo;

    public AttributeDefImplUnitTest() {
        super();
        this.descriptorName = "testAttribute";
        this.qualifiedDescriptorName = "testAttribute";
    }

    // This is incorrect, and I'm not sure what we should test here.
    public void _testAppendDependenciesNullDefaultValue() throws Exception {
        Set<DefDescriptor<?>> dependencies = Mockito.spy(Sets.<DefDescriptor<?>> newHashSet());
        this.defaultValue = null;
        buildDefinition().appendDependencies(dependencies);
        Mockito.verifyNoMoreInteractions(dependencies);
        assertTrue(dependencies.isEmpty());
    }

    @Test
    public void testAppendDependenciesDefaultValue() throws Exception {
        Set<DefDescriptor<?>> dependencies = Mockito.spy(Sets.<DefDescriptor<?>> newHashSet());
        buildDefinition().appendDependencies(dependencies);
        Mockito.verify(this.defaultValue).appendDependencies(dependencies);
    }

    @Test
    public void testGetSerializeToNull() throws Exception {
        this.serializeTo = null;
        SerializeToType actual = buildDefinition().getSerializeTo();
        assertEquals(SerializeToType.BOTH, actual);
    }

    @Test
    public void testGetSerializeToNotNull() throws Exception {
        this.serializeTo = SerializeToType.NONE;
        SerializeToType actual = buildDefinition().getSerializeTo();
        assertEquals(this.serializeTo, actual);
    }

    @Test
    public void testGetTypeDef() throws Exception {
        TypeDef expected = Mockito.mock(TypeDef.class);
        Mockito.doReturn(expected).when(this.typeDefDescriptor).getDef();
        TypeDef actual = buildDefinition().getTypeDef();
        assertEquals(expected, actual);
    }

    @Test
    public void testSerializeDescriptor() throws Exception {
        JsonEncoder json = Mockito.mock(JsonEncoder.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeLiteral("[");
        inOrder.verify(json).writeValue(this.descriptor);
        inOrder.verify(json).writeLiteral("]");
    }

    @Test
    public void testSerializeTypeDefDescriptor() throws Exception {
        JsonEncoder json = Mockito.mock(JsonEncoder.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeLiteral("[");
        inOrder.verify(json).writeValue(this.typeDefDescriptor);
        inOrder.verify(json).writeLiteral("]");
    }

    @Test
    public void testSerializeDefaultValue() throws Exception {
        this.defaultValue = new AttributeDefRefImpl.Builder().setValue("Hello").build();
        JsonEncoder json = Mockito.mock(JsonEncoder.class);
        AttributeDef def = buildDefinition();
		def.serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeLiteral("[");
        inOrder.verify(json).writeValue("Hello");
        inOrder.verify(json).writeLiteral("]");
    }

    @Test
    public void testSerializeRequired() throws Exception {
        this.required = true;

        JsonEncoder json = Mockito.mock(JsonEncoder.class);
        buildDefinition().serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeLiteral("[");
        inOrder.verify(json).writeValue(this.required);
        inOrder.verify(json).writeLiteral("]");
    }
    
    /**
     * Since We serialize attributes using the position of the array, it's very important we do not change the order of
     * the attribute serialization without also changing the client parsing. If you did that, then change this test to match.
     * @throws Exception
     */
    @Test
    public void testAttributeSerializationOrder() throws Exception {
    	this.defaultValue = new AttributeDefRefImpl.Builder().setValue("Hello").build();
    	this.required = true;
        JsonEncoder json = Mockito.mock(JsonEncoder.class);
        AttributeDef def = buildDefinition();
		def.serialize(json);
        InOrder inOrder = Mockito.inOrder(json);
        inOrder.verify(json).writeLiteral("[");
        inOrder.verify(json).writeValue(this.descriptor);
        inOrder.verify(json).writeValue(this.typeDefDescriptor);
        inOrder.verify(json).writeValue(this.access.getAccessCode());
        inOrder.verify(json).writeValue(this.required);
        inOrder.verify(json).writeValue(this.defaultValue.getValue());
        inOrder.verify(json).writeLiteral("]");
    }

    @Test
    public void testValidateDefinitionNullTypeDefDescriptor() throws Exception {
        this.typeDefDescriptor = null;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for null typeDefDescriptor");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Invalid typeDefDescriptor: null");
        }
    }

    @Test
    public void testValidateDefinitionInvalidName() throws Exception {
        this.descriptorName = "i'm invalid";
        this.qualifiedDescriptorName = "i'm invalid";
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for invalid descriptor name");
        } catch (Exception e) {
            assertExceptionMessageStartsWith(e, InvalidDefinitionException.class,
                    String.format("Invalid attribute name: '%s',", this.qualifiedDescriptorName));
        }
    }

    @Test
    public void testValidateDefinitionInvalidSerializeToType() throws Exception {
        this.serializeTo = SerializeToType.INVALID;
        try {
            buildDefinition().validateDefinition();
            fail("Expected an exception for SerializeToType.INVALID");
        } catch (Exception e) {
            assertExceptionMessage(e, InvalidDefinitionException.class, "Invalid serializeTo value");
        }
    }

    @Test
    public void testValidateReferencesDefaultValue() throws Exception {
        TypeDef typeDef = Mockito.mock(TypeDef.class);
        ReferenceValidationContext rvc = Mockito.mock(ReferenceValidationContext.class);
        Mockito.doReturn(typeDef).when(rvc).getAccessibleDefinition(this.typeDefDescriptor);
        AttributeDef attributeDef = buildDefinition();
        Mockito.verifyZeroInteractions(this.defaultValue);
        attributeDef.validateReferences(rvc);
        Mockito.verify(this.defaultValue).parseValue(typeDef);
        Mockito.verify(this.defaultValue).validateReferences(rvc);
    }

    @Test
    public void testValidateReferencesParseThrowsException() throws Exception {
        TypeDef typeDef = Mockito.mock(TypeDef.class);
        Throwable expected = new AuraRuntimeException("");
        Throwable actual = null;
        ReferenceValidationContext rvc = Mockito.mock(ReferenceValidationContext.class);
        Mockito.doReturn(typeDef).when(rvc).getAccessibleDefinition(this.typeDefDescriptor);
        Mockito.doThrow(expected).when(this.defaultValue).parseValue(typeDef);
        try {
            buildDefinition().validateReferences(rvc);
        } catch (Exception e) {
            actual = e;
        }
        assertEquals(expected, actual);
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
