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
package org.auraframework.integration.test.logging;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;

@ThreadHostileTest("The logs can be messed up when running with other tests.")
@UnAdaptableTest("@ThreadHostileTest is not supported in SFDC.")
public abstract class AbstractLoggingUITest extends WebDriverTestCase {

    private Logger logger;
    private Level originalLevel;
    protected LoggingTestAppender appender;

    public AbstractLoggingUITest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        appender = new LoggingTestAppender();

        logger = Logger.getLogger("LoggingContextImpl");
        // When we run integration tests, the logging level of logger LoggingContextImpl
        // is WARN, setting it into INFO here so that we can get the log as we run the app.
        originalLevel = logger.getLevel();
        logger.setLevel(Level.INFO);
        logger.addAppender(appender);
    }

    @Override
    public void tearDown() throws Exception {
        logger.removeAppender(appender);
        logger.setLevel(originalLevel);
        super.tearDown();
    }
}
