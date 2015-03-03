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

import com.google.common.collect.Lists;
import com.google.gson.Gson;
import org.auraframework.impl.util.AuraImplFiles;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.logging.Logger;

public class CombineJavascriptLibraries {

    private static final Logger LOG = Logger.getLogger(CombineJavascriptLibraries.class.getName());
    private static final String CONFIG_FILE = "resources.json";

    public static void main(String[] args) throws IOException {
        CombineJavascriptLibraries process = new CombineJavascriptLibraries();
        process.generate();
    }

    /**
     * Combines files specified in resources config json and creates a non-minified
     * and minified version for every walltime timezone.
     *
     * Third party libraries should include "min" version along with non-minified in
     * its directory in aura-resources.
     */
    public void generate() throws IOException {

        LOG.info("Generating combined third party libraries resource files");

        Path resourcesSourceDir = Paths.get(AuraImplFiles.AuraResourcesSourceDirectory.getPath());
        Path destDir = Paths.get(AuraImplFiles.AuraResourcesClassDirectory.getPath());

        Path configPath = resourcesSourceDir.resolve(CONFIG_FILE);
        BufferedReader br = Files.newBufferedReader(configPath, StandardCharsets.UTF_8);
        Gson gson = new Gson();
        ResourcesConfig config = gson.fromJson(br, ResourcesConfig.class);

        List<String> devFiles = config.files;

        List<Path> minFiles = Lists.newArrayList();

        // create destination folder if doesn't already exist
        File destination = destDir.toFile();
        if (!destination.exists()) {
            destination.mkdirs();
        } else if (!destination.isDirectory()) {
            throw new IOException(destination.getPath() + " is supposed to be a directory");
        }

        StringBuilder outputDev = new StringBuilder();
        StringBuilder logging = new StringBuilder("Non minified version includes ");

        // calculate non-minified and minified paths
        for (String file : devFiles) {

            Path devPath = resourcesSourceDir.resolve(file);
            boolean devExists = Files.exists(devPath);

            String minFile = getMinFilePath(file);
            Path minPath = resourcesSourceDir.resolve(minFile);
            boolean minExists = Files.exists(minPath);

            if (!devExists && !minExists) {
                throw new IOException("Both " + file + " and " + minFile + " don't exist");
            }

            if (minExists) {
                minFiles.add(minPath);
                if (!devExists) {
                    devPath = minPath;
                }
            } else if (devExists) {
                minFiles.add(devPath);
            }

            // cache non minified output without walltime timezones
            outputDev.append(readFile(devPath)).append(System.lineSeparator()).append(";");
            logging.append(devPath.toString()).append(" ");
        }

        LOG.info(logging.toString());
        logging.setLength(0);

        StringBuilder outputMin = new StringBuilder();
        logging.append("Minified version includes ");
        for (Path minFile : minFiles) {
            // cache minified output
            outputMin.append(readFile(minFile)).append(System.lineSeparator()).append(";");
            logging.append(minFile.toString()).append(" ");
        }

        LOG.info(logging.toString());

        Path walltimeLocaleDirectory = resourcesSourceDir.resolve(config.walltimeLocaleDir);
        try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(walltimeLocaleDirectory)) {
            for (Path path : directoryStream) {
                String fileName = path.getFileName().toString();
                String ending = fileName.substring(fileName.indexOf("_"), fileName.length());
                int extIndex = ending.lastIndexOf(".");
                String timezone = ending.substring(0, extIndex);
                String tzContent = readFile(path);
                // include timezone code and with cached output
                StringBuilder dev = new StringBuilder(tzContent);
                StringBuilder min = new StringBuilder(tzContent);
                dev.append(System.lineSeparator()).append(";").append(outputDev);
                min.append(System.lineSeparator()).append(";").append(outputMin);
                // write both non-minified and minified files
                Files.write(destDir.resolve("libs" + timezone + ".js"), dev.toString().getBytes());
                Files.write(destDir.resolve("libs" + timezone + ".min.js"), min.toString().getBytes());
            }
        }

        // write versions without timezone code for "GMT"
        Files.write(destDir.resolve("libs.js"), outputDev.toString().getBytes());
        Files.write(destDir.resolve("libs.min.js"), outputMin.toString().getBytes());

        LOG.info("Finished generating resource files in " + destDir.toString());
    }

    /**
     * Reads file to String
     *
     * @param file Path to file
     * @return string contents
     * @throws IOException
     */
    private String readFile(Path file) throws IOException {
        StringBuilder buffer = new StringBuilder();
        if (Files.exists(file)) {
            try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    buffer.append(line).append(System.lineSeparator());
                }
            }
        }
        return buffer.toString();
    }

    /**
     * Returns minified file name given non-minified file name
     *
     * @param original file name
     * @return minified file name
     */
    public String getMinFilePath(String original) {
        int extIndex = original.lastIndexOf(".");
        return original.substring(0, extIndex) + ".min" + original.substring(extIndex);
    }

    /**
     * Class to represent JSON configuration
     */
    private class ResourcesConfig {
        public List<String> files = Lists.newArrayList();
        public String walltimeLocaleDir;
    }
}
