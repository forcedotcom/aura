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
package org.auraframework.integration.test.serialization;


import java.io.PrintWriter;
import java.io.StringWriter;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.AppJs;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.AuraContext;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.Mockito;

public class AppJsSerializationGoldFileTest extends AuraImplTestCase {

    @Inject
    AppJs appJs = new AppJs();

    @Test
    public void testAppJsSerializationUpdatedGoldFile() throws Exception {

        HttpServletRequest httpRequest = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse httpResponse = Mockito.mock(HttpServletResponse.class);

        Mockito.when(httpRequest.getDateHeader(HttpHeaders.IF_MODIFIED_SINCE)).thenReturn(-1L);

        StringWriter stringWriter = new StringWriter();
        Mockito.when(httpResponse.getWriter()).thenReturn(new PrintWriter(stringWriter));

        AuraContext auraContext = Mockito.mock(AuraContext.class);
        Mockito.when(auraContext.isAppJsSplitEnabled()).thenReturn(false);
        DefDescriptor<? extends BaseComponentDef> applicationDef = definitionService.getDefDescriptor("auradocs:docs", ApplicationDef.class);
        Mockito.<DefDescriptor<? extends BaseComponentDef>>when(auraContext.getApplicationDescriptor()).thenReturn(applicationDef);
        Mockito.when(auraContext.getUid(Matchers.any())).thenReturn("APPLICATION:markup://auradocs:docs");

        appJs.write(httpRequest, httpResponse, auraContext);

        try {
            goldFileText(stringWriter.toString());
        } catch (Exception e) {
            throw new Exception("App.js serialization gold file mismatch. Please bump the Serialization version in ServerServiceImpl.AURA_SERIALIZATION_VERSION", e);
        }
    }
}
