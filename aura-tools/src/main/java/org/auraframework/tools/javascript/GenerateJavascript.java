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
package org.auraframework.tools.javascript;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Properties;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.source.AuraResourcesHashingGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.resource.CompiledGroup;
import org.auraframework.util.resource.HashingGroup;

/**
 * main method for generating aura framework javascript files
 */
public class GenerateJavascript {

    public static final Logger logger = Logger.getLogger(GenerateJavascript.class.getName());

    public static void main(String[] args) throws IOException {
        BasicConfigurator.configure(new ConsoleAppender(
                new PatternLayout("%d %5p [%t] (%F:%L) - %m%n")));
        
        // aura js
        logger.info("Generating framework javascript");
        AuraJavascriptGroup js = new AuraJavascriptGroup(null, false);
        // generate the js into this package, this one right here I say.
        File dest = AuraImplFiles.AuraResourceJavascriptDirectory.asFile();
        if (!dest.exists()) {
            dest.mkdirs();
        } else if (!dest.isDirectory()) {
            throw new IOException(dest.getPath() + " is supposed to be a directory");
        }
        logger.info("Parsing framework javascript");
        js.parse();
        logger.info("Generating scripts to " + dest);
        js.generate(dest, false);

        // Store the precomputed hash into a file.
        logger.info("Saving framework version to filesystem");
        Properties props = new Properties();
        props.setProperty(CompiledGroup.UUID_PROPERTY, js.getGroupHash().toString());
        props.setProperty(CompiledGroup.LASTMOD_PROPERTY, Long.toString(js.getLastMod()));

        File propertyFile = new File(dest, AuraJavascriptGroup.FILE_NAME);
        try (final FileWriter writer = new FileWriter(propertyFile)) {
            props.store(writer, "Aura framework version information by GenerateJavascript");
        }

        // resources
        // Create hashing group for aura resources. Doesn't need to parse or generate. Just hash it.
        HashingGroup resourceJs = new AuraResourcesHashingGroup(null, false);
        props = new Properties();
        props.setProperty(CompiledGroup.UUID_PROPERTY, resourceJs.getGroupHash().toString());
        props.setProperty(CompiledGroup.LASTMOD_PROPERTY, Long.toString(resourceJs.getLastMod()));
        propertyFile = new File(dest, AuraResourcesHashingGroup.FILE_NAME);
        try (final FileWriter writer = new FileWriter(propertyFile)) {
            logger.info("Saving resources version to filesystem");
            props.store(writer, "Aura resources version information by GenerateJavascript");
        }

        // No waiting for jvm to realize we're done.
        System.exit(0);
    }
}
