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
package org.auraframework.impl.css;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.parser.ThemeParser;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeParserException;
/**
 * Automation to verify that CSS validation override.
 * Aura enforces validation of CSS in component bundles. This css validation can be
 * configured in a aura.conf file. The aura.conf file should be at one of the Java classpath roots of the aura projects.
 * For example aura-integration-test/src/test/java/aura.conf
 *  >aura.css.validate=true
 */

public class CSSValidationOverrideTest extends AuraImplTestCase {
    DefDescriptor<ThemeDef> themeDefDesc;
    public CSSValidationOverrideTest(String name){
        super(name);
    }
    @Override
    public void setUp() throws Exception{
        super.setUp();
        DefDescriptor<ComponentDef> cmp = auraTestingUtil.addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "",""));
        assertNotNull(cmp.getDef());
        themeDefDesc = Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, cmp.getNamespace(), cmp.getName()),
                ThemeDef.class);
        auraTestingUtil.addSourceAutoCleanup(themeDefDesc,
                ".xyErrorText {"+
                "color: #808080;"+
                "padding-bottom: 5px;"+
                "}"+
                ".xyLabel {"+
                "padding-right: 5px;"+
        "}");
    }
    /**
     * By default all component CSS is validated by ThemeParser.
     */
    public void testDefaultProps(){
        assertTrue("By default all component CSS should be validated", Aura.getConfigAdapter().validateCss());
        getInvalidThemeDef(true);
    }

    /**
     * Override the validateCss flag on configAdapter and make sure validations are skipped
     */
    public void testOverrideCSSValidation(){
        getMockConfigAdapter().setValidateCss(false);
        assertFalse("Expected CSS validation to be overriden.", Aura.getConfigAdapter().validateCss());
        getInvalidThemeDef(false);
    }

    private void getInvalidThemeDef(boolean expectException){
        try {
            ThemeParser.getInstance().parse(themeDefDesc,auraTestingUtil.getSource(themeDefDesc) );
            if(expectException)
                fail("Expected CSS validation to be turned on and catch the invalid CSS");
        } catch (ThemeParserException expected) {
            if(!expectException){
                fail("Did not expect to encounter CSS validation exception.");
            }else{
                assertTrue("Unexpected error message in ThemeParserException",
                        expected.getMessage().contains("Issue(s) found by Parser:CSS selectors must include component class:"));
            }
        } catch (QuickFixException e){
            fail("Test setup failed. Looking for component test.testInValidCSS with invalid CSS");
        }
    }
}
