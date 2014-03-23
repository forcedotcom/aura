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
package org.auraframework.impl.validation.http;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.List;

import org.auraframework.impl.validation.ValidationTestUtil;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.util.validation.ValidationClient;

import com.google.common.collect.Lists;

public final class ValidationClientHttpTest extends AuraHttpTestCase {

    public ValidationClientHttpTest(String name) {
        super(name);
    }

    /**
     * Checks that the ValidationClient can run with just the aura-util.jar in the classpath
     */
    public void testCanRunStandalone() throws Exception {
        URL url = getTestServletConfig().getBaseUrl();
        List<String> command = Lists.newArrayList();
        command.add("java");
        command.add("-Djetty.host=" + url.getHost());
        command.add("-Djetty.port=" + url.getPort());
        command.add("-classpath");
        command.add("../aura-util/target/classes");
        command.add("org.auraframework.util.validation.ValidationClient");
        command.add("../aura-impl/src/test/components/validationTest/basic");
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);
        Process process = builder.start();
        new Pipe(process.getInputStream(), System.out).run();
        int exitCode = process.waitFor();
        assertEquals(0, exitCode);
    }

    private static class Pipe {
        private final InputStream in;
        private final OutputStream out;

        public Pipe(InputStream in, OutputStream out) {
            this.in = in;
            this.out = out;
        }

        void run() throws IOException {
            byte[] buffer = new byte[1024];
            int bytes_read;
            try {
                while ((bytes_read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytes_read);
                }
            } finally {
                out.flush();
                in.close();
            }
        }
    }

    public void testValidate() throws Exception {
        List<String> errors = ValidationClient
                .validate("../aura-impl/src/test/components/validationTest/basic");

        assertEquals(5, errors.size());

        ValidationTestUtil
                .assertError(
                        "basic.css [line 1, column 1] cssparser: CSS selector must begin with '.validationTestBasic' or '.THIS'",
                        errors.get(0));
        ValidationTestUtil
                .assertError(
                        "basic.css [line 2, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7",
                        errors.get(1));
        ValidationTestUtil.assertError("basicController.js [line 5, column 1] js/custom: Starting '(' missing",
                errors.get(2));
        ValidationTestUtil.assertError("basicController.js [line 7, column 20] jslint: Missing semicolon",
                errors.get(3));
        ValidationTestUtil
                .assertError(
                        "basic.cmp [line 1, column 1] cmp/custom: Abstract component markup://validationTest:basic must be extensible",
                        errors.get(4));
    }
}
