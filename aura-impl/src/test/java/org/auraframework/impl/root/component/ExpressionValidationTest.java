/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl.root.component;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

/**
 * Test expression validation
 * 
 * @hierarchy Aura.Unit Tests.Components.Expressions
 * @userStory a07B0000000E82y
 */
public class ExpressionValidationTest extends AuraImplTestCase {

    public ExpressionValidationTest(String name) {
        super(name);
    }

    /**
     * Expressions are not allowed for top-level component attributes.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testTopLevelComponentExpressionsNotAllowed() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application><aura:attribute name='strAtt' type='String'>{!who.cares}</aura:attribute></aura:application>");
        try {
            Aura.getInstanceService().getInstance(appDesc);
            fail("Expressions cannot be used as attribute values in top-level components.");
        } catch (AuraRuntimeException e) {
            assertEquals("Expressions cannot be used as attribute values in top-level components.", e.getMessage());
        }
    }

    /**
     * Exceptions from parsing by ExpressionAdapter are forwarded. See ExpressionParserTest for more tests that result
     * in parse exceptions.
     * 
     * @expectedResults AuraRuntimeException with underlying parse exception when instantiating the component
     */
    public void testParseExceptions() throws Exception {
        verifyInvalidExpressionException("{!too bad}", "", "unexpected token: an identifier");
        verifyInvalidExpressionException("{!5+(6-7}", "", "unexpected end of expression");
    }

    /**
     * Unknown value provider is not allowed. See ValueProviderType for acceptable providers.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testUnknownValueProvider() throws Exception {
        verifyInvalidExpressionException("{!x.fit}", "", "!!!No current validation on ValueProvider");
    }

    /**
     * Note: this test doesn't pass when using aura-impl unit test target Undefined label references are not allowed.
     * 
     * @expectedResults InvalidExpressionException when instantiating the component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testUnknownLabel() throws Exception {
        verifyInvalidExpressionException("{!$Label.Aura.goomba}", "", "No label found for Aura.goomba");
    }

    /**
     * Label references must have only section and name parts.
     * 
     * @expectedResults InvalidExpressionException when instantiating the component
     */
    public void testInvalidLabelExpression() throws Exception {
        verifyInvalidExpressionException("{!$Label.SomeSection}", "", "Labels should have a section and a name:");
        verifyInvalidExpressionException("{!$Label.SomeSection.ExtraPart.Name}", "",
                "Labels should have a section and a name:");
    }

    /**
     * Nested expressions are not allowed.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    public void testNestedExpressions() throws Exception {
        verifyInvalidExpressionException("{!$'test'{!'Attribute'}}", "",
                "Cannot mix expression and literal string in attribute value");
    }

    /**
     * Expression return type must match the attribute type.
     * 
     * @expectedResults InvalidExpressionException when instantiating the component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testTypeChecking() throws Exception {
        verifyInvalidExpressionException("{!5+1}", "", "!!!No current type validation - returns null");
        verifyInvalidExpressionException("", "{!'NotANumber'}", "!!!No current type validation - returns null");
    }

    /**
     * Expressions that directly or indirectly reference themselves are not allowed.
     * 
     * @expectedResults InvalidExpressionException when instantiating the component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testCyclicalReference() throws Exception {
        verifyInvalidExpressionException("{!v.strAtt}again", "",
                "!!!No current validation of recursive expressions - returns arraylist of propref and string");
        verifyInvalidExpressionException("{!v.strAtt+'x'}", "",
                "!!!No current validation of recursive expressions - returns null");
        verifyInvalidExpressionException("{!v.dblAtt}", "{!v.strAtt}",
                "!!!No current validation of recursive expressions - returns null");
    }

    /**
     * Keywords not allowed in property names.
     * 
     * @expectedResults InvalidExpressionException when instantiating the component
     */
    // TODO(W-1480493): Expression validation needs work
    public void _testKeywordsNotAllowed() throws Exception {
        final String baseMsg = "expecting an identifier, found ";
        verifyInvalidExpressionException("{!v.null}", "", baseMsg + "'null'");
        verifyInvalidExpressionException("{!add(m.integer, m.eq)}", "", baseMsg + "'eq'");
        verifyInvalidExpressionException("{!v.raise ? c.add : c.subtract}", "", baseMsg + "'raise'");
    }

