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

import org.apache.log4j.Logger;
import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.impl.test.util.LoggingTestAppender;
import org.auraframework.throwable.GenericEventException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import java.util.List;
import java.util.UUID;

public class ServerErrorUtilAdapterImplUnitTest extends UnitTestCase {

    private static final String SERVER_ERROR_EVENT = "aura:serverActionError";

    private ServerErrorUtilAdapterImpl serverErrorUtilAdapter = new ServerErrorUtilAdapterImpl();

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
    public void processError() {
        Logger logger = Logger.getLogger(ServerErrorUtilAdapterImpl.class);
        LoggingTestAppender appender = new LoggingTestAppender();
        List<LoggingEvent> logs = appender.getLog();
        logger.addAppender(appender);

        String message = "err";
        String errorId = serverErrorUtilAdapter.processError(message, new RuntimeException());

        // This will throw if errorId isn't a uuid.
        UUID.fromString(errorId);

        String logMessage = logs.get(0).getMessage().toString();
        assertTrue(logMessage.equals(message));
    }
}