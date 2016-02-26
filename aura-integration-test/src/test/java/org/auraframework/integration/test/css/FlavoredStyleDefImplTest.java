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

import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
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
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(component);
        assertTrue("expected to find bundle flavor def", flavor.exists());
        definitionService.getDefinition(flavor); // no errors with loading
    }

    /** basic loading of a custom flavor within another namespace */
    public void testLoadCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.customFlavorDescriptor(component, "flavorTestAlt", "flavors");
        assertTrue("expected to find namespace flavor def", flavor.exists());
        definitionService.getDefinition(flavor); // no errors with loading
    }

    /** test that flavor names are found in the css file and stored */
    public void testGetFlavorNamesFromStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(component);
        Set<String> flavorNames = definitionService.getDefinition(flavor).getFlavorNames();

        assertEquals("didn't get expected flavor names, found: " + flavorNames, 4, flavorNames.size());
        assertTrue(flavorNames.contains("default"));
        assertTrue(flavorNames.contains("flavorA"));
        assertTrue(flavorNames.contains("flavorB"));
        assertTrue(flavorNames.contains("flavorC"));
    }

    /** test that flavor names are found in the css file and stored */
    public void testGetFlavorNamesFromCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.customFlavorDescriptor(component, "flavorTestAlt", "flavors");
        Set<String> flavorNames = definitionService.getDefinition(flavor).getFlavorNames();

        assertEquals("didn't get expected flavor names, found: " + flavorNames, 5, flavorNames.size());
        assertTrue(flavorNames.contains("default"));
        assertTrue(flavorNames.contains("flavorX"));
        assertTrue(flavorNames.contains("flavorY"));
        assertTrue(flavorNames.contains("flavorZ"));
        assertTrue(flavorNames.contains("flavor0"));
    }

    /** test that we don't get confused from non-flavor class names */
    public void testGetFlavorNamesVariations() throws Exception {
        DefDescriptor<ComponentDef> component = DefDescriptorImpl.getInstance("flavorTest:x_landmark", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> flavor = Flavors.standardFlavorDescriptor(component);
        Set<String> flavorNames = definitionService.getDefinition(flavor).getFlavorNames();

        assertEquals("didn't get expected flavor names, found: " + flavorNames, 6, flavorNames.size());
        assertTrue(flavorNames.contains("default"));
        assertTrue(flavorNames.contains("flavorA"));
        assertTrue(flavorNames.contains("flavorB"));
        assertTrue(flavorNames.contains("flavorC"));
        assertTrue(flavorNames.contains("flavorC-special"));
        assertTrue(flavorNames.contains("flavorD"));
    }

    /** references to a token add the namespace-default tokens to the deps */
    public void testTokenDependencies() throws QuickFixException {
        DefDescriptor<TokensDef> nsTokens = addNsTokens(tokens().token("color", "red"));
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component><div aura:flavorable='true'></div></aura:component>");
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, ".THIS--test {color:t(color);}");

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        definitionService.getDefinition(flavor).appendDependencies(dependencies);
        assertTrue(dependencies.contains(nsTokens));
    }

    /** custom flavors have a dependency on the component, standard flavors do not */
    public void testFlavorDependencies() throws QuickFixException {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component><div aura:flavorable='true'></div></aura:component>");
        DefDescriptor<FlavoredStyleDef> standard = addStandardFlavor(cmp, ".THIS--test {color:red}");

        Set<DefDescriptor<?>> dependencies = Sets.newHashSet();
        definitionService.getDefinition(standard).appendDependencies(dependencies);
        assertTrue("did not expect standard flavor to have dependencies", dependencies.isEmpty());

        DefDescriptor<FlavoredStyleDef> custom = addCustomFlavor(cmp, ".THIS--test{}");
        dependencies = Sets.newHashSet();
        definitionService.getDefinition(custom).appendDependencies(dependencies);
        assertEquals("didn't get expected dependencies for custom flavor", 1, dependencies.size());
        assertTrue(dependencies.contains(cmp));
    }

    /** keeps track of token names */
    public void testGetTokensNames() throws Exception {
        addNsTokens(tokens().token("color", "red").token("margin1", "10px"));
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component><div aura:flavorable='true'></div></aura:component>");
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp,
                ".THIS--test {color: token(color); font-weight: bold; margin: t(margin1); }");

        Set<String> tokenNames = definitionService.getDefinition(flavor).getTokenNames();
        assertEquals("didn't have expected size", 2, tokenNames.size());
        assertTrue(tokenNames.contains("color"));
        assertTrue(tokenNames.contains("margin1"));
    }

    /** test that it throws an error if flavoring something that isn't flavorable */
    public void testNotFlavorableWithStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        DefDescriptor<FlavoredStyleDef> custom = addStandardFlavor(cmp, ".THIS--test {color:red}");

        try {
        	definitionService.getDefinition(custom).validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must contain at least one");
        }
    }

    /** test that it throws an error if flavoring something that isn't flavorable */
    public void testNotFlavorableWithCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        DefDescriptor<FlavoredStyleDef> custom = addCustomFlavor(cmp, ".THIS--test {color:red}");

        try {
        	definitionService.getDefinition(custom).validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must contain at least one");
        }
    }
}
