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
package org.auraframework.def;

import org.auraframework.Aura;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Ignore;

/**
 * Unit tests for templates. Components can be marked as template using the "isTemplate" attribute. Applications cannot
 * be marked as template. Both applications and components can use templates. By default, "aura:template" is template
 * for all applications and components.
 */
public class TemplateDefTest extends AuraImplTestCase {
    public TemplateDefTest(String name) {
        super(name);
    }

    public void testDefaultTemplate() throws Exception {
        assertTemplate(ComponentDef.class, String.format(baseComponentTag, "", ""), null,
                "Expected aura:template to be default template for components");

        assertTemplate(ApplicationDef.class, String.format(baseApplicationTag, "", ""), null,
                "Expected aura:template to be default template for applications");
    }

    private void assertTemplate(Class<? extends BaseComponentDef> c, String markup,
            DefDescriptor<ComponentDef> expectedTemplate, String msg) throws Exception {
        expectedTemplate = (expectedTemplate == null
                ? Aura.getDefinitionService().getDefDescriptor("aura:template", ComponentDef.class)
                : expectedTemplate);
        DefDescriptor<? extends BaseComponentDef> desc = addSourceAutoCleanup(c, markup);
        BaseComponentDef def = desc.getDef();
        assertEquals(msg, expectedTemplate, def.getTemplateDef().getDescriptor());
    }

    public void testCustomTemplate() throws Exception {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
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
        assertEquals(msg, isTemplate, desc.getDef().isTemplate());
    }

    @Ignore("W-1545475")
    public void testApplicationIsNotATemplate() {
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "isTemplate='true'", ""));
        try {
            app.getDef();
            fail("Applications cannot be marked as template.");
        } catch (Exception expected) {
            checkExceptionFull(expected, InvalidSystemAttributeException.class, "Invalid attribute isTemplate");
        }
    }

    /**
     * Verify that a component marked as template can also be instantiated stand alone.
     */
    public void testInstantiatingTemplateComponent() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", ""));
        try {
            Aura.getInstanceService().getInstance(template);
        } catch (Exception unexpected) {
            fail("A template component can also be instantiated as a stand alone component.");
        }
    }

    /**
     * Verify that only components marked as 'isTemplate=true' can be used as templates.
     */
    @Ignore("W-1545479")
    public void testIsTemplateAttributeRequired() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", ""));
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("template='%s:%s'", template.getNamespace(), template.getName()), ""));
        try {
            cmp.getDef();
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
            cmp.getDef();
            fail("Should have failed to use a template marked with isTemplate='false'");
        } catch (Exception expected) {
            checkExceptionFull(expected, AuraRuntimeException.class,
                    "Non template component specified for template attribute");
        }
    }

    /**
     * A template cannot be abstract because if it is, it cannot be instantiated directly and that is not good.
     */
    @Ignore("W-1545480")
    public void testTemplateCannotBeAbstract() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' abstract='true'", ""));
        try {
            Aura.getInstanceService().getInstance(template);
            fail("Template components cannot be abstract.");
        } catch (Exception expected) {
            checkExceptionFull(expected, AuraRuntimeException.class, "Template cannot be abstract.");
        }
    }

    /**
     * isTemplate attribute is not inherited by children.
     */
    public void testTemplateExtension() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' extensible='true'", ""));
        assertIsTemplate("Parent is not a template", parent, true);

        DefDescriptor<ComponentDef> child = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("extends='%s:%s'", parent.getNamespace(), parent.getName()), ""));
        assertIsTemplate("Extension of a template should not be a template", child, false);
    }

    /**
     * Valid usage of script tags.
     * 
     * @throws Exception
     */
    public void testValidScriptTags() throws Exception {
        // Script tags inline in a template markup
        String scriptInclude = "<script type='text/javascript' src='/aura/ckeditor/ckeditor.js'></script>";
        DefDescriptor<ComponentDef> scriptTagInBodyOfTemplate = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", scriptInclude));
        assertExceptionDueToScripts("Failed to use script tag in template", scriptTagInBodyOfTemplate, false);

        // Script tags as attribute value of parent template
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' extensible='true'",
                        "<aura:attribute name='scriptTags' type='String'/>"));
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
    public void testExtraTagsCanAccessModel() throws Exception {
        String extraScriptTags = "<aura:set attribute='extraScriptTags'><script type='text/javascript' src='{!m.firstThing}'/></aura:set>";
        String extraStyleTags = "<aura:set attribute='extraStyleTags'><script type='text/javascript' src='{!m.readOnlyThing}'/></aura:set>";
        String extraMetaTags = "<aura:set attribute='extraMetaTags'><meta content='testtest' name='{!m.firstThing}'/></aura:set>";
        DefDescriptor<ComponentDef> scriptTagInBodyOfTemplate = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extends='aura:template' model='java://org.auraframework.impl.java.model.TestModel'",
                        extraScriptTags + extraStyleTags + extraMetaTags));

        StringBuffer sb = new StringBuffer();
        Component template = Aura.getInstanceService().getInstance(scriptTagInBodyOfTemplate);
        Aura.getRenderingService().render(template, sb);
        String result = sb.toString();
        assertTrue("extraScriptTags attribute on aura:template could not retrieve value off model",
                result.contains("<script type=\"text/javascript\" src=\"firstThingDefault\""));
        assertTrue("extraStyleTags attribute on aura:template could not retrieve value off model",
                result.contains("<script type=\"text/javascript\" src=\"readonly\""));
        assertTrue("extraMetaTags attribute on aura:template could not retrieve value off model",
                result.contains("<meta content=\"testtest\" name=\"firstThingDefault\""));
    }

    private void assertExceptionDueToScripts(String msg, DefDescriptor<? extends BaseComponentDef> desc,
            boolean expectException) {
        try {
            desc.getDef();
            if (expectException)
                fail(msg);
        } catch (Exception e) {
            if (expectException && e instanceof AuraRuntimeException) {
                assertTrue(e.getMessage().contains("script tags only allowed in templates"));
                return;
            } else
                fail(msg);
        }
    }
    
    /**
     * Verify the new errorTitle attribute, with default error message.
     */
    public void testDefaultErrorTitleAttributeInTemplate() throws Exception {    	       
        DefDescriptor<ComponentDef> errorTitleIntemplate = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extends='aura:template' ",
                        ""));
        
        StringBuffer sb = new StringBuffer();
        Component template = Aura.getInstanceService().getInstance(errorTitleIntemplate);
        Aura.getRenderingService().render(template, sb);
        String result = sb.toString();
        assertTrue("errorTitle attribute on aura:template has wrong text",
                result.contains("Oops, there's a problem:"));       
        
    }

    /**
     * Verify the new errorTitle attribute, when error message is provided in template.
     */
    public void testCustomErrorTitleAttributeInTemplate() throws Exception {
    	String errorTitle = "<aura:set attribute='errorTitle'>Looks like there's a problem.</aura:set>";        
        DefDescriptor<ComponentDef> errorTitleIntemplate = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extends='aura:template' ",
                        errorTitle));
        
        StringBuffer sb = new StringBuffer();
        Component template = Aura.getInstanceService().getInstance(errorTitleIntemplate);
        Aura.getRenderingService().render(template, sb);
        String result = sb.toString();
        assertTrue("errorTitle attribute on aura:template has wrong text",
                result.contains("Looks like there's a problem."));              
    }
}
