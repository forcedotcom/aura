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
package org.auraframework.impl.util;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.auraframework.impl.AuraImplTestCase;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

public class AuraUtilTest extends AuraImplTestCase {

    public AuraUtilTest(String name) {
        super(name);
    }

    public void testAuraUtil() {
        new AuraUtil();
    }

    public void testImmutableSet() {
        Set<String> set = new HashSet<String>();
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

    public void testImmutableList() {
        List<String> list = new ArrayList<String>();
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

}
