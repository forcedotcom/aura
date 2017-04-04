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
package org.auraframework.impl.factory;

import javax.inject.Inject;

import org.auraframework.def.StyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.StyleParser.WithValidation;
import org.auraframework.impl.factory.StyleParser.WithoutValidation;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.junit.Ignore;
import org.junit.Test;

public class StyleDefFactoryTest extends AuraImplTestCase {
    @Inject
    WithValidation withValidation;;

    @Inject
    WithoutValidation withoutValidation;

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
        AuraTestingUtil util = getAuraTestingUtil();
        String expectedMessage = String.format("CSS selector must begin with '.%sCaseSensitivity'",
                util.getInternalNamespace());
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(), "caseSensitivity",
                StyleDef.class,
                String.format(".%sCaseSensitivity .toolbar{ right : 5px; }\n"
                              +".%sCASESENSITIVITY .toolbar .widget{ height : 20px; }\n",
                              util.getInternalNamespace(), util.getInternalNamespace()));
        StyleParserException expected = null;

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    @Test
    public void testMismatchedBrace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, ".THIS .toolbar{ right : 5px;\n.THIS .toolbar .widget{ height : 20px; }\n");
        StyleParserException expected = null;
        String expectedMessage = "Expected to find closing brace";

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    @Test
    public void testMissingTHIS_1() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class,
                ".THIS input[type=\"text\"],\ntextarea,\nselect,\n.reply,\n#content {\nborder-color: blue;\n}\n");
        StyleParserException expected = null;
        String expectedMessage = "CSS selector must begin with '."+util.getInternalNamespace();

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    @Test
    public void testMissingTHIS_2() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, "ul > li:only-of-type {\nborder: 1px solid blue;\n}\n");
        StyleParserException expected = null;
        String expectedMessage = "CSS selector must begin with '."+util.getInternalNamespace();

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    @Test
    public void testInvalidCSS_1() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, ".THIS html|div {\npadding: 2px;\n}\n");
        StyleParserException expected = null;
        String expectedMessage = "Unable to parse remaining selector content";

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    @Test
    public void testInvalidCSS_2() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, "~div { }\n");
        StyleParserException expected = null;
        String expectedMessage = "Unparsable text found at the end of the source '~div";

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    /*
	[1] Invalid conditional argument
	Error: Issue(s) found by Parser:Unknown conditional: [OPERA]. 
	The allowed conditionals are: [WEBKIT, FIREFOX, IE6, IE7, IE8, IE9, IE10, OTHER]
    */
    @Test
    public void testInvalidCSSConditional_1() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, "@if (OPERA) { .THIS .stackOrder { z-index: 100; } }");
        StyleParserException expected = null;
        String expectedMessage = "Invalid condition 'opera'";

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

    /*	
	[2] Bad loop structure
	Error: Issue(s) found by Parser:Encountered "<EOF>" at line x, column y. 
	Was expecting one of: ":" ... "." ... "*" ... "[" ... "}" ... <S> ... <HASH_NAME> 
	... <IDENTIFIER> ... <WEBKITKEYFRAMES> ... <ATRULESWITHDECLBLOCK> ... <ATKEYWORD> ... 
    */
    @Test
    public void testInvalidCSSConditional_2() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, "@if (FIREFOX) { .THIS .stackOrder { z-index: 200; }");
        StyleParserException expected = null;
        // FIXME: uhhh.... closing closing?
        String expectedMessage = "Expected to find closing closing brace";

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }

	
    /*	
	[3] Unknown conditional rule
	Error: Issue(s) found by Parser:unknown @ rule in ..file.. at line x column y: @do(IE7) { ^
    */
    @Test
    @Ignore("unknown - ask nathan")
    public void testInvalidCSSConditional_3() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        TextSource<StyleDef> source = util.buildTextSource(util.getInternalNamespace(),
                StyleDef.class, "@do (IE7) { .THIS .stackOrder { z-index: 300; } }");
        StyleParserException expected = null;
        String expectedMessage = "Unparsable text found at the end of the source '~div";

        try {
            StyleDef def = withValidation.getDefinition(source.getDescriptor(), source);
            def.validateDefinition();
        } catch (StyleParserException e) {
            expected = e;
        }
        assertNotNull("Should get an exception", expected);
        assertTrue("Exception message must contain '"+expectedMessage+"', but was: "+expected.getMessage(),
                expected.getMessage().contains(expectedMessage));
    }
}
