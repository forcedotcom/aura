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
package org.auraframework.tools.definition;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.service.ContextService;
import org.auraframework.service.RegistryService;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerException;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerLogger;
import org.auraframework.util.IOUtil;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;

import com.google.common.collect.Lists;


public class RegistrySerializerTest extends UnitTestCase {
    @Inject
    private RegistryService registryService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private ContextService contextService;

    private void makeFile(File namespace, String name, String extension, String contents) throws Exception {
        File dir = new File(namespace, name);
        File file = new File(dir, name+extension);
        dir.mkdirs();
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(contents.getBytes("UTF-8"));
            fos.close();
        }
    }

    private File createLoaderContents() throws Exception {
        File tmpDir = new File(IOUtil.newTempDir("registrySerializerTest"));

        File testNamespace = new File(tmpDir, "test");

        makeFile(testNamespace, "parent", ".cmp", "<aura:component />");
        makeFile(testNamespace, "anevent", ".evt", "<aura:event type='APPLICATION' />");
        makeFile(testNamespace, "aninterface", ".intf", "<aura:interface />");

        return tmpDir;
    }

    @Test
    public void testNullOutput() throws Exception {
        RegistrySerializer rs = new RegistrySerializer(registryService, configAdapter, null,
                createLoaderContents(), null, null, contextService, false);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            assertEquals(mee.getMessage(), RegistrySerializer.ERR_ARGS_REQUIRED);
        }
    }

    @Test
    public void testComponentDirIsFile() throws Exception {
        File dir = new File(IOUtil.newTempDir("componentDirIsFile"));
        File file = new File(dir, "foo");
        file.createNewFile();
        RegistrySerializer rs = new RegistrySerializer(registryService, configAdapter,
                file, createLoaderContents(), null, null, contextService, false);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            assertTrue("Expected error about component directory: "+mee.getMessage(),
                    mee.getMessage().startsWith("Component directory is not a directory:"));
        }
    }

    @Test
    public void testOutputDirIsFile() throws Exception {
        Path path = Files.createTempFile("badOutput", "foo");
        RegistrySerializer rs = new RegistrySerializer(registryService, configAdapter,
                createLoaderContents(), path.toFile(), null, null, contextService, false);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            assertTrue("Expected error about output directory: "+mee.getMessage(),
                    mee.getMessage().startsWith("Output directory is not a directory:"));
        }
    }

    @Test
    public void testOutputValid() throws Exception {
        TestLogger logger = new TestLogger();
        File compPath = createLoaderContents();
        RegistrySerializer rs = new RegistrySerializer(registryService, configAdapter,
                compPath, compPath, null, logger, contextService, false);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            // Whoops.
            System.out.println(logger.getLogEntries());
            fail("Got exception "+mee.getMessage());
        }
        assertEquals("Error logs should be empty", 0, logger.getErrorLogEntries().size());
    }

    @Test
    public void testOutputInvalid() throws Exception {
        TestLogger logger = new TestLogger();
        File compPath = createLoaderContents();
        makeFile(new File(compPath, "testFail"), "broken", ".cmp", 
                "<aura;component><aura:IDontExistReallyReally /></aura:component>");
        RegistrySerializer rs = new RegistrySerializer(registryService, configAdapter,
                compPath, compPath, null, logger, contextService, false);
        RegistrySerializerException expected = null;

        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            expected = mee;
        }
        assertNotNull("We should fail to execute with an error", expected);
        assertEquals("one or more errors occurred during compile", expected.getMessage());
        System.out.println(logger.getErrorLogEntries());
        assertEquals("There should be one error", 1, logger.getErrorLogEntries().size());
    }

    public enum LoggerLevel { ERROR, WARN, INFO, DEBUG};

    private static class TestLoggerEntry {
        public final LoggerLevel level;
        public final String message;
        public final Throwable cause;

        public TestLoggerEntry(LoggerLevel level, String message, Throwable cause) {
            this.level = level;
            this.message = message;
            this.cause = cause;
        }

        @Override
        public String toString() {
            return level+":"+message+", Caused by "+cause;
        }
    }

    private static class TestLogger implements RegistrySerializerLogger {
        private List<TestLoggerEntry> entries = Lists.newArrayList();

        @Override
        public void error(CharSequence loggable) {
            entries.add(new TestLoggerEntry(LoggerLevel.ERROR, loggable.toString(), null));
        }

        @Override
        public void error(CharSequence loggable, Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.ERROR, loggable.toString(), cause));
        }

        @Override
        public void error(Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.ERROR, null, cause));
        }

        @Override
        public void warning(CharSequence loggable) {
            entries.add(new TestLoggerEntry(LoggerLevel.WARN, loggable.toString(), null));
        }

        @Override
        public void warning(CharSequence loggable, Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.WARN, loggable.toString(), cause));
        }

        @Override
        public void warning(Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.WARN, null, cause));
        }

        @Override
        public void info(CharSequence loggable) {
            entries.add(new TestLoggerEntry(LoggerLevel.INFO, loggable.toString(), null));
        }

        @Override
        public void info(CharSequence loggable, Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.INFO, loggable.toString(), cause));
        }

        @Override
        public void info(Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.INFO, null, cause));
        }

        @Override
        public void debug(CharSequence loggable) {
            entries.add(new TestLoggerEntry(LoggerLevel.DEBUG, loggable.toString(), null));
        }

        @Override
        public void debug(CharSequence loggable, Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.DEBUG, loggable.toString(), cause));
        }

        @Override
        public void debug(Throwable cause) {
            entries.add(new TestLoggerEntry(LoggerLevel.DEBUG, null, cause));
        }

        public List<TestLoggerEntry> getErrorLogEntries() {
            List<TestLoggerEntry> errors = Lists.newArrayList();

            for (TestLoggerEntry tle : entries) {
                if (tle.level == LoggerLevel.ERROR) {
                    errors.add(tle);
                }
            }
            return errors;
        }

        public List<TestLoggerEntry> getLogEntries() {
            return entries;
        }
    }
}
