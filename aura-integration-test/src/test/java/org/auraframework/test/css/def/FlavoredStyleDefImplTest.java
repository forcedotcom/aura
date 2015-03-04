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

import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

/**
 * Unit tests for {@link FlavoredStyleDef}.
 */
public class FlavoredStyleDefImplTest extends StyleTestCase {
    public FlavoredStyleDefImplTest(String name) {
        super(name);
    }

    /** basic loading of a standard flavor within the component bundle */
    public void testLoadStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTestA:box", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(component);
        assertTrue("expected to find bundle flavor def", flavor.exists());
        flavor.getDef(); // no errors with loading
    }

    /** basic loading of a custom flavor within another namespace */
    public void testLoadCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTestA:box", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.customFlavorDescriptor(component, "flavorTestB", "flavors");
        assertTrue("expected to find namespace flavor def", flavor.exists());
        flavor.getDef(); // no errors with loading
    }

    /** test that flavor names are found in the css file and stored */
    public void testGetFlavorNamesFromStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:multiple", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(component);
        Set<String> flavorNames = flavor.getDef().getFlavorNames();

        assertEquals(3, flavorNames.size());
        assertTrue(flavorNames.contains("default"));
        assertTrue(flavorNames.contains("minimal"));
        assertTrue(flavorNames.contains("extravagant"));
    }

    /** test that flavor names are found in the css file and stored */
    public void testGetFlavorNamesFromCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:multiple", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.customFlavorDescriptor(component, "flavorTestB", "flavors");
        Set<String> flavorNames = flavor.getDef().getFlavorNames();

        assertEquals(3, flavorNames.size());
        assertTrue(flavorNames.contains("primary"));
        assertTrue(flavorNames.contains("promo"));
        assertTrue(flavorNames.contains("publisher"));
    }

    /** references to a theme var add the namespace theme to the deps */
    public void testThemeDependencies() throws QuickFixException {
        DefDescriptor<ThemeDef> theme = addNsTheme(theme().var("color", "red"));
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, "@flavor test; .test {color:t(color);}");

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        flavor.getDef().appendDependencies(dependencies);
        assertTrue(dependencies.contains(theme));
    }

    /** keeps track of var names */
    public void testGetVarNames() throws Exception {
        addNsTheme(theme().var("color", "red").var("margin1", "10px"));
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp,
                "@flavor test; .test {color: theme(color); font-weight: bold; margin: t(margin1); }");

        Set<String> varNames = flavor.getDef().getVarNames();
        assertEquals("didn't have expected size", 2, varNames.size());
        assertTrue(varNames.contains("color"));
        assertTrue(varNames.contains("margin1"));
    }
}
