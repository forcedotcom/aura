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
package org.auraframework.http;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.sameInstance;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

/**
 * Unit test for the {@link AuraContextFilter} class.
 *
 * @author eperret (Eric Perret)
 */
@RunWith(MockitoJUnitRunner.class)
public class AuraContextFilterTest {
    
    @Mock
    private HttpServletRequest request;
    @Mock
    private DefinitionService definitionService;
    @Mock
    private LoggingService loggingService;
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when a valid mode parameter is in the request and the {@code allowedModes} is {@code null}.
     */
    @Test
    public void testGetModeParamValidRequestParam() {
        // Arrange
        when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn(Mode.JSTEST.name());
        
        // Act
        final Mode mode = AuraContextFilter.getModeParam(request, null, null);
        
        // Assert
        assertThat("Expected the correct mode from the request", mode, equalTo(Mode.JSTEST));
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when a valid lower case mode parameter is in the request and the {@code allowedModes} is {@code null}.
     */
    @Test
    public void testGetModeParamValidRequestParamLowerCase() {
        // Arrange
        when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn(Mode.JSTEST.name().toLowerCase());
        
        // Act
        final Mode mode = AuraContextFilter.getModeParam(request, null, null);
        
        // Assert
        assertThat("Expected the correct mode from the request", mode, equalTo(Mode.JSTEST));
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when an invalid mode parameter is in the request.
     */
    @Test
    public void testGetModeParamInvalidRequestParam() {
        // Arrange
        when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn("HAX0R");
        
        // Act
        try {
            AuraContextFilter.getModeParam(request, null, null);
            fail("Expected an InvalidParamException");
        } catch(final InvalidParamException ipe) {
            // Assert
            assertThat("Expected a correct exception message", ipe.getMessage(), equalTo("Invalid parameter value for " + AuraContextFilter.mode.name));
        }
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when a valid mode parameter is in the request and the {@code allowedModes} is a
     * {@link java.util.Collection} of values.
     */
    @Test
    public void testGetModeParamValidRequestParam2() {
        // Arrange
        when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn(Mode.JSTEST.name());
        
        // Act
        final Mode mode = AuraContextFilter.getModeParam(request, null, ImmutableSet.of(Mode.DEV, Mode.PROD));
        
        // Assert
        assertThat("Expected the correct mode from the request", mode, equalTo(Mode.JSTEST));
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when the mode param is not in the request and the config map in null.
     */
    @Test
    public void testGetModeParamNoRequestParamAndNoConfigMap() {
        // Arrange
        
        // Act
        final Mode mode = AuraContextFilter.getModeParam(request, null, ImmutableSet.of(Mode.DEV, Mode.PROD));
        
        // Assert
        assertThat("Expected the mode to be null", mode, nullValue());
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when the mode param is not in the request and the config map does not contain a mode value.
     */
    @Test
    public void testGetModeParamNoRequestParamAndConfigMapWithoutMode() {
        // Arrange
        
        // Act
        final Mode mode = AuraContextFilter.getModeParam(request, ImmutableMap.of("foo", "bar"), ImmutableSet.of(Mode.DEV, Mode.PROD));
        
        // Assert
        assertThat("Expected the mode to be null", mode, nullValue());
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when the mode param is not in the request and the config map does contain a valid mode value.
     */
    @Test
    public void testGetModeParamNoRequestParamAndConfigMapWithMode() {
        // Arrange
        
        // Act
        final Mode mode = AuraContextFilter.getModeParam(request, ImmutableMap.of("mode", Mode.JSTEST.name()), ImmutableSet.of(Mode.DEV, Mode.PROD));
        
        // Assert
        assertThat("Expected a valid mode", mode, equalTo(Mode.JSTEST));
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when the mode param is not in the request and the config map does contain an invalid mode value.
     */
    @Test
    public void testGetModeParamNoRequestParamAndConfigMapWithInvalidMode() {
        // Arrange
        
        // Act
        try {
            AuraContextFilter.getModeParam(request, ImmutableMap.of("mode", "HAX0R"), ImmutableSet.of(Mode.DEV, Mode.PROD));
            fail("Expected an InvalidParamException.");
        } catch(final InvalidParamException ipe) {
            // Assert
            assertThat("Expected a correct exception message", ipe.getMessage(), equalTo("Invalid parameter value for aura.context -> mode. Allowed values are [DEV, PROD]"));
        }
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map} method when a valid app
     * parameter is in the request.
     */
    @Test
    public void testGetAppParamValidRequestParam() {
        // Arrange
        when(request.getParameter(eq(AuraServlet.AURA_PREFIX + "app"))).thenReturn("test:test.app");
        final DefDescriptor<Definition> appDefDescriptor = mock(DefDescriptor.class);
        when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.any())).thenReturn(appDefDescriptor);
        
        final AuraContextFilter auraContextFilter = new AuraContextFilter();
        auraContextFilter.setDefinitionService(definitionService);
        
        // Act
        final DefDescriptor<? extends BaseComponentDef> app = auraContextFilter.getAppParam(request, null);
        
        // Assert
        assertThat("Expected the correct mode from the request", app, sameInstance(appDefDescriptor));
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map} method when an invalid app
     * parameter is in the request.
     */
    @Test
    public void testGetAppParamInvalidRequestParam() {
        // Arrange
        final String appParameterValue = "test://////test/////.app";
        when(request.getParameter(eq(AuraServlet.AURA_PREFIX + "app"))).thenReturn(appParameterValue);
        final AuraRuntimeException cause = new AuraRuntimeException("Invalid Value");
        when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.any())).thenThrow(cause);
        
        final AuraContextFilter auraContextFilter = new AuraContextFilter();
        auraContextFilter.setDefinitionService(definitionService);
        auraContextFilter.setLoggingService(loggingService);
        
        // Act
        try {
            auraContextFilter.getAppParam(request, null);
            fail("Expected an InvalidParamException");
        } catch (final InvalidParamException are) {
            // Assert
            assertThat("Expected a valid message from the exception", are, hasProperty("message", equalTo("Invalid parameter value for aura.app")));
            assertThat("Expected an IllegalStateException with the correct message", are, hasProperty("cause", sameInstance(cause)));
        }
        
        Mockito.verify(definitionService, Mockito.only()).getDefDescriptor(Matchers.eq(appParameterValue), Matchers.eq(ApplicationDef.class));
        Mockito.verify(loggingService, Mockito.only()).warn(Matchers.eq("Invalid parameter value for aura.app"), Matchers.same(cause));
    }

    /**
     * Test for the
     * {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map)} method when the mode param is
     * not in the request and the config map in null.
     */
    @Test
    public void testGetAppParamNoRequestParamAndNoConfigMap() {
        // Arrange
        
        // Act
        final DefDescriptor<? extends BaseComponentDef> app = new AuraContextFilter().getAppParam(request, null);
        
        // Assert
        assertThat("Expected the app to be null", app, nullValue());
    }
    
    /**
     * Test for the {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map} method when a
     * valid app parameter is in the request.
     */
    @Test
    public void testGetAppParamNoRequestParamAndConfigMapWithApp() {
        // Arrange
        final String appValue = "aura://test:test.app";
        final DefDescriptor<Definition> appDefDescriptor = mock(DefDescriptor.class);
        when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.any())).thenReturn(appDefDescriptor);
        
        final AuraContextFilter auraContextFilter = new AuraContextFilter();
        auraContextFilter.setDefinitionService(definitionService);
        
        // Act
        final DefDescriptor<? extends BaseComponentDef> app = auraContextFilter.getAppParam(request, ImmutableMap.of("app", appValue));
        
        // Assert
        assertThat("Expected the correct mode from the request", app, sameInstance(appDefDescriptor));
        Mockito.verify(definitionService, Mockito.only()).getDefDescriptor(Matchers.eq(appValue), Matchers.eq(ApplicationDef.class));
    }
    
    /**
     * Test for the {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map} method when a
     * valid cmp parameter is in the request.
     */
    @Test
    public void testGetAppParamNoRequestParamAndConfigMapWithCmp() {
        // Arrange
        final String cmpValue = "aura://test:test.cmp";
        final DefDescriptor<Definition> appDefDescriptor = mock(DefDescriptor.class);
        when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.any())).thenReturn(appDefDescriptor);
        