    /**
     * Functions should validate the number of args passed in.
     * 
     * @expectedResults InvalidExpressionException when instantiating the component
     */
    // TODO(W-1008501): Number of args in expression functions not validated
    public void _testNumberOfArgs() throws Exception {
        final String tooFew = "!!!No current validation of number of args - allows less than expected";
        final String tooMany = "!!!No current validation of number of args - allows more than expected";

        verifyInvalidExpressionException("{!equals()}", "", tooFew);
        verifyInvalidExpressionException("{!equals(true)}", "", tooFew);
        verifyInvalidExpressionException("{!equals('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!notequals()}", "", tooFew);
        verifyInvalidExpressionException("{!notequals(true)}", "", tooFew);
        verifyInvalidExpressionException("{!notequals('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!and()}", "", tooFew);
        verifyInvalidExpressionException("{!and(true)}", "", tooFew);
        verifyInvalidExpressionException("{!and('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!or()}", "", tooFew);
        verifyInvalidExpressionException("{!or(false)}", "", tooFew);
        verifyInvalidExpressionException("{!or('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!not()}", "", tooFew);
        verifyInvalidExpressionException("{!not(1,2)}", "", tooMany);
        verifyInvalidExpressionException("{!if()}", "", tooFew);
        verifyInvalidExpressionException("{!if(1,2)}", "", tooFew);
        verifyInvalidExpressionException("{!if(true,'a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!add()}", "", tooFew);
        verifyInvalidExpressionException("{!add(false)}", "", tooFew);
        verifyInvalidExpressionException("{!add('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!concat()}", "", tooFew);
        verifyInvalidExpressionException("{!concat(false)}", "", tooFew);
        verifyInvalidExpressionException("{!concat('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!sub()}", "", tooFew);
        verifyInvalidExpressionException("{!sub(false)}", "", tooFew);
        verifyInvalidExpressionException("{!sub('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!subtract()}", "", tooFew);
        verifyInvalidExpressionException("{!subtract(false)}", "", tooFew);
        verifyInvalidExpressionException("{!subtract('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!mult()}", "", tooFew);
        verifyInvalidExpressionException("{!mult(false)}", "", tooFew);
        verifyInvalidExpressionException("{!mult('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!multiply()}", "", tooFew);
        verifyInvalidExpressionException("{!multiply(false)}", "", tooFew);
        verifyInvalidExpressionException("{!multiply('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!div()}", "", tooFew);
        verifyInvalidExpressionException("{!div(false)}", "", tooFew);
        verifyInvalidExpressionException("{!div('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!divide()}", "", tooFew);
        verifyInvalidExpressionException("{!divide(false)}", "", tooFew);
        verifyInvalidExpressionException("{!divide('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!mod()}", "", tooFew);
        verifyInvalidExpressionException("{!mod(false)}", "", tooFew);
        verifyInvalidExpressionException("{!mod('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!modulus()}", "", tooFew);
        verifyInvalidExpressionException("{!modulus(false)}", "", tooFew);
        verifyInvalidExpressionException("{!modulus('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!greaterthan()}", "", tooFew);
        verifyInvalidExpressionException("{!greaterthan(false)}", "", tooFew);
        verifyInvalidExpressionException("{!greaterthan('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!greaterthanorequal()}", "", tooFew);
        verifyInvalidExpressionException("{!greaterthanorequal(false)}", "", tooFew);
        verifyInvalidExpressionException("{!greaterthanorequal('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!lessthan()}", "", tooFew);
        verifyInvalidExpressionException("{!lessthan(false)}", "", tooFew);
        verifyInvalidExpressionException("{!lessthan('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!lessthanorequal()}", "", tooFew);
        verifyInvalidExpressionException("{!lessthanorequal(false)}", "", tooFew);
        verifyInvalidExpressionException("{!lessthanorequal('a','b','c')}", "", tooMany);
        verifyInvalidExpressionException("{!neg()}", "", tooFew);
        verifyInvalidExpressionException("{!neg(1,2)}", "", tooMany);
        verifyInvalidExpressionException("{!negate()}", "", tooFew);
        verifyInvalidExpressionException("{!negate(1,2)}", "", tooMany);
        verifyInvalidExpressionException("{!abs()}", "", tooFew);
        verifyInvalidExpressionException("{!abs(1,2)}", "", tooMany);
    }

