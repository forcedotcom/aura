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
package org.auraframework.impl.http.resource;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static org.hamcrest.Matchers.*;
import static org.hamcrest.Matchers.hasEntry;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyZeroInteractions;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Map;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ExpressionBuilder;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.expression.PropertyReference;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.Component;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.Location;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.runners.MockitoJUnitRunner;
import org.mockito.stubbing.Answer;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

/**
 * Simple (non-integration) test case for {@link Manifest}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
@RunWith(MockitoJUnitRunner.class)
public class ManifestUnitTest {
    
    @Mock
    RenderingService renderingService;
    
    @Mock
    CSPInliningService cspInliningService;
    
    @Mock
    ExpressionBuilder expressionBuilder;
    
    @Mock
    ExceptionAdapter exceptionAdapter;
    
    Manifest manifest;
    
    @Before
    public void setup() {
        // This way you can see any exception which occur during the run of this test.
        doAnswer(new Answer<Throwable>() {

            @Override
            public Throwable answer(final InvocationOnMock invocation) throws Throwable {
                throw invocation.getArgumentAt(0, Throwable.class);
            }
            
        }).when(exceptionAdapter).handleException(Matchers.any(Throwable.class));
        
        manifest = new Manifest(renderingService, cspInliningService, expressionBuilder);
        manifest.setExceptionAdapter(exceptionAdapter);
    }

    /**
     * Name is API!.
     */
    @Test
    public void testName() {
        Assert.assertEquals("app.manifest", manifest.getName());
        verifyZeroInteractions(renderingService, cspInliningService, expressionBuilder);
    }

    /**
     * Format is API!.
     */
    @Test
    public void testFormat() {
        Assert.assertEquals(Format.MANIFEST, manifest.getFormat());
        verifyZeroInteractions(renderingService, cspInliningService, expressionBuilder);
    }

    private static Enumeration<String> getEmptyStringEnumeration() {
        Vector<String> vector = new Vector<>();
        return vector.elements();
    }

    /**
     * Test for manifest disabled.
     */
    @Test
    public void testManifestDisallowed() throws Exception {
        ManifestUtil manifestUtil = mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);

        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpServletRequest request = mock(HttpServletRequest.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        doReturn(FALSE).when(manifestUtil).isManifestEnabled();
        doReturn(getEmptyStringEnumeration()).when(request).getParameterNames();

        manifest.write(request, response, null);

        // This is mocked.
        verify(manifestUtil).isManifestEnabled();

        //
        // These are the real verifications. It should not be cached, and it should be marked
        // as 'Not Found'
        //
        verify(servletUtilAdapter).setNoCache(response);
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);


        verifyNoMoreInteractions(servletUtilAdapter, response, manifestUtil);
        verifyZeroInteractions(renderingService, cspInliningService, expressionBuilder);
    }

    /**
     * Test for manifest enabled, but failing cookie check.
     */
    @Test
    public void testManifestCookieCheck() throws Exception {
        ManifestUtil manifestUtil = mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);

        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpServletRequest request = mock(HttpServletRequest.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        doReturn(TRUE).when(manifestUtil).isManifestEnabled();
        doReturn(FALSE).when(manifestUtil).checkManifestCookie(request, response);
        doReturn(getEmptyStringEnumeration()).when(request).getParameterNames();

        manifest.write(request, response, null);

        // This is mocked.
        verify(manifestUtil).isManifestEnabled();
        verify(manifestUtil).checkManifestCookie(request, response);

        //
        // These are the real verifications. It should not be cached checkManifestCookie sets the response
        // code, but that is not checked here.
        //
        verify(servletUtilAdapter).setNoCache(response);

        verifyNoMoreInteractions(servletUtilAdapter, response, manifestUtil);
        verifyZeroInteractions(renderingService, cspInliningService, expressionBuilder);
    }

    /**
     * Test for manifest enabled, but failing cookie check.
     */
    @Test
    public void testNoDescriptor() throws Exception {
        ManifestUtil manifestUtil = mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);

        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        AuraContext context = mock(AuraContext.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        doReturn(TRUE).when(manifestUtil).isManifestEnabled();
        doReturn(TRUE).when(manifestUtil).checkManifestCookie(request, response);
        doReturn(getEmptyStringEnumeration()).when(request).getParameterNames();

        manifest.write(request, response, context);

        // This is mocked.
        verify(manifestUtil).isManifestEnabled();
        verify(manifestUtil).checkManifestCookie(request, response);
        verify(context).getApplicationDescriptor();

        //
        // These are the real verifications. It should not be cached, and should return Not Found
        //
        verify(servletUtilAdapter).setNoCache(response);
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);

        verifyNoMoreInteractions(servletUtilAdapter, response, manifestUtil);
        verifyZeroInteractions(renderingService, cspInliningService, expressionBuilder);
    }

    /**
     * Verify that we set the correct contentType to response
     */
    @Test
    public void testSetContentType() {
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        
        manifest.setServletUtilAdapter(servletUtilAdapter);
        doReturn("text/cache-manifest").when(servletUtilAdapter).getContentType(AuraContext.Format.MANIFEST);
        HttpServletResponse response = new MockHttpServletResponse() {
            String contentType = "defaultType";

            @Override
            public String getContentType() {
                return this.contentType;
            }

            @Override
            public void setContentType(String contentType) {
                this.contentType = contentType;
            }
        };

        manifest.setContentType(response);

        Assert.assertEquals("text/cache-manifest", response.getContentType());
        verifyZeroInteractions(renderingService, cspInliningService, expressionBuilder);
    }
    
    /**
     * Tests the {@code Manifest#write(HttpServletRequest, HttpServletResponse, AuraContext)} method.
     *
     * @throws IOException Can be thrown by the class under test.
     * @throws QuickFixException 
     * @throws ClientOutOfSyncException 
     */
    @Test
    @SuppressWarnings("unchecked")
    public void testWrite() throws IOException, ClientOutOfSyncException, QuickFixException {
        
        final String uid = "09F911029D74E35BD84156C5635688C0";
        final String nonce = "nonce";
        final String javaWebToken = "javaWebToken";
        final String unwrapedAdditionalAppCacheUrls = "additionalAppCacheUrls";
        final String additionalAppCacheUrls = "{!" + unwrapedAdditionalAppCacheUrls + "}";
        final String propertyReferenceString = "toString";
        
        final Map<String, Object> exectedAttributes = ImmutableMap.of(
            Manifest.LAST_MOD, "app=" + uid + ", FW=" + nonce,
            Manifest.UID, uid,
            Manifest.RESOURCE_URLS,
                "# CONTEXT TOKEN: XBjvcncVZLf0PEl9xQeuqw\n" +
                "# APP INITIALIZER TOKEN: JxvLCuWgnblsg0h20MGo0g\n" +
                "https://www.example.com/restcss\n" +
                "style1\n" +
                "style2\n" +
                "style3\n" +
                "script1\n" +
                "script2\n" +
                "script3\n" +
                "https://www.example.com/inlinejs\n" +
                "https://www.example.com/additional1\n" +
                "https://www.example.com/additional2\n" +
                "https://www.example.com/additional3\n" +
                "# bootstrap token: " + javaWebToken + '\n',
            Manifest.FALLBACK_URLS,
                "https://www.example.com/frameworkfallback1\n" +
                "https://www.example.com/frameworkfallback2\n" +
                "https://www.example.com/frameworkfallback3\n"
        );
        
        final DefDescriptor<? extends BaseComponentDef> appDefDesc = mock(DefDescriptor.class);
        doReturn(DefType.APPLICATION).when(appDefDesc).getDefType();
        
        final ActionDef actionDef = mock(ActionDef.class);
        
        final ApplicationDef appDef = mock(ApplicationDef.class);
        doReturn(additionalAppCacheUrls).when(appDef).getAdditionalAppCacheURLs();
        doReturn(actionDef).when(appDef).getServerActionByName(Matchers.anyString());
        
        final DefDescriptor<ComponentDef> tmplDesc = mock(DefDescriptor.class);
        
        final DefinitionService definitionService = mock(DefinitionService.class);
        doReturn(uid).when(definitionService).getUid(Matchers.anyString(), Matchers.any(DefDescriptor.class));
        doReturn(appDef).when(definitionService).getDefinition(Matchers.any(DefDescriptor.class));
        doReturn(tmplDesc).when(definitionService).getDefDescriptor(Matchers.anyString(), Matchers.any(Class.class));
        
        final Action nextAction = mock(Action.class);
        doReturn(ImmutableList.of("https://www.example.com/additional1", "https://www.example.com/additional2", "https://www.example.com/additional3")).when(nextAction).getReturnValue();
        
        final Action prevAction = mock(Action.class);
        
        final AuraContext context = mock(AuraContext.class);
        doReturn(appDefDesc).when(context).getApplicationDescriptor();
        doReturn(prevAction).when(context).setCurrentAction(nextAction);
        
        final HttpServletResponse servletResponse = new MockHttpServletResponse();
        final HttpServletRequest  servletRequest  = new MockHttpServletRequest();
        
        final ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        doReturn(ImmutableList.of("style1" , "style2" , "style3")).when(servletUtilAdapter).getStyles(Matchers.any(AuraContext.class));
        doReturn(ImmutableList.of("script1", "script2", "script3")).when(servletUtilAdapter).getScripts(Matchers.any(AuraContext.class), Matchers.anyBoolean(), Matchers.anyBoolean(), Matchers.anyMap());
        doReturn("https://www.example.com/inlinejs").when(servletUtilAdapter).getInlineJsUrl(Matchers.any(AuraContext.class), Matchers.anyMap());
        doReturn(ImmutableList.of("https://www.example.com/frameworkfallback1", "https://www.example.com/frameworkfallback2", "https://www.example.com/frameworkfallback3")).when(servletUtilAdapter).getFrameworkFallbackScripts(Matchers.any(AuraContext.class), Matchers.anyBoolean(), Matchers.anyMap());
        
        final ManifestUtil manifestUtil = mock(ManifestUtil.class);
        doReturn(TRUE).when(manifestUtil).isManifestEnabled();
        doReturn(TRUE).when(manifestUtil).checkManifestCookie(servletRequest, servletResponse);
        
        final ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        doReturn(nonce).when(configAdapter).getAuraFrameworkNonce();
        doReturn(TRUE).when(configAdapter).isBootstrapInliningEnabled();
        doReturn(TRUE).when(configAdapter).isBootstrapModelExclusionEnabled();
        doReturn("https://www.example.com/restcss").when(configAdapter).getResetCssURL();
        doReturn(javaWebToken).when(configAdapter).generateJwtToken();
        
        final ServerService serverService = mock(ServerService.class);
        doReturn("context").when(serverService).serializeContext(Matchers.any(AuraContext.class));
        doReturn("initializers").when(serverService).serializeInitializers(Matchers.any(AuraContext.class));
        
        doReturn(CSPInliningService.InlineScriptMode.UNSUPPORTED).when(cspInliningService).getInlineMode();
        
        final PropertyReference properyExpression = mock(PropertyReference.class);
        doReturn(properyExpression).when(properyExpression).getStem();
        doReturn(propertyReferenceString).when(properyExpression).toString();
        
        doReturn(properyExpression).when(expressionBuilder).buildExpression(Matchers.anyString(), Matchers.any(Location.class));
        
        final Component tmpl = mock(Component.class);
        
        final InstanceService instanceService = mock(InstanceService.class);
        doReturn(nextAction).when(instanceService).getInstance(Matchers.any(ActionDef.class));
        doAnswer(new Answer<Component>() {

            @Override
            public Component answer(final InvocationOnMock invocation) {
                final Map<String, Object> params = invocation.getArgumentAt(1, Map.class);
                
                assertThat(params, equalTo(exectedAttributes));
                return tmpl;
            }
            
        }).when(instanceService).getInstance(Matchers.any(DefDescriptor.class), Matchers.anyMap());
        
        manifest.setServletUtilAdapter(servletUtilAdapter);
        manifest.setManifestUtil(manifestUtil);
        manifest.setDefinitionService(definitionService);
        manifest.setConfigAdapter(configAdapter);
        manifest.setServerService(serverService);
        manifest.setInstanceService(instanceService);
        
        //Run
        manifest.write(servletRequest, servletResponse, context);
        
        //Verify
        verify(servletUtilAdapter).setNoCache(Matchers.same(servletResponse));
        verify(manifestUtil).isManifestEnabled();
        verify(manifestUtil).checkManifestCookie(Matchers.same(servletRequest), Matchers.same(servletResponse));
        verify(definitionService).updateLoaded(Matchers.same(appDefDesc));
        verify(definitionService).getUid(Matchers.isNull(String.class), Matchers.same(appDefDesc));
        verify(definitionService).getDefinition(Matchers.same(appDefDesc));
        verify(definitionService).getDefDescriptor(Matchers.eq("ui:manifest"), Matchers.eq(ComponentDef.class));
        verify(configAdapter).getAuraFrameworkNonce();
        verify(configAdapter).isBootstrapInliningEnabled();
        verify(configAdapter).isBootstrapModelExclusionEnabled();
        verify(configAdapter).getResetCssURL();
        verify(configAdapter).generateJwtToken();
        verify(context, Mockito.times(2)).getApplicationDescriptor();
        verify(context).setFrameworkUID(Matchers.same(nonce));
        verify(context).setCurrentAction(Matchers.same(nextAction));
        verify(context).setCurrentAction(Matchers.same(prevAction));
        verify(serverService).serializeContext(Matchers.same(context));
        verify(serverService).serializeInitializers(Matchers.same(context));
        verify(servletUtilAdapter).getStyles(Matchers.same(context));
        verify(servletUtilAdapter).getScripts(Matchers.same(context), Matchers.eq(true), Matchers.eq(true), Matchers.eq(ImmutableMap.of()));
        verify(servletUtilAdapter).getInlineJsUrl(Matchers.same(context), Matchers.eq(ImmutableMap.of()));
        verify(servletUtilAdapter).getFrameworkFallbackScripts(Matchers.same(context), Matchers.eq(true), Matchers.eq(ImmutableMap.of()));
        verify(cspInliningService).getInlineMode();
        verify(expressionBuilder).buildExpression(Matchers.eq(unwrapedAdditionalAppCacheUrls), Matchers.isNull(Location.class));
        verify(appDef).getServerActionByName(Matchers.same(propertyReferenceString));
        verify(appDef, Mockito.times(2)).getAdditionalAppCacheURLs();
        verify(instanceService).getInstance(Matchers.same(actionDef));
        verify(instanceService).getInstance(Matchers.same(tmplDesc), Matchers.eq(exectedAttributes));
        verify(renderingService).render(Matchers.same(tmpl), Matchers.same(servletResponse.getWriter()));
        verifyNoMoreInteractions(servletUtilAdapter, manifestUtil, context, definitionService, configAdapter, serverService, cspInliningService, expressionBuilder, appDef, instanceService, renderingService);
        verifyZeroInteractions(exceptionAdapter);
    }
}
