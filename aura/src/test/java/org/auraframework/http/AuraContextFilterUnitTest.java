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
package org.auraframework.http;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.system.AuraContext.Mode;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Maps;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

/**
 * Unit tests for AuraContextFilter
 */
public class AuraContextFilterUnitTest {

    @Test
    public void testConfigAdapterEnabled() throws Exception {
        assertTrue("modules should be enabled with config adapter enabled", isModulesEnabledSetup(true, null, null, Mode.PROD));
    }

    @Test
    public void testURLParamEnabledDEV() throws Exception {
        assertTrue("modules should be enabled with url param 1 in DEV", isModulesEnabledSetup(false, "1", null, Mode.DEV));
    }

    @Test
    public void testURLParamEnabledTrueDEV() throws Exception {
        assertTrue("modules should be enabled with url param 1 in DEV", isModulesEnabledSetup(false, "true", null, Mode.DEV));
    }

    @Test
    public void testURLParamEnabledYesDEV() throws Exception {
        assertTrue("modules should be enabled with url param 1 in DEV", isModulesEnabledSetup(false, "yes", null, Mode.DEV));
    }

    @Test
    public void testURLParamDisabledPROD() throws Exception {
        assertFalse("modules should not be enabled with url param 1 in DEV", isModulesEnabledSetup(false, "1", null, Mode.PROD));
    }

    @Test
    public void testConfigAdapterEnabledURLParamDisabledDEV() throws Exception {
        assertFalse("modules should not be enabled with url param other than 'truly' in DEV", isModulesEnabledSetup(true, "false", null, Mode.DEV));
    }

    @Test
    public void testConfigAdapterEnabledURLParamDisabledPROD() throws Exception {
        assertTrue("modules should be enabled with config adapter enabled in PROD", isModulesEnabledSetup(true, "0", null, Mode.PROD));
    }

    @Test
    public void testConfigAdapterDisabledURLParamDisabledPROD() throws Exception {
        assertFalse("modules should not be enabled with config adapter enabled in PROD", isModulesEnabledSetup(false, "true", null, Mode.PROD));
    }

    @Test
    public void testURLParamInvalidValue() throws Exception {
        assertFalse("modules should not be enabled with wrong url param value", isModulesEnabledSetup(false, "on", null, Mode.DEV));
    }

    @Test
    public void testConfigMapValidValue() throws Exception {
        assertTrue("modules should be enabled with config map (1)", isModulesEnabledSetup(false, null, 1, Mode.DEV));
    }

    @Test
    public void testConfigMapInvalidValue() throws Exception {
        assertFalse("modules should not be enabled with invalid (disabled) config map value", isModulesEnabledSetup(true, "0", true, Mode.DEV));
    }

    @Test
    public void testConfigMapFalse() throws Exception {
        assertFalse("modules should not be enabled with config map (false)", isModulesEnabledSetup(false, "1", false, Mode.PROD));
    }

    @Test
    public void testConfigMapWithoutModulesValue() throws Exception {
        assertFalse("modules should not be enabled with config map without modules value", isModulesEnabledSetup(false, "1", new HashMap<String, Object>(), Mode.PROD));
    }

    private boolean isModulesEnabledSetup(boolean configAdapterValue, String urlParamValue, Object configMapValue, Mode mode) {
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        Mockito.when(configAdapter.isModulesEnabled()).thenReturn(configAdapterValue);
        Mockito.when(request.getParameter(AuraServlet.AURA_PREFIX + "modules")).thenReturn(urlParamValue);
        
        AuraContextFilter contextFilter = new AuraContextFilter();
        contextFilter.setConfigAdapter(configAdapter);

        Map<String, Object> configMap = null;

        if (configMapValue != null) {
            if (configMapValue instanceof Map) {
                configMap = (Map<String, Object>) configMapValue;
            } else {
                configMap = Maps.newHashMap();
                configMap.put("m", configMapValue);
            }
        }

        return contextFilter.isModulesEnabled(request, configMap, mode);
    }
}