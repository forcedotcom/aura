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
package org.auraframework.test.css.def;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.util.Styles;
import org.auraframework.throwable.quickfix.StyleParserException;

/**
 * General unit tests for expected flavor parsed output.
 */
public class FlavorOutputTest extends StyleTestCase {
    public FlavorOutputTest(String name) {
        super(name);
    }

    /** [flavorName] -> [namespace][FlavorName]-f */
    public void testRenameFlavorClassNames() throws Exception {
        String src = ".THIS--primary {color:red} \n" +
                ".THIS--secondary {color:red}";

        String fmt = ".%s--primary {color:red}\n" +
                ".%s--secondary {color:red}";

        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> flavor = addCustomFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);

        String expected = String.format(fmt, addedClass, addedClass);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** nested selectors with the flavor name should be renamed too */
    public void testRenameCustomFlavorClassNamesNested() throws Exception {
        String src = ".THIS--primary div .THIS--primary {color:red}";
        String fmt = ".%s--primary div .%s--primary {color:red}";

        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> flavor = addCustomFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);

        String expected = String.format(fmt, addedClass, addedClass);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** test other valid key selectors, such as .THIS-foo, .THIS__foo */
    public void testAlternativeKeySelectors() throws Exception {
        String src = ".THIS-foo {color:red}\n"
                + ".THIS__foo {color:red}\n"
                + ".THIS-foo__bar {color:red}\n"
                + ".THIS-foo-this__THISbar div .THIS__test {color:red}\n"
                + ".THIS--foo__bar {color:red}\n"
                + ".THIS__foo--bar {color:red}";

        String fmt = ".%1$s-foo {color:red}\n"
                + ".%1$s__foo {color:red}\n"
                + ".%1$s-foo__bar {color:red}\n"
                + ".%1$s-foo-this__THISbar div .%1$s__test {color:red}\n"
                + ".%1$s--foo__bar {color:red}\n"
                + ".%1$s__foo--bar {color:red}";

        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> flavor = addCustomFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);

        String expected = String.format(fmt, addedClass, addedClass);
        assertEquals(expected, flavor.getDef().getCode());
    }

    public void testResolvesThemeTokens() throws Exception {
        String src = ".THIS--primary {color:t(color)}";
        String fmt = ".%s--primary {color:red}";

        addNsTheme(theme().var("color", "red"));
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);
        String expected = String.format(fmt, addedClass);
        assertEquals(expected, flavor.getDef().getCode());
    }

    public void testRenamesThisShorthand() throws Exception {
        String src = ".THIS {color:red}";
        String fmt = ".%s--default {color:red}";

        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);
        String expected = String.format(fmt, addedClass);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** selectors must begin with a class selector containing one of the declared flavor names */
    public void testErrorsOnUnscopedSelectorInFlavor() throws Exception {
        try {
            addCustomFlavor(addFlavorableComponentDef(), ".bad{}").getDef();
            fail("Parser should have thrown StyleParserException trying to parse invalid CSS.");
        } catch (Exception e) {
            checkExceptionContains(e, StyleParserException.class,
                    "CSS selectors must begin with a class selector of the proper format");
        }
    }

    /** selectors must begin with a class selector containing one of the declared flavor names */
    public void testErrorsOnUnscopedSelectorNested() throws Exception {
        try {
            addStandardFlavor(addFlavorableComponentDef(), "div .THIS--primary{}").getDef();
            fail("Parser should have thrown StyleParserException trying to parse invalid CSS.");
        } catch (Exception e) {
            checkExceptionContains(e, StyleParserException.class,
                    "CSS selectors must begin with a class selector of the proper format");
        }
    }

}
