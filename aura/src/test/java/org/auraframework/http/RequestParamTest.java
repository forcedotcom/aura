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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.auraframework.http.RequestParam.InvalidParamException;
import org.auraframework.system.AuraContext.Mode;
import org.junit.Test;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

/**
 * Test class for {@link InvalidParamException}.
 *
 * @author eperret (Eric Perret)
 */
public class RequestParamTest {

    /**
     * Test method for
     * {@link InvalidParamException#InvalidParamException(java.lang.String, java.util.Collection)}.
     */
    @SuppressWarnings("static-method")
    @Test
    public final void testInvalidParamExceptionStringCollectionOfQ() {
        // Arrange
        
        // Act
        final InvalidParamException ipe = new InvalidParamException("aura.ora", ImmutableSet.of(Mode.DEV, Mode.PROD));
        
        // Assert
        assertEquals("Expected a valid message form the exception", "Invalid parameter value for aura.ora. Allowed values are [DEV, PROD]", ipe.getMessage());
    }
    
    /**
     * Test method for
     * {@link InvalidParamException#InvalidParamException(java.lang.String, java.util.Collection)} with an
     * empty {@link Collection} of supported values.
     */
    @SuppressWarnings("static-method")
    @Test
    public final void testInvalidParamExceptionStringEmptyCollectionOfQ() {
        // Arrange
        
        // Act
        final InvalidParamException ipe = new InvalidParamException("aura.ora", ImmutableSet.of());
        
        // Assert
        assertEquals("Expected a valid message form the exception", "Invalid parameter value for aura.ora", ipe.getMessage());
    }

    /**
     * Test method for
     * {@link InvalidParamException#InvalidParamException(java.lang.String)}.
     */
    @SuppressWarnings("static-method")
    @Test
    public final void testInvalidParamExceptionString() {
        // Arrange
        
        // Act
        final InvalidParamException ipe = new InvalidParamException("aura.ora");
        
        // Assert
        assertEquals("Expected a valid message form the exception", "Invalid parameter value for aura.ora", ipe.getMessage());
    }
}