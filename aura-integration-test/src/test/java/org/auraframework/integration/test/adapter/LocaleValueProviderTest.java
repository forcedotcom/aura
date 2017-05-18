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
package org.auraframework.integration.test.adapter;

import java.util.*;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.adapter.LocaleValueProvider;
import org.auraframework.impl.adapter.LocaleValueProvider.LocalizedLabel;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Before;
import org.junit.Test;

@UnAdaptableTest
public class LocaleValueProviderTest extends AuraImplTestCase {
    private enum LocaleProperty {
        language(LocaleValueProvider.LANGUAGE),
        country(LocaleValueProvider.COUNTRY),
        variant(LocaleValueProvider.VARIANT),
        langLocale(LocaleValueProvider.LANGUAGE_LOCALE),
        numberFormat(LocaleValueProvider.NUMBER_FORMAT),
        percentFormat(LocaleValueProvider.PERCENT_FORMAT),
        currencyFormat(LocaleValueProvider.CURRENCY_FORMAT),
        dateFormat(LocaleValueProvider.DATE_FORMAT),
        datetimeFormat(LocaleValueProvider.DATETIME_FORMAT),
        timeFormat(LocaleValueProvider.TIME_FORMAT),
        timezone(LocaleValueProvider.TIME_ZONE),
        currencyCode(LocaleValueProvider.CURRENCY_CODE),
        decimal(LocaleValueProvider.DECIMAL),
        grouping(LocaleValueProvider.GROUPING),
        currency(LocaleValueProvider.CURRENCY),
        zero(LocaleValueProvider.ZERO_DIGIT);

        private PropertyReferenceImpl propRef;

        LocaleProperty(String name) {
            propRef = new PropertyReferenceImpl(name, null);
        }
 
        public PropertyReference getRef() {
            return propRef;
        }
    }

    @Inject
    private LocalizationAdapter localizationAdapter;

    private ConfigAdapter configAdapter;

