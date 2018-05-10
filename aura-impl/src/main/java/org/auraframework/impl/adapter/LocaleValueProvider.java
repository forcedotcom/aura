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

import java.io.IOException;
import java.text.DateFormatSymbols;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LocalizationService;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;


public class LocaleValueProvider implements GlobalValueProvider {
    public static String USER_LOCALE_LANGUAGE = "userLocaleLang";
    public static String USER_LOCALE_COUNTRY = "userLocaleCountry";

    public static String LANGUAGE = "language";
    public static String COUNTRY = "country";
    public static String VARIANT = "variant";
    public static String LANGUAGE_LOCALE = "langLocale";

    public static String MONTH_NAME = "nameOfMonths";
    public static String TODAY_LABEL = "labelForToday";
    public static String WEEKDAY_NAME = "nameOfWeekdays";
    public static String FIRST_DAY_OF_WEEK = "firstDayOfWeek";

    public static String NUMBER_FORMAT = "numberFormat";
    public static String PERCENT_FORMAT = "percentFormat";
    public static String CURRENCY_FORMAT = "currencyFormat";

    public static String DATE_FORMAT = "dateFormat";
    public static String DATETIME_FORMAT = "datetimeFormat";
    public static String TIME_FORMAT = "timeFormat";
    public static String TIME_ZONE = "timezone";
    public static String CURRENCY_CODE = "currencyCode";

    // symbols
    public static String DECIMAL = "decimal";
    public static String GROUPING = "grouping";
    public static String CURRENCY = "currency";
    public static String ZERO_DIGIT = "zero";

    public static String IS_EASTERN_NAME_STYLE = "isEasternNameStyle";
    public static String SHOW_JAPANESE_IMPERIAL_YEAR = "showJapaneseImperialYear";
    public static String DIR = "dir";

    private final Map<String, Object> data;
    private final DefinitionService definitionService;

    public LocaleValueProvider(LocalizationService localizationService, LocalizationAdapter localizationAdapter, DefinitionService definitionService) {
        this.definitionService = definitionService;

        Builder<String, Object> builder = ImmutableMap.builder();

        AuraLocale auraLocale = localizationAdapter.getAuraLocale();

        Locale userLocale = auraLocale.getLocale();
        Locale lang = auraLocale.getLanguageLocale();

        builder.put(USER_LOCALE_LANGUAGE, userLocale.getLanguage());
        builder.put(USER_LOCALE_COUNTRY, userLocale.getCountry());
        builder.put(LANGUAGE, lang.getLanguage());
        builder.put(COUNTRY, lang.getCountry());
        builder.put(VARIANT, lang.getVariant());
        builder.put(LANGUAGE_LOCALE, lang.toString());

        try {
            builder.put(MONTH_NAME, this.getNameOfMonths(auraLocale));
            builder.put(WEEKDAY_NAME, this.getNameOfWeekdays(auraLocale));
            builder.put(TODAY_LABEL, this.getLabelForToday(localizationAdapter));
        } catch (QuickFixException qfe) {
            // Ignore
        }

        builder.put(FIRST_DAY_OF_WEEK, Calendar.getInstance(auraLocale.getTimeZone(), userLocale).getFirstDayOfWeek());

        String timezoneId = auraLocale.getTimeZone().getID();
        builder.put(TIME_ZONE, timezoneId);

        builder.put(IS_EASTERN_NAME_STYLE, auraLocale.isEasternNameStyle());
        if ("ja".equals(userLocale.getLanguage())) {
            builder.put(SHOW_JAPANESE_IMPERIAL_YEAR, localizationAdapter.showJapaneseImperialYear());
        }

        // FORMAT PATTERNS

        builder.put(DATE_FORMAT, localizationService.getDateFormatPattern());
        builder.put(DATETIME_FORMAT, localizationService.getDateTimeFormatPattern());
        builder.put(TIME_FORMAT, localizationService.getTimeFormatPattern());

        builder.put(NUMBER_FORMAT, localizationService.getNumberFormatPattern());
        builder.put(DECIMAL, localizationService.getDecimalSeparator());
        builder.put(GROUPING, localizationService.getGroupingSeparator());
        builder.put(ZERO_DIGIT, localizationService.getZeroDigit());

        builder.put(PERCENT_FORMAT, localizationService.getPercentFormatPattern());

        // Don't localize the patterns
        builder.put(CURRENCY_FORMAT, localizationService.getCurrencyFormatPattern());
        builder.put(CURRENCY_CODE, localizationService.getCurrencyCode());
        builder.put(CURRENCY, localizationService.getCurrencySymbol());

        String dir = "ltr";
        switch (lang.getLanguage()) {
        case "he":  case "ji":  case "ar":  case "iw":  case "yi":  case "fa":  case "ur":
            dir = "rtl";
        default:
        }
        builder.put(DIR, dir);


        data = builder.build();
    }

