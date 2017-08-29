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
package org.auraframework.impl.util;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.util.IOUtil;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

public class AuraUtilTest extends AuraImplTestCase {
    @Test
    public void testAuraUtil() {
        new AuraUtil();
    }

    @Test
    public void testImmutableSet() {
        Set<String> set = new HashSet<>();
        set.add("fee");
        set.add("fi");
        Set<String> immutableSet = AuraUtil.immutableSet(set);
        assertTrue(immutableSet instanceof ImmutableSet);
        assertEquals(2, immutableSet.size());
        try {
            immutableSet.add("fo");
            fail("Should have thrown UnsupportedOperationException");
        } catch (UnsupportedOperationException e) {
        }

        assertNotNull(AuraUtil.immutableSet(null));
    }

    @Test
    public void testImmutableList() {
        List<String> list = new ArrayList<>();
        list.add("fee");
        list.add("fi");
        List<String> immutableList = AuraUtil.immutableList(list);
        assertTrue(immutableList instanceof ImmutableList);
        assertEquals(2, immutableList.size());
        try {
            immutableList.add("fo");
            fail("Should have thrown UnsupportedOperationException");
        } catch (UnsupportedOperationException e) {
        }

        assertNotNull(AuraUtil.immutableList(null));
    }

    @Test
    @ThreadHostileTest("setting a system property")
    public void testAuraHomeInvalid() {
        String brokenHome = "/I/sure/hope/this/directory/never/exists/or/the/test/will/fail";
        String originalProp = System.getProperty("aura.home");
        try {
            System.setProperty("aura.home", brokenHome);
            String calculatedHome = AuraUtil.buildAuraHome();
            assertTrue(calculatedHome == null || !calculatedHome.equals(brokenHome));
        } finally {
            if (originalProp != null) {
                System.setProperty("aura.home", originalProp);
            } else {
                System.clearProperty("aura.home");
            }
        }
    }

    @Test
    @ThreadHostileTest("setting a system property")
    public void testAuraHomeDirectory() throws Exception {
        String tmpHome = IOUtil.newTempDir("testAuraHome");
        String canonicalTmpHome = new File(tmpHome).getCanonicalPath();
        String originalProp = System.getProperty("aura.home");
        try {
            System.setProperty("aura.home", tmpHome);
            String calculatedHome = AuraUtil.buildAuraHome();
            assertEquals(canonicalTmpHome, calculatedHome);
        } finally {
            if (originalProp != null) {
                System.setProperty("aura.home", originalProp);
            } else {
                System.clearProperty("aura.home");
            }
        }
    }

    @Test
    @ThreadHostileTest("setting a system property")
    public void testAuraHomeNoPropDoesntExplode() {
        String originalProp = System.getProperty("aura.home");
        try {
            System.clearProperty("aura.home");
            String calculatedHome = AuraUtil.buildAuraHome();
            if (calculatedHome != null) {
                assertTrue(new File(calculatedHome).isDirectory());
            }
        } finally {
            if (originalProp != null) {
                System.setProperty("aura.home", originalProp);
            }
        }
    }
}
