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
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.Manifest;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.AuraContext;
import org.mockito.Mockito;

public class ManifestIntegrationTest extends AuraImplTestCase {

    public ManifestIntegrationTest(String name) {
        super(name);
    }

    /**
     * Verify manifest doesn't include null when ResetCss is null.
     */
    public void testManifestNotIncludeNullResetCssURL() throws Exception {
        // Arrange
        if (Aura.getContextService().isEstablished()) {
            Aura.getContextService().endContext();
        }
        String cmpMarkup = String.format(baseComponentTag, "isTemplate='true' extends='aura:template'",
                "<aura:set attribute='auraResetStyle' value=''/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);
        String appAttributes = String.format(" useAppcache='true' template='%s'", cmpDesc.getDescriptorName());
        String appMarkup = String.format(baseApplicationTag, appAttributes, "");
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appMarkup);

        AuraContext context = Aura.getContextService().startContext(AuraContext.Mode.PROD,
                AuraContext.Format.MANIFEST, AuraContext.Authentication.AUTHENTICATED, appDesc);
        String uid = context.getDefRegistry().getUid(null, appDesc);
        context.addLoaded(appDesc, uid);

        StringWriter stringWriter = new StringWriter();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));
        when(request.getParameterNames()).thenReturn(new Vector<String>().elements());

        ServletUtilAdapter servletUtilAdapter = Aura.getServletUtilAdapter();
        ServletUtilAdapter spyServletUtilAdapter = spy(servletUtilAdapter);
        ConfigAdapter configAdapter = Aura.getConfigAdapter();
        ConfigAdapter spyConfigAdapter = spy(configAdapter);
        doReturn(new ArrayList<String>()).when(spyServletUtilAdapter).getStyles(context);
        doReturn(new ArrayList<String>()).when(spyServletUtilAdapter).getScripts(Mockito.any(), Mockito.anyBoolean(), Mockito.anyMap());

        Manifest manifest = new Manifest();
        manifest.setServletUtilAdapter(spyServletUtilAdapter);
        manifest.setConfigAdapter(spyConfigAdapter);

        // Act
        manifest.write(request, response, context);
        String content = stringWriter.toString();

        // Assert
        verify(spyConfigAdapter, times(1)).getResetCssURL();

        String[] lines = content.split("\n");
        int start = Arrays.asList(lines).indexOf("CACHE:");
        if(start < 0) {
            fail("Could not find CACHE part in appcache manifest: " + content);
        }

        for(int i=start + 1; i < lines.length; i++) {
            assertThat("auraResetStyle is empty, so manifest should not contains resetCSS.css",
                    lines[i], not(containsString("resetCSS.css")));
            assertThat(lines[i], not(containsString("null")));
        }
    }
}
