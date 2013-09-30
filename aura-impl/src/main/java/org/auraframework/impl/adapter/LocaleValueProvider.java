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

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.AuraLocale;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;
import com.ibm.icu.text.DecimalFormat;
import com.ibm.icu.text.DecimalFormatSymbols;
import com.ibm.icu.util.Currency;

public class LocaleValueProvider implements GlobalValueProvider {
    public static String USER_LOCALE_LANGUAGE = "userLocaleLang";
    public static String USER_LOCALE_COUNTRY = "userLocaleCountry";
    
    public static String LANGUAGE = "language";
    public static String COUNTRY = "country";
    public static String VARIANT = "variant";
    public static String LANGUAGE_LOCALE = "langLocale";
    
    public static String NUMBER_FORMAT = "numberFormat";
    public static String PERCENT_FORMAT = "percentFormat";
    public static String CURRENCY_FORMAT = "currencyFormat";
    
    public static String DATE_FORMAT = "dateFormat";
    public static String DATETIME_FORMAT = "datetimeFormat";
    public static String TIME_FORMAT = "timeFormat";
    public static String TIME_ZONE = "timezone";
    public static String TIME_ZONE_FILE_NAME = "timezoneFileName";
    public static String CURRENCY_CODE = "currencyCode";

    // symbols
    public static String DECIMAL = "decimal";
    public static String GROUPING = "grouping";
    public static String CURRENCY = "currency";
    public static String ZERO_DIGIT = "zero";
    
    public static String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm";
    public static String DEFAULT_TIME_FORMAT = "HH:mm";
    
    private final Map<String, Object> data;

    public LocaleValueProvider() {
        Builder<String, Object> builder = ImmutableMap.builder();
        
        AuraLocale al = Aura.getLocalizationAdapter().getAuraLocale();
        
        Locale userLocale = al.getLocale();
        Locale lang = al.getLanguageLocale();
        Locale dateLocale = al.getDateLocale();
        
        builder.put(USER_LOCALE_LANGUAGE, userLocale.getLanguage());
        builder.put(USER_LOCALE_COUNTRY, userLocale.getCountry());
        builder.put(LANGUAGE, lang.getLanguage());
        builder.put(COUNTRY, lang.getCountry());
        builder.put(VARIANT, lang.getVariant());
        builder.put(LANGUAGE_LOCALE, lang.toString());

        // using java DateFormat because the year pattern "MMM d, y" (although valid) isn't understood by moment.js
        DateFormat dateFormat = DateFormat.getDateInstance(DateFormat.DEFAULT, dateLocale);
        DateFormat datetimeFormat = DateFormat.getDateTimeInstance(DateFormat.DEFAULT, DateFormat.DEFAULT, dateLocale);
        DateFormat timeFormat = DateFormat.getTimeInstance(DateFormat.DEFAULT, dateLocale);
        try {
            SimpleDateFormat sdf = (SimpleDateFormat) dateFormat;
            builder.put(DATE_FORMAT, sdf.toPattern());
            
            SimpleDateFormat sdtf = (SimpleDateFormat) datetimeFormat;
            builder.put(DATETIME_FORMAT, sdtf.toPattern());
            
            SimpleDateFormat stf = (SimpleDateFormat) timeFormat;
            builder.put(TIME_FORMAT, stf.toPattern());
        } catch (ClassCastException cce) {
            builder.put(DATE_FORMAT, DEFAULT_DATE_FORMAT);
            builder.put(DATETIME_FORMAT, DEFAULT_DATETIME_FORMAT);
            builder.put(TIME_FORMAT, DEFAULT_TIME_FORMAT);
        }
                
        builder.put(TIME_ZONE, al.getTimeZone().getID());
        builder.put(TIME_ZONE_FILE_NAME, al.getTimeZone().getID().replace("/", "-"));

        // DecimalFormat is expected
        DecimalFormat df = (DecimalFormat) DecimalFormat.getNumberInstance(al.getNumberLocale());

        builder.put(NUMBER_FORMAT, df.toPattern());
        DecimalFormatSymbols dfs = df.getDecimalFormatSymbols();
        builder.put(DECIMAL, dfs.getDecimalSeparator());
        builder.put(GROUPING, dfs.getGroupingSeparator());
        builder.put(ZERO_DIGIT, dfs.getZeroDigit());
        
        df = (DecimalFormat) DecimalFormat.getPercentInstance(al.getNumberLocale());

        builder.put(PERCENT_FORMAT, df.toPattern());
        
        df = (DecimalFormat) DecimalFormat.getCurrencyInstance(al.getCurrencyLocale());

        builder.put(CURRENCY_FORMAT, df.toPattern());
        DecimalFormatSymbols cdfs = df.getDecimalFormatSymbols();
        Currency cur = cdfs.getCurrency();
        builder.put(CURRENCY_CODE, cur != null ? cur.getCurrencyCode() : "");
        builder.put(CURRENCY, cdfs.getCurrencySymbol());

        data = builder.build();
    }

    @Override
    public Object getValue(PropertyReference expr) {
        return getData().get(expr.getRoot());
    }

    @Override
    public ValueProviderType getValueProviderKey() {
        return ValueProviderType.LOCALE;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return DefDescriptorImpl.getInstance("String", TypeDef.class);
    }

    @Override
    public void validate(PropertyReference expr) throws InvalidExpressionException {
        if (expr.size() != 1 || !getData().containsKey(expr.getRoot())) {
            throw new InvalidExpressionException("No property on $Locale for key: " + expr, expr.getLocation());
        }
    }

    @Override
    public boolean isEmpty() {
        return false;
    }

    @Override
    public Map<String, ?> getData() {
        return data;
    }
}