        final AuraContextFilter auraContextFilter = new AuraContextFilter();
        auraContextFilter.setDefinitionService(definitionService);
        
        // Act
        final DefDescriptor<? extends BaseComponentDef> cmp = auraContextFilter.getAppParam(request, ImmutableMap.of("cmp", cmpValue));
        
        // Assert
        assertThat("Expected the correct mode from the request", cmp, sameInstance(appDefDescriptor));
        Mockito.verify(definitionService, Mockito.only()).getDefDescriptor(Matchers.eq(cmpValue), Matchers.eq(ComponentDef.class));
    }
    
    /**
     * Test for the {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map)} method when the
     * app param is not in the request and the config map does contain an invalid app value.
     */
    @Test
    public void testGetAppParamNoRequestParamAndConfigMapWithInvalidApp() {
        // Arrange
        final String appParameterValue = "test://////test/////.app";
        final AuraRuntimeException cause = new AuraRuntimeException("Invalid Value");
        when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.any())).thenThrow(cause);
        
        final AuraContextFilter auraContextFilter = new AuraContextFilter();
        auraContextFilter.setDefinitionService(definitionService);
        auraContextFilter.setLoggingService(loggingService);
        
        // Act
        try {
            auraContextFilter.getAppParam(request, ImmutableMap.of("app", appParameterValue));
            fail("Expected an InvalidParamException");
        } catch (final InvalidParamException are) {
            // Assert
            assertThat("Expected a valid message from the exception", are, hasProperty("message", equalTo("Invalid parameter value for aura.app")));
            assertThat("Expected an IllegalStateException with the correct message", are, hasProperty("cause", sameInstance(cause)));
        }
        
        Mockito.verify(definitionService, Mockito.only()).getDefDescriptor(Matchers.eq(appParameterValue), Matchers.eq(ApplicationDef.class));
        Mockito.verify(loggingService, Mockito.only()).warn(Matchers.eq("Invalid parameter value for aura.app"), Matchers.same(cause));
    }
    
    /**
     * Test for the {@link AuraContextFilter#getAppParam(HttpServletRequest, java.util.Map)} method when the
     * app param is not in the request and the config map does contain an invalid cmp value.
     */
    @Test
    public void testGetAppParamNoRequestParamAndConfigMapWithInvalidCmp() {
        // Arrange
        final String cmpValue = "test://////test/////.cmp";
        final AuraRuntimeException cause = new AuraRuntimeException("Invalid Value");
        when(definitionService.getDefDescriptor(Matchers.anyString(), Matchers.any())).thenThrow(cause);
        
        final AuraContextFilter auraContextFilter = new AuraContextFilter();
        auraContextFilter.setDefinitionService(definitionService);
        auraContextFilter.setLoggingService(loggingService);
        
        // Act
        try {
            auraContextFilter.getAppParam(request, ImmutableMap.of("cmp", cmpValue));
            fail("Expected an InvalidParamException");
        } catch (final InvalidParamException are) {
            // Assert
            assertThat("Expected a valid message from the exception", are, hasProperty("message", equalTo("Invalid parameter value for aura.context -> cmp")));
            assertThat("Expected an IllegalStateException with the correct message", are, hasProperty("cause", sameInstance(cause)));
        }
        
        Mockito.verify(definitionService, Mockito.only()).getDefDescriptor(Matchers.eq(cmpValue), Matchers.eq(ComponentDef.class));
        Mockito.verify(loggingService, Mockito.only()).warn(Matchers.eq("Invalid parameter value for aura.context -> cmp"), Matchers.same(cause));
    }
}