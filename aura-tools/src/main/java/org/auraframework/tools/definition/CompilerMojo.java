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

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.logging.Log;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerException;
import org.auraframework.tools.definition.RegistrySerializer.RegistrySerializerLogger;

/**
 * Goal compiles components into a static registry.
 *
 * This is a maven plugin.
 *
 * @goal compile-components
 * 
 * @phase process-classes
 * @phase process-test-classes
 * @requiresDependencyResolution runtime
 */
public class CompilerMojo extends AbstractMojo {
    /**
     * componentDirectory: The base directory for components.
     *
     * If the directory name is relative, it will be relative to the pom file location
     * This is the top level directory under which all namespaces are to be compiled.
     *
     * @parameter property="componentDirectory"
     * @required
     */
    private File componentDirectory;

    /**
     * outputDirectory: The directory in which to put out the .registries file.
     *
     * If the directory name is relative, it will be relative to the pom file location
     * This is the top level directory under which all namespaces are to be compiled.
     * The output is always put in a file called '.registries' inside this directory.
     *
     * @parameter property="outputDirectory"
     * @required
     */
    private File outputDirectory;

    /**
     * excluded: Namespaces to exclude.
     *
     * This is an optional set of namespaces to exclude.
     *
     * @parameter property="excluded"
     * @optional
     */
    private String[] excluded;

    /**
     * Create an empty compiler instance.
     *
     * With this constructor, the caller is required to set the various parameters by some sort of
     * magic. This is used by the maven plugin manager to create and populate fields.
     */
    public CompilerMojo() { }

    /**
     * The entry point for the maven plugin.
     */
    @Override
    public void execute() throws MojoExecutionException {
        Logger logger = new Logger(this.getLog());
        RegistrySerializer rs = new RegistrySerializer(componentDirectory, outputDirectory, excluded, logger);
        try {
            rs.execute();
        } catch (RegistrySerializerException rse) {
            throw new MojoExecutionException(rse.getMessage(), rse.getCause());
        }
    }

    private static class Logger implements RegistrySerializerLogger {
        private final Log mojoLogger;

        public Logger(Log mojoLogger) {
            this.mojoLogger = mojoLogger;
        }

        @Override
        public void error(CharSequence loggable) {
            mojoLogger.error(loggable);
        }

        @Override
        public void error(CharSequence loggable, Throwable cause) {
            mojoLogger.error(loggable, cause);
        }

        @Override
        public void error(Throwable cause) {
            mojoLogger.error(cause);
        }

        @Override
        public void warning(CharSequence loggable) {
            mojoLogger.warn(loggable);
        }

        @Override
        public void warning(CharSequence loggable, Throwable cause) {
            mojoLogger.warn(loggable, cause);
        }

        @Override
        public void warning(Throwable cause) {
            mojoLogger.warn(cause);
        }

        @Override
        public void info(CharSequence loggable) {
            mojoLogger.info(loggable);
        }

        @Override
        public void info(CharSequence loggable, Throwable cause) {
            mojoLogger.info(loggable, cause);
        }

        @Override
        public void info(Throwable cause) {
            mojoLogger.info(cause);
        }

        @Override
        public void debug(CharSequence loggable) {
            mojoLogger.debug(loggable);
        }

        @Override
        public void debug(CharSequence loggable, Throwable cause) {
            mojoLogger.debug(loggable, cause);
        }

        @Override
        public void debug(Throwable cause) {
            mojoLogger.debug(cause);
        }
    }
}
