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

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.StyleParser;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.test.client.UserAgent;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.junit.Ignore;
import org.junit.Test;

import javax.inject.Inject;

/**
 * This class tests the CSS validation in place for Aura Components. Aura components can have a .css file specified in
 * the same directory. The first part of every selector has to be the name of the component, including the namespace.
 * For example, if there is a component called aura:test, then every selector in the test.css file has to being with
 * .auraTest
 */
public class StyleParserTest extends AuraImplTestCase {

    @Inject
    DefinitionService definitionService;

    private void serializeAndGoldFile(StyleDef styleDef, String suffix) throws Exception {
        String styleStr = toJson(styleDef);
        // strip any cachebusters from URLs (simplistically), we have other
        // tests for that
        styleStr = styleStr.replaceAll("[\\?&]aura.cb=\\d+", "");
        // strip quotes from URLs
        styleStr = styleStr.replaceAll("url\\s*\\(\\s*['\"]?([^'\"]+)['\"]?\\)", "url($1)");
        goldFileJson(styleStr, suffix);
    }

    /**
     * Tests for validation of css files and creation of StyleDefs for aura components. {@link StyleParser}
     * 
     * Negative Test Case 1: Have two css files for a single component.
     * 
     * Expected result: Pick up only the style defined in file named exactly as the component but with a .css file type.
     */
    @Test
    public void testTwoCssFilesForAComponent() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testTwoCSSFiles", StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testTwoCSSFiles"));
        serializeAndGoldFile(style, "_styleDef");
    }

    /**
     * Tests for validation of css files and creation of StyleDefs for aura components. {@link StyleParser}
     * 
     * Negative Test Case 2: Have a single css file for a component. Break the Case sensitivity rule of CSS selectors.
     * This test is sufficient to cover the test case for missing prefix for selectors.
     * 
     * Expected result: The parser should throw a StyleParserException.
     */
    @Test
    public void testCaseSensitivity() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleSelectorCaseSensitivity",
                StyleDef.class);
        try {
        	definitionService.getDefinition(descriptor);
            fail("Should have caught the css selector in caps.");
        } catch (StyleParserException expected) {
            assertTrue(expected.getMessage().contains(
                    "CSS selector must begin with '.testTestStyleSelectorCaseSensitivity'"));
        }
    }

    /**
     * Tests for validation of css files and creation of StyleDefs for aura components. {@link StyleParser}
     * 
     * Positive Test Case 1: Have a single valid css file for a component.
     * 
     * Expected result: Pick up only the style defined in file.
     */
    @Test
    public void testValidCss() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testValidCSS", StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testValidCSS"));
        serializeAndGoldFile(style, "_styleDef");
    }

    /**
     * Tests for validation of css files and creation of StyleDefs for aura components. {@link StyleParser}
     * 
     * Positive Test Case 2: Have an invalid css file for a single component. Just leave on of the selectors definitions
     * open.
     * 
     * Expected result: The parser should throw a StyleParserException.
     */
    @Test
    public void testInvalidCss() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testInValidCSS", StyleDef.class);
        try {
        	definitionService.getDefinition(descriptor);
            fail("Should have caught the bad css");
        } catch (StyleParserException expected) {
            assertTrue("Incorrect message in StyleParserException",
                    expected.getMessage().contains("Expected to find closing brace '}'"));
        }
    }

    /**
     * Tests for validation of css files and creation of StyleDefs for aura components. {@link StyleParser}
     * 
     * Positive Test Case 3: Nested Component, have valid css file for parent component and an invalid file for child
     * component.
     * 
     * Expected result: The parser just considers the css file for the parent for validation.
     */
    @Test
    public void testValidNestedComponents() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleValidParent", StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testStyleValidParent"));
        serializeAndGoldFile(style, "_styleDef");
    }

    /**
     * Tests for substitution of the THIS token with the component's namespace. {@link StyleParser}
     * 
     * Expected result: Css file is valid.
     */
    @Test
    public void testStyleNamespaceToken() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceToken",
                StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testStyleNamespaceToken"));
        serializeAndGoldFile(style, "_styleDef");
    }

    /**
     * Tests for substitution of the THIS token with the component's namespace for a set of valid CSS rules.
     * {@link StyleParser}
     * 
     * Expected result: The parser just considers the css file for the parent for validation.
     */
    @Test
    public void testStyleNamespaceTokenValidCss() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceTokenValidCSS",
                StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testStyleNamespaceTokenValidCSS"));
        serializeAndGoldFile(style, "_styleDef");
    }

    /**
     * Tests for substitution of the THIS token with the component's namespace for a set of invalid CSS rules.
     * {@link StyleParser}
     * 
     * Expected result: The parser will throw exception based on type of error it encounters while parsing the CSS file.
     */
    @Test
    public void testStyleNamespaceTokenInvalidCSS() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceTokenInvalidCSS",
                StyleDef.class);
        try {
        	definitionService.getDefinition(descriptor);
            fail("Exception not thrown for some set of invalid CSS rules!");
        } catch (StyleParserException expected) {
            assertTrue("Incorrect message in StyleParserException", expected.getMessage().contains(
                    "Unparsable text found at the end of the source '~div"));
        }
    }

    /**
     * Tests for browser conditionals in the CSS file. Tests if the rules for client (browser) type "chrome" get
     * rendered.
     */
    @Test
    public void testStyleNamespaceTrueConditions() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceTrueConditions",
                StyleDef.class);
        contextService
                .getCurrentContext()
                .setClient(new Client(UserAgent.GOOGLE_CHROME.getUserAgentString()));
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testStyleNamespaceTrueConditions"));
        goldFileText(style.getCode());
    }

    /**
     * Tests that media blocks don't trip up the parser
     */
    @Test
    public void testStyleNamespaceMediaAndConditions() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceMediaAndConditions",
                StyleDef.class);
        contextService
                .getCurrentContext()
                .setClient(new Client(UserAgent.GOOGLE_CHROME.getUserAgentString()));
        StyleDef style = definitionService.getDefinition(descriptor);
        assertTrue(style.getName().equals("testStyleNamespaceMediaAndConditions"));
        goldFileText(style.getCode());
    }

    /**
     * Tests keyframes
     */
    @Test
    public void testKeyframes() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceKeyframes",
                StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        goldFileText(style.getCode());
    }

    /**
     * Tests font faces
     */
    @Test
    public void testFontface() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceFontface",
                StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        goldFileText(style.getCode());
    }

    @Test
    public void testAutoPrefixing() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespacePrefixing",
                StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        goldFileText(style.getCode());
    }

    /**
     * Test SVG data uris
     */
    @Test
    public void testSvgUrl() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceSvgUrl",
                StyleDef.class);
        StyleDef style = definitionService.getDefinition(descriptor);
        goldFileText(style.getCode());
    }

    /**
     * Tests for invalid values as part of browser conditionals.
     */
    @Test
    public void testStyleNamespaceExceptions() throws Exception {
        DefDescriptor<StyleDef> descriptor = definitionService.getDefDescriptor("test.testStyleNamespaceInvalidConditions",
                StyleDef.class);
        try {
        	definitionService.getDefinition(descriptor);
            fail("Exception not thrown for some set of invalid CSS rules!");
        } catch (StyleParserException expected) {
            assertTrue("Incorrect message in StyleParserException", expected.getMessage().contains(
                    "Expected to find closing closing brace '}'"));
        }
    }

    /**
     * Tests that templateCss is not validated but standard CSS files are.
     * 
     * W-1366145
     */
    @Test
    public void testTemplateCssValid() throws Exception {
        DefDescriptor<StyleDef> templateCssDesc = definitionService.getDefDescriptor("templateCss://test.testTemplateCss",
                StyleDef.class);
        DefDescriptor<StyleDef> cssDesc = definitionService.getDefDescriptor("css://test.testTemplateCss", StyleDef.class);

        // templateCss should work here since not validated
        try {
        	definitionService.getDefinition(templateCssDesc);
        } catch (Exception e) {
            fail("CSS should be valid for templateCss, no Exception should be thrown.");
        }

        // CSS should fail on validation
        try {
        	definitionService.getDefinition(cssDesc);
            fail("Parser should have thrown StyleParserException trying to parse invalid CSS.");
        } catch (StyleParserException e) {
            assertTrue("Incorrect message in StyleParserException",
                    e.getMessage().contains("CSS selector must begin with '.testTestTemplateCss' or '.THIS'"));
        }
    }

    @Ignore
    @Test
    public void _testPerformance() throws Exception {
        /*
         * List<Long> oldTimes = Lists.newArrayList(); List<Long> newTimes = Lists.newArrayList(); List<Integer>
         * lineCount = Lists.newArrayList();
         * DefDescriptor<StyleDef> desc = definitionService.getDefDescriptor("ui.button", StyleDef.class);
         * Source<StyleDef> source = definitionService.getSource(desc);
         * String code = source.getContents();
         * StyleParserResultHolder holder = null; for(int k=0;k<1;k++){ if(k>0){ code = code +
         * code; } int count = 2; long old = 0l; long newer = 0l; for(int i=0;i<count;i++){ long start =
         * System.currentTimeMillis(); holder = new CSSParser2("ui", true, ".uiButton", code,
         * StyleParser.allowedConditions).parse(); long one = System.currentTimeMillis(); new CSSParser("ui", true,
         * ".uiButton", code, StyleParser.allowedConditions).parse(); long two = System.currentTimeMillis(); if(i > 0){
         * newer += one - start; old += two - one; } } newTimes.add(newer/count); oldTimes.add(old/count);
         * lineCount.add(code.split("\n").length); } System.out.println(newTimes); System.out.println(oldTimes);
         * System.out.println(lineCount); holder.getDefaultCss(); //System.out.println(holder.getDefaultCss());
         */
    }

    @Test
    public void testInvalidCSS() throws Exception {
        try {
            definitionService.getDefinition("auratest.invalidCss", StyleDef.class);
            fail("Expected exception.");
        } catch (QuickFixException e) {
            String[] errors = e.getMessage().split("\n");
            StringBuffer sb = new StringBuffer();
            for (int i = 1; i < errors.length; i++) {
                sb.append(errors[i]);
            }
            goldFileText(sb.toString());
        }
    }

    /**
     * Context path should be prepended to any /auraFW url in css url function
     */
    @Ignore("flapper")
    @Test
    public void testUrlFunctionContextPath() throws Exception {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> desc = definitionService.getDefDescriptor("auratest:testApplication1", ApplicationDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.DEV, AuraContext.Format.HTML,
                AuraContext.Authentication.AUTHENTICATED, desc);
        String coolContext = "/cool";
        context.setContextPath(coolContext);
        context.setApplicationDescriptor(desc);
        final String uid = definitionService.getUid(null, desc);
        context.addLoaded(desc, uid);
        StyleDef styleDef = definitionService.getDefinition(desc).getStyleDef();
        String styleStr = toJson(styleDef);
        int start = styleStr.indexOf("/auraFW");
        String cool = styleStr.substring(start - 5, start);
        if (!cool.equals(coolContext)) {
            fail("Context path was not prepended to Aura url in css url function");
        }
    }
}
