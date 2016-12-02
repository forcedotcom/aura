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
package org.auraframework.http.resource;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraResource;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

public class InlineJsUnitTest extends UnitTestCase {

    @Test
    public void testGetName() {
        AuraResource resource = new InlineJs();
        String name = resource.getName();
        assertEquals("inline.js", name);
    }

    @Test
    public void testGetFormat() {
        AuraResource resource = new InlineJs();
        Format format = resource.getFormat();
        assertEquals(Format.JS, format);
    }

    @Test
    public void testSetContentType() {
        String expected = "text/javascript";
        AuraResource resource = new InlineJs();
        // mocking ServletUtilAdapterImpl.getContentType
        ServletUtilAdapter mockServletUtil = Mockito.mock(ServletUtilAdapter.class);
        Mockito.when(mockServletUtil.getContentType(Format.JS)).thenReturn(expected);
        ((AuraResourceImpl)resource).setServletUtilAdapter(mockServletUtil);

        HttpServletResponse mockResponse = Mockito.mock(HttpServletResponse.class);
        resource.setContentType(mockResponse);
        Mockito.verify(mockResponse, Mockito.times(1)).setContentType(expected);
    }

    @Test
    public void testExceptionHandling() throws Exception {
        ContextService acs = Mockito.mock(ContextService.class);
        AuraContext ac = Mockito.mock(AuraContext.class);
        ServletUtilAdapter sua = Mockito.mock(ServletUtilAdapter.class);
        ClientOutOfSyncException coos = Mockito.mock(ClientOutOfSyncException.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        Mockito.when(acs.getCurrentContext()).thenReturn(ac);
        Mockito.doThrow(coos).when(sua).checkFrameworkUID(ac);

        InlineJs inline = new InlineJs();
        inline.setServletUtilAdapter(sua);
        inline.setContextService(acs);

        inline.write(request, response, ac);

        Mockito.verify(sua).handleServletException(coos, false, ac, request, response, false);
        Mockito.verify(sua).checkFrameworkUID(ac);
        Mockito.verifyNoMoreInteractions(sua);
    }
}
