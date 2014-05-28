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
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.Callable;

import javax.annotation.concurrent.GuardedBy;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.common.collect.Maps;

/**
 * Get pooled WebDriver instances for Aura tests.
 * 
 * @since 0.0.178
 */
public class PooledRemoteWebDriverFactory extends RemoteWebDriverFactory {
    private final Map<String, Queue<PooledRemoteWebDriver>> pools = Maps.newConcurrentMap();

    public PooledRemoteWebDriverFactory(URL serverUrl) {
        super(serverUrl);
    }

    public class PooledRemoteWebDriver extends AdaptiveWebElementDriver {
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
            for (int i = 0; (getWindowHandles().size() > 1) && (i < 10); i++) {
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

        Queue<PooledRemoteWebDriver> pool = pools.get(toKeyWorkaround(capabilities));

        if (pool == null) {
            pool = new LinkedList<PooledRemoteWebDriver>();
            pools.put(toKeyWorkaround(capabilities), pool);
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

    /**
     * Using DesiredCapabilities as the key doesn't work if ChromeOptions are used, ChromeOptions.toJson() modifies the
     * object and after that equals() is broken. WebDriverUtilTest.testChromeOptionsIsFixed() will start failing once
     * this workaround is no longer needed
     */
    private static String toKeyWorkaround(DesiredCapabilities capabilities) {
        ChromeOptions options = (ChromeOptions) capabilities.getCapability(ChromeOptions.CAPABILITY);
        if (options == null) {
            return String.valueOf(capabilities.hashCode());
        }
        capabilities.setCapability(ChromeOptions.CAPABILITY, (ChromeOptions) null);
        String key;
        try {
            key = capabilities.hashCode() + ':' + options.toJson().toString();
        } catch (Exception e) {
            throw new RuntimeException(String.valueOf(capabilities));
        }
        capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        return key;
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
