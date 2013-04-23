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
package org.auraframework.test;

import java.util.logging.Logger;

import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

/**
 * Log test status as it happens.
 */
public class LoggerRunListener extends RunListener {
    private static final Logger log = Logger.getLogger(LoggerRunListener.class.getName());

    @Override
    public void testStarted(Description description) throws Exception {
        log.info(description.toString());
    }

    @Override
    public void testFailure(Failure failure) throws Exception {
        log.severe("FAILED: " + failure);
    }

    @Override
    public void testIgnored(Description description) throws Exception {
        log.warning("IGNORED: " + description);
    }
}
