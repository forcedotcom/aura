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

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.Expression;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.type.TypeUtil.ConversionException;
import org.mockito.Mockito;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Sets;

public class AttributeDefRefTest extends AuraImplTestCase {

    private static final String testAttributeDescriptorName = "testAttribute";

    public AttributeDefRefTest(String name) {
        super(name);
    }

    private AttributeDefRefImpl assertParsedValue(Object original, String typeDefDesc, Object expected)
            throws Exception {
        AttributeDefRefImpl adr = vendor.makeAttributeDefRef(testAttributeDescriptorName, original, null);

        // getValue starts as just the markup string
        Object value = adr.getValue();
        assertEquals("unparsed value", original, value);

        adr.parseValue(Aura.getDefinitionService().getDefinition(typeDefDesc, TypeDef.class));
        value = adr.getValue();
        assertEquals("parsed value", expected, value);

        return adr;
    }

    private void assertParseException(String markup, String typeDefDesc, Class<?> exceptionType, String startsWith)
            throws Exception {
        try {
            assertParsedValue(markup, typeDefDesc, null);
        } catch (Throwable t) {
            t.printStackTrace(System.err);
            checkExceptionStart(t, InvalidExpressionException.class, startsWith);
            Throwable cause = t.getCause();
            checkExceptionStart(cause, exceptionType, startsWith);
        }
    }

    /**
     * Non-expressions are parsed by the TypeDef.
     */
    public void testParseValueSimple() throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String typeName = auraTestingUtil.getNonce("customType");
        DefDescriptor<TypeDef> typeDesc = DefDescriptorImpl.getInstance(typeName, TypeDef.class);
        TypeDef mockType = Mockito.mock(TypeDef.class);
        Mockito.doReturn(typeDesc).when(mockType).getDescriptor();
        Mockito.doReturn("fabulous").when(mockType).valueOf("parseable");
        context.getDefRegistry().addLocalDef(mockType);
        AttributeDefRefImpl adr = assertParsedValue("parseable", typeName, "fabulous");
        assertEquals("unparsed for toString()", "parseable", adr.toString());
    }

    /**
     * Expressions are not parsed in parseValue.
     */
    public void testParseValueExpression() throws Exception {
        Expression expr = Mockito.mock(Expression.class);
        assertParsedValue(expr, "long", expr);
        Mockito.verifyNoMoreInteractions(expr);
    }

    /**
     * Primitives converted to respective types.
     */
    public void testParseValuePrimitives() throws Exception {
        // current types with default converters
        assertParsedValue("1", "int", 1);
        assertParsedValue("1", "long", 1L);
        assertParsedValue("1", "double", 1.0);
        assertParsedValue("1", "string", "1");
        assertParsedValue("1", "boolean", false);
        assertParsedValue("1", "Object", "1"); // object just remains the original string
    }

    /**
     * Parse errors wrapped in InvalidExpressionException.
     */
    public void testParseValueWithConversionException() throws Exception {
        // values without a converter from String
        assertParseException("1", "byte", ConversionException.class, "No Converter found for ");
        assertParseException("1", "short", ConversionException.class, "No Converter found for ");
        assertParseException("1", "float", ConversionException.class, "No Converter found for ");
        assertParseException("1", "char", ConversionException.class, "No Converter found for ");

        // number format
        assertParseException("xxx", "long", NumberFormatException.class, "For input string: \"xxx\"");

        // number overflow (W-1564567)
        // assertParseException("987654321987654321987654321", "int", ParseException.class, "Unparseable number: ");
    }

    public void testValidateReferencesChainsToValue() throws Exception {
        Definition value = Mockito.mock(Definition.class);
        AttributeDefRefImpl adr = vendor.makeAttributeDefRef(testAttributeDescriptorName, value, null);
        Mockito.verify(value, Mockito.times(0)).validateReferences();
        adr.validateReferences();
        Mockito.verify(value, Mockito.times(1)).validateReferences();
    }

    public void testValidateReferencesChainsThroughCollection() throws Exception {
        Definition value = Mockito.mock(Definition.class);
        AttributeDefRefImpl adr = vendor
                .makeAttributeDefRef(testAttributeDescriptorName, ImmutableList.of(value), null);
        Mockito.verify(value, Mockito.times(0)).validateReferences();
        adr.validateReferences();
        Mockito.verify(value, Mockito.times(1)).validateReferences();
    }

    public void testAppendDependenciesChainsToValue() throws Exception {
        Definition value = Mockito.mock(Definition.class);
        AttributeDefRefImpl adr = vendor.makeAttributeDefRef(testAttributeDescriptorName, value, null);
        Mockito.verify(value, Mockito.times(0)).appendDependencies(Mockito.<Set<DefDescriptor<?>>> any());
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        adr.appendDependencies(dependencies);
        Mockito.verify(value, Mockito.times(1)).appendDependencies(Mockito.<Set<DefDescriptor<?>>> any());
    }

    public void testAppendDependenciesChainsThroughCollection() throws Exception {
        Definition value = Mockito.mock(Definition.class);
        AttributeDefRefImpl adr = vendor.makeAttributeDefRef(testAttributeDescriptorName, Sets.newHashSet(value), null);
        Mockito.verify(value, Mockito.times(0)).appendDependencies(Mockito.<Set<DefDescriptor<?>>> any());
        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        adr.appendDependencies(dependencies);
        Mockito.verify(value, Mockito.times(1)).appendDependencies(Mockito.<Set<DefDescriptor<?>>> any());
    }

    /**
     * Equality is based on unparsed values.
     */
    public void testEquals() throws Exception {
        AttributeDefRefImpl adr1 = vendor.makeAttributeDefRef(testAttributeDescriptorName, "1", null);
        AttributeDefRefImpl adr2 = vendor.makeAttributeDefRef(testAttributeDescriptorName, "1", null);
        assertEquals("unparsed def refs should be equal", adr1, adr2);

        adr1.parseValue(Aura.getDefinitionService().getDefinition("string", TypeDef.class));
        assertEquals("parsed def ref and unparsed def ref should still be equal", adr1, adr2);

        adr2.parseValue(Aura.getDefinitionService().getDefinition("long", TypeDef.class));
        assertEquals("differently parsed def refs should still be equal", adr1, adr2);
    }
}
