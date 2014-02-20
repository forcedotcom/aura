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
package org.auraframework.impl.root.theme;

import org.auraframework.def.ThemeDef;
import org.auraframework.def.VarDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.root.parser.handler.VarDefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Iterables;

/**
 * Unit tests for {@link VarDefHandler}.
 */
public class VarDefHandlerTest extends StyleTestCase {
    public VarDefHandlerTest(String name) {
        super(name);
    }

    public void testName() throws Exception {
        VarDef def = source("<aura:var name='color' value='red'/>");
        assertEquals("didn't get expected aura:var name", "color", def.getName());
    }

    public void testValue() throws Exception {
        VarDef def = source("<aura:var name='color' value='red'/>");
        assertEquals("didn't get expected aura:var value", "red", def.getValue().toString());
    }

    public void testDescription() throws Exception {
        VarDef def = source("<aura:var name='color' value='red' description='test'/>");
        assertEquals("didn't get expected aura:var description", "test", def.getDescription());
    }

    public void testValueIsExpression() throws Exception {
        VarDef def = source("<aura:var name='myColor' value='{!color}'/><aura:var name='color' value='red'/>");
        assertTrue(def.getValue() instanceof PropertyReference);
    }

    public void testInvalidChild() throws Exception {
        try {
            source("<aura:var name='f' value='f'><ui:button/></aura:var>");
            fail("Should have thrown AuraException");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No children");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            source("<aura:var name='f' value='f'>text</aura:var>");
            fail("Should have thrown AuraException");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }

    public void testMissingName() throws Exception {
        try {
            source("<aura:var  value='f'/>");
            fail("Should have thrown AuraException");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute 'name'");
        }
    }

    /** utility */
    private VarDef source(CharSequence contents) throws QuickFixException {
        ThemeDef def = addSeparateTheme(String.format("<aura:theme>%s</aura:theme>", contents)).getDef();
        return Iterables.getFirst(def.getDeclaredVarDefs().values(), null);
    }
}
