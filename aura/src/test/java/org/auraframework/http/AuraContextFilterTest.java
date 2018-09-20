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
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.eq;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.system.AuraContext.Mode;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

/**
 * Unit test for the {@link AuraContextFilter} class.
 *
 * @author eperret (Eric Perret)
 */
public class AuraContextFilterTest {
    
    @Mock
    private HttpServletRequest request;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }
    
    /**
     * Test for the
     * {@link AuraContextFilter#getModeParam(HttpServletRequest, java.util.Map, java.util.Collection)} method
     * when a valid mode parameter is in the request and the {@code allowedModes} is {@code null}.
     */
    @Test
    public void testGetModeParamValidRequestParam() {
        // Arrange
        Mockito.when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn(Mode.JSTEST.name());
        
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
        Mockito.when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn(Mode.JSTEST.name().toLowerCase());
        
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
        Mockito.when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn("HAX0R");
        
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
        Mockito.when(request.getParameter(eq(AuraContextFilter.mode.name))).thenReturn(Mode.JSTEST.name());
        
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
}