    @Override
    public Object getValue(PropertyReference expr) {
        return getData().get(expr.getRoot());
    }

    @Override
    public ValueProviderType getValueProviderKey() {
        return AuraValueProviderType.LOCALE;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return definitionService.getDefDescriptor("String", TypeDef.class);
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
    public boolean refSupport() {
        // $Locale has no serialization references.
        return false;
    }

    @Override
    public Map<String, ?> getData() {
        return data;
    }

    private List<LocalizedLabel> getNameOfMonths(AuraLocale locale) throws QuickFixException {
        Locale lang = locale.getLanguageLocale();
        Calendar cal = Calendar.getInstance(lang);
        Map<String, Integer> shortNames = cal.getDisplayNames(Calendar.MONTH, Calendar.SHORT_STANDALONE, lang);
        Map<String, Integer> fullNames = cal.getDisplayNames(Calendar.MONTH, Calendar.LONG_STANDALONE, lang);
        ArrayList<LocalizedLabel> monthList = new ArrayList<>(13);
        // We always return 13 months, which is the maximum known used calendar months atm
        for (int i = Calendar.JANUARY; i <= Calendar.UNDECIMBER; i++) {
            String shortName = "";
            String fullName = "";
            for (Entry<String, Integer> nameMonth : shortNames.entrySet()) {
                if (nameMonth.getValue() != null && nameMonth.getValue() == i) {
                    shortName = nameMonth.getKey();
                    break;
                }
            }
            for (Entry<String, Integer> nameMonth : fullNames.entrySet()) {
                if (nameMonth.getValue() != null && nameMonth.getValue() == i) {
                    fullName = nameMonth.getKey();
                    break;
                }
            }
            monthList.add(new LocalizedLabel(fullName, shortName));
        }
        return monthList;
    }

    private String getLabelForToday(LocalizationAdapter localizationAdapter) throws QuickFixException {
        String today = localizationAdapter.getLabel("Related_Lists", "task_mode_today");
        if (today == null) {
            return "Today";
        }
        return today;
    }

    private List<LocalizedLabel> getNameOfWeekdays(AuraLocale locale) throws QuickFixException {
        DateFormatSymbols weekdaySymbols = DateFormatSymbols.getInstance(locale.getLanguageLocale());
        String[] weekdays = weekdaySymbols.getWeekdays();
        String[] shortWeekdays = weekdaySymbols.getShortWeekdays();
        ArrayList<LocalizedLabel> weekdayList = new ArrayList<>(7);
        for (int i = 1; i < weekdays.length; i++) {
            weekdayList.add(new LocalizedLabel(weekdays[i], shortWeekdays[i].toUpperCase(locale.getLanguageLocale())));
        }
        return weekdayList;
    }

    public static class LocalizedLabel implements JsonSerializable {
        /** Full name of month */
        private String fullName;
        /** Short name of month */
        private String shortName;

        public LocalizedLabel(String fullName, String shortName) {
            this.fullName = fullName;
            this.shortName = shortName;
        }

        public String getFullName() {
            return this.fullName;
        }

        public String getShortName() {
            return this.shortName;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapKey("fullName");
            json.writeValue(this.getFullName());
            json.writeMapKey("shortName");
            json.writeValue(this.getShortName());
            json.writeMapEnd();
        }
    }
}
