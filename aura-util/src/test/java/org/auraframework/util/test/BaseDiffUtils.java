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
package org.auraframework.util.test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;

public abstract class BaseDiffUtils<T> implements DiffUtils<T> {

    private URL srcUrl;
    private URL destUrl;

    public BaseDiffUtils(Class<?> testClass, String goldName) throws Exception {
        String resourceName = "/results/" + testClass.getSimpleName() + (goldName.startsWith("/") ? "" : "/")
                + goldName;
        srcUrl = testClass.getResource(resourceName);
        if (srcUrl == null) {
            // gold file not found, but try to identify expected gold file location based on the test class location
            String relPath = testClass.getName().replace('.', '/') + ".class";
            URL testUrl = testClass.getResource("/" + relPath);
            if ("file".equals(testUrl.getProtocol())) {
                String fullPath = testUrl.getPath();
                String basePath = fullPath.substring(0, fullPath.indexOf(relPath)).replaceFirst(
                        "/target/test-classes/", "/src/test");
                destUrl = new URL("file://" + basePath + resourceName);
            }
        } else if ("file".equals(srcUrl.getProtocol())) {
            // probably in dev so look for source rather than target
            String devPath = srcUrl.getPath().replaceFirst("/target/test-classes/", "/src/test/");
            srcUrl = destUrl = new URL("file://" + devPath);
        }

        if (destUrl == null) {
            // if we're reading from jars and can't identify filesystem source locations, write to a temp file at least
            destUrl = new URL("file://" + System.getProperty("java.io.tmpdir") + "/aura/test" + resourceName);
        }
        if (srcUrl == null) {
            // also if reading from jars and no gold included (shouldn't happen)
            srcUrl = destUrl;
        }
    }

    @Override
    public URL getUrl() {
        return srcUrl;
    }

    protected URL getDestUrl() {
        return destUrl;
    }

    /**
     * try to invoke "diff" to create a readable diff for the test failure results, otherwise append our crappy
     * unreadable garbage
     */
    protected void appendDiffs(String results, StringBuilder sb) {
        try {
            // create a temp file and write the results so that we're sure to
            // have something for diff to use
            File file = File.createTempFile("aura-gold.", ".xml");
            try {
                OutputStreamWriter fw = new OutputStreamWriter(new FileOutputStream(file), "UTF-8");
                try {
                    fw.write(results);
                } finally {
                    fw.close();
                }
                Process child = Runtime.getRuntime().exec("diff -du " + srcUrl.getPath() + " " + file.getPath());
                try {
                    printToBuffer(sb, child.getInputStream());
                    printToBuffer(sb, child.getErrorStream());
                } finally {
                    child.waitFor();
                }
            } finally {
                file.delete();
            }
        } catch (Throwable t) {
        }
    }

    private boolean printToBuffer(StringBuilder sb, InputStream in) throws IOException {
        boolean printedAny = false;
        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        try {
            String line = reader.readLine();
            while (null != line) {
                sb.append(line).append("\n");
                printedAny = true;
                line = reader.readLine();
            }
            return printedAny;
        } finally {
            reader.close();
        }
    }
}
