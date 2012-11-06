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

    private URL url;

    public BaseDiffUtils(Class<?> testClass, String goldName) throws Exception {
        String resourceName = "/results/" + testClass.getSimpleName() + (goldName.startsWith("/") ? "" : "/")
                + goldName;
        url = testClass.getResource(resourceName);
        if (url != null) {
            if ("file".equals(url.getProtocol())) {
                // probably in dev so look for source rather than target
                String devPath = url.getPath().replaceFirst("/target/test-classes/", "/src/test/");
                File f = new File(devPath);
                if (f.exists()) url = f.toURI().toURL();
            }
            return;
        }

        // file not found, but check if we can write
        String relPath = testClass.getName().replace('.', '/') + ".class";
        URL testUrl = testClass.getResource("/" + relPath);
        if (!testUrl.getProtocol().equals("file")) {
            // write something to temp file at least
            url = new URL(System.getProperty("java.io.tmpdir") + "/aura/test" + resourceName);
        } else {
            String fullPath = testUrl.getPath();
            String basePath = fullPath.substring(0, fullPath.indexOf(relPath));
            url = new URL(String.format("file://%s../../test%s", basePath, resourceName));
        }
    }

    @Override
    public URL getUrl() {
        return this.url;
    }

    /**
     * try to invoke "diff" to create a readable diff for the test failure results, otherwise append our crappy
     * unreadable garbage
     */
    protected void appendDiffs(String results, StringBuilder sb) {
        try {
            // create a temp file and write the results so that we're sure to have something for diff to use
            File file = File.createTempFile("sfdc-gold.", ".xml");
            try {
                OutputStreamWriter fw = new OutputStreamWriter(new FileOutputStream(file), "UTF-8");
                try {
                    fw.write(results);
                } finally {
                    fw.close();
                }
                Process child = Runtime.getRuntime().exec("diff -du " + url.getPath() + " " + file.getPath());
                try {
                    printToBuffer(sb, child.getInputStream());
                    printToBuffer(sb, child.getErrorStream());
                } finally {
                    child.waitFor();
                }
            } finally {
                file.delete();
            }
        } catch (Throwable t) {}
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