    /**
     * Undefined function referenced in expression.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    public void testFunctionNotFound() throws Exception {
        final String noFunction = "No function found for key: ";
        verifyAuraRuntimeException("{!isNull(null)}", "", noFunction + "isNull");
        verifyAuraRuntimeException("{!1 > v.div ? isFinite(v.num/v.div) : true}", "", noFunction + "isFinite");
        verifyAuraRuntimeException("{!v.max > absolute(-1)}", "", noFunction + "absolute");
    }

    private void verifyInvalidExpressionException(String strExpr, String dblExpr, String expectedMsgContains)
            throws Exception {
        verifyValidationException(strExpr, dblExpr, expectedMsgContains, InvalidExpressionException.class);
    }

    private void verifyAuraRuntimeException(String strExpr, String dblExpr, String expectedMsgContains)
            throws Exception {
        verifyValidationException(strExpr, dblExpr, expectedMsgContains, AuraRuntimeException.class);
    }

    private void verifyValidationException(String strExpr, String dblExpr, String expectedMsgContains,
            Class<?> expectedClass) throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, String.format("<aura:component>"
                + "<aura:attribute name='strAtt' type='String' default=\"%s\"/>"
                + "<aura:attribute name='dblAtt' type='Double' default=\"%s\"/>" + "</aura:component>", strExpr,
                dblExpr));
        String cmpName = cmpDesc.getNamespace() + ":" + cmpDesc.getName();
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                "<aura:application>" + "<%s/>" + "</aura:application>", cmpName));
        try {
            Aura.getInstanceService().getInstance(appDesc);
            fail("Expression validation did not result in a runtime exception for strAtt=\"" + strExpr + "\" dblAtt=\""
                    + dblExpr + "\"");
        } catch (Exception e) {
            assertTrue("Wrong Exception type thrown. Expected: " + expectedClass + ". But got: " + e.getClass(),
                    e.getClass().equals(expectedClass));
            assertTrue("Wrong Exception message. Expected: " + expectedMsgContains + ". But got: " + e.getMessage(),
                    e.getMessage().contains(expectedMsgContains));
        }

        cmpDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component>"
                + "<aura:attribute name='strAtt' type='String'/>" + "<aura:attribute name='dblAtt' type='Double'/>"
                + "</aura:component>");
        cmpName = cmpDesc.getNamespace() + ":" + cmpDesc.getName();
        appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format("<aura:application>"
                + "<%s strAtt=\"%s\" dblAtt=\"%s\"/>" + "</aura:application>", cmpName, strExpr, dblExpr));
        try {
            Aura.getInstanceService().getInstance(appDesc);
            fail("Expression validation did not result in a runtime exception for strAtt=\"" + strExpr + "\" dblAtt=\""
                    + dblExpr + "\"");
        } catch (Exception e) {
            assertTrue("Wrong Exception type thrown. Expected: " + expectedClass + ". But got: " + e.getClass(),
                    e.getClass().equals(expectedClass));
            assertTrue("Wrong Exception message. Expected: " + expectedMsgContains + ". But got: " + e.getMessage(),
                    e.getMessage().contains(expectedMsgContains));
        }
    }
}
