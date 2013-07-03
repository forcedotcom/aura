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

import java.net.URL;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Scanner;
import java.util.concurrent.Callable;

import javax.annotation.concurrent.GuardedBy;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Get pooled WebDriver instances for Aura tests.
 * 
 * @since 0.0.178
 */
public class PooledRemoteWebDriverFactory extends RemoteWebDriverFactory {
    private final Map<DesiredCapabilities, Queue<PooledRemoteWebDriver>> pools = Maps.newConcurrentMap();

    public PooledRemoteWebDriverFactory(URL serverUrl) {
        super(serverUrl);
    }

    public class PooledRemoteWebDriver extends RemoteWebDriver {
        /**
         * The pool containing this web driver instance.
         */
        @GuardedBy("PooledRemoteWebDriverFactory.this")
        private final Collection<PooledRemoteWebDriver> pool;

        public PooledRemoteWebDriver(Collection<PooledRemoteWebDriver> pool, URL serverUrl,
                DesiredCapabilities capabilities) {
            super(serverUrl, capabilities);
            this.pool = pool;
        }

        // append a query param to avoid possible browser caching of pages
        @Override
        public void get(String url) {
            // save any fragment
            int hashLoc = url.indexOf('#');
            String hash = "";
            if (hashLoc >= 0) {
                hash = url.substring(hashLoc);
                url = url.substring(0, hashLoc);
            }

            // strip query string
            int qLoc = url.indexOf('?');
            String qs = "";
            if (qLoc >= 0) {
                qs = url.substring(qLoc + 1);
                url = url.substring(0, qLoc);
            }

            List<NameValuePair> newParams = Lists.newArrayList();
            URLEncodedUtils.parse(newParams, new Scanner(qs), "UTF-8");

            // update query with a nonce

            newParams.add(new BasicNameValuePair("browser.nonce", String.valueOf(System.currentTimeMillis())));

            url = url + "?" + URLEncodedUtils.format(newParams, "UTF-8") + hash;

            super.get(url);
        }

        @Override
        public void close() {
            // don't close the final window; otherwise, we can't reuse it
            if (getWindowHandles().size() > 1) {
                super.close();
            }
        }

        private void dismissAlerts() {
            try {
                // if more than 10 alerts, something must be wrong
                for (int i = 0; i < 10; i++) {
                    switchTo().alert().accept();
                }
            } catch (Throwable t) {
                // all alerts are now dismissed
            }
        }

        @Override
        public void quit() {
            dismissAlerts();
            // close up to 10 windows, except the final window
            for (int i = 0; (getWindowHandles().size() > 1) && (i < 10); i--) {
                super.close();
                dismissAlerts();
            }

            // cleanup domain cookies (hopefully you're not on an external site)
            manage().deleteAllCookies();

            synchronized (PooledRemoteWebDriverFactory.this) {
                // return to pool
                pool.add(this);
            }
        }

        private void superQuit() {
            super.quit();
        }
    }

    @Override
    public synchronized WebDriver get(final DesiredCapabilities capabilities) {
        // default to use a pooled instance unless the test explicitly requests a brand new instance
        Object reuseBrowser = capabilities.getCapability(WebDriverProvider.REUSE_BROWSER_PROPERTY);
        if ((reuseBrowser != null) && (reuseBrowser.equals(false))) {
            return super.get(capabilities);
        }

        Queue<PooledRemoteWebDriver> pool = pools.get(capabilities);

        if (pool == null) {
            pool = new LinkedList<PooledRemoteWebDriver>();
            pools.put(capabilities, pool);
        }

        if (pool.size() > 0) {
            return pool.poll();
        } else {
            final Queue<PooledRemoteWebDriver> thisPool = pool;
            return retry(new Callable<WebDriver>() {
                @Override
                public WebDriver call() throws Exception {
                    return new PooledRemoteWebDriver(thisPool, serverUrl, capabilities);
                }
            }, MAX_GET_RETRIES, "Failed to get a new PooledRemoteWebDriver");
        }
    }

    @Override
    public synchronized void release() {
        for (Queue<PooledRemoteWebDriver> pool : pools.values()) {
            PooledRemoteWebDriver driver = pool.poll();
            while (driver != null) {
                driver.superQuit();
                driver = pool.poll();
            }
        }
    }
}
