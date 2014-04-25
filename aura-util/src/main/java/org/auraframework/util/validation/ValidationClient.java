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
package org.auraframework.util.validation;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

/**
 * Performs validation through http requests to the AuraValidationServlet.
 */
public final class ValidationClient {

    public static void main(String[] args) throws Exception {
        String path = args[0];
        String report = (args.length > 1) ? args[1] : null;
        if (report != null) {
            validate(path, report);
        } else {
            List<String> errors = validate(path);
            for (String error : errors) {
                System.out.println(error);
            }
        }
    }

    /**
     * Performs validation of all definitions found under path.
     * 
     * @return the errors found
     */
    public static List<String> validate(String path) throws Exception {
        return new ValidationClient(path, null, false).performValidation();
    }

    /**
     * Performs validation of all definitions found under path and writes the errors to report.
     */
    public static void validate(String path, String report) throws Exception {
        validate(path, report, false);
    }

    /**
     * Performs validation of all definitions found under path and writes the errors to report.
     * 
     * @param exit if true will exit the JVM running aura after writing the report
     */
    public static void validate(String path, String report, boolean exit) throws Exception {
        new ValidationClient(path, report, exit).performValidation();
    }

    //

    private final String path;
    private final String report;
    private final boolean exit;

    private ValidationClient(String path, String report, boolean exit) {
        this.path = path;
        this.report = report;
        this.exit = exit;
    }

    List<String> performValidation() throws Exception {
        String absolutePath = new File(path).getAbsolutePath();
        StringBuilder request = new StringBuilder();
        request.append("/qa/auraValidation?path=");
        request.append(URLEncoder.encode(absolutePath, "UTF-8"));
        if (report != null) {
            request.append("&report=");
            request.append(URLEncoder.encode(new File(report).getAbsolutePath(), "UTF-8"));
        }
        if (exit) {
            request.append("&exit=true");
        }

        String url = getBaseUrl().toURI().resolve(request.toString()).toString();
        log("connecting to Aura server at: " + url);

        int sleepSeconds = 10;
        for (int numTrials = 4; numTrials >= 0; numTrials--) {
            Reader reader = null;
            try {
                URLConnection connection = new URL(url).openConnection();
                reader = new InputStreamReader(connection.getInputStream());
                if (report != null) {
                    // errors only sent back if report is null
                    log(new BufferedReader(reader).readLine());
                    return null;
                } else {
                    return parseErrors(reader);
                }
            } catch (IOException e) {
                if (numTrials > 0) {
                    // wait for aura to start
                    log("sleeping " + sleepSeconds + " seconds waiting for Aura to start");
                    Thread.sleep(sleepSeconds * 1000);
                    sleepSeconds *= 2;
                    continue;
                }
                throw new IOException(e.toString() + ": " + url, e);
            } finally {
                if (reader != null) {
                    reader.close();
                }
            }
        }
        throw new RuntimeException("unreachable");
    }

    //

    private static List<String> parseErrors(Reader inputReader) throws IOException {
        BufferedReader reader = new BufferedReader(inputReader);
        List<String> errors = new ArrayList<String>();
        String line;
        while ((line = reader.readLine()) != null) {
            errors.add(line);
        }
        return errors;
    }

    private static URL getBaseUrl() throws MalformedURLException {
        int port = Integer.parseInt(System.getProperty("jetty.port", "9090"));
        String host = System.getProperty("jetty.host");
        if (host == null) {
            try {
                host = InetAddress.getLocalHost().getHostName();
            } catch (UnknownHostException e) {
                host = "localhost";
            }
        }
        return new URL("http", host, port, "/");
    }

    private static void log(String message) {
        System.out.println("ValidationClient: " + message);
    }
}
