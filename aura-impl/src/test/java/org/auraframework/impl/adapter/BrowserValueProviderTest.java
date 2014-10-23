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

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.test.client.UserAgent;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

public class BrowserValueProviderTest extends AuraImplTestCase {

    public BrowserValueProviderTest(String name) {
        super(name);
    }

    private interface BrowserProperty {
        final PropertyReference isTablet = new PropertyReferenceImpl(
                BrowserValueProvider.IS_TABLET, null);
        final PropertyReference isPhone = new PropertyReferenceImpl(
                BrowserValueProvider.IS_PHONE, null);
        final PropertyReference isAndroid = new PropertyReferenceImpl(
                BrowserValueProvider.IS_ANDROID, null);
        final PropertyReference formFactor = new PropertyReferenceImpl(
                BrowserValueProvider.FORM_FACTOR, null);
        final PropertyReference isIPad = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IPAD, null);
        final PropertyReference isIPhone = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IPHONE, null);
        final PropertyReference isIOS = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IOS, null);
        final PropertyReference isWindowsPhone = new PropertyReferenceImpl(
                BrowserValueProvider.IS_WINDOWS_PHONE, null);
    }

    private interface BrowserType {
        final PropertyReference isWebKit = new PropertyReferenceImpl(
                BrowserValueProvider.IS_WEBKIT, null);
        final PropertyReference isFirefox = new PropertyReferenceImpl(
                BrowserValueProvider.IS_FIREFOX, null);
        final PropertyReference isIE6 = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IE6, null);
        final PropertyReference isIE7 = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IE7, null);
        final PropertyReference isIE8 = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IE8, null);
        final PropertyReference isIE9 = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IE9, null);
        final PropertyReference isIE10 = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IE10, null);
        final PropertyReference isIE11 = new PropertyReferenceImpl(
                BrowserValueProvider.IS_IE11, null);
    }

    public void testValidate() throws Exception {
        BrowserValueProvider bvp = new BrowserValueProvider();
        bvp.validate(BrowserProperty.isTablet);
        bvp.validate(BrowserProperty.isPhone);
        bvp.validate(BrowserProperty.isAndroid);
        bvp.validate(BrowserProperty.formFactor);
        bvp.validate(BrowserProperty.isIPad);
        bvp.validate(BrowserProperty.isIPhone);
        bvp.validate(BrowserProperty.isIOS);
        bvp.validate(BrowserProperty.isWindowsPhone);

        PropertyReference property = new PropertyReferenceImpl("hah", null);
        try {
            bvp.validate(property);
            fail("Expected InvalidExpressionException for " + property);
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Browser for key: " + property,
                    e.getMessage());
        }

        try {
            bvp.validate(null);
            fail("Expected NullPointerException for null PropertyReference");
        } catch (NullPointerException expected) {
        }
    }

    // semi-integration test checks that value provider is created and validated
    // on component
    public void testInvalidPropertyInMarkup() throws Exception {
        try {
            DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                    ComponentDef.class,
                    "<aura:component>{!$Browser.badProperty}</aura:component>");

            Aura.getInstanceService().getInstance(desc, null);
            fail("Expected an InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Browser for key: badProperty",
                    e.getMessage());
        }
    }

    private void assertBrowserProperty(BrowserValueProvider bvp, PropertyReference property, Object expected,
            String userAgent) throws Exception {
        assertEquals("Unexpected value for " + property.toString() + " for UserAgent <" + userAgent + ">", expected,
                bvp.getValue(property));
    }

    private void assertBrowserProperties(UserAgent userAgent, boolean isTablet,
            boolean isPhone, boolean isAndroid, String formFactor,
            boolean isIPad, boolean isIPhone, boolean isIOS, boolean isWindowsPhone) throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String userAgentString = userAgent == null ? null : userAgent.getUserAgentString();
        context.setClient(new Client(userAgentString));
        BrowserValueProvider bvp = new BrowserValueProvider();
        assertBrowserProperty(bvp, BrowserProperty.isTablet, isTablet, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.isPhone, isPhone, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.isAndroid, isAndroid, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.formFactor, formFactor, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.isIPad, isIPad, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.isIPhone, isIPhone, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.isIOS, isIOS, userAgentString);
        assertBrowserProperty(bvp, BrowserProperty.isWindowsPhone, isWindowsPhone, userAgentString);
    }

    /**
     * Verify user agent strings return the correct browser properties (form factor, OS, etc.).
     */
    public void testGetValueBrowserProperties() throws Exception {
        assertBrowserProperties(null, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.EMPTY, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.GOOGLE_CHROME, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.IE6, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.IE7, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.IE8, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.IE9, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.IE10, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.IE11, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.FIREFOX, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.SAFARI5_MAC, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.OPERA12, false, false, false, "DESKTOP", false, false, false, false);
        assertBrowserProperties(UserAgent.OPERA12_MOBILE, false, true, true, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.IPHONE4, false, true, false, "PHONE", false, true, true, false);
        assertBrowserProperties(UserAgent.IPOD, false, true, false, "PHONE", false, true, true, false);
        assertBrowserProperties(UserAgent.IPAD, true, false, false, "TABLET", true, false, true, false);
        assertBrowserProperties(UserAgent.IPAD_7, true, false, false, "TABLET", true, false, true, false);
        assertBrowserProperties(UserAgent.IPAD_WEBVIEW, true, false, false, "TABLET", true, false, true, false);
        assertBrowserProperties(UserAgent.ANDROID1_6, false, true, true, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.ANDROID2_3, false, true, true, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.ANDROID4_2, false, true, true, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.NEXUS_10, true, false, true, "TABLET", false, false, false, false);
        assertBrowserProperties(UserAgent.KINDLE_FIRE, true, false, false, "TABLET", false, false, false, false);
        assertBrowserProperties(UserAgent.PLAYBOOK, true, false, false, "TABLET", false, false, false, false);
        assertBrowserProperties(UserAgent.NOKIA_N95, false, true, false, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.NOKIA_920, false, true, false, "PHONE", false, false, false, true);
        assertBrowserProperties(UserAgent.LUMIA_928, false, true, false, "PHONE", false, false, false, true);
        assertBrowserProperties(UserAgent.IE10_WINDOWS_PHONE_8, false, true, false, "PHONE", false, false, false, true);
        assertBrowserProperties(UserAgent.IE10_WINDOWS_RT_8, true, false, false, "TABLET", false, false, false, false);
        assertBrowserProperties(UserAgent.IE11_WINDOWS_PHONE_8_1, false, true, false, "PHONE", false, false, false,
                true);
        assertBrowserProperties(UserAgent.IE11_WINDOWS_RT_8_1, true, false, false, "TABLET", false, false, false, false);
        assertBrowserProperties(UserAgent.IE11_WINDOWS_PHONE_8_1, false, true, false, "PHONE", false, false, false,
                true);
        assertBrowserProperties(UserAgent.BLACKBERRY_10, false, true, false, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.BLACKBERRY_7, false, true, false, "PHONE", false, false, false, false);
        assertBrowserProperties(UserAgent.GOOD_IPHONE, false, true, false, "PHONE", false, true, true, false);
        assertBrowserProperties(UserAgent.GOOD_ANDROID, false, true, true, "PHONE", false, false, false, false);
    }

    public void testGetValueUndefinedProperty() throws Exception {
        BrowserValueProvider bvp = new BrowserValueProvider();
        assertEquals(null,
                bvp.getValue(new PropertyReferenceImpl("isBlackberry", null))); // undefined property
    }

    public void testGetValueBrowserTypes() throws Exception {
        assertBrowserTypes(UserAgent.EMPTY, false, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.GOOGLE_CHROME, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.IE6, false, false, true, false, false, false, false, false);
        assertBrowserTypes(UserAgent.IE7, false, false, false, true, false, false, false, false);
        assertBrowserTypes(UserAgent.IE8, false, false, false, false, true, false, false, false);
        assertBrowserTypes(UserAgent.IE9, false, false, false, false, false, true, false, false);
        assertBrowserTypes(UserAgent.IE10, false, false, false, false, false, false, true, false);
        assertBrowserTypes(UserAgent.IE11, false, false, false, false, false, false, false, true);
        assertBrowserTypes(UserAgent.IE11_WINDOWS_PHONE_8_1_SDK, false, false, false, false, false, false, false,
                true);
        assertBrowserTypes(UserAgent.IE11_NET_FRAMEWORK, false, false, false, false, false, false, false, true);
        assertBrowserTypes(UserAgent.IE11_WINDOWS_PHONE_8_1, false, false, false, false, false, false, false, true);
        assertBrowserTypes(UserAgent.IE11_WINDOWS_RT_8_1, false, false, false, false, false, false, false, true);
        assertBrowserTypes(UserAgent.LUMIA_928, false, false, false, false, false, false, false, true);
        assertBrowserTypes(UserAgent.NOKIA_920, false, false, false, false, false, false, true, false);
        assertBrowserTypes(UserAgent.FIREFOX, false, true, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.NETSCAPE, false, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.SAFARI5_MAC, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.SAFARI5_WINDOWS, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.SAFARI6, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.IPAD, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.IPAD_7, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.IPAD_WEBVIEW, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.NEXUS_10, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.OPERA12, false, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.OPERA12_MOBILE, false, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.OPERA_MINI, false, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.KINDLE_FIRE, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.ANDROID4_2, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.BLACKBERRY_7, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.BLACKBERRY_10, true, false, false, false, false, false, false, false);
        assertBrowserTypes(UserAgent.GOOD_IPHONE, true, false, false, false, false, false, false, false);
        // Good Technology for Android is not reported as WebKit, is that correct?
        assertBrowserTypes(UserAgent.GOOD_ANDROID, false, false, false, false, false, false, false, false);
    }

    private void assertBrowserType(BrowserValueProvider bvp, PropertyReference property, Object expected,
            String userAgent) throws Exception {
        assertEquals("Unexpected value for " + property.toString() + " for UserAgent <" + userAgent + ">", expected,
                bvp.getValue(property));
    }

    private void assertBrowserTypes(UserAgent userAgent, boolean isWebKit, boolean isFirefox, boolean isIE6,
            boolean isIE7, boolean isIE8, boolean isIE9, boolean isIE10, boolean isIE11) throws Exception {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String userAgentString = userAgent == null ? null : userAgent.getUserAgentString();
        context.setClient(new Client(userAgentString));
        BrowserValueProvider bvp = new BrowserValueProvider();
        assertBrowserType(bvp, BrowserType.isWebKit, isWebKit, userAgentString);
        assertBrowserType(bvp, BrowserType.isFirefox, isFirefox, userAgentString);
        assertBrowserType(bvp, BrowserType.isIE6, isIE6, userAgentString);
        assertBrowserType(bvp, BrowserType.isIE7, isIE7, userAgentString);
        assertBrowserType(bvp, BrowserType.isIE8, isIE8, userAgentString);
        assertBrowserType(bvp, BrowserType.isIE9, isIE9, userAgentString);
        assertBrowserType(bvp, BrowserType.isIE10, isIE10, userAgentString);
        assertBrowserType(bvp, BrowserType.isIE11, isIE11, userAgentString);
    }

}
