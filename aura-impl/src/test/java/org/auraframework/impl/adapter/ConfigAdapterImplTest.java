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

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.TimeZone;

import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.test.UnitTestCase;
import org.auraframework.throwable.AuraRuntimeException;

/**
 * Tests for ConfigAdapterImpl.
 *
 *
 * @since 0.0.245
 */
public class ConfigAdapterImplTest extends UnitTestCase {

    // An exception thrown to test error handling.
    public static class MockException extends RuntimeException {
        public MockException(String string) {
            // TODO Auto-generated constructor stub
        }
    };

    // An AuraJavascriptGroup that fails compilation, and also that exists
    // when we're running from jars (when the normal AuraImplFiles don't
    // exist, so the normal group throws an IOException).
    public static class MockAuraJavascriptGroup extends AuraJavascriptGroup {
        private int count = 0;
        private File tempDir;

        public MockAuraJavascriptGroup(File tempDir) throws IOException {
            super(tempDir);
            this.tempDir = tempDir;
            count = 0;
        }
        
        @Override
        public boolean isStale() {
            count++;
            return (count % 2 == 1);  // stale first and third times only
        }

        @Override
        public void regenerate(File dir) throws IOException {
            if (count < 3) {
              // "compile errors" the first and second time.
              throw new MockException("Pretend we had a compile error in regeneration");
            }
            super.regenerate(tempDir);
        };
    }

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
                    version.matches("^\\d+\\.\\d+(\\.\\d+(_\\d+)?(-.*)?)?$"));
        }
        assertTrue(impl.getBuildTimestamp() > 0);
    }
    
    /**
     * Test regenerateAuraJS() functionality.  Note that in a resource/jar-based
     * environment, this is essentially a no-op because we never "regenerate,"
     * but the test makes a fake jsGroup which will still act as though it saw
     * an error (and should be handled as such). 
     */
    public void testRegenerateHandlesErrors() throws Exception {
        // The real case should work, of course:
        ConfigAdapterImpl impl = new ConfigAdapterImpl();
        impl.regenerateAuraJS();
               
        // But an error case should fail, and not be swallowed.
        final File tmpDir = File.createTempFile("ConfigAdapterImplTest", "tmp");
        File aura = null;
        File auraJs = null;
        try {
            aura = new File(tmpDir, "aura");
            auraJs = new File(aura, "Aura.js");
            tmpDir.delete();
            aura.mkdirs();
            auraJs.createNewFile();
            
            impl = new ConfigAdapterImpl() {
                @Override
                public AuraJavascriptGroup newAuraJavascriptGroup() throws IOException {
                    return new MockAuraJavascriptGroup(tmpDir);
                }
                @Override
                public boolean isProduction() {
                    return false;
                }
            };
            try {
                impl.regenerateAuraJS();
                fail("Compilation failure should have been caught!");
            } catch (AuraRuntimeException e) {
                assertTrue("expected ARTE caused by MockException, not " + e.getCause().toString(),
                        e.getCause() instanceof MockException);
            }
            // Try again, without changes; it should still fail.
            try {
                impl.regenerateAuraJS();
                fail("Second compilation failure should have been caught!");                
            } catch (AuraRuntimeException e2) {
                assertTrue("expected ARTE caused by MockException, not " + e2.getCause().toString(),
                        e2.getCause() instanceof MockException);
            }
            // Third time's the charm, we stop pretending there are errors and it should work.  Unless
            // we're in a resources-only environment, in which case the copying done after our
            // jsGroup.regenerate() can't work, even though the mock jsGroup.regenerate() will..  
            if (!AuraImplFiles.AuraResourceJavascriptDirectory.asFile().exists()) {
                impl.regenerateAuraJS();
            }
        } finally {
            if (auraJs.exists()) {
                auraJs.delete();
            }
            if (aura.exists()) {
                aura.delete();
            }
            if (tmpDir.exists()) {
                tmpDir.delete();
            }
        }
    }
}
