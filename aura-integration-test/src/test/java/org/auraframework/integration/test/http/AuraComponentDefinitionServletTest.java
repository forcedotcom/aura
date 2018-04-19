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
package org.auraframework.integration.test.http;

import static org.junit.Assert.assertTrue;

import java.io.PrintWriter;
import java.util.Set;
import java.util.HashSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.http.AuraComponentDefinitionServlet;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

public class AuraComponentDefinitionServletTest {

    @Mock
    private DefinitionService definitionService;
    
    @Mock
    private LoggingService loggingService;
    
    @Mock
    private ServerService serverService;
    
    @Mock
    private ContextService contextService;

    @Mock
    private AuraContext auraContextService;
    
    @Mock
    private ConfigAdapter configAdapter;
    
    @Mock
    private ServletUtilAdapter servletUtilAdapter;
    
    @Mock
    private HttpServletRequest request;
    
    @Mock
    private HttpServletResponse response;
    
    private AuraComponentDefinitionServlet auraComponentDefinitionServlet;
    
    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        
        auraComponentDefinitionServlet = new AuraComponentDefinitionServlet();
        auraComponentDefinitionServlet.setConfigAdapter(configAdapter);
        auraComponentDefinitionServlet.setContextService(contextService);
        auraComponentDefinitionServlet.setDefinitionService(definitionService);
        auraComponentDefinitionServlet.setLoggingService(loggingService);
        auraComponentDefinitionServlet.setServerService(serverService);
        auraComponentDefinitionServlet.setServletUtilAdapter(servletUtilAdapter);
    }
    
    private void setMockRequestParameters(String auraApp, String hydration, String locker, String locale, String style, String def, String uid, String ... params) {
        
        Mockito.when(request.getParameter("aura.app")).thenReturn(auraApp);
        Mockito.when(request.getParameter("_hydration")).thenReturn(hydration);
        Mockito.when(request.getParameter("_l")).thenReturn(locker);
        Mockito.when(request.getParameter("_l10n")).thenReturn(locale);
        Mockito.when(request.getParameter("_style")).thenReturn(style);
        Mockito.when(request.getParameter("_def")).thenReturn(def);
        Mockito.when(request.getParameter("_uid")).thenReturn(uid);
        
        assertTrue(String.format("Must supply an even number of parameters to mock, as Key / Value pairs, was given %d : %s", params.length, String.join(",", params)), 
                params.length % 2 == 0);
        for (int i = 0; i < params.length; i += 2) {
            Mockito.when(request.getParameter(params[i])).thenReturn(params[i+1]);
        }
    }
    
    @SuppressWarnings("unchecked")
    @Test
    public void testMismatchUIDsendRedirectWithAllParams() throws Exception {
        // Arrange
        setMockRequestParameters("myApp", "one", "true", "de", "styling", "def", "UID");
        DefDescriptor<Definition> defDescriptorMock = Mockito.mock(DefDescriptor.class);
        Mockito.when(defDescriptorMock.getNamespace()).thenReturn("namespace");
        Mockito.when(defDescriptorMock.getName()).thenReturn("name");
        Mockito.when(defDescriptorMock.getQualifiedName()).thenReturn("def:qualifiedName");
        Mockito.when(definitionService.getDefDescriptor(Matchers.eq("def"), Matchers.any())).thenReturn(defDescriptorMock);
        Mockito.when(definitionService.getUid(null, defDescriptorMock)).thenReturn("DIFFERENT_UID");
        Mockito.when(configAdapter.isSecureRequest(request)).thenReturn(true);
        Mockito.when(response.getWriter()).thenReturn(Mockito.mock(PrintWriter.class));
        Mockito.when(request.getHeader("Host")).thenReturn("example.host");

        // Act
        AuraPrivateAccessor.invoke(auraComponentDefinitionServlet, "doGet", request, response);

        // Assert
        Mockito.verify(response).sendRedirect("https://example.host/auraCmpDef?aura.app=myApp&_hydration=one&_l=false&_l10n=de&_style=styling&_def=def:qualifiedName&_uid=DIFFERENT_UID");
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testContainsRestrictedDefs() throws Exception {
        // Arrange
        //private Boolean containsOnlyRestrictedDefs = true;
        setMockRequestParameters("myApp", "one", "true", "de", "styling", "def", "UID");
        DefDescriptor<Definition> defDescriptorMock = Mockito.mock(DefDescriptor.class);
        Mockito.when(defDescriptorMock.getNamespace()).thenReturn("def");
        Mockito.when(defDescriptorMock.getName()).thenReturn("name");
        Mockito.when(defDescriptorMock.getQualifiedName()).thenReturn("def:qualifiedName");
        Mockito.when(definitionService.getDefDescriptor(Matchers.eq("def"), Matchers.any())).thenReturn(defDescriptorMock);
        Mockito.when(definitionService.getUid(null, defDescriptorMock)).thenReturn("UID");
        Mockito.when(configAdapter.isSecureRequest(request)).thenReturn(true);
        Mockito.when(response.getWriter()).thenReturn(Mockito.mock(PrintWriter.class));
        Mockito.when(request.getHeader("Host")).thenReturn("example.host");
        Set<String> restrictedNamespaces = new HashSet<String>();
        restrictedNamespaces.add("def");
        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContextService);
        Mockito.when(contextService.getCurrentContext().getRestrictedNamespaces()).thenReturn(restrictedNamespaces);

        // Act
        AuraPrivateAccessor.invoke(auraComponentDefinitionServlet, "doGet", request, response);

        // Assert
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).setLongCachePrivate(response);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testContainsNoRestrictedDefs() throws Exception {
        // Arrange
        setMockRequestParameters("myApp", "one", "true", "de", "styling", "def", "UID");
        DefDescriptor<Definition> defDescriptorMock = Mockito.mock(DefDescriptor.class);
        Mockito.when(defDescriptorMock.getNamespace()).thenReturn("namespace");
        Mockito.when(defDescriptorMock.getName()).thenReturn("name");
        Mockito.when(defDescriptorMock.getQualifiedName()).thenReturn("def:qualifiedName");
        Mockito.when(definitionService.getDefDescriptor(Matchers.eq("def"), Matchers.any())).thenReturn(defDescriptorMock);
        Mockito.when(definitionService.getUid(null, defDescriptorMock)).thenReturn("UID");
        Mockito.when(configAdapter.isSecureRequest(request)).thenReturn(true);
        Mockito.when(response.getWriter()).thenReturn(Mockito.mock(PrintWriter.class));
        Mockito.when(request.getHeader("Host")).thenReturn("example.host");
        Set<String> restrictedNamespaces = new HashSet<String>();
        restrictedNamespaces.add("fed");
        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContextService);
        Mockito.when(contextService.getCurrentContext().getRestrictedNamespaces()).thenReturn(restrictedNamespaces);

        // Act
        AuraPrivateAccessor.invoke(auraComponentDefinitionServlet, "doGet", request, response);

        // Assert
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).setLongCache(response);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testContainsEmptyRestrictedNamespaces() throws Exception {
        // Arrange
        setMockRequestParameters("myApp", "one", "true", "de", "styling", "def", "UID");
        DefDescriptor<Definition> defDescriptorMock = Mockito.mock(DefDescriptor.class);
        Mockito.when(defDescriptorMock.getNamespace()).thenReturn("namespace");
        Mockito.when(defDescriptorMock.getName()).thenReturn("name");
        Mockito.when(defDescriptorMock.getQualifiedName()).thenReturn("def:qualifiedName");
        Mockito.when(definitionService.getDefDescriptor(Matchers.eq("def"), Matchers.any())).thenReturn(defDescriptorMock);
        Mockito.when(definitionService.getUid(null, defDescriptorMock)).thenReturn("UID");
        Mockito.when(configAdapter.isSecureRequest(request)).thenReturn(true);
        Mockito.when(response.getWriter()).thenReturn(Mockito.mock(PrintWriter.class));
        Mockito.when(request.getHeader("Host")).thenReturn("example.host");
        Set<String> restrictedNamespaces = new HashSet<String>();
        Mockito.when(contextService.getCurrentContext()).thenReturn(auraContextService);
        Mockito.when(contextService.getCurrentContext().getRestrictedNamespaces()).thenReturn(restrictedNamespaces);

        // Act
        AuraPrivateAccessor.invoke(auraComponentDefinitionServlet, "doGet", request, response);

        // Assert
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).setLongCache(response);
    }
}
