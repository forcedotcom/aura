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
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.startsWith;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.doReturn;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.ManifestUtil;
import org.auraframework.http.resource.Manifest;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

public class ManifestTest extends AuraImplTestCase {

    @Inject
    private ContextService contextService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ExceptionAdapter exceptionAdapter;

    @Inject
    private RenderingService renderingService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private ServletUtilAdapter servletUtilAdapter;

    @Inject
    private ServerService serverService;

    private Manifest getManifest() {
        Manifest manifest = new Manifest();
        manifest.setServletUtilAdapter(servletUtilAdapter);
        manifest.setConfigAdapter(configAdapter);
        manifest.setDefinitionService(definitionService);
        manifest.setInstanceService(instanceService);
        manifest.setContextService(contextService);
        manifest.setServerService(serverService);
        manifest.setRenderingService(renderingService);
        manifest.setExceptionAdapter(exceptionAdapter);
        manifest.setManifestUtil(new ManifestUtil(definitionService, contextService, configAdapter));
        return manifest;
    }

    /**
     * Verify response status is SC_NOT_FOUND when writing manifest throws Exception.
     */
    @Test
    public void testResponseSourceNotFoundWhenWritingManifestThrowsException() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        String appMarkup = String.format(baseApplicationTag, "useAppcache='true'", "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(AuraContext.Mode.PROD,
                AuraContext.Format.MANIFEST, AuraContext.Authentication.AUTHENTICATED, appDesc);

        ConfigAdapter spyConfigAdapter = spy(configAdapter);
        doThrow(new RuntimeException()).when(spyConfigAdapter).getResetCssURL();

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        Manifest manifest = getManifest();
        manifest.setConfigAdapter(spyConfigAdapter);

        // Act
        manifest.write(mockRequest, mockResponse, context);

        // Assert
        int actual = mockResponse.getStatus();
        assertEquals(HttpServletResponse.SC_NOT_FOUND, actual);
    }

    /**
     * Verify manifest doesn't include null when ResetCss is null.
     */
    @Test
    public void testManifestNotIncludeNullResetCssURL() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        String cmpTagAttributes = "isTemplate='true' extends='aura:template'";
        String cmpMarkup = String.format(baseComponentTag, cmpTagAttributes, "<aura:set attribute='auraResetStyle' value=''/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);

        String appAttributes = String.format(" useAppcache='true' template='%s'", cmpDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = contextService.startContext(AuraContext.Mode.PROD,
                AuraContext.Format.MANIFEST, AuraContext.Authentication.AUTHENTICATED, appDesc);
        String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        Manifest manifest = getManifest();

        // Act
        manifest.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        String[] lines = content.split("\n");
        int start = Arrays.asList(lines).indexOf("CACHE:");
        assertTrue("Could not find CACHE part in appcache manifest: " + content, start >= 0);

        for(int i=start + 1; i < lines.length; i++) {
            assertThat("auraResetStyle is empty, so manifest should not contains resetCSS.css",
                    lines[i], not(containsString("resetCSS.css")));
            assertThat(lines[i], not(containsString("null")));
        }
    }

   /**
    * Verify that context path is prepended on all Aura URLs in appcache manifest
    */
    @Test
    public void testManifestContentWithContextPath() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:testApp", ApplicationDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.PROD, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setApplicationDescriptor(appDesc);
        String expectedContextName = "/cool";
        context.setContextPath(expectedContextName);
        String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        Manifest manifest = getManifest();

        // Act
        manifest.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        // find URLs which contain /auraFW/ or /l/
        Pattern pattern = Pattern.compile("(?m)^(.*)(/auraFW|/l/)(.*)$");
        Matcher matcher = pattern.matcher(content);

        assertTrue("Failed to find any Aura URL in manifest:\n" + content, matcher.find());

        String url = matcher.group();
        assertThat("Aura URL in manifest should start with context name.", url, startsWith(expectedContextName));
        while(matcher.find()) {
            url = matcher.group();
            assertThat("Aura URL in manifest should start with context name.", url, startsWith(expectedContextName));
        }
    }

    /**
     * Verify framework UID exists in auraFW URLs in appcache manifest
     */
    @Test
    public void testManifestFwJsUrlContainsFWId() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:testApp", ApplicationDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.PROD,
                AuraContext.Format.MANIFEST, AuraContext.Authentication.AUTHENTICATED, appDesc);
        String uid = definitionService.getUid(null, appDesc);
        context.addLoaded(appDesc, uid);
        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        Manifest manifest = getManifest();

        // Act
        manifest.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        // find UID in manifest file
        Pattern pattern = Pattern.compile("FW=(.*)\n");
        Matcher matcher = pattern.matcher(content);
        assertTrue("Failed to find UID in manifest:\n" + content, matcher.find());

        String fwId = matcher.group(1);
        Pattern urlPattern = Pattern.compile("/auraFW|/l/");
        Matcher urlMatcher = urlPattern.matcher(content);
        assertTrue("Failed to find any Aura URL in manifest:\n" + content, urlMatcher.find());

        String url = matcher.group();
        assertThat("Aura URL in manifest should contain UID.", url, containsString(fwId));
        while(matcher.find()) {
            url = matcher.group();
            assertThat("Aura URL in manifest should contain UID.", url, containsString(fwId));
        }
    }

    @Test
    public void testManifestContainsFallbackScripts() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:testApp", ApplicationDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.PROD, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setApplicationDescriptor(appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        Manifest manifest = getManifest();

        // Act
        manifest.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        // Refer to the order in ServletUtilAdapterImpl.getFrameworkFallbackScripts
        String[] expectedScripts = new String[]{};

        String[] lines = content.split("\n");
        int start = Arrays.asList(lines).indexOf("FALLBACK:");
        assertTrue("Could not find FALLBACK part in appcache manifest: " + content, start >= 0);
        for(int i = 0; i < expectedScripts.length; i++) {
            int index = start + 1 + i;
            assertTrue("Missing expected fallback scripts: " + content, index < lines.length);
            assertThat("Failed to find expected fallback script", lines[index], containsString(expectedScripts[i]));
        }
    }

    @Test
    public void testManifestIncludesClientLibraries() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("appCache:testApp", ApplicationDef.class);
        AuraContext context = contextService.startContext(AuraContext.Mode.PROD, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.AUTHENTICATED, appDesc);
        context.setApplicationDescriptor(appDesc);

        MockHttpServletRequest mockRequest = new MockHttpServletRequest();
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();

        ServletUtilAdapter spyServletUtilAdapter = Mockito.spy(this.servletUtilAdapter);
        String expected = "clientLibraryUrl";
        doReturn(Arrays.asList(expected)).when(spyServletUtilAdapter).getJsClientLibraryUrls(any(AuraContext.class));

        Manifest manifest = getManifest();
        manifest.setServletUtilAdapter(spyServletUtilAdapter);

        // Act
        manifest.write(mockRequest, mockResponse, context);
        String content = mockResponse.getContentAsString();

        // Assert
        assertThat("Failed to find expected client library in manifest file", content, containsString(expected));
    }
}
