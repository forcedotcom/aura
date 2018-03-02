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
import static org.mockito.Mockito.mock;

import java.util.Arrays;
import java.util.Locale;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.InlineJs;
import org.auraframework.http.resource.LocaleDataJsAppender;
import org.auraframework.http.resource.PreInitJavascriptJSAppender;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.google.common.collect.ImmutableList;

public class InlineJsTest extends AuraImplTestCase {

    public static final String IE11_WINDOWS_8_UA = "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko";
    public static final String CHROME58_MAC10_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";

    @Inject
    private ContextService contextService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private RenderingService renderingService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private ServletUtilAdapter servletUtilAdapter;

    @Inject
    private ServerService serverService;

    @Inject
    private ExceptionAdapter exceptionAdapter;

    @Inject
    private PreInitJavascriptJSAppender preInitJavascriptJSAppender;

    @Inject
    private LocaleDataJsAppender localeDataJsAppender;

    public InlineJsTest() {
        setShouldSetupContext(false);
    }

    private InlineJs getInlineJs() {
        InlineJs inlineJs = new InlineJs();
        inlineJs.setServletUtilAdapter(servletUtilAdapter);
        inlineJs.setConfigAdapter(configAdapter);
        inlineJs.setDefinitionService(definitionService);
        inlineJs.setInstanceService(instanceService);
        inlineJs.setContextService(contextService);
        inlineJs.setServerService(serverService);
        inlineJs.setRenderingService(renderingService);
        inlineJs.setExceptionAdapter(exceptionAdapter);
        inlineJs.setInlineJSAppenders(ImmutableList.of(localeDataJsAppender, preInitJavascriptJSAppender));
        inlineJs.initManifest();
        return inlineJs;
    }

