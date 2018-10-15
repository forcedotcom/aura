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

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anEmptyMap;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.sameInstance;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.auraframework.adapter.GlobalValueProviderAdapter;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.hamcrest.Matchers;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import com.google.common.collect.ImmutableList;

/**
 * Unit test for {@link GlobalValueProviderFactoryImpl}.
 * 
 * @author eperret (Eric Perret)
 */
@RunWith(MockitoJUnitRunner.class)
public class GlobalValueProviderFactoryImplTest {
    
    @Mock
    private GlobalValueProviderAdapter primaryGlobalValueProviderAdapter;
    
    @Mock
    private GlobalValueProviderAdapter globalValueProviderAdapter1;
    
    @Mock
    private GlobalValueProviderAdapter globalValueProviderAdapter2;
    
    @Mock
    private GlobalValueProviderAdapter globalValueProviderAdapter3;
    
    private GlobalValueProviderFactoryImpl globalValueProviderFactoryImpl;

    private static GlobalValueProvider buildGlobalValueProvider(final String keyPrefix) {
        final ValueProviderType valueProviderType = mock(ValueProviderType.class);
        when(valueProviderType.getPrefix()).thenReturn(keyPrefix);
        final GlobalValueProvider provider1 = mock(GlobalValueProvider.class);
        when(provider1.getValueProviderKey()).thenReturn(valueProviderType);
        return provider1;
    }
    
    /**
     * Test method for {@link GlobalValueProviderFactoryImpl#getGlobalProviders()}.
     */
    @SuppressWarnings("unchecked")
    @Test
    public void testGetGlobalProviders() {
        
        final List<GlobalValueProviderAdapter> globalValueProviderAdapters = ImmutableList.of(globalValueProviderAdapter1, globalValueProviderAdapter2, globalValueProviderAdapter3);
        
        globalValueProviderFactoryImpl = new GlobalValueProviderFactoryImpl(primaryGlobalValueProviderAdapter, globalValueProviderAdapters);

        final GlobalValueProvider provider1 = buildGlobalValueProvider("key1");
        final GlobalValueProvider provider2 = buildGlobalValueProvider("key2");
        final GlobalValueProvider provider3 = buildGlobalValueProvider("key3");
        
        final GlobalValueProvider provider11 = buildGlobalValueProvider("key11");
        final GlobalValueProvider provider12 = buildGlobalValueProvider("key12");
        final GlobalValueProvider provider13 = buildGlobalValueProvider("key13");
        
        final GlobalValueProvider provider21 = buildGlobalValueProvider("key21");
        final GlobalValueProvider provider22 = buildGlobalValueProvider("key22");
        final GlobalValueProvider provider23 = buildGlobalValueProvider("key23");
        
        final GlobalValueProvider provider31 = buildGlobalValueProvider("key31");
        final GlobalValueProvider provider32 = buildGlobalValueProvider("key32");
        final GlobalValueProvider provider33 = buildGlobalValueProvider("key33");
        
        when(primaryGlobalValueProviderAdapter.createValueProviders()).thenReturn(ImmutableList.of(provider1, provider2, provider3));
        when(globalValueProviderAdapter1.createValueProviders()).thenReturn(ImmutableList.of(provider11, provider12, provider13));
        when(globalValueProviderAdapter2.createValueProviders()).thenReturn(ImmutableList.of(provider21, provider22, provider23));
        when(globalValueProviderAdapter3.createValueProviders()).thenReturn(ImmutableList.of(provider31, provider32, provider33));
        
        final Map<String, GlobalValueProvider> actual = globalValueProviderFactoryImpl.getGlobalProviders();
        
        assertThat(actual,
            allOf(
                hasEntry(equalTo("key1"),  sameInstance(provider1)),
                hasEntry(equalTo("key2"),  sameInstance(provider2)),
                hasEntry(equalTo("key3"),  sameInstance(provider3)),
                hasEntry(equalTo("key11"), sameInstance(provider11)),
                hasEntry(equalTo("key12"), sameInstance(provider12)),
                hasEntry(equalTo("key13"), sameInstance(provider13)),
                hasEntry(equalTo("key21"), sameInstance(provider21)),
                hasEntry(equalTo("key22"), sameInstance(provider22)),
                hasEntry(equalTo("key23"), sameInstance(provider23)),
                hasEntry(equalTo("key31"), sameInstance(provider31)),
                hasEntry(equalTo("key32"), sameInstance(provider32)),
                hasEntry(equalTo("key33"), sameInstance(provider33))
            )
        );
        assertThat("Map of GlobalValueProviders is the wrong size.", actual, Matchers.aMapWithSize(12));
    }
    
