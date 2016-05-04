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
package org.auraframework.integration.test.http.resource;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertThat;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.TemplateHtml;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.adapter.ServletUtilAdapterImpl;
import org.auraframework.impl.clientlibrary.ClientLibraryServiceImpl;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

public class TemplateHtmlTest extends AuraImplTestCase {

    ContextService contextService = Aura.getContextService();

    @Test
    public void testHtmlMarkupInTemplateIsWrittenIntoTemplateHtml() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        String htmlMarkup = "<div>test</div>";
        String templateMarkup = String.format(baseComponentTag, "isTemplate='true'", htmlMarkup);
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);
        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        TemplateHtml templateHtml = new TemplateHtml();
        templateHtml.setServletUtilAdapter(new MockServletUtilAdapterImpl());

        // Act
        templateHtml.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        assertEquals("Didn't find expceted html markup in response content: " + content, htmlMarkup, content.trim());
    }

    @Test
    public void testHtmlMarkupOnTemplateInheritance() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        String htmlMarkup = "<div>test</div>";
        String baseCmpTagAttributes = "isTemplate='true' extensible='true'";
        String baseTemplateMarkup = String.format(baseComponentTag, baseCmpTagAttributes, htmlMarkup + "{!v.body}");
        DefDescriptor<ComponentDef> baseTemplateDesc = addSourceAutoCleanup(ComponentDef.class, baseTemplateMarkup);

        String cmpTagAttributes = String.format("isTemplate='true' extends='%s'", baseTemplateDesc.getDescriptorName());
        String templateMarkup = String.format(baseComponentTag, cmpTagAttributes, htmlMarkup);
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);

        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        TemplateHtml templateHtml = new TemplateHtml();
        templateHtml.setServletUtilAdapter(new MockServletUtilAdapterImpl());

        // Act
        templateHtml.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        String expected = htmlMarkup + htmlMarkup;
        String actual = content.trim();
        assertEquals("Didn't find expected html markups in response content: " + content, expected, actual);
    }

    /**
     * Verify all HTML content (except script tag) in aura:template is written into templateHTML.
     *
     * TODO: go over html tags aura:template and split the test into specific small cases.
     */
    public void testHtmlInAuraTemplate() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        String appMarkup = String.format(baseApplicationTag, "template='aura:template'", "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        TemplateHtml templateHtml = new TemplateHtml();
        templateHtml.setServletUtilAdapter(new MockServletUtilAdapterImpl());

        // Act
        templateHtml.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        this.goldFileText(content);
    }

    @Test
    public void testTemplateHtmlWithExtendedAuraTemplate() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        String htmlMarkup = "<div>test</div>";
        String cmpTagAttributes = String.format("isTemplate='true' extends='aura:template'");
        String templateMarkup = String.format(baseComponentTag, cmpTagAttributes, htmlMarkup);
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);
        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        TemplateHtml templateHtml = new TemplateHtml();
        templateHtml.setServletUtilAdapter(new MockServletUtilAdapterImpl());

        // Act
        templateHtml.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        assertThat("Didn't find expceted html mark in response content.", content, containsString(htmlMarkup));
    }

    private static class MockServletUtilAdapterImpl extends ServletUtilAdapterImpl {
        public MockServletUtilAdapterImpl() {
            setClientLibraryService(new ClientLibraryServiceImpl());
        }

        @Override
        public void handleServletException(Throwable t, boolean quickfix, AuraContext context,
                HttpServletRequest request, HttpServletResponse response,
                boolean written) {
            throw new RuntimeException(t);
        }
    }
}
