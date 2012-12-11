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
package org.auraframework.impl.css;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.css.parser.CSSParser;
import org.auraframework.impl.css.parser.ThemeParser;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Client;
import org.auraframework.throwable.ThemeParserException;

/**
 * This class tests the CSS validation in place for Aura Components. Aura components can have a .css file specified in
 * the same directory. The first part of every selector has to be the name of the component, including the namespace.
 * For example, if there is a component called aura:test, then every selector in the test.css file has to being with
 * .auraTest
 */
public class ThemeParserTest extends AuraImplTestCase {
    public ThemeParserTest(String name) {
        super(name);
    }

    private void serializeAndGoldFile(ThemeDef themeDef, String suffix) throws Exception {
        String themeStr = toJson(themeDef);
        // strip any cachebusters from URLs (simplistically), we have other tests for that
        themeStr = themeStr.replaceAll("[\\?&]aura.cb=\\d+", "");
        // strip quotes from URLs
        themeStr = themeStr.replaceAll("url\\s*\\(\\s*['\"]?([^'\"]+)['\"]?\\)", "url($1)");
        goldFileJson(themeStr, suffix);
    }

    /**
     * Tests for validation of css files and creation of ThemeDefs for aura components. {@link ThemeParser} Negative
     * Test Case 1: Have two css files for a single component. Expected result: Pick up only the theme defined in file
     * named exactly as the component but with a .css file type.
     */
    public void testTwoCSSFilesForAComponent() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testTwoCSSFiles", ThemeDef.class);
        ThemeDef theme = descriptor.getDef();
        assertTrue(theme.getName().equals("testTwoCSSFiles"));
        serializeAndGoldFile(theme, "_themeDef");
    }

    /**
     * Tests for validation of css files and creation of ThemeDefs for aura components. {@link ThemeParser} Negative
     * Test Case 2: Have a single css file for a component. Break the Case sensitivity rule of CSS selectors. This test
     * is sufficient to cover the test case for missing prefix for selectors. Expected result: Runtime Exception.
     */
    public void testCaseSensitivity() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeSelectorCaseSensitivity",
                ThemeDef.class);
        try {
            descriptor.getDef();
            fail("Should have caught the css selector in caps.");
        } catch (ThemeParserException expected) {
            assertTrue(expected.getMessage().contains(CSSParser.ISSUE_MESSAGE));
        }
    }

    /**
     * Tests for validation of css files and creation of ThemeDefs for aura components. {@link ThemeParser} Positive
     * Test Case 1: Have a single valid css file for a component. Expected result: Pick up only the theme defined in
     * file.
     */
    public void testValidCss() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testValidCSS", ThemeDef.class);
        ThemeDef theme = descriptor.getDef();
        assertTrue(theme.getName().equals("testValidCSS"));
        serializeAndGoldFile(theme, "_themeDef");
    }

    /**
     * Tests for validation of css files and creation of ThemeDefs for aura components. {@link ThemeParser} Positive
     * Test Case 2: Have an invalid css file for a single component. Just leave on of the selectors definitions open.
     * Expected result: The parser should throw a AuraRuntimeException.
     */
    public void testInvalidCSS() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testInValidCSS", ThemeDef.class);
        try {
            descriptor.getDef();
            fail("Should have caught the bad css");
        } catch (ThemeParserException expected) {
            assertTrue(expected.getMessage().contains("Parse error"));
        }
    }

    /**
     * Tests for validation of css files and creation of ThemeDefs for aura components. {@link ThemeParser} Positive
     * Test Case 3: Nested Component, have valid css file for parent component and an invalid file for child component.
     * Expected result: The parser just considers the css file for the parent for validation.
     */
    public void testValidNestedComponents() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeValidParent", ThemeDef.class);
        ThemeDef theme = descriptor.getDef();
        assertTrue(theme.getName().equals("testThemeValidParent"));
        serializeAndGoldFile(theme, "_themeDef");
    }

    /**
     * Tests for substitution of the THIS token with the component's namespace. {@link ThemeParser} Expected result: The
     * parser just considers the css file for the parent for validation.
     */
    public void testThemeNamespaceToken() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeNamespaceToken",
                ThemeDef.class);
        ThemeDef theme = descriptor.getDef();
        assertTrue(theme.getName().equals("testThemeNamespaceToken"));
        serializeAndGoldFile(theme, "_themeDef");
    }

    /**
     * Tests for substitution of the THIS token with the component's namespace for a set of valid CSS rules.
     * {@link ThemeParser} Expected result: The parser just considers the css file for the parent for validation.
     */
    public void testThemeNamespaceTokenValidCSS() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeNamespaceTokenValidCSS",
                ThemeDef.class);
        ThemeDef theme = descriptor.getDef();
        assertTrue(theme.getName().equals("testThemeNamespaceTokenValidCSS"));
        serializeAndGoldFile(theme, "_themeDef");
    }

    /**
     * Tests for substitution of the THIS token with the component's namespace for a set of invalid CSS rules.
     * {@link ThemeParser} Expected result: The parser will throw exception based on type of error it encounters while
     * parsing the CSS file.
     */
    public void testThemeNamespaceTokenInvalidCSS() throws ThemeParserException {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeNamespaceTokenInvalidCSS",
                ThemeDef.class);
        try {
            descriptor.getDef();
            fail("Exception not thrown for some set of invalid CSS rules!");
        } catch (Exception e) {
            assertTrue("Incorrect exception type! Message:" + e.getMessage(), (e instanceof ThemeParserException));
        }
    }

    /**
     * Tests for browser conditionals in the CSS file. Tests if the rules for client (browser) type "chrome" get
     * rendered.
     */
    public void testThemeNamespaceTrueConditions() throws Exception {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeNamespaceTrueConditions",
                ThemeDef.class);

        Client client = new Client("chrome");
        ThemeDef theme = descriptor.getDef();
        assertTrue(theme.getName().equals("testThemeNamespaceTrueConditions"));
        goldFileText(theme.getCode(client.getType()));
    }

    /**
     * Tests for invalid values as part of browser conditionals.
     */
    public void testThemeNamespaceExceptions() throws ThemeParserException {
        DefDescriptor<ThemeDef> descriptor = DefDescriptorImpl.getInstance("test.testThemeNamespaceInvalidConditions",
                ThemeDef.class);
        try {
            descriptor.getDef();
            fail("Exception not thrown for some set of invalid CSS rules!");
        } catch (Exception e) {
            assertTrue("Incorrect exception type! Message:" + e.getMessage(), (e instanceof ThemeParserException));
        }
    }

    /**
     * Tests that templateCss is not validated but standard CSS files are.
     * 
     * W-1366145
     */
    public void testTemplateCssValid() throws Exception {
        DefDescriptor<ThemeDef> templateCssDesc = DefDescriptorImpl.getInstance("templateCss://test.testTemplateCss",
                ThemeDef.class);
        DefDescriptor<ThemeDef> cssDesc = DefDescriptorImpl.getInstance("css://test.testTemplateCss", ThemeDef.class);

        // templateCss should work here since not validated
        try {
            templateCssDesc.getDef();
        } catch (Exception e) {
            fail("CSS should be valid for templateCss, no Exception should be thrown.");
        }

        // CSS should fail on validation
        try {
            cssDesc.getDef();
            fail("Parser should have thrown ThemeParserException trying to parse invalid CSS.");
        } catch (Exception e) {
            assertTrue("Expecting CSS parser error for component test.testTemplateCss but got: " + e.getMessage(),
                    e.getMessage().toString().startsWith("Issue(s) found by Parser:CSS selectors must include " +
                    "component class: \"testTestTemplateCss\" in testTestTemplateCss"));
        }
    }
}
