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

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokenMapProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import java.util.List;
import java.util.Map;

/**
 * Unit tests for resolving token function values in CSS files.
 */
public class TokenResolutionTest extends StyleTestCase {
    private void assertStyle(DefDescriptor<StyleDef> style, String expected) throws QuickFixException {
        expected = expected.replace(".THIS", "." + definitionService.getDefinition(style).getClassName());
        assertEquals("Did not get the expected css code", expected, getParsedCssUseAppTokens(style));
    }

    /** where the token value is unquoted */
    @Test
    public void testUnquoted() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        String src = ".THIS {color: token(color);}";
        assertStyle(addStyleDef(src), ".THIS {color:red}");
    }

    /** where the token value is double quoted */
    @Test
    public void testDoubleQuoted() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        String src = ".THIS {color: token(\"color\");}";
        assertStyle(addStyleDef(src), ".THIS {color:red}");
    }

    /** proper stripping of outer quotes when using concatenation */
    @Test
    public void testQuotedConcatenation() throws Exception {
        addNsTokens(tokens()
                .token("margin", "10px")
                .token("font", "Times")
                .token("gradient", "red, yellow"));

        String src = ".THIS {\n" +
                "  margin: token('5px ' + margin);" + // quotes should not be stripped
                "  font-family: token(\"font + ',Arial'\");\n" + // quotes should be stripped
                "  margin: token('5px ' + margin + ' 10px');\n" + // quotes should not be stripped
                "  background: t('linear-grad('+ gradient +')');\n" + // quotes should not be stripped
                "}";

        String expected = ".THIS {" +
                "margin:5px 10px; " +
                "font-family:Times,Arial; " +
                "margin:5px 10px 10px; " +
                "background:linear-grad(red, yellow)" +
                "}";

        assertStyle(addStyleDef(src), expected);
    }

    /** where the token value is inherited */
    @Test
    public void testInherited() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        addNsTokens(tokens().parent(parent));

        String src = ".THIS {color: token(color);}";
        assertStyle(addStyleDef(src), ".THIS {color:red}");
    }

    /** where the token is imported */
    @Test
    public void testImported() throws Exception {
        DefDescriptor<TokensDef> imported = addSeparateTokens(tokens().token("color", "red"));
        addNsTokens(tokens().imported(imported));

        String src = ".THIS {color: token(color);}";
        assertStyle(addStyleDef(src), ".THIS {color:red}");
    }

    /** where the token value is overridden */
    @Test
    public void testOverridden() throws Exception {
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "red"));
        addNsTokens(tokens().parent(parent).token("color", "blue"));

        String src = ".THIS {color: token(color);}";
        assertStyle(addStyleDef(src), ".THIS {color:blue}");
    }

    /** using the 't' alternative function name */
    @Test
    public void testShorthand() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        String src = ".THIS {color: t(color);}";
        assertStyle(addStyleDef(src), ".THIS {color:red}");
    }

    /** using multiple token functions in one declaration value */
    @Test
    public void testMultipleTokenFunctions() throws Exception {
        addNsTokens(tokens().token("marginTB", "7px").token("marginLR", "5px"));
        String src = ".THIS {margin:t(marginTB) t(marginLR)}";
        assertStyle(addStyleDef(src), ".THIS {margin:7px 5px}");
    }

    /** errors when the def does not exist */
    @Test
    public void testNonexistentDef() throws Exception {
        try {
            definitionService.getDefinition(addStyleDef(".THIS{color: token(color)")).getCode();
            fail("expected exception");
        } catch (Exception e) {
        }
    }

    /** errors when the token does not exist */
    @Test
    public void testNonexistentToken() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        try {
            definitionService.getDefinition(addStyleDef(".THIS{color: token(dolor)")).getCode();
            fail("expected exception");
        } catch (Exception e) {
        }
    }

    /** if the token value is an empty string then the declaration should be removed */
    @Test
    public void testDeclarationRemoval() throws Exception {
        addNsTokens(tokens().token("color", ""));
        String src = ".THIS {color: token(color); font: arial}";
        assertStyle(addStyleDef(src), ".THIS {font:arial}");
    }

    /** test expressions */
    @Test
    public void testExpression() throws Exception {
        addNsTokens(tokens()
                .token("margin", "10px")
                .token("spacious", "true")
                .token("lineHeight", "5"));

        String src = ".THIS {\n" +
                "  margin: t('5px ' + margin);\n" +
                "  margin: t(margin + ' 5px');\n" +
                "  margin: t(margin + ' 5px ' + margin);\n" +
                // "  padding: t(spacious == true ? '30px' : '5px');\n" +
                // "  line-height: t(lineHeight * 2);\n" +
                "}";

        String expected = ".THIS {" +
                "margin:5px 10px; " +
                "margin:10px 5px; " +
                "margin:10px 5px 10px" +
                // "padding:30px; " +
                // "line-height:10;" +
                "}";

        assertStyle(addStyleDef(src), expected);
    }

    /** token in media query */
    @Test
    public void testInMediaQuery() throws Exception {
        addNsTokens(tokens().token("normal", "only screen and (max-width: 999px) and (orientation: portrait)"));

        String src = "@media token(normal) {\n" +
                "  .THIS {color:red}  \n" +
                "}";

        String expected = "@media only screen and (max-width: 999px) and (orientation: portrait) {\n" +
                "  .THIS {color:red}\n" +
                "}";

        assertStyle(addStyleDef(src), expected);
    }

    /** token in media query has error */
    @Test
    public void testInMediaQueryHasError() throws Exception {
        addNsTokens(tokens().token("normal", "screen (max-width: 999px)"));

        String src = "@media token(normal) {\n" +
                "  .THIS {color:red}  \n" +
                "}";

        try {
            definitionService.getDefinition(addStyleDef(src)).getCode();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Expected to find keyword");
        }
    }

    /** token in media query cannot evaluate to an empty string */
    @Test
    public void testInMediaQueryEvalsToEmpty() throws Exception {
        addNsTokens(tokens().token("normal", ""));

        String src = "@media token(normal) {\n" +
                "  .THIS {color:red}  \n" +
                "}";

        try {
            definitionService.getDefinition(addStyleDef(src)).getCode();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "must not evaluate to an empty string");
        }
    }

    /** token values with auto-prefixable properties */
    @Test
    public void testTokenAutoPrefix() throws Exception {
        addNsTokens(tokens()
                .token("userSelect", "none")
                .token("gradient", "red, yellow"));

        String src = ".THIS {\n" +
                "  user-select: t(userSelect);\n" +
                "  background: token('linear-gradient(' + gradient + ')');\n" +
                "}";

        String expected = ".THIS {" +
                "-webkit-user-select:none; " +
                "-moz-user-select:none; " +
                "-ms-user-select:none; " +
                "user-select:none; " +
                "background:linear-gradient(red, yellow)" +
                "}";

        assertStyle(addStyleDef(src), expected);
    }

    /** test that cross referencing own token works */
    @Test
    public void testSelfCrossReference() throws Exception {
        addNsTokens(tokens().token("color", "red").token("bg", "{!color}"));
        String src = ".THIS {background: token(bg);}";
        assertStyle(addStyleDef(src), ".THIS {background:red}");
    }

    /** test that multiple level cross references work */
    @Test
    public void testMultiCrossReference() throws Exception {
        addNsTokens(tokens()
                .token("bright", "purple")
                .token("color", "{!bright}")
                .token("bg", "{!color}"));
        String src = ".THIS {background: token(bg);}";
        assertStyle(addStyleDef(src), ".THIS {background:purple}");
    }

    /** test that the correct app tokens are used under various combinations of which files exist */
    @Test
    public void testAppTokenOverrides() throws Exception {
        // component in a different ns, with ns default tokens
        addNsTokensOtherNamespace(tokens().token("color", "red"));
        DefDescriptor<StyleDef> toTest = addStyleDefOtherNamespace(".THIS {color: token(color)}");

        // our app is in a different ns from the cmp, specifying explicit app tokens
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().token("color", "blue"));
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // the explicit tokens should override the namespace-defaults
        assertStyle(toTest, ".THIS {color:blue}");
    }

    /** test that the explicit override isn't confused with the app's ns default */
    @Test
    public void testAppTokenOverridesAndNsDefault() throws Exception {
        // component in a different ns, with ns default tokens
        addNsTokensOtherNamespace(tokens().token("color", "red"));
        DefDescriptor<StyleDef> toTest = addStyleDefOtherNamespace(".THIS {color: token(color)}");

        // a namespace-default exists in the app's namespace
        addNsTokens(tokens().token("color", "blue"));

        // our app is in a different ns from the cmp, specifying explicit tokens
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().token("color", "green"));
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // the explicit tokens def outranks the cmp's namespace-default and the app's namespace-default
        assertStyle(toTest, ".THIS {color:green}");
    }

    /** test that the overrides don't prevent usage of ns-default when the token is not present in the overrides */
    @Test
    public void testAppTokenOverridesNotRelevant() throws Exception {
        // component in a different ns, with ns default tokens
        addNsTokensOtherNamespace(tokens().token("color", "red"));
        DefDescriptor<StyleDef> toTest = addStyleDefOtherNamespace(".THIS {color: token(color)}");

        // our app is in a different ns from the cmp, specifying explicit tokens
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().token("font", "arial"));
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // the cmp should fallback to it's namespace-default, without an error
        assertStyle(toTest, ".THIS {color:red}");
    }

    /** test that inherited tokens are applied */
    @Test
    public void testAppTokenOverridesInheritedToken() throws Exception {
        // component in a different ns, with ns default tokens
        addNsTokensOtherNamespace(tokens().token("color", "red"));
        DefDescriptor<StyleDef> toTest = addStyleDefOtherNamespace(".THIS {color: token(color)}");

        // the explicit tokens will inherit from this one
        DefDescriptor<TokensDef> parent = addSeparateTokens(tokens().token("color", "blue"));

        // our app is in a different ns from the cmp, specifying explicit app tokens
        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().parent(parent).token("font", "arial"));
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // the inherited value should be used
        assertStyle(toTest, ".THIS {color:blue}");
    }

    /** test when app tokens inherit from the other cmp's namespace-defaults */
    @Test
    public void testAppTokenOverridesCircleAround() throws Exception {
        // component in a different ns, with ns default tokens
        DefDescriptor<TokensDef> other = addNsTokensOtherNamespace(tokens().token("color", "red"));
        DefDescriptor<StyleDef> toTest = addStyleDefOtherNamespace(".THIS {color: token(color)}");

        // the tokens to use as an override inherits from the cmp's namespace-default tokens
        DefDescriptor<TokensDef> override = addNsTokens(tokens().parent(other));

        // our app is in a different ns from the cmp
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // the effect should be the same as if the override wasn't there
        assertStyle(toTest, ".THIS {color:red}");
    }

    /** test when app tokens inherit from the other cmp's namespace-defaults, but then changes the val */
    @Test
    public void testAppTokenOverridesCircleAroundChanged() throws Exception {
        // component in a different ns, with ns default tokens
        DefDescriptor<TokensDef> other = addNsTokensOtherNamespace(tokens().token("color", "red"));
        DefDescriptor<StyleDef> toTest = addStyleDefOtherNamespace(".THIS {color: token(color)}");

        // the tokens to use as an override inherits from the cmp's namespace-default tokens
        DefDescriptor<TokensDef> override = addNsTokens(tokens().parent(other).token("color", "blue"));

        // our app is in a different ns from the cmp
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // the app's implicit tokens value should be used
        assertStyle(toTest, ".THIS {color:blue}");
    }

    @Provider
    public static final class Provider1 implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return Aura.getDefinitionService().getDefDescriptor("tokenProviderTest:tokenResolutionProvider", TokensDef.class);
        }
    }

    /** test that a provided def works */
    @Test
    public void testAppExplicitTokensUsesProvider() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<StyleDef> styleDef = addStyleDef(".THIS {color:t(color)}");

        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().descriptorProvider(
                "java://" + Provider1.class.getName()));
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // should get the value from the provided def
        assertStyle(styleDef, ".THIS {color:blue}");
    }

    @Provider
    public static final class Provider2 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("color", "green");
        }
    }

    @Test
    public void testAppExplicitTokensUsesMapProvider() throws Exception {
        addNsTokens(tokens().token("color", "red"));
        DefDescriptor<StyleDef> styleDef = addStyleDef(".THIS {color:t(color)}");

        DefDescriptor<TokensDef> override = addSeparateTokens(tokens().mapProvider(
                "java://" + Provider2.class.getName()));
        addContextApp(String.format("<aura:application tokens='%s'/>", override.getDescriptorName()));

        // should get the value from the provided def
        assertStyle(styleDef, ".THIS {color:green}");
    }

    @Provider
    public static final class TokenComboTestProvider implements TokenDescriptorProvider {
        @Override
        public DefDescriptor<TokensDef> provide() throws QuickFixException {
            return Aura.getDefinitionService().getDefDescriptor("tokenProviderTest:tokenComboTest", TokensDef.class);
        }
    }

    @Provider
    public static final class TokenComboTestP1 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("font", "trebuchet", "margin", "20px");
        }
    }

    @Provider
    public static final class TokenComboTestP2 implements TokenMapProvider {
        @Override
        public Map<String, String> provide() throws QuickFixException {
            return ImmutableMap.of("font", "georgia");
        }
    }

    @Test
    public void testVariousTokenTypesCombination() throws Exception {
        // "*" next to the ones that should be used
        // namespace default (color, font, padding, margin, borderRadius*)
        // app override static tokens (color, font, padding*)
        // app override provided tokens (color*)
        // app override map tokens (font, margin*)
        // app override map tokens (font*)

        addNsTokens(tokens()
                .token("color", "red")
                .token("font", "arial")
                .token("padding", "5px")
                .token("margin", "7px")
                .token("borderRadius", "3px"));

        DefDescriptor<TokensDef> staticOverride = addSeparateTokens(tokens()
                .token("color", "green")
                .token("font", "times")
                .token("padding", "12px"));

        DefDescriptor<TokensDef> usesProvider = addSeparateTokens(tokens().descriptorProvider(
                "java://" + TokenComboTestProvider.class.getName()));

        DefDescriptor<TokensDef> mapTokens1 = addSeparateTokens(tokens().mapProvider(
                "java://" + TokenComboTestP1.class.getName()));
        DefDescriptor<TokensDef> mapTokens2 = addSeparateTokens(tokens().mapProvider(
                "java://" + TokenComboTestP2.class.getName()));

        String src = ".THIS {color: t(color); " +
                "font-family: t(font); " +
                "padding: t(padding); " +
                "margin: t(margin); " +
                "border-radius: t(borderRadius);}";

        String expected = ".THIS {color:yellow; " +
                "font-family:georgia; " +
                "padding:12px; " +
                "margin:20px; " +
                "border-radius:3px}";

        DefDescriptor<StyleDef> styleDef = addStyleDef(src);

        List<DefDescriptor<TokensDef>> tokens = Lists.newArrayList();
        tokens.add(staticOverride);
        tokens.add(usesProvider);
        tokens.add(mapTokens1);
        tokens.add(mapTokens2);
        addContextApp(String.format("<aura:application tokens='%s'/>", Joiner.on(", ").join(tokens)));

        assertStyle(styleDef, expected);
    }
}