    @Test
    public void testInlineScriptIsWrittenIntoInlineJs() throws Exception {
        // Arrange

        String script = "var foo = null;";
        String templateMarkup = String.format(baseComponentTag, "isTemplate='true'", String.format("<script>%s</script>", script));
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);
        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setRequestedLocales(Arrays.asList(Locale.US));

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        mockRequest.addParameter("jwt", configAdapter.generateJwtToken());
        mockRequest.addHeader(HttpHeaders.USER_AGENT, CHROME58_MAC10_UA);
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());

        InlineJs inlineJs = getInlineJs();

        // Act
        inlineJs.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        assertEquals("Didn't find expected inline scripts in response content.", script, content.trim());
    }

    @Test
    public void testMultipleInlineScriptOnSameTemplate() throws Exception {
        // Arrange

        String script = "var foo = null;";
        String templateMarkup = String.format(baseComponentTag, "isTemplate='true'", String.format("<script>%s</script><script>%s</script>", script, script));
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);
        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        // momentJs locale data is written into inline if locale is not en_US
        context.setRequestedLocales(Arrays.asList(Locale.US));

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        mockRequest.addParameter("jwt", configAdapter.generateJwtToken());
        mockRequest.addHeader(HttpHeaders.USER_AGENT, CHROME58_MAC10_UA);
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());

        InlineJs inlineJs = getInlineJs();

        // Act
        inlineJs.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        String expected = script + script;
        String actual = content.trim();
        assertEquals("Didn't find expected inline scripts in response content.", expected, actual);
    }

    @Test
    public void testMultipleInlineScriptOnTemplateInheritance() throws Exception {
        // Arrange

        String script = "var foo = null;";
        String baseCmpTagAttributes = "isTemplate='true' extensible='true'";
        String baseTemplateMarkup = String.format(baseComponentTag, baseCmpTagAttributes, String.format("<script>%s</script>{!v.body}", script));
        DefDescriptor<ComponentDef> baseTemplateDesc = addSourceAutoCleanup(ComponentDef.class, baseTemplateMarkup);

        String cmpTagAttributes = String.format("isTemplate='true' extends='%s'", baseTemplateDesc.getDescriptorName());
        String templateMarkup = String.format(baseComponentTag, cmpTagAttributes, String.format("<script>%s</script>", script));
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);

        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setRequestedLocales(Arrays.asList(Locale.US));

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        mockRequest.addParameter("jwt", configAdapter.generateJwtToken());
        mockRequest.addHeader(HttpHeaders.USER_AGENT, CHROME58_MAC10_UA);
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());

        InlineJs inlineJs = getInlineJs();

        // Act
        inlineJs.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        String expected = script + script;
        String actual = content.trim();
        assertEquals("Didn't find expected inline scripts in response content.", expected, actual);
    }

    /**
     * Verify all content in script tag in aura:template is written into inlineJs.
     *
     * TODO: go over inline JS in aura:template and split the test into specific small cases.
     */
    public void testInlineScriptInAuraTemplate() throws Exception {
        // Arrange

        String appMarkup = String.format(baseApplicationTag, "template='aura:template'", "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        mockRequest.addParameter("jwt", configAdapter.generateJwtToken());
        mockRequest.addHeader(HttpHeaders.USER_AGENT, CHROME58_MAC10_UA);
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        InlineJs inlineJs = getInlineJs();

        // Act
        inlineJs.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        this.goldFileText(content);
    }

    @Test
    public void testInlineScriptInTemplateWhichExtendsAuraTemplate() throws Exception {
        // Arrange

        String script = "var foo = null;";
        String cmpTagAttributes = String.format("isTemplate='true' extends='aura:template'");
        String templateMarkup = String.format(baseComponentTag, cmpTagAttributes, String.format("<script>%s</script>", script));
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);
        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(
                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        mockRequest.addParameter("jwt", configAdapter.generateJwtToken());
        mockRequest.addHeader(HttpHeaders.USER_AGENT, CHROME58_MAC10_UA);
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());

        InlineJs inlineJs = getInlineJs();

        // Act
        inlineJs.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        assertThat("Didn't find expected inline scripts in response content.", content, containsString(script));
    }

    @Test
    public void testResponseWith404WhenTokenValidationFails() throws Exception {
        // Arrange
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application></aura:application>");
        AuraContext context = contextService.startContext(AuraContext.Mode.PROD, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());
        HttpServletRequest request = mock(HttpServletRequest.class);
        MockHttpServletResponse response = new MockHttpServletResponse();

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);

        InlineJs inlineJs = getInlineJs();
        inlineJs.setConfigAdapter(configAdapter);

        // Force token validation to fail
        Mockito.when(configAdapter.validateBootstrap(Matchers.anyString())).thenReturn(false);

        // Act
        inlineJs.write(request, response, context);

        // Assert
        // JWT token failure returns 404 response code
        assertEquals(HttpStatus.SC_NOT_FOUND, response.getStatus());
    }

//    @Test
//    public void testPolyfillsForIE11() throws Exception {
//        // Arrange
//
//        String templateMarkup = String.format(baseComponentTag, "isTemplate='true'", "");
//        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(ComponentDef.class, templateMarkup);
//        String appTagAttributes = String.format("template='%s'", templateDesc.getDescriptorName());
//        String appMarkup = String.format(baseApplicationTag, appTagAttributes, "");
//        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);
//
//        AuraContext context = contextService.startContext(
//                AuraContext.Mode.DEV, AuraContext.Format.JS, AuraContext.Authentication.AUTHENTICATED, appDesc);
//        context.setRequestedLocales(Arrays.asList(Locale.US));
//
//        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
//        mockRequest.addParameter("jwt", configAdapter.generateJwtToken());
//        mockRequest.addHeader(HttpHeaders.USER_AGENT, IE11_WINDOWS_8_UA);
//        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
//        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());
//
//        InlineJs inlineJs = getInlineJs();
//
//        // Act
//        inlineJs.write(mockRequest, mockResponse, context);
//        String content = mockResponse.getContentAsString();
//
//        // Assert
//        assertTrue("polyfill source not found in response", content.contains("CustomEvent"));
//    }
}
