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
     * Exceptions from parsing by ExpressionAdapter are forwarded. See
     * ExpressionParserTest for more tests that result in parse exceptions.
     * 
     * @expectedResults AuraRuntimeException with underlying parse exception
     *                  when instantiating the component
     */
    public void testParseExceptions() throws Exception {
        verifyValidationException("{!too bad}", "", "unexpected token: an identifier");
        verifyValidationException("{!5+(6-7}", "", "unexpected end of expression");
    }

    /**
     * Unknown value provider is not allowed. See ValueProviderType for
     * acceptable providers.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testUnknownValueProvider() throws Exception {
        verifyValidationException("{!x.fit}", "", "!!!No current validation on ValueProvider");
    }

    /**
     * Note: this test doesn't pass when using aura-impl unit test target
     * Undefined label references are not allowed.
     * 
     * @expectedResults InvalidExpressionException when instantiating the
     *                  component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testUnknownLabel() throws Exception {
        verifyValidationException("{!$Label.Aura.goomba}", "",
                "org.auraframework.throwable.InvalidExpressionException: No label found for Aura.goomba");
    }

    /**
     * Label references must have only section and name parts.
     * 
     * @expectedResults InvalidExpressionException when instantiating the
     *                  component
     */
    public void testInvalidLabelExpression() throws Exception {
        verifyValidationException("{!$Label.SomeSection}", "", "Labels should have a section and a name:");
        verifyValidationException("{!$Label.SomeSection.ExtraPart.Name}", "",
                "Labels should have a section and a name:");
    }

    /**
     * Nested expressions are not allowed.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    public void testNestedExpressions() throws Exception {
        verifyValidationException("{!$'test'{!'Attribute'}}", "",
                "Cannot mix expression and literal string in attribute value");
    }

    /**
     * Expression return type must match the attribute type.
     * 
     * @expectedResults InvalidExpressionException when instantiating the
     *                  component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testTypeChecking() throws Exception {
        verifyValidationException("{!5+1}", "", "!!!No current type validation - returns null");
        verifyValidationException("", "{!'NotANumber'}", "!!!No current type validation - returns null");
    }

    /**
     * Expressions that directly or indirectly reference themselves are not
     * allowed.
     * 
     * @expectedResults InvalidExpressionException when instantiating the
     *                  component
     */
    // TODO(W-1480493): Expression Validation needs work
    public void _testCyclicalReference() throws Exception {
        verifyValidationException("{!v.strAtt}again", "",
                "!!!No current validation of recursive expressions - returns arraylist of propref and string");
        verifyValidationException("{!v.strAtt+'x'}", "",
                "!!!No current validation of recursive expressions - returns null");
        verifyValidationException("{!v.dblAtt}", "{!v.strAtt}",
                "!!!No current validation of recursive expressions - returns null");
    }

    /**
     * Keywords not allowed in property names.
     * 
     * @expectedResults SomeMeaningfulException when instantiating the component
     */
    // W-1008453 https://gus.soma.salesforce.com/a07B0000000FVP8IAO
    public void _testKeywordsNotAllowed() throws Exception {
        final String noKeywords = "!!!currently throws MismatchedTokenException which isn't very helpful";
        verifyValidationException("{!v.null}", "", noKeywords);
        verifyValidationException("{!add(m.integer, m.eq)}", "", noKeywords);
        verifyValidationException("{!v.raise ? c.add : c.subtract}", "", noKeywords);
    }

    /**
     * Functions should validate the number of args passed in.
     * 
     * @expectedResults SomeMeaningfulException when instantiating the component
     */
    // W-1008501 https://gus.soma.salesforce.com/a07B0000000FVSMIA4
    public void _testNumberOfArgs() throws Exception {
        final String tooFew = "!!!No current validation of number of args - allows less than expected";
        final String tooMany = "!!!No current validation of number of args - allows more than expected";
        verifyValidationException("{!equals()}", "", tooFew);
        verifyValidationException("{!equals(true)}", "", tooFew);
        verifyValidationException("{!equals('a','b','c')}", "", tooMany);
        verifyValidationException("{!notequals()}", "", tooFew);
        verifyValidationException("{!notequals(true)}", "", tooFew);
        verifyValidationException("{!notequals('a','b','c')}", "", tooMany);
        verifyValidationException("{!and()}", "", tooFew);
        verifyValidationException("{!and(true)}", "", tooFew);
        verifyValidationException("{!and('a','b','c')}", "", tooMany);
        verifyValidationException("{!or()}", "", tooFew);
        verifyValidationException("{!or(false)}", "", tooFew);
        verifyValidationException("{!or('a','b','c')}", "", tooMany);
        verifyValidationException("{!not()}", "", tooFew);
        verifyValidationException("{!not(1,2)}", "", tooMany);
        verifyValidationException("{!if()}", "", tooFew);
        verifyValidationException("{!if(1,2)}", "", tooFew);
        verifyValidationException("{!if(true,'a','b','c')}", "", tooMany);
        verifyValidationException("{!add()}", "", tooFew);
        verifyValidationException("{!add(false)}", "", tooFew);
        verifyValidationException("{!add('a','b','c')}", "", tooMany);
        verifyValidationException("{!concat()}", "", tooFew);
        verifyValidationException("{!concat(false)}", "", tooFew);
        verifyValidationException("{!concat('a','b','c')}", "", tooMany);
        verifyValidationException("{!sub()}", "", tooFew);
        verifyValidationException("{!sub(false)}", "", tooFew);
        verifyValidationException("{!sub('a','b','c')}", "", tooMany);
        verifyValidationException("{!subtract()}", "", tooFew);
        verifyValidationException("{!subtract(false)}", "", tooFew);
        verifyValidationException("{!subtract('a','b','c')}", "", tooMany);
        verifyValidationException("{!mult()}", "", tooFew);
        verifyValidationException("{!mult(false)}", "", tooFew);
        verifyValidationException("{!mult('a','b','c')}", "", tooMany);
        verifyValidationException("{!multiply()}", "", tooFew);
        verifyValidationException("{!multiply(false)}", "", tooFew);
        verifyValidationException("{!multiply('a','b','c')}", "", tooMany);
        verifyValidationException("{!div()}", "", tooFew);
        verifyValidationException("{!div(false)}", "", tooFew);
        verifyValidationException("{!div('a','b','c')}", "", tooMany);
        verifyValidationException("{!divide()}", "", tooFew);
        verifyValidationException("{!divide(false)}", "", tooFew);
        verifyValidationException("{!divide('a','b','c')}", "", tooMany);
        verifyValidationException("{!mod()}", "", tooFew);
        verifyValidationException("{!mod(false)}", "", tooFew);
        verifyValidationException("{!mod('a','b','c')}", "", tooMany);
        verifyValidationException("{!modulus()}", "", tooFew);
        verifyValidationException("{!modulus(false)}", "", tooFew);
        verifyValidationException("{!modulus('a','b','c')}", "", tooMany);
        verifyValidationException("{!greaterthan()}", "", tooFew);
        verifyValidationException("{!greaterthan(false)}", "", tooFew);
        verifyValidationException("{!greaterthan('a','b','c')}", "", tooMany);
        verifyValidationException("{!greaterthanorequal()}", "", tooFew);
        verifyValidationException("{!greaterthanorequal(false)}", "", tooFew);
        verifyValidationException("{!greaterthanorequal('a','b','c')}", "", tooMany);
        verifyValidationException("{!lessthan()}", "", tooFew);
        verifyValidationException("{!lessthan(false)}", "", tooFew);
        verifyValidationException("{!lessthan('a','b','c')}", "", tooMany);
        verifyValidationException("{!lessthanorequal()}", "", tooFew);
        verifyValidationException("{!lessthanorequal(false)}", "", tooFew);
        verifyValidationException("{!lessthanorequal('a','b','c')}", "", tooMany);
        verifyValidationException("{!neg()}", "", tooFew);
        verifyValidationException("{!neg(1,2)}", "", tooMany);
        verifyValidationException("{!negate()}", "", tooFew);
        verifyValidationException("{!negate(1,2)}", "", tooMany);
        verifyValidationException("{!abs()}", "", tooFew);
        verifyValidationException("{!abs(1,2)}", "", tooMany);
    }

    /**
     * Undefined function referenced in expression.
     * 
     * @expectedResults AuraRuntimeException when instantiating the component
     */
    public void testFunctionNotFound() throws Exception {
        final String noFunction = "No function found for key: ";
        verifyValidationException("{!isNull(null)}", "", noFunction + "isNull");
        verifyValidationException("{!1 > v.div ? isFinite(v.num/v.div) : true}", "", noFunction + "isFinite");
        verifyValidationException("{!v.max > absolute(-1)}", "", noFunction + "absolute");
    }

    private void verifyValidationException(String strExpr, String dblExpr, String expectedMessageStartsWith)
            throws Exception {
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
            if (!e.getMessage().contains(expectedMessageStartsWith)) {
                throw (e);
            }
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
            if (!e.getMessage().contains(expectedMessageStartsWith)) {
                throw (e);
            }
        }
    }
}
