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
package org.auraframework.impl.clientlibrary;

import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

import org.auraframework.def.ClientLibraryDef;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.hamcrest.Matchers;
import org.junit.Test;

/**
 * Unit tests for {@link ClientLibraryServiceImpl}. Coverage should include {@link ClientLibraryResolverRegistryImpl},
 * and framework implementations of {@link org.auraframework.clientlibrary.ClientLibraryResolver}
 */
public class ClientLibraryServiceImplTest {
    @Test
    public void testCKEditorProd() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.PROD).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("CkEditor").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "ckeditor/ckeditor-4.x/rel/ckeditor.js"));
    }

    @Test
    public void testCKEditorDev() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("CkEditor").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "ckeditor/ckeditor-4.x/rel/ckeditor.js"));
    }

    @Test
    public void testDOMPurifyProd() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.PROD).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("DOMPurify").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "DOMPurify/DOMPurify.min.js"));
    }

    @Test
    public void testDOMPurifyDev() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("DOMPurify").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "DOMPurify/DOMPurify.js"));
    }

    @Test
    public void testEngineProd() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.PROD).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("engine").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "engine/engine.min.js"));
    }

    @Test
    public void testEngineDev() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("engine").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "engine/engine.js"));
    }

    @Test
    public void testLockerProd() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.PROD).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("locker").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "lockerservice/aura-locker.min.js"));
    }

    @Test
    public void testLockerDev() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("locker").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "lockerservice/aura-locker.js"));
    }

    @Test
    public void testLockerDisabledProd() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.PROD).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("locker-disabled").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "lockerservice/aura-locker-disabled.min.js"));
    }

    @Test
    public void testLockerDisabledDev() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("locker-disabled").when(library).getLibraryName();
        doReturn(ClientLibraryDef.Type.JS).when(library).getType();

        String actual = target.getResolvedUrl(library);
        assertThat(actual, Matchers.stringContainsInOrder("/context", "nonce", "lockerservice/aura-locker-disabled.js"));
    }

    @Test
    public void testNullLibrary() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        String actual = target.getResolvedUrl((ClientLibraryDef)null);
        assertNull(actual);
    }

    @Test
    public void testNullLibraryName() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn(null).when(library).getLibraryName();

        String actual = target.getResolvedUrl(library);
        assertNull(actual);
    }

    @Test
    public void testBogusLibraryName() throws Exception {
        ContextService contextService = mock(ContextService.class);
        AuraContext context = mock(AuraContext.class);
        doReturn(context).when(contextService).getCurrentContext();
        doReturn("/context").when(context).getContextPath();
        doReturn("nonce").when(context).getFrameworkUID();
        doReturn(Mode.DEV).when(context).getMode();

        ClientLibraryServiceImpl target = new ClientLibraryServiceImpl();
        target.setContextService(contextService);

        ClientLibraryDef library = mock(ClientLibraryDef.class);
        doReturn("thisIsNotAValidLibrary").when(library).getLibraryName();

        String actual = target.getResolvedUrl(library);
        assertNull(actual);
    }
}
