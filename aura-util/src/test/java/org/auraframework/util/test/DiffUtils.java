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
package org.auraframework.util.test;

import java.io.IOException;
import java.net.URL;

import org.auraframework.test.UnitTestCase;

public interface DiffUtils<T> {

    public URL getUrl();

    /**
     * @return the test this DiffUtils is used for
     */
    public UnitTestCase getTest();

    /**
     * @param testResults actual test results
     * @param sb assertion message to use
     */
    public void assertDiff(T testResults, StringBuilder sb) throws Exception;

    /**
     * @param testResults results to write to the gold file
     */
    public void writeGoldFile(T testResults) throws IOException;

    /**
     * @return the results in the gold file
     */
    public T readGoldFile() throws IOException;
}
