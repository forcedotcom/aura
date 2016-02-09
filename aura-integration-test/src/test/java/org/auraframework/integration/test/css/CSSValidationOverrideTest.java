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
package org.auraframework.integration.test.css;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.parser.StyleParser;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSource;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.util.test.annotation.ThreadHostileTest;

/**
 * Automation to verify that CSS validation override. Aura enforces validation of CSS in component bundles. This css
 * validation can be configured in a aura.conf file. The aura.conf file should be at one of the Java classpath roots of
 * the aura projects. For example aura-integration-test/src/test/java/aura.conf >aura.css.validate=true
 */

public class CSSValidationOverrideTest extends AuraImplTestCase {
    public CSSValidationOverrideTest(String name) {
        super(name);
    }

    private Source<StyleDef> getInvalidStyleSource() {
        DefDescriptor<StyleDef> styleDefDesc = Aura.getDefinitionService().getDefDescriptor("css://fake.name", StyleDef.class);
        return new StringSource<StyleDef>(styleDefDesc, 
                ".xyErrorText { color: #808080; padding-bottom: 5px; } .xyLabel { padding-right: 5px; }",
                "fake:name", Format.CSS);
    }

    /**
     * By default all component CSS is validated by StyleParser.
     */
    public void testDefaultProps() throws Exception {
        assertTrue("By default all component CSS should be validated",
                Aura.getConfigAdapter().validateCss());
        Source<StyleDef> source = getInvalidStyleSource();
        try {
            new StyleParser(true).parse(source.getDescriptor(), source);
            fail("Expected CSS validation to be turned on and catch the invalid CSS");
        } catch (StyleParserException expected) {
            assertTrue("Unexpected error message in StyleParserException",
                       expected.getMessage().contains("CSS selector must begin with"));
        }
    }

    /**
     * Override the validateCss flag on configAdapter and make sure validations are skipped
     */
    @ThreadHostileTest("disables CSS validation")
    public void testOverrideCSSValidation() throws Exception {
        getMockConfigAdapter().setValidateCss(false);
        assertFalse("Expected CSS validation to be overriden.", Aura.getConfigAdapter().validateCss());
        Source<StyleDef> source = getInvalidStyleSource();
        new StyleParser(true).parse(source.getDescriptor(), source);
    }
}
