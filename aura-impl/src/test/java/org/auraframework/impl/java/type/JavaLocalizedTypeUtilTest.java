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
package org.auraframework.impl.java.type;

import org.auraframework.impl.util.AuraLocaleImpl;
import org.auraframework.test.UnitTestCase;

import java.math.BigDecimal;
import java.util.Locale;

/**
 * Verify implementation of JavaLocalizedTypeUtil used to convert data from a given type
 * to a desired type using a Locale.
 *
 *
 */
public class JavaLocalizedTypeUtilTest extends UnitTestCase {

    /**
     * Verify initialization of converters for Localized Strings and numbers.
     */
    public void testNumberConvertersExist(){

        // verify number converters are available
        // there should be one assertion here for every LocalizedConverter in aura.impl.java.type.converter
        assertTrue("Missing LocalizedConverter: String to BigDecimal", JavaLocalizedTypeUtil.hasConverter(String.class, BigDecimal.class));
        assertTrue("Missing LocalizedConverter: String to Double", JavaLocalizedTypeUtil.hasConverter(String.class, Double.class));
        assertTrue("Missing LocalizedConverter: String to Integer", JavaLocalizedTypeUtil.hasConverter(String.class, Integer.class));
        assertTrue("Missing LocalizedConverter: String to Long", JavaLocalizedTypeUtil.hasConverter(String.class, Long.class));
        assertTrue("Missing LocalizedConverter: BigDecimal to String", JavaLocalizedTypeUtil.hasConverter(BigDecimal.class, String.class));
        assertTrue("Missing LocalizedConverter: Integer to String", JavaLocalizedTypeUtil.hasConverter(Integer.class, String.class));

        // but only if they are really available
        assertFalse("Wrongly identified an available LocalizedConverter", JavaLocalizedTypeUtil.hasConverter(BigDecimal.class, java.util.Date.class));

    }

    /**
     * Verify conversion of Localized Strings and consistent numeric data.
     */
    public void testNumberConvertersWork(){

        // verify the converter returns a valid value...
        BigDecimal correctDecimal = new BigDecimal("123456.789");
        Integer correctInteger = new Integer(123);

        // ...for unstyled ints in default Locale
        Integer anInteger = JavaLocalizedTypeUtil.convert("123", Integer.class, false, new AuraLocaleImpl());
        assertNotNull("String to Integer with Locale was null", anInteger);
        assertEquals("String to Integer with Locale was wrong", correctInteger, anInteger);

        // ...for US format decimals
        BigDecimal usDecimal = JavaLocalizedTypeUtil.convert("123,456.789", BigDecimal.class, false, new AuraLocaleImpl(Locale.US));
        assertNotNull("U.S. localized String to BigDecimal was null", usDecimal);
        assertEquals("U.S. localized String to BigDecimal problem", correctDecimal, usDecimal);

        // ...for de_DE format decimals
        BigDecimal deDecimal = JavaLocalizedTypeUtil.convert("123.456,789", BigDecimal.class, false, new AuraLocaleImpl(Locale.GERMANY));
        assertNotNull("German localized String to BigDecimal was null", deDecimal);
        assertEquals("German localized String to BigDecimal problem", correctDecimal, deDecimal);

        // TODO: add more tests
    }


}
