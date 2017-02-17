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

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.StyleParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;

/**
 * Automation to verify that CSS validation override. Aura enforces validation of CSS in component bundles. This css
 * validation can be configured in a aura.conf file. The aura.conf file should be at one of the Java classpath roots of
 * the aura projects. For example aura-integration-test/src/test/java/aura.conf >aura.css.validate=true
 */

public class CSSValidationOverrideTest extends AuraImplTestCase {
    @Inject
    private ConfigAdapter configAdapter;


    private TextSource<StyleDef> getInvalidStyleSource() {
        DefDescriptor<StyleDef> styleDefDesc = definitionService.getDefDescriptor("css://fake.name", StyleDef.class);
        return new StringSource<>(styleDefDesc, 
                ".xyErrorText { color: #808080; padding-bottom: 5px; } .xyLabel { padding-right: 5px; }",
                "fake:name", Format.CSS);
    }

    /**
     * By default all component CSS is validated by StyleParser.
     */
    @Test
    public void testDefaultProps() throws Exception {
        assertTrue("By default all component CSS should be validated", configAdapter.validateCss());
        TextSource<StyleDef> source = getInvalidStyleSource();
        try {
            new StyleParser.WithValidation().getDefinition(source.getDescriptor(), source).validateDefinition();
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
    @Test
    public void testOverrideCSSValidation() throws Exception {
        getMockConfigAdapter().setValidateCss(false);
        assertFalse("Expected CSS validation to be overriden.", configAdapter.validateCss());
        TextSource<StyleDef> source = getInvalidStyleSource();
        new StyleParser.WithValidation().getDefinition(source.getDescriptor(), source);
    }
}
