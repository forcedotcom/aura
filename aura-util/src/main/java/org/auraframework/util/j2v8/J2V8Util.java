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
package org.auraframework.util.j2v8;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.eclipsesource.v8.NodeJS;
import com.eclipsesource.v8.V8;

public class J2V8Util {

    private static final Logger logger = Logger.getLogger(J2V8Util.class.getName());

    private static final boolean J2V8_AVAILABLE = isJ2V8AvailableCheck();

    /**
     * @return true if J2V8 is available the current environment, false otherwise
     */
    public static boolean isJ2V8Available() {
        return J2V8_AVAILABLE;
    }

    private static boolean isJ2V8AvailableCheck() {
        String env = "os.name:" + System.getProperty("os.name") + ",os.version:" + System.getProperty("os.version")
        + ",os.arch:" + System.getProperty("os.arch");
        boolean enabled = false;
        try {
            V8.createV8Runtime().release();
            enabled = true;
        } catch (Throwable t) {
            logger.log(Level.SEVERE, "J2V8 not available in current env (" + env + "), disabling modules", t);
        }
        logger.info("J2V8Util running in: " + env + ", enabled=" + enabled);
        return enabled;
    }
    
    /**
     * Use this method instead of calling NodeJS.createNodeJS() directly to avoid random IOExceptions
     */
    public synchronized static NodeJS createNodeJS() {
        // this is the exception we get randomly:
        // Caused by: java.io.IOException: No such file or directory
        // at java.io.UnixFileSystem.createFileExclusively(Native Method)
        // at java.io.File.createTempFile(File.java:2024)
        // at java.io.File.createTempFile(File.java:2070)
        // at com.eclipsesource.v8.NodeJS.createTemporaryScriptFile(NodeJS.java:204)
        // at com.eclipsesource.v8.NodeJS.createNodeJS(NodeJS.java:73)
        return NodeJS.createNodeJS();
    }
}