    @Inject
    DefinitionService definitionService;

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
        configAdapter = getMockConfigAdapter();
    }

    @Test
    public void testValidateLocaleProperty() throws Exception {
        LocaleValueProvider lvp = new LocaleValueProvider(configAdapter, localizationAdapter, definitionService);
        for (LocaleProperty lp : LocaleProperty.values()) {
            lvp.validate(lp.getRef());
        }

        PropertyReference property = new PropertyReferenceImpl("badProperty", null);
        try {
            lvp.validate(property);
            fail("Expected InvalidExpressionException for " + property);
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Locale for key: " + property,
                    e.getMessage());
        }

        try {
            lvp.validate(null);
            fail("Expected NullPointerException for null PropertyReference");
        } catch (NullPointerException expected) {
        }
    }

    // semi-integration test checks that value provider is created and validated
    // on component
    @Test
    public void testInvalidLocalePropertyInMarkup() throws Exception {
        try {
            DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                    ComponentDef.class,
                    "<aura:component>{!$Locale.badProperty}</aura:component>");

            instanceService.getInstance(desc, null);
            fail("Expected an InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Locale for key: badProperty",
                    e.getMessage());
        }
    }
    
    // Setting some locales for testing
    @Test
    public void testCurrency() throws Exception {
        HashMap<String, Object> defaultLocaleProperties = new HashMap<>();
        defaultLocaleProperties.put(LocaleValueProvider.LANGUAGE, "en");
        defaultLocaleProperties.put(LocaleValueProvider.COUNTRY, "US");
        defaultLocaleProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0.00");
        defaultLocaleProperties.put(LocaleValueProvider.CURRENCY_CODE, "USD");
        defaultLocaleProperties.put(LocaleValueProvider.CURRENCY, "$");
        assertLocaleProperties(Arrays.asList(Locale.US), defaultLocaleProperties);

        HashMap<String, Object> jaLocaleProperties = new HashMap<>();
        jaLocaleProperties.put(LocaleValueProvider.LANGUAGE, "ja");
        jaLocaleProperties.put(LocaleValueProvider.COUNTRY, "JP");
        jaLocaleProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0");
        jaLocaleProperties.put(LocaleValueProvider.CURRENCY_CODE, "JPY");
        jaLocaleProperties.put(LocaleValueProvider.CURRENCY, "￥");
        assertLocaleProperties(Arrays.asList(Locale.JAPAN), jaLocaleProperties);

        HashMap<String, Object> ukLocaleProperties = new HashMap<>();
        ukLocaleProperties.put(LocaleValueProvider.LANGUAGE, "en");
        ukLocaleProperties.put(LocaleValueProvider.COUNTRY, "GB");
        ukLocaleProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0.00");
        ukLocaleProperties.put(LocaleValueProvider.CURRENCY_CODE, "GBP");
        ukLocaleProperties.put(LocaleValueProvider.CURRENCY, "£");
        assertLocaleProperties(Arrays.asList(Locale.UK), ukLocaleProperties);
    }
    
    /**
     * this test when we pass more than one locals to current context, we only honor the FIRST one.
     */
    @Test
    public void testMultiLocale() {
        HashMap<String, Object> localeProperties = new HashMap<>();
        createLocaleProperties_ENZA(localeProperties);
        assertLocaleProperties(Arrays.asList(new Locale("en", "ZA"), Locale.US), localeProperties);
    }

    /**
     * tests for number and percent formats for US, South Africa(ZA) and France
     * http://en.wikipedia.org/wiki/ISO_3166-2
     */
    @Test
    public void testNumberAndPercentFormats() {
        HashMap<String, Object> localeProperties = new HashMap<>();
        createLocaleProperties_ENUS(localeProperties);
        assertLocaleProperties(Arrays.asList(Locale.US), localeProperties);
        
        localeProperties.clear();
        createLocaleProperties_ENZA(localeProperties);
        assertLocaleProperties(Arrays.asList(new Locale("en", "ZA")), localeProperties);
        
        localeProperties.clear();
        createLocaleProperties_FRFR(localeProperties);
        assertLocaleProperties(Arrays.asList(new Locale("fr", "FR")), localeProperties);
    }

    private void assertLocaleProperties(List<Locale> localeList, HashMap<String, Object> localeProperties) {
        AuraContext context = contextService.getCurrentContext();
        context.setRequestedLocales(localeList == null ? null : localeList);
        LocaleValueProvider lvp = new LocaleValueProvider(configAdapter, localizationAdapter, definitionService);
        String countryName = localeList == null ? "" : localeList.get(0).getCountry();
        for (Map.Entry<String, Object> entry : localeProperties.entrySet()) {
            assertLocaleProperty(lvp, entry.getKey(), entry.getValue(), countryName);
        }
    }

    private void assertLocaleProperty(LocaleValueProvider lvp, String propName, Object expected, String countryName) {
        PropertyReference ref = LocaleProperty.valueOf(propName).getRef();
        Object actual = lvp.getValue(ref);
        assertEquals("Unexpected value : " + propName+" of country: "+countryName, expected, actual);
    }

    private void createLocaleProperties_ENZA(HashMap<String, Object> localeProperties) {
        localeProperties.put(LocaleValueProvider.LANGUAGE, "en");
        localeProperties.put(LocaleValueProvider.COUNTRY, "ZA");
        localeProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0.00");  // Patterns shouldn't localize
        localeProperties.put(LocaleValueProvider.GROUPING, '\u00A0');
        localeProperties.put(LocaleValueProvider.DECIMAL, ',');
        localeProperties.put(LocaleValueProvider.NUMBER_FORMAT, "#,##0.###");
        localeProperties.put(LocaleValueProvider.PERCENT_FORMAT, "#,##0%");
        localeProperties.put(LocaleValueProvider.DATE_FORMAT, "dd MMM yyyy");
        localeProperties.put(LocaleValueProvider.TIME_FORMAT, "h:mm:ss a");
        localeProperties.put(LocaleValueProvider.DATETIME_FORMAT, "dd MMM yyyy h:mm:ss a");
        localeProperties.put(LocaleValueProvider.LANGUAGE_LOCALE, "en_ZA");
        localeProperties.put(LocaleValueProvider.ZERO_DIGIT, '0');
        return;
    }
    
    private void createLocaleProperties_FRFR(HashMap<String, Object> localeProperties) {
        localeProperties.put(LocaleValueProvider.LANGUAGE, "fr");
        localeProperties.put(LocaleValueProvider.COUNTRY, "FR");
        localeProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "#,##0.00 ¤");  // Patterns shouldn't localize
        localeProperties.put(LocaleValueProvider.GROUPING, '\u00A0');
        localeProperties.put(LocaleValueProvider.DECIMAL, ',');
        localeProperties.put(LocaleValueProvider.NUMBER_FORMAT, "#,##0.###");
        localeProperties.put(LocaleValueProvider.PERCENT_FORMAT, "#,##0 %");
        localeProperties.put(LocaleValueProvider.DATE_FORMAT, "d MMM yyyy");
        localeProperties.put(LocaleValueProvider.TIME_FORMAT, "HH:mm:ss");
        localeProperties.put(LocaleValueProvider.DATETIME_FORMAT, "d MMM yyyy HH:mm:ss");
        localeProperties.put(LocaleValueProvider.LANGUAGE_LOCALE, "fr_FR");
        localeProperties.put(LocaleValueProvider.ZERO_DIGIT, '0');
        return;
    }
    
    private void createLocaleProperties_ENUS(HashMap<String, Object> localeProperties) {
         localeProperties.put(LocaleValueProvider.LANGUAGE, "en");
         localeProperties.put(LocaleValueProvider.COUNTRY, "US");
         localeProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0.00");  // Patterns shouldn't localize
         localeProperties.put(LocaleValueProvider.GROUPING, ',');
         localeProperties.put(LocaleValueProvider.DECIMAL, '.');
         localeProperties.put(LocaleValueProvider.NUMBER_FORMAT, "#,##0.###");
         localeProperties.put(LocaleValueProvider.PERCENT_FORMAT, "#,##0%");
         localeProperties.put(LocaleValueProvider.DATE_FORMAT, "MMM d, yyyy");
         localeProperties.put(LocaleValueProvider.TIME_FORMAT, "h:mm:ss a");
         localeProperties.put(LocaleValueProvider.DATETIME_FORMAT, "MMM d, yyyy h:mm:ss a");
         localeProperties.put(LocaleValueProvider.LANGUAGE_LOCALE, "en_US");
         localeProperties.put(LocaleValueProvider.ZERO_DIGIT, '0');
        return;
    }

    /**
     * Test to verify getValue returns null for undefined property
     * @throws Exception
     */
    @Test
    public void testGetValueUndefinedProperty() throws Exception {
        AuraContext context = contextService.getCurrentContext();
        context.setRequestedLocales(Arrays.asList(Locale.UK));
        LocaleValueProvider lvp = new LocaleValueProvider(configAdapter, localizationAdapter, definitionService);
        assertEquals(null,
                lvp.getValue(new PropertyReferenceImpl("ISO3Language", null))); // undefined
                                                                                // property
    }

    /**
     * Test name of months is returned correctly
     */
    @Test
    public void testNameOfMonths() throws Exception {
    HashMap<String, String> expectedMonthNames = new HashMap<>();
        expectedMonthNames.put("Jan", "January");
        expectedMonthNames.put("Feb", "February");
        expectedMonthNames.put("Mar", "March");
        expectedMonthNames.put("Apr", "April");
        expectedMonthNames.put("May", "May");
        expectedMonthNames.put("Jun", "June");
        expectedMonthNames.put("Jul", "July");
        expectedMonthNames.put("Aug", "August");
        expectedMonthNames.put("Sep", "September");
        expectedMonthNames.put("Oct", "October");
        expectedMonthNames.put("Nov", "November");
        expectedMonthNames.put("Dec", "December");
        assertDateLocaleProperties(null, LocaleValueProvider.MONTH_NAME, expectedMonthNames); //en_US

        HashMap<String, String> expectedMonthNamesJP = new HashMap<>();
        expectedMonthNamesJP.put("1", "1月");
        expectedMonthNamesJP.put("2", "2月");
        expectedMonthNamesJP.put("3", "3月");
        expectedMonthNamesJP.put("4", "4月");
        expectedMonthNamesJP.put("5", "5月");
        expectedMonthNamesJP.put("6", "6月");
        expectedMonthNamesJP.put("7", "7月");
        expectedMonthNamesJP.put("8", "8月");
        expectedMonthNamesJP.put("9", "9月");
        expectedMonthNamesJP.put("10", "10月");
        expectedMonthNamesJP.put("11", "11月");
        expectedMonthNamesJP.put("12", "12月");
        assertDateLocaleProperties(Locale.JAPANESE, LocaleValueProvider.MONTH_NAME, expectedMonthNamesJP);
    }
    
    /**
     * Test name of day is returned correctly
     */
    @Test
    public void testNameOfWeekdays() throws Exception {
        HashMap<String, String> expectedDayNames = new HashMap<>();
        expectedDayNames.put("MON", "Monday");
        expectedDayNames.put("TUE", "Tuesday");
        expectedDayNames.put("WED", "Wednesday");
        expectedDayNames.put("THU", "Thursday");
        expectedDayNames.put("FRI", "Friday");
        expectedDayNames.put("SAT", "Saturday");
        expectedDayNames.put("SUN", "Sunday");
        assertDateLocaleProperties(null, LocaleValueProvider.WEEKDAY_NAME, expectedDayNames); //en_US
        
        HashMap<String, String> expectedDayNamesJP = new HashMap<>();
        expectedDayNamesJP.put("日", "日曜日");
        expectedDayNamesJP.put("月", "月曜日");
        expectedDayNamesJP.put("火", "火曜日");
        expectedDayNamesJP.put("水", "水曜日");
        expectedDayNamesJP.put("木", "木曜日");
        expectedDayNamesJP.put("金", "金曜日");
        expectedDayNamesJP.put("土", "土曜日");
        assertDateLocaleProperties(Locale.JAPANESE, LocaleValueProvider.WEEKDAY_NAME, expectedDayNamesJP);
    }
    
    /**
     * Test Today label is returned correctly
     */
    @Test
    public void testToday() throws Exception {
        assertTodayLocaleProperty(null, "Today");  // enUS
        assertTodayLocaleProperty(Locale.JAPANESE, "今日");
    }
    
    @SuppressWarnings("unchecked")
    private void assertDateLocaleProperties(Locale locale, String dateName,
            HashMap<String, String> expectedData) {
        AuraContext context = contextService.getCurrentContext();
        context.setRequestedLocales(locale == null ? null : Arrays.asList(locale));
        LocaleValueProvider lvp = new LocaleValueProvider(configAdapter, localizationAdapter, definitionService);
        
        ArrayList<LocalizedLabel> values = (ArrayList<LocalizedLabel>) lvp.getData().get(dateName);
        Set<String> expectedShortNames = expectedData.keySet();
        for (int i=0; i<values.size(); i++) {
            String shortName = values.get(i).getShortName();
            String fullName = values.get(i).getFullName();
            if (shortName != null && !shortName.isEmpty()) {
                assertTrue("Could not find short name '" + shortName + "' in expected short names for locale " + locale,
                    expectedShortNames.contains(shortName));
                assertEquals("Long names for locale " + locale + " do not equal",
                    expectedData.get(shortName), fullName);
            }
        }
    }   
        
    private void assertTodayLocaleProperty(Locale locale, String expectedLabel) {
        AuraContext context = contextService.getCurrentContext();
        context.setRequestedLocales(locale == null ? null : Arrays.asList(locale));
        LocaleValueProvider lvp = new LocaleValueProvider(configAdapter, localizationAdapter, definitionService);
        String actualLabel = (String) lvp.getData().get(LocaleValueProvider.TODAY_LABEL);
        assertEquals("Today label for locale " + locale + " is incorrect", expectedLabel, actualLabel);
    }
}
