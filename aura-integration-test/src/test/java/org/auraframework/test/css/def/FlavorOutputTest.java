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
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.css.util.Styles;
import org.auraframework.throwable.quickfix.StyleParserException;

/**
 * General unit tests for expected flavor parsed output.
 */
public class FlavorOutputTest extends StyleTestCase {
    public FlavorOutputTest(String name) {
        super(name);
    }

    private DefDescriptor<ComponentDef> cmp() {
        return getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
    }

    /** aura-flavor at-rule should not be output in final css */
    public void testFlavorAtRuleNotOutput() throws Exception {
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp(), "@flavor test;");
        assertEquals("", flavor.getDef().getCode());
    }

    /** [flavorName] -> [namespace][FlavorName]-f */
    public void testRenameCustomFlavorClassNames() throws Exception {
        String src = "@flavor primary; \n" +
                "     @flavor secondary; \n" +
                "    .primary {color:red} \n" +
                "    .secondary {color:red}";

        String fmt = ".%s.%s {color:red}\n" +
                ".%s.%s {color:red}";

        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> flavor = addCustomFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);
        String primary = Flavors.buildFlavorClassName("primary", flavor.getNamespace());
        String secondary = Flavors.buildFlavorClassName("secondary", flavor.getNamespace());

        String expected = String.format(fmt, addedClass, primary, addedClass, secondary);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** nested selectors with the flavor name should be renamed too */
    public void testRenameCustomFlavorClassNamesNested() throws Exception {
        String src = "@flavor primary; \n" +
                "    .primary div .primary {color:red}";

        String fmt = ".%s.%s div .%s.%s {color:red}";

        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> flavor = addCustomFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);
        String primary = Flavors.buildFlavorClassName("primary", flavor.getNamespace());

        String expected = String.format(fmt, addedClass, primary, addedClass, primary);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** if multiple flavors are adjoined, only one selector should be prepended */
    public void testRenameCustomFlavorClassNamesAdjoining() throws Exception {
        String src = "@flavor primary; \n" +
                "     @flavor secondary; \n" +
                "    .primary.secondary {color:red}";

        String fmt = ".%s.%s.%s {color:red}";

        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> flavor = addCustomFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);
        String primary = Flavors.buildFlavorClassName("primary", flavor.getNamespace());
        String secondary = Flavors.buildFlavorClassName("secondary", flavor.getNamespace());

        String expected = String.format(fmt, addedClass, primary, secondary);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** [flavorName] -> [flavorName]_flavor */
    public void testRenameStandardFlavorClassNames() throws Exception {
        String src = "@flavor primary; \n" +
                "     @flavor secondary; \n" +
                "    .primary {color:red} \n" +
                "    .secondary {color:red}";

        String fmt = ".%s.%s {color:red}\n" +
                ".%s.%s {color:red}";

        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, src);

        String addedClass = Styles.buildClassName(cmp);
        String primary = Flavors.buildFlavorClassName("primary");
        String secondary = Flavors.buildFlavorClassName("secondary");

        String expected = String.format(fmt, addedClass, primary, addedClass, secondary);
        assertEquals(expected, flavor.getDef().getCode());
    }

    /** selectors must begin with a class selector containing one of the declared flavor names */
    public void testErrorsOnUnscopedSelectorInCustomFlavor() throws Exception {
        try {
            addCustomFlavor(cmp(), "@flavor test; .bad{}").getDef();
            fail("Parser should have thrown StyleParserException trying to parse invalid CSS.");
        } catch (Exception e) {
            checkExceptionContains(e, StyleParserException.class, "CSS rules must start with a class selector");
        }
    }

    /** selectors must begin with a class selector containing one of the declared flavor names */
    public void testErrorsOnUnscopedSelectorInStandardFlavor() throws Exception {
        try {
            addStandardFlavor(cmp(), "@flavor test; .bad{}").getDef();
            fail("Parser should have thrown StyleParserException trying to parse invalid CSS.");
        } catch (Exception e) {
            checkExceptionContains(e, StyleParserException.class, "CSS rules must start with a class selector");
        }
    }

    /** selectors must begin with a class selector containing one of the declared flavor names */
    public void testErrorsOnUnscopedSelectorNested() throws Exception {
        try {
            addStandardFlavor(cmp(), "@flavor test; div .test{}").getDef();
            fail("Parser should have thrown StyleParserException trying to parse invalid CSS.");
        } catch (Exception e) {
            checkExceptionContains(e, StyleParserException.class, "CSS rules must start with a class selector");
        }
    }

    /** TOODNM: resolves theme tokens */
}
