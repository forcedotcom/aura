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
package org.auraframework.integration.test.http.resource;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.http.resource.LocaleDataJsAppender;
import org.auraframework.impl.AuraImplTestCase;
import org.junit.Test;

import javax.inject.Inject;

public class LocaleDataJsAppenderTest extends AuraImplTestCase {

    @Inject
    private LocalizationAdapter localizationAdapter;

    @Inject
    private ExceptionAdapter exceptionAdapter;

    private LocaleDataJsAppender getInlineJs() {
        LocaleDataJsAppender appender = new LocaleDataJsAppender();
        appender.setLocalizationAdapter(localizationAdapter);
        appender.setExceptionAdapter(exceptionAdapter);
        appender.initialize();

        return appender;
    }

    /**
     * Verify all moment locale data are correctly parsed into map.
     * For current version of moment, it has 108 locales.
     */
    @Test
    public void testInitializeLoadsAllMomentLocaleData() {
        LocaleDataJsAppender appender = getInlineJs();
        assertEquals(108, appender.getMomentLocales().size());
    }

    /**
     * In Java 8, locale for norwegian(Norway) uses no-NO.
     * http://www.oracle.com/technetwork/java/javase/java8locales-2095355.html
     * 
     * However, momentJs only supports Norwegian Bokmål [nb], see locales.js.
     * Hard code conversion is needed for the locale.
     */
    @Test
    public void testGetMomentLocaleForNorwegian() {
        LocaleDataJsAppender appender = getInlineJs();
        String actual = appender.getMomentLocale("no_NO");

        String expected = "nb";
        assertEquals(expected, actual);
    }
}
