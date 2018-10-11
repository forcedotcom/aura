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
import java.util.Set;

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
import org.auraframework.util.AuraLocale;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;

public class LocaleValueProvider implements GlobalValueProvider {

    public static final String USER_LOCALE_LANGUAGE = "userLocaleLang";
    public static final String USER_LOCALE_COUNTRY = "userLocaleCountry";

    public static final String LANGUAGE = "language";
    public static final String COUNTRY = "country";
    public static final String VARIANT = "variant";
    public static final String LANGUAGE_LOCALE = "langLocale";

    public static final String TIME_ZONE = "timezone";

    public static final String MONTH_NAME = "nameOfMonths";
    public static final String TODAY_LABEL = "labelForToday";
    public static final String WEEKDAY_NAME = "nameOfWeekdays";
    public static final String FIRST_DAY_OF_WEEK = "firstDayOfWeek";

    // Number formats
    public static final String NUMBER_FORMAT = "numberFormat";
    public static final String PERCENT_FORMAT = "percentFormat";
    public static final String CURRENCY_FORMAT = "currencyFormat";

    // Date time formats
    public static final String DATE_FORMAT = "dateFormat";
    public static final String SHORT_DATE_FORMAT = "shortDateFormat";
    public static final String LONG_DATE_FORMAT = "longDateFormat";

    public static final String DATETIME_FORMAT = "datetimeFormat";
    public static final String SHORT_DATETIME_FORMAT = "shortDatetimeFormat";

    public static final String TIME_FORMAT = "timeFormat";
    public static final String SHORT_TIME_FORMAT = "shortTimeFormat";

    // Symbols
    public static final String CURRENCY_CODE = "currencyCode";
    public static final String DECIMAL = "decimal";
    public static final String GROUPING = "grouping";
    public static final String CURRENCY = "currency";
    public static final String ZERO_DIGIT = "zero";

    public static final String IS_EASTERN_NAME_STYLE = "isEasternNameStyle";
    public static final String SHOW_JAPANESE_IMPERIAL_YEAR = "showJapaneseImperialYear";

    // HTML localization
    public static final String DIR = "dir";
    public static final String LANG = "lang";

    private final Map<String, Object> data;
    private final DefinitionService definitionService;

    public LocaleValueProvider(LocalizationService localizationService, LocalizationAdapter localizationAdapter, DefinitionService definitionService) {
        this.definitionService = definitionService;

        Builder<String, Object> builder = ImmutableMap.builder();

        AuraLocale auraLocale = localizationAdapter.getAuraLocale();
        Locale userLocale = auraLocale.getLocale();
        Locale langLocale = auraLocale.getLanguageLocale();

        builder.put(USER_LOCALE_LANGUAGE, userLocale.getLanguage());
        builder.put(USER_LOCALE_COUNTRY, userLocale.getCountry());
        builder.put(LANGUAGE, langLocale.getLanguage());
        builder.put(COUNTRY, langLocale.getCountry());
        builder.put(VARIANT, langLocale.getVariant());
        builder.put(LANGUAGE_LOCALE, langLocale.toString());

        builder.put(MONTH_NAME, this.getNameOfMonths(langLocale));
        builder.put(WEEKDAY_NAME, this.getNameOfWeekdays(langLocale));
        builder.put(TODAY_LABEL, this.getLabelForToday(localizationAdapter));

        builder.put(FIRST_DAY_OF_WEEK, Calendar.getInstance(auraLocale.getTimeZone(), userLocale).getFirstDayOfWeek());

        builder.put(TIME_ZONE, auraLocale.getTimeZone().getID());

        // date time formats
        builder.put(DATE_FORMAT, localizationService.getMediumDateFormatPattern());
        builder.put(SHORT_DATE_FORMAT, localizationService.getShortDateFormatPattern());
        builder.put(LONG_DATE_FORMAT, localizationService.getLongDateFormatPattern());
        builder.put(DATETIME_FORMAT, localizationService.getMediumDateTimeFormatPattern());
        builder.put(SHORT_DATETIME_FORMAT, localizationService.getShortDateTimeFormatPattern());
        builder.put(TIME_FORMAT, localizationService.getMediumTimeFormatPattern());
        builder.put(SHORT_TIME_FORMAT, localizationService.getShortTimeFormatPattern());

        // number formats
        builder.put(NUMBER_FORMAT, localizationService.getNumberFormatPattern());
        builder.put(DECIMAL, localizationService.getDecimalSeparator());
        builder.put(GROUPING, localizationService.getGroupingSeparator());
        builder.put(ZERO_DIGIT, localizationService.getZeroDigit());
        builder.put(PERCENT_FORMAT, localizationService.getPercentFormatPattern());
        // Don't localize the patterns
        builder.put(CURRENCY_FORMAT, localizationService.getCurrencyFormatPattern());
        builder.put(CURRENCY_CODE, localizationService.getCurrencyCode());
        builder.put(CURRENCY, localizationService.getCurrencySymbol());

        builder.put(DIR, localizationAdapter.getHtmlTextDirection(langLocale));
        builder.put(LANG, localizationAdapter.getHtmlLanguage(langLocale));

        builder.put(IS_EASTERN_NAME_STYLE, localizationAdapter.isEasternNameStyle(userLocale));
        if ("ja".equals(userLocale.getLanguage())) {
            builder.put(SHOW_JAPANESE_IMPERIAL_YEAR, localizationAdapter.showJapaneseImperialYear());
        }

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
    public Map<String, ?> getData() {
        return data;
    }

    private List<LocalizedLabel> getNameOfMonths(Locale locale) {
        Calendar cal = Calendar.getInstance(locale);
        Map<String, Integer> shortNames = cal.getDisplayNames(Calendar.MONTH, Calendar.SHORT_STANDALONE, locale);
        Map<String, Integer> fullNames = cal.getDisplayNames(Calendar.MONTH, Calendar.LONG_STANDALONE, locale);
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

    private String getLabelForToday(LocalizationAdapter localizationAdapter) {
        String today = localizationAdapter.getLabel("Related_Lists", "task_mode_today");
        if (today == null) {
            return "Today";
        }
        return today;
    }

    private List<LocalizedLabel> getNameOfWeekdays(Locale locale) {
        DateFormatSymbols weekdaySymbols = DateFormatSymbols.getInstance(locale);
        String[] weekdays = weekdaySymbols.getWeekdays();
        String[] shortWeekdays = weekdaySymbols.getShortWeekdays();
        ArrayList<LocalizedLabel> weekdayList = new ArrayList<>(7);
        for (int i = 1; i < weekdays.length; i++) {
            weekdayList.add(new LocalizedLabel(weekdays[i], shortWeekdays[i].toUpperCase(locale)));
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

    @Override
    public void loadValues(Set<PropertyReference> keys) {
        // do nothing
    }
}
