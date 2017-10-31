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
package org.auraframework.integration.test.def;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.RenderingService;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

import javax.inject.Inject;
import java.util.regex.Pattern;

/**
 * Unit tests for templates. Components can be marked as template using the "isTemplate" attribute. Applications cannot
 * be marked as template. Both applications and components can use templates. By default, "aura:template" is template
 * for all applications and components.
 */
public class TemplateDefTest extends AuraImplTestCase {
    @Inject
    RenderingService renderingService;

    @Inject
    DefinitionService definitionService;

    @Test
    public void testDefaultTemplate() throws Exception {
        assertTemplate(ComponentDef.class, String.format(baseComponentTag, "", ""), null,
                "Expected aura:template to be default template for components");

        assertTemplate(ApplicationDef.class, String.format(baseApplicationTag, "", ""), null,
                "Expected aura:template to be default template for applications");
    }

    private void assertTemplate(Class<? extends BaseComponentDef> c, String markup,
            DefDescriptor<ComponentDef> expectedTemplate, String msg) throws Exception {
        expectedTemplate = (expectedTemplate == null
                ? definitionService.getDefDescriptor("aura:template", ComponentDef.class)
                : expectedTemplate);
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(c, markup);
        BaseComponentDef def = definitionService.getDefinition(desc);
        assertEquals(msg, expectedTemplate, def.getTemplateDef().getDescriptor());
    }

    @Test
    public void testCustomTemplate() throws Exception {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", ""));
        assertTemplate(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("template='%s:%s'", template.getNamespace(), template.getName()), ""),
                template, "Failed to register a custom template for a component");

