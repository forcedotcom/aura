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

import java.text.*;
import java.util.Locale;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.util.AuraLocale;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;

public class LocaleValueProvider implements GlobalValueProvider {
    public static String LANGUAGE = "language";
    public static String COUNTRY = "country";
    public static String VARIANT = "variant";
    public static String NUMBER_FORMAT = "numberformat";
    public static String PERCENT_FORMAT = "percentformat";
    public static String CURRENCY_FORMAT = "currencyformat";
// TODO: add date format
//    public static String DATE_FORMAT = "dateformat";
    public static String TIME_ZONE = "timezone";
    public static String TIME_ZONE_FILE_NAME = "timezoneFileName";
    public static String CURRENCY_CODE = "currency_code";

    // symbols
    public static String DECIMAL = "decimal";
    public static String GROUPING = "grouping";
    public static String CURRENCY = "currency";
    
    private final Map<String, Object> data;

    public LocaleValueProvider() {
        Builder<String, Object> builder = ImmutableMap.builder();
        
        AuraLocale al = Aura.getLocalizationAdapter().getAuraLocale();
        Locale lang = al.getLanguageLocale();
        builder.put(LANGUAGE, lang.getLanguage());
        builder.put(COUNTRY, lang.getCountry());
        builder.put(VARIANT, lang.getVariant());
        builder.put(TIME_ZONE, al.getTimeZone().getID());
        builder.put(TIME_ZONE_FILE_NAME, al.getTimeZone().getID().replace("/", "-"));
        
        NumberFormat nf = NumberFormat.getNumberInstance(al.getNumberLocale());
        if (!(nf instanceof DecimalFormat)) {
            throw new AuraRuntimeException("Expected DecimalFormat, but found " + nf.getClass().getName());
        }
        DecimalFormat df = (DecimalFormat) nf;
        builder.put(NUMBER_FORMAT, df.toPattern());
        DecimalFormatSymbols dfs = df.getDecimalFormatSymbols();
        builder.put(DECIMAL, dfs.getDecimalSeparator());
        builder.put(GROUPING, dfs.getGroupingSeparator());
        
        nf = NumberFormat.getPercentInstance(al.getNumberLocale());
        if (!(nf instanceof DecimalFormat)) {
            throw new AuraRuntimeException("Expected DecimalFormat, but found " + nf.getClass().getName());
        }
        DecimalFormat pf = (DecimalFormat) nf;
        builder.put(PERCENT_FORMAT, pf.toPattern());
        
        nf = NumberFormat.getCurrencyInstance(al.getCurrencyLocale());
        if (!(nf instanceof DecimalFormat)) {
            throw new AuraRuntimeException("Expected DecimalFormat, but found " + nf.getClass().getName());
        }
        DecimalFormat cf = (DecimalFormat) nf;
        builder.put(CURRENCY_FORMAT, cf.toPattern());
        DecimalFormatSymbols cdfs = cf.getDecimalFormatSymbols();
        builder.put(CURRENCY_CODE, cdfs.getCurrency().getCurrencyCode());
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
