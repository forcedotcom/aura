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
package org.auraframework.impl.java.converter;

import java.util.Map;
import java.util.Set;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.service.LoggingService;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.type.ConversionException;
import org.auraframework.util.type.Converter;
import org.auraframework.util.type.MultiConverter;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationContext;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class ConverterServiceImplUnitTest {
    /////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Basic
    //
    /////////////////////////////////////////////////////////////////////////////////////////////

    public static class Foo {
        private String value;
        public Foo(String value) { this.value = value; };
        public String getValue() { return this.value; };
    }

    public static class BadConverter implements Converter<Foo, String> {
        @Override public String convert(Foo value) { return null; }
        @Override public Class<Foo> getFrom() { return null; }
        @Override public Class<String> getTo() { return null; }
        @Override public Class<?>[] getToParameters() { return null; }
    }

    @Test
    public void testBadConverterFails() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BadConverter()));

        Exception actual = null;
        try {
            service.convert(new Foo("ignored"), String.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when a bad converter is created",
                actual, Matchers.notNullValue());
        Mockito.verify(loggingService, Mockito.times(1)).error(org.mockito.Matchers.any());
        Assert.assertThat("Expect error string with converter name",
                actual.getMessage(), Matchers.stringContainsInOrder("Invalid converter", "BadConverter"));
    }

    public static class BasicConverter implements Converter<Foo, String> {
        @Override public String convert(Foo value) { return value.getValue(); }
        @Override public Class<Foo> getFrom() { return Foo.class; }
        @Override public Class<String> getTo() { return String.class; }
        @Override public Class<?>[] getToParameters() { return null; }
    }
    public static class ReverseConverter implements Converter<String, Foo> {
        @Override public Foo convert(String value) { return new Foo(value); }
        @Override public Class<String> getFrom() { return String.class; }
        @Override public Class<Foo> getTo() { return Foo.class; }
        @Override public Class<?>[] getToParameters() { return null; }
    }
    public static class DupBasicConverter implements Converter<Foo, String> {
        @Override public String convert(Foo value) { return value.getValue(); }
        @Override public Class<Foo> getFrom() { return Foo.class; }
        @Override public Class<String> getTo() { return String.class; }
        @Override public Class<?>[] getToParameters() { return null; }
    }

    @Test
    public void testConvertWithoutLocalized() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BasicConverter()));

        String expected = "expected";

        String actual;
        actual = service.convert(new Foo(expected), String.class);
        Assert.assertThat("Should get expected conversion for non-localized conversion",
                actual, Matchers.equalTo(expected));

        actual = service.convert(new Foo(expected), String.class, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Should get expected conversion for localized conversion",
                actual, Matchers.equalTo(expected));
        Mockito.verifyNoMoreInteractions(loggingService);
    }

    @Test
    public void testConverterNotFound() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BasicConverter()));

        Exception actual = null;
        try {
            service.convert("string", Foo.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when we couldn't find a converter",
                actual, Matchers.notNullValue());
        Assert.assertThat("Should get a conversion exception", actual.getClass(),
                Matchers.equalTo(ConversionException.class));
        Assert.assertThat("Expect error string with type names", actual.getMessage(),
                Matchers.stringContainsInOrder("String", "Foo"));
        Mockito.verifyNoMoreInteractions(loggingService);
    }

    @Test
    public void testConvertTrimDefault() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Default conversion should trim", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimExplicitTrue() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimExplicitFalse() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        Foo actual;

        actual = service.convert(input, Foo.class, null, false);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim = false should not trim", actual.getValue(), Matchers.equalTo(input));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimDefaultWithLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Default conversion should trim", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimExplicitTrueWithLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimExplicitFalseWithLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        Foo actual;

        actual = service.convert(input, Foo.class, null, false, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim = false should not trim", actual.getValue(), Matchers.equalTo(input));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimExplicitTrueWithNoHasLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true, false);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testConvertTrimExplicitTrueWithHasLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true, true);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verify(localizationAdapter, Mockito.times(1)).getAuraLocale();
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testDupConverterFails() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BasicConverter(), new DupBasicConverter()));

        Exception actual = null;
        try {
            service.convert(new Foo("ignored"), String.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when a duplicate converter is added",
                actual, Matchers.notNullValue());
        Mockito.verify(loggingService, Mockito.times(1)).error(org.mockito.Matchers.any());
        Assert.assertThat("Expect error string with converter name", actual.getMessage(),
                Matchers.stringContainsInOrder("More than one", "BasicConverter", "DupBasicConverter"));
        Mockito.verifyNoMoreInteractions(loggingService);
    }

    @Test
    public void testDupConverterSucceedsWithoutEnforcement() {
        ConverterServiceImpl service = new ConverterServiceImpl();
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BasicConverter(), new DupBasicConverter()));
        String expected = "expected";

        String actual = service.convert(new Foo(expected), String.class);

        Assert.assertThat("Should successfully convert when enforcement is off with dups",
                actual, Matchers.equalTo(expected));
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Localized
    //
    /////////////////////////////////////////////////////////////////////////////////////////////

    public static class BasicLocalizedConverter implements LocalizedConverter<Foo, String> {
        @Override public String convert(Foo value) { return value.getValue(); }
        @Override public Class<Foo> getFrom() { return Foo.class; }
        @Override public Class<String> getTo() { return String.class; }
        @Override public Class<?>[] getToParameters() { return null; }
        @Override public String convert(Foo value, AuraLocale locale) { return "localized:"+value.getValue(); }
    }
    public static class ReverseLocalizedConverter implements LocalizedConverter<String, Foo> {
        @Override public Foo convert(String value) { return new Foo(value); }
        @Override public Foo convert(String value, AuraLocale locale) { return new Foo("localized:"+value); }
        @Override public Class<String> getFrom() { return String.class; }
        @Override public Class<Foo> getTo() { return Foo.class; }
        @Override public Class<?>[] getToParameters() { return null; }
    }

    @Test
    public void testDupWithLocalizedFails() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BasicConverter(), new BasicLocalizedConverter()));

        Exception actual = null;
        try {
            service.convert(new Foo("ignored"), String.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when a duplicate converter is added",
                actual, Matchers.notNullValue());
        Mockito.verify(loggingService, Mockito.times(1)).error(org.mockito.Matchers.any());
        Assert.assertThat("Expect error string with converter name",
                actual.getMessage(), Matchers.stringContainsInOrder("More than one", "BasicConverter", "BasicLocalizedConverter"));
    }

    @Test
    public void testLocalizedConvert() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new BasicLocalizedConverter()));

        String expected = "expected";
        String actual = null;
        actual = service.convert(new Foo(expected), String.class);
        Assert.assertThat("Should get expected conversion for non-localized conversion",
                actual, Matchers.equalTo(expected));
        actual = service.convert(new Foo(expected), String.class, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Should get expected conversion for localized conversion",
                actual, Matchers.equalTo("localized:"+expected));
        Mockito.verifyNoMoreInteractions(loggingService);
    }

    @Test
    public void testLocalizedConvertTrimDefault() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Default conversion should trim", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimExplicitTrue() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimExplicitFalse() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        Foo actual;

        actual = service.convert(input, Foo.class, null, false);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim = false should not trim", actual.getValue(), Matchers.equalTo(input));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimDefaultWithLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String trimmedLocalized = "localized:expected";
        Foo actual;

        actual = service.convert(input, Foo.class, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Default conversion should trim", actual.getValue(), Matchers.equalTo(trimmedLocalized));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimExplicitTrueWithLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String trimmedLocalized = "localized:expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmedLocalized));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimExplicitFalseWithLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String inputLocalized = "localized: expected ";
        Foo actual;

        actual = service.convert(input, Foo.class, null, false, Mockito.mock(AuraLocale.class));
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim = false should not trim", actual.getValue(), Matchers.equalTo(inputLocalized));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimExplicitTrueWithNoHasLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String trimmed = "expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true, false);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmed));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }

    @Test
    public void testLocalizedConvertTrimExplicitTrueWithHasLocale() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ReverseLocalizedConverter()));
        String input = " expected ";
        String trimmedLocalized = "localized:expected";
        Foo actual;

        actual = service.convert(input, Foo.class, null, true, true);
        Assert.assertThat("Conversion should succeed", actual, Matchers.notNullValue());
        Assert.assertThat("Trim should work", actual.getValue(), Matchers.equalTo(trimmedLocalized));
        Mockito.verifyNoMoreInteractions(loggingService);
        Mockito.verify(localizationAdapter, Mockito.times(1)).getAuraLocale();
        Mockito.verifyNoMoreInteractions(localizationAdapter);
    }


    /////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Parameterized
    //
    /////////////////////////////////////////////////////////////////////////////////////////////
    public static class Bar<T> {
        private T value;
        public Bar(T value) { this.value = value; }
        public T getValue() { return this.value; }
    };
    
    @SuppressWarnings("rawtypes")
    public static class ParameterizedString implements Converter<String, Bar> {
        @Override public Bar convert(String value) { return new Bar<>(value); }
        @Override public Class<String> getFrom() { return String.class; }
        @Override public Class<Bar> getTo() { return Bar.class; }
        @Override public Class<?>[] getToParameters() { return new Class[] { String.class }; }
    }

    @SuppressWarnings("rawtypes")
    public static class ParameterizedStringDup implements Converter<String, Bar> {
        @Override public Bar convert(String value) { return new Bar<>(value); }
        @Override public Class<String> getFrom() { return String.class; }
        @Override public Class<Bar> getTo() { return Bar.class; }
        @Override public Class<?>[] getToParameters() { return new Class[] { String.class }; }
    }

    @SuppressWarnings("rawtypes")
    public static class ParameterizedInteger implements Converter<Integer, Bar> {
        @Override public Bar convert(Integer value) { return new Bar<>(value); }
        @Override public Class<Integer> getFrom() { return Integer.class; }
        @Override public Class<Bar> getTo() { return Bar.class; }
        @Override public Class<?>[] getToParameters() { return new Class[] { Integer.class }; }
    }

    @SuppressWarnings("rawtypes")
    public static class ParameterizedIntegerString implements LocalizedConverter<String, Bar> {
        @Override public Bar convert(String value) {
            int out = 0; try { out = Integer.parseInt(value); } catch (Exception e) {};
            return new Bar<>(new Integer(out));
        }
        @Override public Bar convert(String value, AuraLocale locale) {
            int out = 0; try { out = Integer.parseInt(value); } catch (Exception e) {};
            return new Bar<>(new Integer(out+1));
        }
        @Override public Class<String> getFrom() { return String.class; }
        @Override public Class<Bar> getTo() { return Bar.class; }
        @Override public Class<?>[] getToParameters() { return new Class[] { Integer.class }; }
    }

    @Test
    public void testDupWithParameterizedFails() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList(new ParameterizedString(), new ParameterizedStringDup()));

        Exception actual = null;
        try {
            service.convert(new Foo("ignored"), String.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when a duplicate converter is added",
                actual, Matchers.notNullValue());
        Mockito.verify(loggingService, Mockito.times(1)).error(org.mockito.Matchers.any());
        Assert.assertThat("Expect error string with converter name", actual.getMessage(),
                Matchers.stringContainsInOrder("More than one", "ParameterizedString", "ParameterizedStringDup"));
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testParameterizedMatches() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        LocalizationAdapter localizationAdapter = Mockito.mock(LocalizationAdapter.class);
        Mockito.doReturn(Mockito.mock(AuraLocale.class)).when(localizationAdapter).getAuraLocale();
        service.setLoggingService(loggingService);
        service.setLocalizationAdapter(localizationAdapter);
        service.setConverters(Lists.newArrayList(new ParameterizedString(), new ParameterizedInteger(),
                    new ParameterizedIntegerString()));

        String expectedStringValue = "expectedString";
        Bar<String> actualString = service.convert(expectedStringValue, Bar.class, "String", true);
        Assert.assertThat("expected non-null return", actualString, Matchers.notNullValue());
        Assert.assertThat("expected String conversion", actualString.getValue(), Matchers.equalTo(expectedStringValue));

        Integer expectedIntegerValue = new Integer(123);
        Bar<Integer> actualInt = service.convert(expectedIntegerValue, Bar.class, "Integer", true);
        Assert.assertThat("expected non-null return", actualInt, Matchers.notNullValue());
        Assert.assertThat("expected String conversion", actualInt.getValue(), Matchers.equalTo(expectedIntegerValue));

        String inputString = "123";
        Integer expectedConvert = new Integer(123);
        Bar<Integer> actualConverted = service.convert(inputString, Bar.class, "Integer", true);
        Assert.assertThat("expected Integer conversion", actualConverted.getValue(), Matchers.equalTo(expectedConvert));

        Integer expectedLocalized = new Integer(124);
        Bar<Integer> actualLocalized = service.convert(inputString, Bar.class, "Integer", true, true);
        Assert.assertThat("expected Integer conversion", actualLocalized.getValue(), Matchers.equalTo(expectedLocalized));

        Mockito.verifyNoMoreInteractions(loggingService);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Multi-converters
    //
    /////////////////////////////////////////////////////////////////////////////////////////////
    public static class FooAbstract {};
    public static class FooChild1 extends FooAbstract {};
    public static class FooChild2 extends FooAbstract {};

    public static class BarAbstract {};
    public static class BarChild1 extends BarAbstract {};
    public static class BarChild2 extends BarAbstract {};

    public static class MultiConverterBad implements MultiConverter<FooAbstract> {
        @Override public FooAbstract convert(Class<? extends FooAbstract> toClass, Object fromValue) {
            return null;
        }
        @Override public Class<?> getFrom() { return null; }
        @Override public Set<Class<?>> getTo() { return null; }
    }
    public static class MultiConverter1 implements MultiConverter<FooAbstract> {
        @Override public FooAbstract convert(Class<? extends FooAbstract> toClass, Object fromValue) {
            return new FooChild1(); 
        }
        @Override public Class<?> getFrom() { return String.class; }
        @Override public Set<Class<?>> getTo() { return Sets.newHashSet(FooChild1.class, FooChild2.class); }
    }
    public static class MultiConverter1Dup implements MultiConverter<FooAbstract> {
        @Override public FooAbstract convert(Class<? extends FooAbstract> toClass, Object fromValue) {
            return new FooChild1(); 
        }
        @Override public Class<?> getFrom() { return String.class; }
        @Override public Set<Class<?>> getTo() { return Sets.newHashSet(FooChild1.class); }
    }

    public static class MultiConverter2 implements MultiConverter<BarAbstract> {
        @Override public BarAbstract convert(Class<? extends BarAbstract> toClass, Object fromValue) {
            return new BarChild1(); 
        }
        @Override public Class<?> getFrom() { return String.class; }
        @Override public Set<Class<?>> getTo() { return Sets.newHashSet(BarChild1.class, BarChild2.class); }
    }

    @Test
    public void testMultiConverterBad() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        @SuppressWarnings("rawtypes")
        Map<String,MultiConverter> converterMap = new ImmutableMap.Builder<String,MultiConverter>()
            .put("bad", new MultiConverterBad())
            .build();
        Mockito.doReturn(converterMap).when(appContext).getBeansOfType(MultiConverter.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList());
        service.setApplicationContext(appContext);

        Exception actual = null;
        try {
            service.convert("foo", BarChild1.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when a bad converter is created",
                actual, Matchers.notNullValue());
        Mockito.verify(loggingService, Mockito.times(1)).error(org.mockito.Matchers.any());
        Assert.assertThat("Expect error string with converter name",
                actual.getMessage(), Matchers.stringContainsInOrder("Invalid multiconverter", "MultiConverterBad"));
    }

    @Test
    public void testMultiConverterDup() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        @SuppressWarnings("rawtypes")
        Map<String,MultiConverter> converterMap = new ImmutableMap.Builder<String,MultiConverter>()
            .put("1", new MultiConverter1())
            .put("dup", new MultiConverter1Dup())
            .build();
        Mockito.doReturn(converterMap).when(appContext).getBeansOfType(MultiConverter.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList());
        service.setApplicationContext(appContext);

        Exception actual = null;
        try {
            service.convert("foo", FooChild1.class);
        } catch (Exception e) {
            actual = e;
        }
        Assert.assertThat("Should have thrown an exception when a duplicate converter is added",
                actual, Matchers.notNullValue());
        Mockito.verify(loggingService, Mockito.times(1)).error(org.mockito.Matchers.any());
        Assert.assertThat("Expect error string with converter name",
                actual.getMessage(), Matchers.stringContainsInOrder("More than one", "MultiConverter1Dup"));
    }

    @Test
    public void testMultiConverterBasic() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        @SuppressWarnings("rawtypes")
        Map<String,MultiConverter> converterMap = new ImmutableMap.Builder<String,MultiConverter>()
            .put("1", new MultiConverter1())
            .build();
        Mockito.doReturn(converterMap).when(appContext).getBeansOfType(MultiConverter.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList());
        service.setApplicationContext(appContext);

        FooChild1 actual = service.convert("foo", FooChild1.class);
        Assert.assertThat("Should have get a converted value", actual, Matchers.notNullValue());
        Mockito.verifyNoMoreInteractions(loggingService);
    }

    @Test
    public void testMultiConverterDouble() {
        ConverterServiceImpl service = new ConverterServiceImpl(true);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        @SuppressWarnings("rawtypes")
        Map<String,MultiConverter> converterMap = new ImmutableMap.Builder<String,MultiConverter>()
            .put("1", new MultiConverter1())
            .put("2", new MultiConverter2())
            .build();
        Mockito.doReturn(converterMap).when(appContext).getBeansOfType(MultiConverter.class);
        service.setLoggingService(loggingService);
        service.setConverters(Lists.newArrayList());
        service.setApplicationContext(appContext);

        FooChild1 actual = service.convert("foo", FooChild1.class);
        Assert.assertThat("Should have gotten a response", actual, Matchers.notNullValue());
        BarChild1 actual2 = service.convert("foo", BarChild1.class);
        Assert.assertThat("Should have gotten a response", actual2, Matchers.notNullValue());
        Mockito.verifyNoMoreInteractions(loggingService);
    }
}
