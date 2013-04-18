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
package org.auraframework.impl.adapter;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.TimeZone;

import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.test.UnitTestCase;
import org.auraframework.throwable.AuraRuntimeException;
import org.mockito.Mockito;

/**
 * Tests for ConfigAdapterImpl.
 * 
 * 
 * @since 0.0.245
 */
public class ConfigAdapterImplTest extends UnitTestCase {

    // An exception thrown to test error handling.
    public static class MockException extends RuntimeException {
        private static final long serialVersionUID = -8065118313848222864L;

        public MockException(String string) {
        }
    };

    /**
     * Make sure that version file is available in aura package. If this test
     * fails, then we have a build/packaging issue.
     */
    public void testVersionPropFile() throws Exception {
        String path = "/version.prop";
        InputStream stream = ConfigAdapterImpl.class.getResourceAsStream(path);
        Properties props = new Properties();
        props.load(stream);
        stream.close();
        String timestamp = (String) props.get("aura.build.timestamp");
        String timestampFormat = (String) props.get("aura.build.timestamp.format");
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
                    version.matches("^\\d+\\.\\d+(\\.\\d+(_\\d+)?(-.*)?)?$"));
        }
        assertTrue(impl.getBuildTimestamp() > 0);
    }

    /**
     * Test regenerateAuraJS() functionality. For failure testing, the test
     * makes a fake jsGroup which will still act as though it saw an error (and
     * should be handled as such).
     */
    public void testRegenerateHandlesErrors() throws Exception {
        // The real case should work, of course:
        ConfigAdapterImpl impl = new ConfigAdapterImpl();
        impl.regenerateAuraJS();
        assertTrue("Framework nonce should not be empty", impl.getAuraFrameworkNonce().length() > 0);

        // But an error case should fail, and not be swallowed.
        final AuraJavascriptGroup mockJsGroup = Mockito.mock(AuraJavascriptGroup.class);

        impl = new ConfigAdapterImpl() {
            @Override
            public AuraJavascriptGroup newAuraJavascriptGroup() throws IOException {
                return mockJsGroup;
            }

            @Override
            public boolean isProduction() {
                return false;
            }
        };
        try {
            Mockito.when(mockJsGroup.isStale()).thenReturn(true);
            Mockito.doThrow(new MockException("Pretend we had a compile error in regeneration")).when(mockJsGroup)
                    .regenerate(AuraImplFiles.AuraResourceJavascriptDirectory.asFile());
            impl.regenerateAuraJS();
            fail("Compilation failure should have been caught!");
        } catch (AuraRuntimeException e) {
            assertTrue("expected ARTE caused by MockException, not " + e.getCause().toString(),
                    e.getCause() instanceof MockException);
        }

        // Try again, without changes; it should still fail.
        try {
            Mockito.when(mockJsGroup.isStale()).thenReturn(false);
            impl.regenerateAuraJS();
            fail("Second compilation failure should have been caught!");
        } catch (AuraRuntimeException e2) {
            assertTrue("expected ARTE caused by MockException, not " + e2.getCause().toString(),
                    e2.getCause() instanceof MockException);
        }

        // Third time's the charm, we stop pretending there are errors and it
        // should work. Unless
        // we're in a resources-only environment, in which case the copying done
        // after our
        // jsGroup.regenerate() can't work, even though the mock
        // jsGroup.regenerate() will..
        if (!AuraImplFiles.AuraResourceJavascriptDirectory.asFile().exists()) {
            Mockito.reset(mockJsGroup);
            Mockito.when(mockJsGroup.isStale()).thenReturn(true);
            impl.regenerateAuraJS();
        }
    }
}
