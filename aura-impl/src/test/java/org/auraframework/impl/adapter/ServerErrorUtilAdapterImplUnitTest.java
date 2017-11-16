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

package org.auraframework.impl.adapter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.verify;

import java.util.UUID;
import java.util.logging.Level;

import org.auraframework.service.ContextService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.GenericEventException;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

public class ServerErrorUtilAdapterImplUnitTest {

    private static final String SERVER_ERROR_EVENT = "aura:serverActionError";

    private ServerErrorUtilAdapterImpl serverErrorUtilAdapter;

    @Before
    public void setUp() {
        serverErrorUtilAdapter = new ServerErrorUtilAdapterImpl();

        ContextService mockContextSerivce = Mockito.mock(ContextService.class);
        AuraContext mockContext = Mockito.mock(AuraContext.class);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.DEV);
        Mockito.when(mockContextSerivce.getCurrentContext()).thenReturn(mockContext);

        LoggingService mockLoggingService = Mockito.mock(LoggingService.class);

        serverErrorUtilAdapter.setContextService(mockContextSerivce);
        serverErrorUtilAdapter.setLoggingService(mockLoggingService);
    }

    @Test
    public void handleException() throws Exception {
        try {
            serverErrorUtilAdapter.handleException("err");
            fail("Expected exception not thrown");
        } catch (GenericEventException gee) {
            assertTrue(gee.getMessage().equals(SERVER_ERROR_EVENT) && gee.getCause() == null);
        }
    }

    @Test
    public void handleCustomException() throws Exception {
        RuntimeException re = new RuntimeException();
        try {
            serverErrorUtilAdapter.handleCustomException("err", re);
            fail("Expected exception not thrown");
        } catch (GenericEventException gee) {
            assertTrue(gee.getMessage().equals(SERVER_ERROR_EVENT) && gee.getCause().equals(re));
        }
    }

    @Test
    public void processErrorWithInfoLevelException() {
        ServerErrorUtilAdapterImpl serverErrorUtilAdapter = new ServerErrorUtilAdapterImpl();

        ContextService mockContextSerivce = Mockito.mock(ContextService.class);
        AuraContext mockContext = Mockito.mock(AuraContext.class);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.DEV);
        Mockito.when(mockContextSerivce.getCurrentContext()).thenReturn(mockContext);

        LoggingService mockLoggingService = Mockito.mock(LoggingService.class);

        serverErrorUtilAdapter.setContextService(mockContextSerivce);
        serverErrorUtilAdapter.setLoggingService(mockLoggingService);


        String message = "err";
        String errorId = serverErrorUtilAdapter.processError(message, new RuntimeException(), Level.INFO, null);

        // This will throw if errorId isn't a uuid.
        UUID.fromString(errorId);

        ArgumentCaptor<String> argument = ArgumentCaptor.forClass(String.class);
        verify(mockLoggingService).warn(argument.capture(), any(Throwable.class));
        assertEquals(message, argument.getValue());
    }

}
