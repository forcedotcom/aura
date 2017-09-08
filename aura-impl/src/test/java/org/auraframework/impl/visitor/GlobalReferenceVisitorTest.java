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
package org.auraframework.impl.visitor;

import java.util.Map.Entry;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.system.Location;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Lists;

/**
 * A visitor class to extract labels from a set of definitions.
 */
public class GlobalReferenceVisitorTest extends UnitTestCase {
    @Test
    public void testMatchingEntryInserted() throws Exception {
        @SuppressWarnings("unchecked")
        Entry<DefDescriptor<?>, Definition> entry = Mockito.mock(Entry.class);
        PropertyReference pref = Mockito.mock(PropertyReference.class);
        PropertyReference stem = Mockito.mock(PropertyReference.class);
        String root = "blahDeDah";
        Location location = new Location("filename1", 0);
        Definition definition = Mockito.mock(Definition.class);
        @SuppressWarnings("unchecked")
        UsageMap<PropertyReference> usage = Mockito.mock(UsageMap.class);

        Mockito.when(pref.getLocation()).thenReturn(location);
        Mockito.when(pref.getStem()).thenReturn(stem);
        Mockito.when(pref.getRoot()).thenReturn(root);

        Mockito.when(definition.getPropertyReferences()).thenReturn(Lists.newArrayList(pref));

        Mockito.when(entry.getKey()).thenReturn(null);
        Mockito.when(entry.getValue()).thenReturn(definition);

        GlobalReferenceVisitor underTest = new GlobalReferenceVisitor(root);

        underTest.accept(usage, entry);
        Mockito.verify(usage, Mockito.times(1)).add(stem, location);
        Mockito.verifyNoMoreInteractions(usage);
    }

    @Test
    public void testNonMatchingEntryNotInserted() throws Exception {
        @SuppressWarnings("unchecked")
        Entry<DefDescriptor<?>, Definition> entry = Mockito.mock(Entry.class);
        PropertyReference pref = Mockito.mock(PropertyReference.class);
        PropertyReference stem = Mockito.mock(PropertyReference.class);
        String root = "blahDeDah";
        Location location = new Location("file", 0);
        Definition definition = Mockito.mock(Definition.class);
        @SuppressWarnings("unchecked")
        UsageMap<PropertyReference> usage = Mockito.mock(UsageMap.class);

        Mockito.when(pref.getLocation()).thenReturn(location);
        Mockito.when(pref.getStem()).thenReturn(stem);
        Mockito.when(pref.getRoot()).thenReturn("notroot");

        Mockito.when(definition.getPropertyReferences()).thenReturn(Lists.newArrayList(pref));

        Mockito.when(entry.getKey()).thenReturn(null);
        Mockito.when(entry.getValue()).thenReturn(definition);

        GlobalReferenceVisitor underTest = new GlobalReferenceVisitor(root);

        underTest.accept(usage, entry);
        Mockito.verifyNoMoreInteractions(usage);
    }

    @Test
    public void testMatchingEntryInsertedInDoubleEntry() throws Exception {
        @SuppressWarnings("unchecked")
        Entry<DefDescriptor<?>, Definition> entry = Mockito.mock(Entry.class);
        PropertyReference pref = Mockito.mock(PropertyReference.class);
        PropertyReference nmpref = Mockito.mock(PropertyReference.class);
        PropertyReference stem = Mockito.mock(PropertyReference.class);
        String root = "blahDeDah";
        Location location = new Location("file", 0);
        Definition definition = Mockito.mock(Definition.class);
        @SuppressWarnings("unchecked")
        UsageMap<PropertyReference> usage = Mockito.mock(UsageMap.class);

        Mockito.when(pref.getLocation()).thenReturn(location);
        Mockito.when(pref.getStem()).thenReturn(stem);
        Mockito.when(pref.getRoot()).thenReturn(root);

        Mockito.when(nmpref.getLocation()).thenReturn(null);
        Mockito.when(nmpref.getStem()).thenReturn(null);
        Mockito.when(nmpref.getRoot()).thenReturn("notroot");

        Mockito.when(definition.getPropertyReferences()).thenReturn(Lists.newArrayList(nmpref, pref));

        Mockito.when(entry.getKey()).thenReturn(null);
        Mockito.when(entry.getValue()).thenReturn(definition);

        GlobalReferenceVisitor underTest = new GlobalReferenceVisitor(root);

        underTest.accept(usage, entry);
        Mockito.verify(usage, Mockito.times(1)).add(stem, location);
        Mockito.verifyNoMoreInteractions(usage);
    }

    @Test
    public void testNullEntryValue() throws Exception {
        @SuppressWarnings("unchecked")
        Entry<DefDescriptor<?>, Definition> entry = Mockito.mock(Entry.class);
        @SuppressWarnings("unchecked")
        UsageMap<PropertyReference> usage = Mockito.mock(UsageMap.class);

        Mockito.when(entry.getKey()).thenReturn(null);
        Mockito.when(entry.getValue()).thenReturn(null);

        GlobalReferenceVisitor underTest = new GlobalReferenceVisitor("root");

        underTest.accept(usage, entry);
        Mockito.verifyNoMoreInteractions(usage);
    }
}
