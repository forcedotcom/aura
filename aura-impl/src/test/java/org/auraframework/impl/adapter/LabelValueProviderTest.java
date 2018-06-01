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

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.expression.PropertyReference;
import org.auraframework.service.DefinitionService;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Matchers;

public class LabelValueProviderTest {

    LocalizationAdapter mockLocalizationAdapter;
    DefinitionService mockDefinitionService;

    @Before
    public void setUp() {
        mockLocalizationAdapter = mock(LocalizationAdapter.class);
        mockDefinitionService = mock(DefinitionService.class);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testLoadValues() {
        // Arrange
        String section = "section";
        String name = "label1";
        String expected = "This is a label";

        Map<String, Map<String, String>> labels = new HashMap<>();
        Map<String, String> nameToValue = new HashMap<>();
        nameToValue.put(name, expected);
        labels.put(section, nameToValue);

        when(mockLocalizationAdapter.getLabels(Matchers.<Map<String, Set<String>>> any())).thenReturn(labels);

        LabelValueProvider provider = new LabelValueProvider(mockLocalizationAdapter, mockDefinitionService);

        PropertyReference propertyReference = mock(PropertyReference.class);
        when(propertyReference.size()).thenReturn(2);
        when(propertyReference.getList()).thenReturn(Arrays.asList(section, name));

        // Act
        Set<PropertyReference> keys = new HashSet<>(Arrays.asList(propertyReference));
        provider.loadValues(keys);

        // Assert
        Map<String, ?> data = provider.getData();
        Map<String, String> nameValuePair = (Map<String, String>)data.get(section);
        String actual = nameValuePair.get(name);

        assertEquals(expected, actual);
    }

    @Test
    public void testLoadValuesWithLabelsAreInProvider() {
        // Arrange
        String section = "section";
        String name = "label1";
        String value = "This is a label";

        when(mockLocalizationAdapter.getLabel(eq(section), eq(name))).thenReturn(value);

        LabelValueProvider provider = new LabelValueProvider(mockLocalizationAdapter, mockDefinitionService);

        PropertyReference propertyReference = mock(PropertyReference.class);
        when(propertyReference.size()).thenReturn(2);
        when(propertyReference.getList()).thenReturn(Arrays.asList(section, name));

        // put the label into provider
        provider.getValue(propertyReference);

        // Act
        Set<PropertyReference> keys = new HashSet<>(Arrays.asList(propertyReference));
        provider.loadValues(keys);

        // Assert
        // If the labels are already in the provider, do not fetch them again
        verify(mockLocalizationAdapter, never()).getLabels(Matchers.<Map<String, Set<String>>> any());
    }

    @Test
    public void testGetValueWithLabelIsInProvider() {
        // Arrange
        String section = "section";
        String name = "label1";
        String expected = "This is a label";

        when(mockLocalizationAdapter.getLabel(eq(section), eq(name))).thenReturn(expected);

        LabelValueProvider provider = new LabelValueProvider(mockLocalizationAdapter, mockDefinitionService);

        PropertyReference propertyReference = mock(PropertyReference.class);
        when(propertyReference.size()).thenReturn(2);
        when(propertyReference.getList()).thenReturn(Arrays.asList(section, name));

        // put the label into provider
        provider.getValue(propertyReference);

        // Act
        String actual = (String)provider.getValue(propertyReference);

        // Assert
        verify(mockLocalizationAdapter, never()).getLabels(Matchers.<Map<String, Set<String>>> any());
        assertEquals(expected, actual);
    }
}
