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

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

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

    public void testApplicationIsNotATemplate() {
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "isTemplate='true'", ""));
        try {
            app.getDef();
            fail("Applications cannot be marked as template.");
        } catch (Exception expected) {
            checkExceptionContains(expected, InvalidDefinitionException.class, "Invalid attribute \"isTemplate\"");
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
            checkExceptionFull(expected, InvalidDefinitionException.class,
                    String.format("Template %s must be marked as a template", nonTemplate.getQualifiedName()));
        }
    }

    /**
     * A template cannot be abstract because if it is, it cannot be instantiated directly and that is not good.
     */
    public void testTemplateCannotBeAbstract() {
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' abstract='true'", ""));
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("template='%s:%s'", template.getNamespace(), template.getName()), ""));
        try {
            //Aura.getInstanceService().getInstance(template);
            cmp.getDef();
            fail("Template components cannot be abstract.");
        } catch (Exception expected) {
            checkExceptionFull(expected, InvalidDefinitionException.class,
            		String.format("Template %s must not be abstract", template.getQualifiedName()));
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
        try {
            child.getDef();
            fail("Non-templates cannot extend template.");
        } catch (Exception expected) {
            checkExceptionFull(expected, InvalidDefinitionException.class,
                    String.format("Non-template %s cannot extend template %s",
                            child.getQualifiedName(), parent.getQualifiedName()));
        }
    }

    private static String SCRIPT_INCLUDE = "<script type='text/javascript' src='/aura/ckeditor/ckeditor.js'></script>";
    private static String SCRIPT_EXCEPT_MESSAGE = "script tags only allowed in privileged templates";

    /**
     * Valid usage of script tags.
     * 
     * @throws Exception
     */
    public void testValidScriptInTemplate() throws Exception {
        // Script tags inline in a template markup
        DefDescriptor<ComponentDef> scriptTagInBodyOfTemplate = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", SCRIPT_INCLUDE));
        scriptTagInBodyOfTemplate.getDef();
    }

    public void testValidScriptInTemplateAsAttribute() throws Exception {
        // Script tags as attribute value of parent template
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true' extensible='true'",
                        "<aura:attribute name='scriptTags' type='Aura.Component[]'/>"));
        DefDescriptor<ComponentDef> scriptTagInAuraSet = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("isTemplate='true' extends='%s:%s'", parent.getNamespace(), parent.getName()),
                        String.format("<aura:set attribute='scriptTags'>%s</aura:set>", SCRIPT_INCLUDE)));
        scriptTagInAuraSet.getDef();
    }

    public void testValidScriptInApplication() throws Exception {
        // Script tags inline in a application markup
        DefDescriptor<ApplicationDef> scriptTagInBodyOfApp = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "", SCRIPT_INCLUDE));
        scriptTagInBodyOfApp.getDef();
    }

    /**
     * Invalid usage of script tag in a component (not a template).
     * 
     * @throws Exception
     */
    public void testInvalidScriptTagsInComponent() throws Exception {
        DefDescriptor<ComponentDef> scriptTagInBodyOfComponent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", SCRIPT_INCLUDE));
        try {
            scriptTagInBodyOfComponent.getDef();
            fail("Script tags should not be allowed in components");
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains(SCRIPT_EXCEPT_MESSAGE));
        }
    }

    public void testInvalidScriptInUnprivilegedApplication() throws Exception {
        // Script tags inline in a application markup
        DefDescriptor<ApplicationDef> scriptTagInBodyOfApp = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "", SCRIPT_INCLUDE),
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":thing", false);
        try {
            scriptTagInBodyOfApp.getDef();
            fail("Script tags should not be allowed in unprivileged namespaces");
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains(SCRIPT_EXCEPT_MESSAGE));
        }
    }

    /**
     * Invalid usage of script tag in an unprivileged template.
     * 
     * @throws Exception
     */
    public void testInvalidScriptTagsInUnprivilegedTemplate() throws Exception {
        // Script tags inline in a component markup
        DefDescriptor<ComponentDef> scriptTagInUnprivileged = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "isTemplate='true'", SCRIPT_INCLUDE),
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":thing", false);
        try {
            scriptTagInUnprivileged.getDef();
            fail("Script tags should not be allowed in unprivileged namespaces");
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains(SCRIPT_EXCEPT_MESSAGE));
        }
    }

    /**
     * Invalid usage of script tags.
     * 
     * @throws Exception
     */
    public void testInvalidScriptTagsInUnprivilegedAttribute() throws Exception {
        // Script tags as attribute value of parent component
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "extensible='true' isTemplate='true' ",
                        "<aura:attribute name='scriptTags' type='String'/>"));
        DefDescriptor<ComponentDef> scriptTagInAuraSet = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("extends='%s:%s'", parent.getNamespace(), parent.getName()),
                        String.format("<aura:set attribute='scriptTags'>%s</aura:set>", SCRIPT_INCLUDE)),
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":thing", false);
        try {
            scriptTagInAuraSet.getDef();
            fail("Script tags should not be allowed as attribute value in unprivileged templates");;
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains(SCRIPT_EXCEPT_MESSAGE));
        }
    }

    /**
     * Invalid usage of script tags.
     * 
     * @throws Exception
     */
    public void testInvalidScriptTagsInAttribute() throws Exception {
        // Script tags as attribute value of parent component
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "extensible='true'",
                        "<aura:attribute name='scriptTags' type='String'/>"));
        DefDescriptor<ComponentDef> scriptTagInAuraSet = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("extends='%s:%s'", parent.getNamespace(), parent.getName()),
                        String.format("<aura:set attribute='scriptTags'>%s</aura:set>", SCRIPT_INCLUDE)));
        try {
            scriptTagInAuraSet.getDef();
            fail("Script tags should not be allowed as attribute value in components");;
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains(SCRIPT_EXCEPT_MESSAGE));
        }
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
                        "isTemplate='true' extends='aura:template' model='java://org.auraframework.components.test.java.model.TestModel'",
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
        assertTrue("errorTitle attribute on aura:template has wrong text: "+result,
                result.contains("Looks like there's a problem:"));
        
    }

    /**
     * Verify the new errorTitle attribute, when error message is provided in template.
     */
    public void testCustomErrorTitleAttributeInTemplate() throws Exception {
    	String errorTitle = "<aura:set attribute='errorTitle' value='Looks like theres a problem.'></aura:set>";        
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
                result.contains("Looks like theres a problem."));              
    }
}
