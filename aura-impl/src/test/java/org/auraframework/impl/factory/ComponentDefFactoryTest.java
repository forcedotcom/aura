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

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.service.CompilerService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Parser;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import com.google.common.collect.Lists;

public class ComponentDefFactoryTest extends BaseComponentDefFactoryTest<ComponentDef> {
    @Inject
    ComponentDefFactory componentDefFactory;

    @Inject
    CompilerService compilerService;

    public ComponentDefFactoryTest() {
        super("<aura:component %s>%s</aura:component>", ComponentDef.class);
    }

    @PostConstruct
    public void setupFactory() {
        setFactory(componentDefFactory);
    }

    @Test
    public void testEmptyXMLPlusDesign() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ComponentDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.COMPONENT, "<aura:component></aura:component>"),
                        new BundleEntryInfo(DefType.DESIGN, "<design:component></design:component>")
                        ));
        ComponentDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        assertNotNull(def.getDesignDef());
    }

    @Test
    public void testEventHandlerDefHandler() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ComponentDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.COMPONENT,
                "<aura:component><aura:handler event='aura:click' action='{!c.action}'/></aura:component>")));
        ComponentDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        assertNotNull(def);
        // FIXME Test for the handler.
    }

    @Test
    public void testEventHandlerDefHandlerNoName() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ComponentDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.COMPONENT,
                    "<aura:component><aura:handler action='{!c.handleIt}'/></aura:component>"
                )));
        ComponentDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        QuickFixException expected = null;

        try {
            def.validateDefinition();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull(expected);
    }



    ////////////////////////////////////////////////////////////////////////////////////////
    // isTemplate
    ////////////////////////////////////////////////////////////////////////////////////////
    @Test
    public void testCustomIsTemplateTrue() throws Exception {
    }

    @Test
    public void testCustomIsTemplateFalse() throws Exception {
    }

    @Test
    public void testCustomIsTemplateInvalid() throws Exception {
    }

    @Test
    public void testInternalIsTemplateTrue() throws Exception {
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // template
    ////////////////////////////////////////////////////////////////////////////////////////
    @Test
    public void testCustomTemplateNegative() throws Exception {
    }

    @Test
    public void testInternalTemplate() throws Exception {
    }

    @Test
    public void testInvalidImportNoName() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<ComponentDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class,
                Lists.newArrayList(new BundleEntryInfo(DefType.COMPONENT,
                    "<aura:component><aura:import property='testLibrary' /></aura:component>"
                )));
        ComponentDef def = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        QuickFixException expected = null;

        try {
            def.validateDefinition();
        } catch (QuickFixException qfe) {
            expected = qfe;
        }
        assertNotNull(expected);
    }

    @Test
    public void testTemplateUIDMatch() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String styleText = ".div { color: blue; }";
        BundleSource<ComponentDef> bundleSource = util.buildBundleSource(util.getInternalNamespace(),
                ComponentDef.class,
                Lists.newArrayList(
                    new BundleEntryInfo(DefType.COMPONENT,
                        "<aura:component isTemplate='true'></aura:component>"),
                    new BundleEntryInfo(DefType.STYLE, styleText)
                ));
        TextSource<StyleDef> styleSource = util.buildTextSource(
                bundleSource.getDescriptor().getNamespace(),
                bundleSource.getDescriptor().getName(),
                StyleDef.class, "templateCss", styleText, Parser.Format.TEMPLATE_CSS);
        ComponentDef component = factory.getDefinition(bundleSource.getDescriptor(), bundleSource);
        StyleDef templateCss = compilerService.compile(styleSource.getDescriptor(), styleSource);
        assertEquals(templateCss.getOwnHash(), component.getStyleDef().getOwnHash());
    }
}
