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
package org.auraframework.impl.context;

import static org.junit.Assert.assertEquals;

import java.util.Locale;

import org.junit.Before;
import org.junit.Test;

public class LocalizationAdapterImplTest {

    LocalizationAdapterImpl localizationAdapter;

    @Before
    public void setUp() {
        this.localizationAdapter = new LocalizationAdapterImpl();
    }

    @Test
    public void testGetHtmlTextDirection() {
        assertEquals("Unexpected text diretion for English (Canada)", "ltr", localizationAdapter.getHtmlTextDirection(Locale.CANADA));

        assertEquals("Unexpected text diretion for Arabic (United Arab Emirates)", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("ar", "AE")));
        assertEquals("Unexpected text diretion for Persian", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("fa")));
        assertEquals("Unexpected text diretion for Hebrew", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("he")));
        assertEquals("Unexpected text diretion for Urdu", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("ur")));
        assertEquals("Unexpected text diretion for Yiddish", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("yi")));

        assertEquals("Unexpected text diretion for pseudo-localization (en_IL)", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("eo", "IL")));
        assertEquals("Unexpected text diretion for pseudo-localization (eo_IL)", "rtl", localizationAdapter.getHtmlTextDirection(new Locale("eo", "IL")));
    }

    @Test
    public void testGetHtmlLanguage() {
        assertEquals("Unexpected html language for English (United Kingdom)", "en-GB", localizationAdapter.getHtmlLanguage(Locale.UK));

        assertEquals("Unexpected html language for Hebrew", "he", localizationAdapter.getHtmlLanguage(new Locale("iw")));
        assertEquals("Unexpected html language for Indonesian", "id", localizationAdapter.getHtmlLanguage(new Locale("in")));
        assertEquals("Unexpected html language for Chinese (Simplified, China)", "zh-Hans-CN", localizationAdapter.getHtmlLanguage(Locale.SIMPLIFIED_CHINESE));
        assertEquals("Unexpected html language for Chinese (Traditional, Taiwan)", "zh-Hant-TW", localizationAdapter.getHtmlLanguage(Locale.TRADITIONAL_CHINESE));
        assertEquals("Unexpected html language for Chinese (Simplified, Singapore)", "zh-Hans-SG", localizationAdapter.getHtmlLanguage(new Locale("zh", "SG")));
        assertEquals("Unexpected html language for Chinese (Traditional, Hong Kong)", "zh-Hant-HK", localizationAdapter.getHtmlLanguage(new Locale("zh", "HK")));
    }
}
