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
package org.auraframework.test;

import java.net.Socket;

import org.apache.log4j.Logger;
import org.openqa.grid.selenium.GridLauncher;

/**
 * Get WebDriver instances for Aura tests.
 * 
 * 
 * @since 0.0.94
 */
public class SeleniumServerLauncher {
    private static String browsers = "-browser browserName=chrome,maxInstances=%1$s -browser browserName=firefox,maxInstances=%1$s";

    public static void main(String args[]) throws Exception {
        final String host = "localhost";
        final int serverPort = Integer.parseInt(args[0]);
        start(host, serverPort);
    }

    public static void start(String host, int serverPort) throws Exception {
        Logger logger = Logger.getLogger(SeleniumServerLauncher.class.getName());

        logger.info("Launching Selenium server on port " + serverPort);
        GridLauncher.main(String.format("-port %s %s", serverPort, String.format(browsers, TestExecutor.NUM_THREADS + 2))
                .split(" "));
        logger.info("Waiting for server to open port");
        waitForServer(host, serverPort);

        // Don't need to startup a grid as of now
        //
        // logger.info("Launching Selenium grid hub on port " + serverPort);
        // GridLauncher.main(String.format("-port %s -role hub",
        // serverPort).split(" "));
        // logger.info("Waiting for hub to open port");
        // waitForPortOpen(host, serverPort);
        //
        // logger.info("Launching Selenium grid node on port " + nodePort);
        // logger.info("chrome driver location: " +
        // System.getProperty("webdriver.chrome.driver"));
        // GridLauncher.main(String.format("-port %s -role webdriver -hub http://%s:%s/grid/register %s",
        // nodePort,
        // host, serverPort, browsers).split(" "));
        // logger.info("Waiting for node to open port");
        // waitForPortOpen(host, nodePort);
        // Thread.sleep(1000);
    }

    // just check if port is listening
    private static void waitForServer(String host, int port) {
        boolean isUp = false;
        for (int tries = 0; !isUp && tries < 10; tries++) {
            try {
                new Socket(host, port);
                isUp = true;
            } catch (Exception e) {
            }
            ;
        }
        if (!isUp) {
            throw new Error(String.format("Failed to open socket to port %d", port));
        }
    }
}
