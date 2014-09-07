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

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.auraframework.component.AuraComponentTestBuilder;
import org.auraframework.def.ComponentDef;
import org.auraframework.test.UnitTestCase;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerException;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerLogger;

import com.google.common.collect.Lists;

public class RegistrySerializerTest extends UnitTestCase {
    AuraComponentTestBuilder actb;

    public RegistrySerializerTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        actb = new AuraComponentTestBuilder();
    }

    @Override
    public void tearDown() throws Exception {
        actb.close();
        super.tearDown();
    }

    public void testNullOutput() {
        RegistrySerializer rs = new RegistrySerializer(null, actb.getComponentsPath().toFile(), null, null);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            assertEquals(mee.getMessage(), RegistrySerializer.ERR_ARGS_REQUIRED);
        }
    }

    public void testComponentDirIsFile() throws Exception {
        Path path = Files.createTempFile("badOutput", "foo");
        RegistrySerializer rs = new RegistrySerializer(path.toFile(), actb.getComponentsPath().toFile(), null, null);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            assertTrue("Expected error about component directory: "+mee.getMessage(),
                    mee.getMessage().startsWith("Component directory is not a directory:"));
        }
    }

    public void testOutputDirIsFile() throws Exception {
        Path path = Files.createTempFile("badOutput", "foo");
        RegistrySerializer rs = new RegistrySerializer(actb.getComponentsPath().toFile(), path.toFile(), null, null);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            assertTrue("Expected error about output directory: "+mee.getMessage(),
                    mee.getMessage().startsWith("Output directory is not a directory:"));
        }
    }

    public void testOutputValid() throws Exception {
        TestLogger logger = new TestLogger();
        Path compPath = actb.getComponentsPath();
        String ns = actb.getNewNamespace();
        actb.getNewObject(ns, ComponentDef.class, "<aura:component />");
        actb.installComponentLocationAdapter();
        RegistrySerializer rs = new RegistrySerializer(compPath.toFile(), compPath.toFile(), null, logger);
        try {
            rs.execute();
        } catch (RegistrySerializerException mee) {
            // Whoops.
            System.out.println(logger.getLogEntries());
            fail("Got exception "+mee.getMessage());
        }
        assertEquals("Error logs should be empty", 0, logger.getErrorLogEntries().size());
    }

    public void testOutputInvalid() throws Exception {
        TestLogger logger = new TestLogger();
        Path compPath = actb.getComponentsPath();
        String ns = actb.getNewNamespace();
        // deliberate missing component
        actb.getNewObject(ns, ComponentDef.class, "<aura;component><aura:IDontExistReallyReally /></aura:component>");
        actb.installComponentLocationAdapter();
        RegistrySerializer rs = new RegistrySerializer(compPath.toFile(), compPath.toFile(), null, logger);
        try {
            rs.execute();
            fail("We should fail to execute with an error");
        } catch (RegistrySerializerException mee) {
            assertEquals("one or more errors occurred during compile", mee.getMessage());
        }
        System.out.println(logger.getErrorLogEntries());
        assertEquals("Error logs should be empty", 1, logger.getErrorLogEntries().size());
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