    /**
     * Test method for {@link GlobalValueProviderFactoryImpl#getGlobalProviders()}.
     */
    @Test
    public void testGetGlobalProvidersNoSecondaryAdapters() {
        
        final List<GlobalValueProviderAdapter> globalValueProviderAdapters = Collections.emptyList();
        
        globalValueProviderFactoryImpl = new GlobalValueProviderFactoryImpl(primaryGlobalValueProviderAdapter, globalValueProviderAdapters);

        final GlobalValueProvider provider1 = buildGlobalValueProvider("key1");
        final GlobalValueProvider provider2 = buildGlobalValueProvider("key2");
        final GlobalValueProvider provider3 = buildGlobalValueProvider("key3");
        
        when(primaryGlobalValueProviderAdapter.createValueProviders()).thenReturn(ImmutableList.of(provider1, provider2, provider3));
        
        final Map<String, GlobalValueProvider> actual = globalValueProviderFactoryImpl.getGlobalProviders();
        
        assertThat(actual,
            allOf(
                hasEntry(equalTo("key1"),  sameInstance(provider1)),
                hasEntry(equalTo("key2"),  sameInstance(provider2)),
                hasEntry(equalTo("key3"),  sameInstance(provider3))
            )
        );
        assertThat("Map of GlobalValueProviders is the wrong size.", actual, Matchers.aMapWithSize(3));
    }
    
    /**
     * Test method for {@link GlobalValueProviderFactoryImpl#getGlobalProviders()}.
     */
    @Test
    public void testGetGlobalProvidersNoSecondaryProviders() {
        
        final List<GlobalValueProviderAdapter> globalValueProviderAdapters = ImmutableList.of(globalValueProviderAdapter1, globalValueProviderAdapter2, globalValueProviderAdapter3);
        
        globalValueProviderFactoryImpl = new GlobalValueProviderFactoryImpl(primaryGlobalValueProviderAdapter, globalValueProviderAdapters);

        final GlobalValueProvider provider1 = buildGlobalValueProvider("key1");
        final GlobalValueProvider provider2 = buildGlobalValueProvider("key2");
        final GlobalValueProvider provider3 = buildGlobalValueProvider("key3");
        
        when(primaryGlobalValueProviderAdapter.createValueProviders()).thenReturn(ImmutableList.of(provider1, provider2, provider3));
        
        final Map<String, GlobalValueProvider> actual = globalValueProviderFactoryImpl.getGlobalProviders();
        
        assertThat(actual,
            allOf(
                hasEntry(equalTo("key1"),  sameInstance(provider1)),
                hasEntry(equalTo("key2"),  sameInstance(provider2)),
                hasEntry(equalTo("key3"),  sameInstance(provider3))
            )
        );
        assertThat("Map of GlobalValueProviders is the wrong size.", actual, Matchers.aMapWithSize(3));
    }
    
    /**
     * Test method for {@link GlobalValueProviderFactoryImpl#getGlobalProviders()}.
     */
    @SuppressWarnings("unchecked")
    @Test
    public void testGetGlobalProvidersDuplicatePrimaryAdapter() {
        
        final List<GlobalValueProviderAdapter> globalValueProviderAdapters = ImmutableList.of(globalValueProviderAdapter1, primaryGlobalValueProviderAdapter, globalValueProviderAdapter3);
        
        globalValueProviderFactoryImpl = new GlobalValueProviderFactoryImpl(primaryGlobalValueProviderAdapter, globalValueProviderAdapters);

        final GlobalValueProvider provider1 = buildGlobalValueProvider("key1");
        final GlobalValueProvider provider2 = buildGlobalValueProvider("key2");
        final GlobalValueProvider provider3 = buildGlobalValueProvider("key3");
        
        final GlobalValueProvider provider11 = buildGlobalValueProvider("key11");
        final GlobalValueProvider provider12 = buildGlobalValueProvider("key12");
        final GlobalValueProvider provider13 = buildGlobalValueProvider("key13");
        
        final GlobalValueProvider provider31 = buildGlobalValueProvider("key31");
        final GlobalValueProvider provider32 = buildGlobalValueProvider("key32");
        final GlobalValueProvider provider33 = buildGlobalValueProvider("key33");
        
        when(primaryGlobalValueProviderAdapter.createValueProviders()).thenReturn(ImmutableList.of(provider1, provider2, provider3));
        when(globalValueProviderAdapter1.createValueProviders()).thenReturn(ImmutableList.of(provider11, provider12, provider13));
        when(globalValueProviderAdapter3.createValueProviders()).thenReturn(ImmutableList.of(provider31, provider32, provider33));
        
        final Map<String, GlobalValueProvider> actual = globalValueProviderFactoryImpl.getGlobalProviders();
        
        assertThat("Map of GlobalValueProviders contains the wrong items.", actual,
            allOf(
                hasEntry(equalTo("key1"),  sameInstance(provider1)),
                hasEntry(equalTo("key2"),  sameInstance(provider2)),
                hasEntry(equalTo("key3"),  sameInstance(provider3)),
                hasEntry(equalTo("key11"), sameInstance(provider11)),
                hasEntry(equalTo("key12"), sameInstance(provider12)),
                hasEntry(equalTo("key13"), sameInstance(provider13)),
                hasEntry(equalTo("key31"), sameInstance(provider31)),
                hasEntry(equalTo("key32"), sameInstance(provider32)),
                hasEntry(equalTo("key33"), sameInstance(provider33))
            )
        );
        assertThat("Map of GlobalValueProviders is the wrong size.", actual, Matchers.aMapWithSize(9));
    }
    
