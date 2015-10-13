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

import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.test.util.UnitTestCase;
import org.mockito.Mockito;

import java.io.Writer;
import java.util.HashSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;

/**
 * Simple (non-integration) test case for {@link AppJs}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class AppJsTest extends UnitTestCase {

    public AppJsTest(String name) {
        super(name);
    }

    /**
     * Name is API!.
     */
    public void testName() {
        assertEquals("app.js", new AppJs().getName());
    }

    /**
     * Format is API!.
     */
    public void testFormat() {
        assertEquals(Format.JS, new AppJs().getFormat());
    }

    /**
     * Check for an exception being caught and routed to the exception handler.
     *
     * Most of this is internal, but we want to make sure that we call handleServletException if there
     * is an exception in the writing of the CSS.
     */
    @SuppressWarnings("unchecked")
    public void testExceptionInWrite() throws Exception {
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ServerService serverService = Mockito.mock(ServerService.class);
        AppJs appJs = new AppJs();
        Throwable t = new RuntimeException();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        appJs.setServletUtilAdapter(servletUtilAdapter);
        appJs.setServerService(serverService);
        Mockito.when(servletUtilAdapter.verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class)))
            .thenReturn(new HashSet<DefDescriptor<?>>());
        Mockito.doThrow(t).when(serverService).writeDefinitions(Mockito.anySet(), Mockito.any(Writer.class));

        appJs.write(null, response, null);

        //
        // Knock off the known calls. These are mocked above, and are internal implementation dependent.
        //
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).verifyTopLevel(Mockito.any(HttpServletRequest.class),
                Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class));
        Mockito.verify(response, Mockito.times(1)).getWriter();
        Mockito.verify(serverService, Mockito.times(1)).writeDefinitions(Mockito.anySet(), Mockito.any(Writer.class));

        //
        // And this is the expected call. This must stay.
        //
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).handleServletException(Mockito.eq(t),
                Mockito.anyBoolean(), Mockito.any(AuraContext.class), Mockito.any(HttpServletRequest.class),
                Mockito.any(HttpServletResponse.class), Mockito.anyBoolean());

        //
        // Make sure nothing else happens.
        //
        Mockito.verifyNoMoreInteractions(response);
        Mockito.verifyNoMoreInteractions(serverService);
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }

    /**
     * Check that null dependencies doesn't call anything.
     *
     * This test will need to change if the internals change, but null should mean that nothing gets called.
     */
    public void testNullDependencies() throws Exception {
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ServerService serverService = Mockito.mock(ServerService.class);
        AppJs appJs = new AppJs();
        appJs.setServletUtilAdapter(servletUtilAdapter);
        appJs.setServerService(serverService);
        Mockito.when(servletUtilAdapter.verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class)))
            .thenReturn(null);

        appJs.write(null, null, null);

        //
        // This is the known call to get the null.
        // 
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class));

        //
        // Nothing else should happen.
        //
        Mockito.verifyNoMoreInteractions(serverService);
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
    
    /**
     * Verify that we set the correct contentType to response
     */
    public void testSetContentType() {
    	AppJs appJs = new AppJs();
    	ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
    	appJs.setServletUtilAdapter(servletUtilAdapter);
    	Mockito.when(servletUtilAdapter.getContentType(AuraContext.Format.JS))
        .thenReturn("text/javascript");
    	
    	DummyHttpServletResponse response = new DummyHttpServletResponse() {
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
    	
    	appJs.setContentType(response);
    	
    	assertEquals("text/javascript", response.getContentType());
    }
}
