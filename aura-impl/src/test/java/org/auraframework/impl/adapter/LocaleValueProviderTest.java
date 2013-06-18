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

import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
@UnAdaptableTest
public class LocaleValueProviderTest extends AuraImplTestCase {

    public LocaleValueProviderTest(String name) {
        super(name);
    }

    private interface LocaleProperty {
        final PropertyReference language = new PropertyReferenceImpl(
                LocaleValueProvider.LANGUAGE, null);
        final PropertyReference country = new PropertyReferenceImpl(
                LocaleValueProvider.COUNTRY, null);
        final PropertyReference variant = new PropertyReferenceImpl(
                LocaleValueProvider.VARIANT, null);
        final PropertyReference numberformat = new PropertyReferenceImpl(
                LocaleValueProvider.NUMBER_FORMAT, null);
        final PropertyReference percentformat = new PropertyReferenceImpl(
                LocaleValueProvider.PERCENT_FORMAT, null);
        final PropertyReference currencyformat = new PropertyReferenceImpl(
                LocaleValueProvider.CURRENCY_FORMAT, null);
        final PropertyReference timezone = new PropertyReferenceImpl(
                LocaleValueProvider.TIME_ZONE, null);
        final PropertyReference currency_code = new PropertyReferenceImpl(
                LocaleValueProvider.CURRENCY_CODE, null);
        final PropertyReference decimal = new PropertyReferenceImpl(
                LocaleValueProvider.DECIMAL, null);
        final PropertyReference grouping = new PropertyReferenceImpl(
                LocaleValueProvider.GROUPING, null);
        final PropertyReference currency = new PropertyReferenceImpl(
                LocaleValueProvider.CURRENCY, null);
    }

    public void testValidateLocaleProperty() throws Exception {
    	LocaleValueProvider lvp = new LocaleValueProvider();
        lvp.validate(LocaleProperty.language);
        lvp.validate(LocaleProperty.country);
        lvp.validate(LocaleProperty.variant);
        lvp.validate(LocaleProperty.numberformat);
        lvp.validate(LocaleProperty.percentformat);
        lvp.validate(LocaleProperty.currencyformat);
        lvp.validate(LocaleProperty.timezone);
        lvp.validate(LocaleProperty.currency_code);
        lvp.validate(LocaleProperty.decimal);
        lvp.validate(LocaleProperty.grouping);
        lvp.validate(LocaleProperty.currency);
        
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
    public void testInvalidLocalePropertyInMarkup() throws Exception {
        try {
            DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                    ComponentDef.class,
                    "<aura:component>{!$Locale.badProperty}</aura:component>");

            Aura.getInstanceService().getInstance(desc, null);
            fail("Expected an InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Locale for key: badProperty",
                    e.getMessage());
        }
    }
    
    // Setting some locales for testing
    public void testGetValue() throws Exception {
    	HashMap<String, Object> defaultLocaleProperties = new HashMap<String, Object>();
    	defaultLocaleProperties.put(LocaleValueProvider.LANGUAGE, "en");
    	defaultLocaleProperties.put(LocaleValueProvider.COUNTRY, "US");
    	defaultLocaleProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0.00;(¤#,##0.00)");
    	defaultLocaleProperties.put(LocaleValueProvider.CURRENCY_CODE, "USD");
    	defaultLocaleProperties.put(LocaleValueProvider.CURRENCY, "$");
    	assertLocaleProperties(null, defaultLocaleProperties);
    	
    	HashMap<String, Object> jaLocaleProperties = new HashMap<String, Object>();
    	jaLocaleProperties.put(LocaleValueProvider.LANGUAGE, "ja");
    	jaLocaleProperties.put(LocaleValueProvider.COUNTRY, "JP");
    	jaLocaleProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0");
    	jaLocaleProperties.put(LocaleValueProvider.CURRENCY_CODE, "JPY");
    	jaLocaleProperties.put(LocaleValueProvider.CURRENCY, "￥");
    	assertLocaleProperties(Locale.JAPAN, jaLocaleProperties);
    	
    	HashMap<String, Object> ukLocaleProperties = new HashMap<String, Object>();
    	ukLocaleProperties.put(LocaleValueProvider.LANGUAGE, "en");
    	ukLocaleProperties.put(LocaleValueProvider.COUNTRY, "GB");
    	ukLocaleProperties.put(LocaleValueProvider.CURRENCY_FORMAT, "¤#,##0.00");
    	ukLocaleProperties.put(LocaleValueProvider.CURRENCY_CODE, "GBP");
    	ukLocaleProperties.put(LocaleValueProvider.CURRENCY, "£");
    	assertLocaleProperties(Locale.UK, ukLocaleProperties);
    }
    
    private void assertLocaleProperties(Locale locale,
			HashMap<String, Object> localeProperties) {
    	AuraContext context = Aura.getContextService().getCurrentContext();
        context.setRequestedLocales(locale == null ? null : Arrays.asList(locale));
        LocaleValueProvider lvp = new LocaleValueProvider();
        assertLocaleProperty(lvp, LocaleProperty.language, localeProperties.get(LocaleValueProvider.LANGUAGE));
        assertLocaleProperty(lvp, LocaleProperty.country, localeProperties.get(LocaleValueProvider.COUNTRY));
        assertLocaleProperty(lvp, LocaleProperty.currencyformat, localeProperties.get(LocaleValueProvider.CURRENCY_FORMAT));
        assertLocaleProperty(lvp, LocaleProperty.currency_code, localeProperties.get(LocaleValueProvider.CURRENCY_CODE));
        assertLocaleProperty(lvp, LocaleProperty.currency, localeProperties.get(LocaleValueProvider.CURRENCY));
	}
    
    private void assertLocaleProperty(LocaleValueProvider lvp,
			PropertyReference property, Object expected) {
    	 assertEquals("Unexpected value for " + property.toString(), expected,
                 lvp.getValue(property));
	}

    /**
     * Test to verify getValue returns null for undefined property
     * @throws Exception
     */
	public void testGetValueUndefinedProperty() throws Exception {
		AuraContext context = Aura.getContextService().getCurrentContext();
        context.setRequestedLocales(Arrays.asList(Locale.UK));
    	LocaleValueProvider lvp = new LocaleValueProvider();
    	assertEquals(null,
                lvp.getValue(new PropertyReferenceImpl("ISO3Language", null))); // undefined
                                                                                // property
    }
}