    /**
     * Test method for {@link GlobalValueProviderFactoryImpl#getGlobalProviders()} where we are testing that the
     * providers from the primary adapter are kept and the duplicates (keys) from the other adapters are not added to
     * the map.
     */
    @SuppressWarnings("unchecked")
    @Test
    public void testGetGlobalProvidersDuplicateKeys() {
        
        final List<GlobalValueProviderAdapter> globalValueProviderAdapters = ImmutableList.of(globalValueProviderAdapter1, globalValueProviderAdapter2, globalValueProviderAdapter3);
        
        globalValueProviderFactoryImpl = new GlobalValueProviderFactoryImpl(primaryGlobalValueProviderAdapter, globalValueProviderAdapters);

        final GlobalValueProvider provider1 = buildGlobalValueProvider("key1");
        final GlobalValueProvider provider2 = buildGlobalValueProvider("key2");
        final GlobalValueProvider provider3 = buildGlobalValueProvider("key3");
        
        final GlobalValueProvider provider11 = buildGlobalValueProvider("key11");
        final GlobalValueProvider provider12 = buildGlobalValueProvider("key12");
        final GlobalValueProvider provider13 = buildGlobalValueProvider("key13");
        
        final GlobalValueProvider provider21 = buildGlobalValueProvider("key1");
        final GlobalValueProvider provider22 = buildGlobalValueProvider("key2");
        final GlobalValueProvider provider23 = buildGlobalValueProvider("key3");
        
        final GlobalValueProvider provider31 = buildGlobalValueProvider("key31");
        final GlobalValueProvider provider32 = buildGlobalValueProvider("key32");
        final GlobalValueProvider provider33 = buildGlobalValueProvider("key33");
        
        when(primaryGlobalValueProviderAdapter.createValueProviders()).thenReturn(ImmutableList.of(provider1, provider2, provider3));
        when(globalValueProviderAdapter1.createValueProviders()).thenReturn(ImmutableList.of(provider11, provider12, provider13));
        when(globalValueProviderAdapter2.createValueProviders()).thenReturn(ImmutableList.of(provider21, provider22, provider23));
        when(globalValueProviderAdapter3.createValueProviders()).thenReturn(ImmutableList.of(provider31, provider32, provider33));
        
        final Map<String, GlobalValueProvider> actual = globalValueProviderFactoryImpl.getGlobalProviders();
        
        assertThat("Map of GlobalValueProviders contains the wrong items.", actual,
            allOf(
                hasEntry(equalTo("key1"),  sameInstance(provider1)),
                hasEntry(equalTo("key2"),  sameInstance(provider2)),
                hasEntry(equalTo("key3"),  sameInstance(provider3)),
                hasEntry(equalTo("key11"), sameInstance(provider11)),
                hasEntry(equalTo("key12"), sameInstance(provider12)),
                hasEntry(equalTo("key13"), sameInstance(provider13)),
                hasEntry(equalTo("key31"), sameInstance(provider31)),
                hasEntry(equalTo("key32"), sameInstance(provider32)),
                hasEntry(equalTo("key33"), sameInstance(provider33))
            )
        );
        assertThat("Map of GlobalValueProviders is the wrong size.", actual, Matchers.aMapWithSize(9));
    }
    
    /**
     * Test method for {@link GlobalValueProviderFactoryImpl#getGlobalProviders()}.
     */
    @Test
    public void testGetGlobalProvidersEmptpyMap() {
        
        final List<GlobalValueProviderAdapter> globalValueProviderAdapters = ImmutableList.of(globalValueProviderAdapter1, globalValueProviderAdapter2, globalValueProviderAdapter3);
        
        globalValueProviderFactoryImpl = new GlobalValueProviderFactoryImpl(primaryGlobalValueProviderAdapter, globalValueProviderAdapters);
        
        when(primaryGlobalValueProviderAdapter.createValueProviders()).thenReturn(Collections.emptyList());
        when(globalValueProviderAdapter1.createValueProviders()).thenReturn(Collections.emptyList());
        when(globalValueProviderAdapter2.createValueProviders()).thenReturn(Collections.emptyList());
        when(globalValueProviderAdapter3.createValueProviders()).thenReturn(Collections.emptyList());
        
        final Map<String, GlobalValueProvider> actual = globalValueProviderFactoryImpl.getGlobalProviders();
        
        assertThat("Must be an empty map", actual, anEmptyMap());
    }
}