        assertTemplate(
                ApplicationDef.class,
                String.format(baseApplicationTag,
                        String.format("template='%s:%s'", template.getNamespace(), template.getName()), ""),
                template, "Failed to register a custom template for an application");
    }

    @Test
    public void testIsTemplateAttribute() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        assertIsTemplate("By default a component is not a template", desc, false);

        desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "isTemplate='true'", ""));
        assertIsTemplate("isTemplate specification not respected", desc, true);

        desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "isTemplate='false'", ""));
        assertIsTemplate("isTemplate specification not respected", desc, false);

        desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "isTemplate=''", ""));
        assertIsTemplate("Empty string for isTemplate is not handled", desc, false);

        desc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag, "isTemplate='foo'", ""));
        assertIsTemplate("Garbage string for isTemplate should result in false", desc, false);
    }

    private void assertIsTemplate(String msg, DefDescriptor<? extends BaseComponentDef> desc,
            boolean isTemplate) throws Exception {
        assertEquals(msg, isTemplate, definitionService.getDefinition(desc).isTemplate());
    }

    @Test
    public void testApplicationIsNotATemplate() {
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "isTemplate='true'", ""));
        try {
        	definitionService.getDefinition(app);
            fail("Applications cannot be marked as template.");
        } catch (Exception expected) {
            checkExceptionContains(expected, InvalidDefinitionException.class, "Invalid attribute \"isTemplate\"");
        }
    }

    /**
     * Verify that a component marked as template can also be instantiated stand alone.
     */
    @Test
    public void testInstantiatingTemplateComponent() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", ""));
        try {
            instanceService.getInstance(template);
        } catch (Exception unexpected) {
            fail("A template component can also be instantiated as a stand alone component.");
        }
    }

    /**
     * Verify that only components marked as 'isTemplate=true' can be used as templates.
     */
    @Test
    public void testIsTemplateAttributeRequired() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", ""));
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("template='%s:%s'", template.getNamespace(), template.getName()), ""));
        try {
        	definitionService.getDefinition(cmp);
        } catch (Exception unexpected) {
            fail("Failed to use a template component.");
        }

        DefDescriptor<ComponentDef> nonTemplate = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='false'", ""));
        cmp = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("template='%s:%s'", nonTemplate.getNamespace(), nonTemplate.getName()), ""));
        try {
        	definitionService.getDefinition(cmp);
            fail("Should have failed to use a template marked with isTemplate='false'");
        } catch (Exception expected) {
            checkExceptionFull(expected, InvalidDefinitionException.class,
                    String.format("Template %s must be marked as a template", nonTemplate.getQualifiedName()));
        }
    }

    /**
     * A template cannot be abstract because if it is, it cannot be instantiated directly and that is not good.
     */
    @Test
    public void testTemplateCannotBeAbstract() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' abstract='true'", ""));
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("template='%s:%s'", template.getNamespace(), template.getName()), ""));
        try {
            definitionService.getDefinition(cmp);
            fail("Template components cannot be abstract.");
        } catch (Exception expected) {
            checkExceptionFull(expected, InvalidDefinitionException.class,
            		String.format("Template %s must not be abstract", template.getQualifiedName()));
        }
    }

    /**
     * isTemplate attribute is not inherited by children.
     */
    @Test
    public void testTemplateExtension() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' extensible='true'", ""));
        assertIsTemplate("Parent is not a template", parent, true);

        DefDescriptor<ComponentDef> child = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("extends='%s:%s'", parent.getNamespace(), parent.getName()), ""));
        try {
            definitionService.getDefinition(child);
            fail("Non-templates cannot extend template.");
        } catch (Exception expected) {
            checkExceptionFull(expected, InvalidDefinitionException.class,
                    String.format("Non-template %s cannot extend template %s",
                            child.getQualifiedName(), parent.getQualifiedName()));
        }
    }

    /**
     * Valid usage of script tags.
     *
     * @throws Exception
     */
    @Test
    public void testValidScriptTags() throws Exception {
        // Script tags inline in a template markup
        String scriptInclude = "<script type='text/javascript' src='/aura/ckeditor/ckeditor.js'></script>";
        DefDescriptor<ComponentDef> scriptTagInBodyOfTemplate = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", scriptInclude));
        assertExceptionDueToScripts("Failed to use script tag in template", scriptTagInBodyOfTemplate, false);

        // Script tags as attribute value of parent template
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' extensible='true'",
                        "<aura:attribute name='scriptTags' type='Aura.Component[]'/>"));
        DefDescriptor<ComponentDef> scriptTagInAuraSet = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("isTemplate='true' extends='%s:%s'", parent.getNamespace(), parent.getName()),
                        String.format("<aura:set attribute='scriptTags'>%s</aura:set>", scriptInclude)));
        assertExceptionDueToScripts("Failed to use script tag as attribute value of parent", scriptTagInAuraSet, false);

        // Script tags inline in a application markup
        DefDescriptor<ApplicationDef> scriptTagInBodyOfApp = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "", scriptInclude));
        assertExceptionDueToScripts("Failed to use script tag in application", scriptTagInBodyOfApp, false);

    }

    /**
     * Invalid usage of script tags.
     *
     * @throws Exception
     */
    @Test
    public void testInvalidScriptTags() throws Exception {
        // Script tags inline in a component markup
        String scriptInclude = "<script type='text/javascript' src='/aura/ckeditor/ckeditor.js'></script>";
        DefDescriptor<ComponentDef> scriptTagInBodyOfComponent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", scriptInclude));
        assertExceptionDueToScripts("Script tags should not be allowed in components", scriptTagInBodyOfComponent, true);

        // Script tags as attribute value of parent component
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "extensible='true'",
                        "<aura:attribute name='scriptTags' type='String'/>"));
        DefDescriptor<ComponentDef> scriptTagInAuraSet = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("extends='%s:%s'", parent.getNamespace(), parent.getName()),
                        String.format("<aura:set attribute='scriptTags'>%s</aura:set>", scriptInclude)));
        assertExceptionDueToScripts("Script tags should not be allowed as attribute value in components",
                scriptTagInAuraSet, true);
    }

    // Automation for W-1584537
    @Test
    public void testExtraTagsCanAccessModel() throws Exception {
        String extraScriptTags = "<aura:set attribute='extraScriptTags'><script type='text/javascript' src='{!m.firstThing}'/></aura:set>";
        String extraStyleTags = "<aura:set attribute='extraStyleTags'><script type='text/javascript' src='{!m.readOnlyThing}'/></aura:set>";
        String extraMetaTags = "<aura:set attribute='extraMetaTags'><meta content='testtest' name='{!m.firstThing}'/></aura:set>";
        DefDescriptor<ComponentDef> scriptTagInBodyOfTemplate = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extends='aura:template' model='java://org.auraframework.components.test.java.model.TestModel'",
                        extraScriptTags + extraStyleTags + extraMetaTags));

        StringBuffer sb = new StringBuffer();
        Component template = instanceService.getInstance(scriptTagInBodyOfTemplate);
        renderingService.render(template, sb);
        String result = sb.toString();

        // Using pattens here because in java 1.7 we get attributes rendered one way, in 1.8 we get a different way.
        Pattern scriptPattern = Pattern.compile("<script src=\"firstThingDefault\" type=\"text/javascript\"|<script type=\"text/javascript\" src=\"firstThingDefault\"");
        Pattern stylePattern = Pattern.compile("<script src=\"readonly\" type=\"text/javascript\"|<script type=\"text/javascript\" src=\"readonly\"");
        Pattern metaPattenr = Pattern.compile("<meta content=\"testtest\" name=\"firstThingDefault\"|<meta name=\"firstThingDefault\" content=\"testtest\"");

        assertTrue("extraScriptTags attribute on aura:template could not retrieve value off model", scriptPattern.matcher(result).find());
        assertTrue("extraStyleTags attribute on aura:template could not retrieve value off model",stylePattern.matcher(result).find());
        assertTrue("extraMetaTags attribute on aura:template could not retrieve value off model",metaPattenr.matcher(result).find());
    }

    private void assertExceptionDueToScripts(String msg, DefDescriptor<? extends BaseComponentDef> desc,
            boolean expectException) {
        try {
        	definitionService.getDefinition(desc);
            if (expectException) {
                fail(msg);
            }
        } catch (Exception e) {
            if (expectException && e instanceof InvalidDefinitionException) {
                assertTrue(e.getMessage().contains("script tags only allowed in templates"));
                return;
            } else {
                fail(msg);
            }
        }
    }

    /**
     * Verify the new errorTitle attribute, with default error message.
     */
    @Test
    public void testDefaultErrorTitleAttributeInTemplate() throws Exception {
        DefDescriptor<ComponentDef> errorTitleIntemplate = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extends='aura:template' ",
                        ""));

        StringBuffer sb = new StringBuffer();
        Component template = instanceService.getInstance(errorTitleIntemplate);
        renderingService.render(template, sb);
        String result = sb.toString();
        assertTrue("errorTitle attribute on aura:template has wrong text: "+result,
                result.contains("Sorry to interrupt"));

    }

    /**
     * Verify the new errorTitle attribute, when error message is provided in template.
     */
    @Test
    public void testCustomErrorTitleAttributeInTemplate() throws Exception {
    	String errorTitle = "<aura:set attribute='errorTitle' value='Looks like theres a problem.'></aura:set>";
        DefDescriptor<ComponentDef> errorTitleIntemplate = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extends='aura:template' ",
                        errorTitle));

        StringBuffer sb = new StringBuffer();
        Component template = instanceService.getInstance(errorTitleIntemplate);
        renderingService.render(template, sb);
        String result = sb.toString();
        assertTrue("errorTitle attribute on aura:template has wrong text",
                result.contains("Looks like theres a problem."));
    }
}
