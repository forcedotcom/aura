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

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.auraframework.impl.util.AuraImplFiles;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.ibm.icu.util.TimeZone;

public class CombineJavascriptLibraries {

    private static final Logger LOG = Logger.getLogger(CombineJavascriptLibraries.class.getName());
    private static final String CONFIG_FILE = "resources.json";

    public static void main(String[] args) throws IOException {
        CombineJavascriptLibraries process = new CombineJavascriptLibraries();
        process.generate();
    }

    /**
     * Combines files specified in resources config json and creates a non-minified and minified version for every
     * walltime timezone.
     * 
     * Third party libraries should include "min" version along with non-minified in its directory in aura-resources.
     */
    public void generate() throws IOException {

        LOG.info("Generating combined third party libraries resource files");

        Path resourcesSourceDir = Paths.get(AuraImplFiles.AuraResourcesSourceDirectory.getPath());
        Path destDir = Paths.get(AuraImplFiles.AuraResourcesClassDirectory.getPath());

        Path configPath = resourcesSourceDir.resolve(CONFIG_FILE);
        BufferedReader br = Files.newBufferedReader(configPath, StandardCharsets.UTF_8);
        Gson gson = new Gson();
        ResourcesConfig config = gson.fromJson(br, ResourcesConfig.class);
        List<String> existingTimezones = Lists.newArrayList();

         // Create destination folder if doesn't already exist
        File destination = destDir.toFile();
        if (!destination.exists()) {
            destination.mkdirs();
        } else if (!destination.isDirectory()) {
            throw new IOException(destination.getPath() + " is supposed to be a directory");
        }

        Path walltimeLocaleDirectory = resourcesSourceDir.resolve(config.walltimeLocaleDir);
        try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(walltimeLocaleDirectory)) {
            for (Path path : directoryStream) {
                String fileName = path.getFileName().toString();
                if (!fileName.endsWith(".js")) {
                    continue;
                }
                String ending = fileName.substring(fileName.indexOf("_"), fileName.length());
                int extIndex = ending.lastIndexOf(".");
                String timezone = ending.substring(1, extIndex);
                if (timezone.endsWith(".min")) {
                    // skip minified files to prevent duplicates
                    continue;
                }

                existingTimezones.add(timezone.replace("-", "/"));
            }
        }
        
        LOG.info("Generating equivalent timezones json");
        String timezonesJson = generateEquivalentTimezonesJson(existingTimezones, gson);
        Files.write(destDir.resolve("timezones.json"), timezonesJson.getBytes());
        LOG.info("Finished generating resource files in " + destDir.toString());
    }

    private String generateEquivalentTimezonesJson(List<String> existingTimezones, Gson gson) {
        Map<String, String> mapped = Maps.newHashMap();
        for (String existingTimezone : existingTimezones) {
            mapped.put(existingTimezone, existingTimezone);
        }
        // map equivalents
        for (String timezone : TimeZone.getAvailableIDs()) {
            if (!existingTimezones.contains(timezone)) {
                continue;
            }
            int equivalentCount = TimeZone.countEquivalentIDs(timezone);
            for (int i = 0; i < equivalentCount; i++) {
                String alternateId = TimeZone.getEquivalentID(timezone, i);
                if (!mapped.containsKey(alternateId)) {
                    mapped.put(alternateId, timezone);
                }
            }
        }
        mapped.put("GMT", "GMT");
        return gson.toJson(mapped);
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
        public String walltimeLocaleDir;
    }
}
