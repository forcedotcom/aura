/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.controller.java;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.MockConfigAdapter;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.AuraServlet;
import org.auraframework.system.Annotations.Key;

/**
 * Let tests adjust servlet configuration.
 * 
 * @since 0.0.178
 */
public class ServletConfigController {
    /**
     * Set the servlet production mode configuration. Don't forget to restore
     * config after test.
     * 
     * @param isProduction true/false
     */
    public static void setProductionConfig(@Key("isProduction") boolean isProduction) {
        getMockConfigAdapter().setIsProduction(isProduction);
        System.out.println("PROD : " + isProduction + " , " + Aura.getConfigAdapter().isProduction() + " - "
                + Aura.getConfigAdapter());
    }

    /**
     * Set the servlet isJar configuration. Don't forget to restore config after
     * test.
     * 
     * @param isAuraJSStatic true/false
     */
    public static void setIsAuraJSStatic(@Key("isAuraJSStatic") boolean isAuraJSStatic) {
        getMockConfigAdapter().setIsAuraJSStatic(isAuraJSStatic);
    }

    /**
     * Set the servlet application cache configuration. Don't forget to restore
     * config after test.
     * 
     * @param isDisabled true/false
     */
    public static Boolean setAppCacheDisabled(@Key("isDisabled") Boolean isDisabled) {
        String oldValue = System.getProperty(AuraServlet.DISABLE_APPCACHE_PROPERTY);
        if (isDisabled == null) {
            System.clearProperty(AuraServlet.DISABLE_APPCACHE_PROPERTY);
        } else {
            System.setProperty(AuraServlet.DISABLE_APPCACHE_PROPERTY, isDisabled.toString());
        }
        if (oldValue == null) {
            return null;
        } else {
            return Boolean.parseBoolean(oldValue);
        }
    }

    /**
     * Get the servlet's current last modification timestamp.
     */
    public static long getLastMod() throws Exception {
        return AuraBaseServlet.getLastMod();
    }

    public static long getBuildTimestamp() throws Exception {
        return Aura.getConfigAdapter().getBuildTimestamp();
    }

    public static void resetMocks() throws Exception {
        getMockConfigAdapter().reset();
    }

    public static MockConfigAdapter getMockConfigAdapter() {
        ConfigAdapter adapter = Aura.getConfigAdapter();
        if (adapter instanceof MockConfigAdapter) {
            return (MockConfigAdapter) adapter;
        }
        throw new Error("MockConfigAdapter is not configured!");
    }

    public static void main(String[] args) {
        setProductionConfig(true);
    }
}
