/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.util.adapter;

import java.io.File;
import java.io.IOException;

import org.auraframework.test.UnitTestCase;

public class GitSourceControlAdapterTest extends UnitTestCase {
    public GitSourceControlAdapterTest(String name){
        super(name);
    }

    public void testCanCheckout() {
        //FIXME: nothing to test.
    }

    public void testCheckout() {
        //FIXME: nothing to test.
    }

    public void testAdd() {
        //FIXME: nothing to test.
    }

    public void testWriteIfDifferentInvalidFile() {
        StringBuilder sb = new StringBuilder("new data");
        File badFile = new File("/god/I/hope/this/file/doesnt/exist/and/no/one/creates/it");
        SourceControlAdapterImpl scai = new SourceControlAdapterImpl();

        try {
            scai.writeIfDifferent(sb, badFile);
            fail("should have thrown an IO exception");
        } catch (IOException expected) {
            // FIXME: Check for type of exception.
        }
    }

    public void testWriteIfDifferentValid() {
        // FIXME: come up with a test scenario.
    }
}
