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

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.test.client.UserAgent;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

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
public class BrowserValueProviderTest extends AuraImplTestCase {

    public BrowserValueProviderTest(String name) {
        super(name);
    }

    private interface BrowserProperty{
        final PropertyReference isTablet = new PropertyReferenceImpl(BrowserValueProvider.IS_TABLET, null);
        final PropertyReference isPhone = new PropertyReferenceImpl(BrowserValueProvider.IS_PHONE, null);
        final PropertyReference isAndroid = new PropertyReferenceImpl(BrowserValueProvider.IS_ANDROID, null);
        final PropertyReference formFactor = new PropertyReferenceImpl(BrowserValueProvider.FORM_FACTOR, null);
        final PropertyReference isIPad = new PropertyReferenceImpl(BrowserValueProvider.IS_IPAD, null);
        final PropertyReference isIPhone = new PropertyReferenceImpl(BrowserValueProvider.IS_IPHONE, null);
        final PropertyReference isIOS = new PropertyReferenceImpl(BrowserValueProvider.IS_IOS, null);
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

        PropertyReference property = new PropertyReferenceImpl("hah", null);
        try {
            bvp.validate(property);
            fail("Expected InvalidExpressionException for " + property);
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Browser for key: " + property, e.getMessage());
        }

        try {
            bvp.validate(null);
            fail("Expected NullPointerException for null PropertyReference");
        } catch (NullPointerException expected) {}
    }
    
    // semi-integration test checks that value provider is created and validated on component
    public void testInvalidPropertyInMarkup() throws Exception {
        Aura.getContextService().startContext(Mode.UTEST, Format.HTML, Access.AUTHENTICATED);
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component>{!$Browser.badProperty}</aura:component>");
        try {
            Aura.getInstanceService().getInstance(desc, null);
            fail("Expected an InvalidExpressionException");
        } catch (InvalidExpressionException e) {
            assertEquals("No property on $Browser for key: badProperty", e.getMessage());
        }
    }
    
    private void assertBrowserProperty(BrowserValueProvider bvp, PropertyReference property, Object expected) throws Exception {
        assertEquals("Unexpected value for " + property.toString(), expected, bvp.getValue(property));
    }
    
    private void assertBrowserProperties(UserAgent userAgent, boolean isTablet, boolean isPhone, boolean isAndroid,
            String formFactor, boolean isIPad, boolean isIPhone, boolean isIOS) throws Exception {
        AuraContext context = Aura.getContextService().startContext(Mode.UTEST, Format.HTML, Access.AUTHENTICATED);
        context.setClient(new Client(userAgent == null ? null : userAgent.getUserAgentString()));
        BrowserValueProvider bvp = new BrowserValueProvider();
        assertBrowserProperty(bvp, BrowserProperty.isTablet, isTablet);
        assertBrowserProperty(bvp, BrowserProperty.isPhone, isPhone);
        assertBrowserProperty(bvp, BrowserProperty.isAndroid, isAndroid);
        assertBrowserProperty(bvp, BrowserProperty.formFactor, formFactor);
        assertBrowserProperty(bvp, BrowserProperty.isIPad, isIPad);
        assertBrowserProperty(bvp, BrowserProperty.isIPhone, isIPhone);
        assertBrowserProperty(bvp, BrowserProperty.isIOS, isIOS);
    }

    // sample some user agents
    public void testGetValue() throws Exception {
        assertBrowserProperties(null, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.EMPTY, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.GOOGLE_CHROME, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.IE7, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.IE8, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.IE9, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.IE10, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.FIREFOX, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.SAFARI5_MAC, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.OPERA12, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.OPERA12_MOBILE, false, true, true, "PHONE", false, false, false);
        assertBrowserProperties(UserAgent.IPHONE4, false, true, false, "PHONE", false, true, true);
        assertBrowserProperties(UserAgent.IPOD, false, true, false, "PHONE", false, true, true);
        assertBrowserProperties(UserAgent.IPAD, true, false, false, "TABLET", true, false, true);
        assertBrowserProperties(UserAgent.ANDROID1_6, false, true, true, "PHONE", false, false, false);
        assertBrowserProperties(UserAgent.ANDROID2_3, false, true, true, "PHONE", false, false, false);
        assertBrowserProperties(UserAgent.KINDLE_FIRE, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.PLAYBOOK, false, false, false, "DESKTOP", false, false, false);
        assertBrowserProperties(UserAgent.NOKIA_N95, false, false, false, "DESKTOP", false, false, false);
    }
    
    public void testGetValueUndefinedProperty() throws Exception {
        BrowserValueProvider bvp = new BrowserValueProvider();
        assertEquals(null, bvp.getValue(new PropertyReferenceImpl("isBlackberry", null)));  // undefined property
    }
}
