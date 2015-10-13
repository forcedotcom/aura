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

import java.util.HashSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.util.test.util.UnitTestCase;
import org.mockito.Mockito;

public class ClientLibraryCssTest extends UnitTestCase {

	public ClientLibraryCssTest(String name) {
        super(name);
    }

    /**
     * Name is API!.
     */
    public void testName() {
        assertEquals("resources.css", new ClientLibraryCss().getName());
    }

    /**
     * Format is API!.
     */
    public void testFormat() {
        assertEquals(Format.CSS, new ClientLibraryCss().getFormat());
    }
    
    /**
     * verify when we throw during write, handleServletException of servletUtilAdapter is called
     * @throws Exception
     */
    public void testExceptionInWrite() throws Exception {
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ClientLibraryService clientLibraryService = Mockito.mock(ClientLibraryService.class);
        ClientLibraryCss clientLibraryCss = new ClientLibraryCss();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        clientLibraryCss.setServletUtilAdapter(servletUtilAdapter);
        clientLibraryCss.setClientLibraryService(clientLibraryService);
        Mockito.when(servletUtilAdapter.verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class)))
            .thenReturn(new HashSet<DefDescriptor<?>>());
        Throwable t = new RuntimeException();
        Mockito.doThrow(t).when(clientLibraryService).
        writeCss( Mockito.any(AuraContext.class), Mockito.any(Appendable.class) );

        clientLibraryCss.write(null, response, null);

        //
        // Knock off the known calls. These are mocked above, and are internal implementation dependent.
        //
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).verifyTopLevel(Mockito.any(HttpServletRequest.class),
                Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class));
        Mockito.verify(response, Mockito.times(1)).getWriter();

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
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
    
    /**
     * Check that null dependencies doesn't call anything.
     *
     * This test will need to change if the internals change, but null should mean that nothing gets called.
     */
    public void testNullDependencies() throws Exception {
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ClientLibraryService clientLibraryService = Mockito.mock(ClientLibraryService.class);
        ClientLibraryCss clientLibraryCss = new ClientLibraryCss();
        clientLibraryCss.setServletUtilAdapter(servletUtilAdapter);
        clientLibraryCss.setClientLibraryService(clientLibraryService);
        Mockito.when(servletUtilAdapter.verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class)))
            .thenReturn(null);

        clientLibraryCss.write(null, null, null);

        //
        // This is the known call to get the null.
        // 
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class));

        //
        // Nothing else should happen.
        //
        Mockito.verifyNoMoreInteractions(clientLibraryService);
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
    
}
