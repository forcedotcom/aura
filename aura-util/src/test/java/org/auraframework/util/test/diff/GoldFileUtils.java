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
package org.auraframework.util.test.diff;

import java.io.FileNotFoundException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.util.test.util.UnitTestCase;

import junit.framework.AssertionFailedError;

public final class GoldFileUtils {

    private static final Logger LOG = Logger.getLogger(GoldFileUtils.class.getSimpleName());

    public void assertTextDiff(UnitTestCase test, String resultsBaseFilename, String testResults) throws Exception {
        TextDiffUtils diff = new TextDiffUtils(test, resultsBaseFilename);
        assertDiffInternal(testResults, diff);
    }

    public void assertJsonDiff(UnitTestCase test, String resultsBaseFilename, String testResults) throws Exception {
        TextDiffUtils diff = new JsonDiffUtils(test, resultsBaseFilename);
        assertDiffInternal(testResults, diff);
    }

    private <T> void assertDiffInternal(T testResults, DiffUtils<T> diff) throws Exception {
        URL url = diff.getUrl();
        Throwable exceptionFound = null;
        String message = null;

        try {
            diff.assertDiff(testResults, null);
        } catch (FileNotFoundException e) {
            exceptionFound = e;
            message = String.format("Created missing gold file, review new gold file before committing: %s", url);
        } catch (Throwable t) {
            exceptionFound = t;
            message = "Gold file differences found";
            message += String.format(", review updated gold file before committing: %s", url);
            message += "\nDifferences";
            message += ":\n" + t.getMessage();
        }

        if (exceptionFound != null) {
            if (exceptionFound instanceof FileNotFoundException) {
                LOG.info("writing missing gold file: " + url);
            } else {
                LOG.info("overwriting gold file: " + url);
            }
            try {
                diff.writeGoldFile(testResults);
            } catch (Exception e) {
                // i.e. in autobuild
                LOG.log(Level.WARNING, "cannot write goldfile: " + url, e);
            }
            // add info about creating/updating log file in the assertion message
            Error error = new AssertionFailedError(message);
            error.setStackTrace(exceptionFound.getStackTrace());
            throw error;
        }
    }
}
