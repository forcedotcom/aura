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
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.Bootstrap;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.util.json.JsonReader;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletResponse;

public class BootstrapTest extends AuraImplTestCase {

    ContextService contextService = Aura.getContextService();

    @SuppressWarnings("unchecked")
    @Test
    public void testWriteSetsOkResponseWithErrorPayloadWhenTokenValidationFails() throws Exception {
        // Arrange
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application></aura:application>");
        AuraContext context = contextService.startContext(AuraContext.Mode.PROD, AuraContext.Format.MANIFEST,
                AuraContext.Authentication.AUTHENTICATED, appDesc);

        HttpServletRequest request = mock(HttpServletRequest.class);
        MockHttpServletResponse response = new MockHttpServletResponse();

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);

        Bootstrap bootstrap = new Bootstrap();
        bootstrap.setConfigAdapter(configAdapter);

        // Force token validation to fail
        when(configAdapter.validateBootstrap(anyString())).thenReturn(false);

        // Act
        bootstrap.write(request, response, context);

        // Assert
        // JWT token failure returns 2xx response code with error payload so browser executes it
        assertEquals(HttpStatus.SC_OK, response.getStatus());

        /*
         * Expected appBootstrap object
         * window.Aura.appBootstrap = {
         *     "error":{
         *          "message":"Invalid jwt parameter"
         *     }
         * };
         */
        String content = response.getContentAsString();
        Pattern pattern = Pattern.compile("appBootstrap = (\\{.*\\});", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(content);
        assertTrue("Failed to find appBootstrap in response: " + content, matcher.find());

        Map<String, Object> appBootstrap = (Map<String, Object>) new JsonReader().read(matcher.group(1));
        Map<String, Object> error = (Map<String, Object>)appBootstrap.get("error");

        String actualMessage = error.get("message").toString();
        // refer to the message in Bootstrap.write()
        String expectedMessage = "Invalid jwt parameter";
        assertThat("Failed to find expected message: " + content, actualMessage, containsString(expectedMessage));
    }

}
