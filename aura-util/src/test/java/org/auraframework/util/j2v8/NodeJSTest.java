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

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Future;
import java.util.concurrent.FutureTask;

import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.junit.Test;

import com.eclipsesource.v8.JavaVoidCallback;
import com.eclipsesource.v8.NodeJS;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;

/**
 * Verifies NodeJS can be used in Aura plus usage examples
 */
public class NodeJSTest extends UnitTestCase {

    // basic

    @Test
    public void testUseNodeJS() throws Exception {
        String NODE_SCRIPT = "" + "var path = require('path');\n" + "javaCallback(path.dirname('/foo/file.js'));";

        JavaVoidCallback javaCallback = new JavaVoidCallback() {
            @Override
            public void invoke(final V8Object receiver, final V8Array parameters) {
                String dirname = parameters.getString(0);
                assertEquals("/foo", dirname);
            }
        };

        NodeJS nodeJS = J2V8Util.createNodeJS();
        nodeJS.getRuntime().registerJavaMethod(javaCallback, "javaCallback");
        nodeJS.exec(createTempScriptFile(NODE_SCRIPT, "useNodeJS"));

        while (nodeJS.isRunning()) {
            nodeJS.handleMessage();
        }
        nodeJS.release();
    }

    // profile

    @Ignore("may flap")
    @Test
    public void testProfile() throws Exception {
        File quickSortJS = getResourceFile("/testdata/j2v8/quickSort.js");

        // execute using J2V8 NodeJS
        long startNanos = System.nanoTime();
        NodeJS nodeJS = J2V8Util.createNodeJS();
        nodeJS.exec(quickSortJS);
        while (nodeJS.isRunning()) {
            nodeJS.handleMessage();
        }
        nodeJS.release();
        long elapsedMillisJ2V8 = (System.nanoTime() - startNanos) / 1000000;

        // execute using command line node
        ProcessBuilder processBuilder = new ProcessBuilder(findPathToNode(), quickSortJS.getAbsolutePath());

        startNanos = System.nanoTime();
        Process process = processBuilder.start();
        assertEquals(0, process.waitFor());
        long elapsedMillisNode = (System.nanoTime() - startNanos) / 1000000;

        double ratio = (1.0d * elapsedMillisJ2V8) / elapsedMillisNode;
        System.out.println("NodeJSTest.testProfile(): ratio = " + ratio);
        if (ratio > 1.5) {
            fail("J2V8 NodeJS is slower than plain node: " + ratio);
        }
    }

    // parallel

    @Test
    @Ignore("flaps and breaks build")
    public void testUseManyInParallel() throws Exception {
        final int numParallel = 100;
        List<Future<Integer>> futures = new ArrayList<>();
        CountDownLatch countDownLatch = new CountDownLatch(numParallel + 1);
        CountDownLatch memoryCheckLatch = new CountDownLatch(numParallel);

        class NodeJSCallable implements Callable<Integer> {
            private final int num;

            NodeJSCallable(int num) {
                this.num = num;
            }

            @Override
            public Integer call() {
                try {
                    NodeJS nodeJS = J2V8Util.createNodeJS();
                    nodeJS.exec(createTempScriptFile("global.tmpvar = " + num + ';', "useManyInParallel" + num));
                    // block threads here until all running
                    memoryCheckLatch.countDown();
                    countDownLatch.countDown();
                    countDownLatch.await();
                    while (nodeJS.isRunning()) {
                        nodeJS.handleMessage();
                    }
                    return nodeJS.getRuntime().getInteger("tmpvar");
                } catch (Exception x) {
                    // countdown to avoid test to hang on errors
                    memoryCheckLatch.countDown();
                    countDownLatch.countDown();
                    return -1;
                }
            }
        }

        // create and start all threads
        for (int i = 0; i < numParallel; i++) {
            FutureTask<Integer> future = new FutureTask<>(new NodeJSCallable(i));
            futures.add(future);
            new Thread(future).start();
        }

        memoryCheckLatch.await(); // wait for all NodeJS runtimes to be running
        // breakpoint in next line to see memory used with all NodeJS runtimes
        // up
        // (as of J2V8 version 4.6.0 each NodeJS runtime takes 6MB)
        countDownLatch.countDown(); // let all threads continue

        // verify results
        for (int i = 0; i < numParallel; i++) {
            assertEquals(new Integer(i), futures.get(i).get());
        }
    }

    @Test
    public void testExecuteScript() {
        NodeJS nodeJS = J2V8Util.createNodeJS();
        V8 v8 = nodeJS.getRuntime();
        int result = v8
                .executeIntegerScript("" + "var hello = 'hello, ';\n" + "var world = 'world!';\n" + "hello.length;\n");
        assertEquals(7, result);
    }

    // util

    private static File createTempScriptFile(final String script, final String name) throws IOException {
        File file = File.createTempFile(name, ".js.tmp");
        file.deleteOnExit();
        try (PrintWriter writer = new PrintWriter(file, "UTF-8")) {
            writer.print(script);
        }
        return file;
    }
    
    private static String findPathToNode() {
        String path = System.getProperty("aura.home");
        if (path == null) {
            URL loaded = NodeJSTest.class.getResource("/" + NodeJSTest.class.getName().replace('.', '/') + ".class");
            if ("file".equals(loaded.getProtocol())) {
                String temp = loaded.getPath();
                temp = temp.substring(0, temp.indexOf("/target/test-classes/"));
                path = temp.substring(0, temp.lastIndexOf("/"));
            }
        } else {
            try {
                // try to clean up any provided path
                path = new File(path).getCanonicalPath();
            } catch (IOException e) {
                throw new RuntimeException("Invalid aura.home: " + path, e);
            }
        }
        File pathToNode = new File(path, "node/node");
        if (!pathToNode.exists()) {
            throw new RuntimeException("node not found in " + pathToNode.getAbsolutePath());
        }
        return pathToNode.getAbsolutePath();
    }

}
