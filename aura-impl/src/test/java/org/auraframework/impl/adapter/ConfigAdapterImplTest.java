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
package org.auraframework.impl.adapter;

import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.TimeZone;

import org.auraframework.test.UnitTestCase;

/**
 * Tests for ConfigAdapterImpl.
 *
 *
 * @since 0.0.245
 */
public class ConfigAdapterImplTest extends UnitTestCase {

    /**
     * Make sure that version file is available in aura package.
     * If this test fails, then we have a build/packaging issue.
     */
    public void testVersionPropFile() throws Exception {
        String path = "/version.prop";
        InputStream stream = ConfigAdapterImpl.class.getResourceAsStream(path);
        Properties props = new Properties();
        props.load(stream);
        stream.close();
        String timestamp = (String)props.get("aura.build.timestamp");
        String timestampFormat = (String)props.get("aura.build.timestamp.format");
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(timestampFormat);
        simpleDateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        simpleDateFormat.parse(timestamp).getTime();
    }

    /**
     * Test we can read the props as resources.
     */
    public void testConfigAdapterCtor() {
        ConfigAdapterImpl impl = new ConfigAdapterImpl();
        String version = impl.getAuraVersion();
        if (!version.equals("development")) {
            assertTrue("Unexpected version format: " + version,
                    version.matches("^\\d+\\.\\d+(\\.\\d+(_\\d+*)?(-.*)?)?$"));
        }
        assertTrue(impl.getBuildTimestamp() > 0);
    }
}
