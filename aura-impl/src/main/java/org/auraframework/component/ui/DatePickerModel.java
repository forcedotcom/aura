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
package org.auraframework.component.ui;

import java.io.IOException;
import java.text.DateFormatSymbols;
import java.util.ArrayList;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

/**
 * A Aura model that backs the ui:datePicker Aura component.
 */
@Model
public class DatePickerModel {
    
    @AuraEnabled
    public String getLangLocale() throws QuickFixException {
        AuraLocale locale = Aura.getLocalizationAdapter().getAuraLocale();
        return locale.getLanguageLocale().toString();
    }
    
    @AuraEnabled
    public List<LocalizedLabel> getMonthLabels() throws QuickFixException {
        AuraLocale locale = Aura.getLocalizationAdapter().getAuraLocale();
        DateFormatSymbols monthSymbols = DateFormatSymbols.getInstance(locale.getLanguageLocale());
        String[] months = monthSymbols.getMonths();
        String[] shortMonths = monthSymbols.getShortMonths();
        ArrayList<LocalizedLabel> monthList = new ArrayList<LocalizedLabel>(12);
        for (int i = 0; i < months.length - 1; i++) {
            monthList.add(new LocalizedLabel(months[i], shortMonths[i]));
        }
        return monthList;
    }
    
    @AuraEnabled
    public String getLabelForToday() throws QuickFixException {
        LocalizationAdapter la = Aura.getLocalizationAdapter();
        return la.getLabel("Related_Lists", "task_mode_today");
    }
    
    @AuraEnabled
    public List<LocalizedLabel> getWeekdayLabels() throws QuickFixException {
        AuraLocale locale = Aura.getLocalizationAdapter().getAuraLocale();
        DateFormatSymbols weekdaySymbols = DateFormatSymbols.getInstance(locale.getLanguageLocale());
        String[] weekdays = weekdaySymbols.getWeekdays();
        String[] shortWeekdays = weekdaySymbols.getShortWeekdays();
        ArrayList<LocalizedLabel> weekdayList = new ArrayList<LocalizedLabel>(7);
        for (int i = 1; i < weekdays.length; i++) {
            weekdayList.add(new LocalizedLabel(weekdays[i], shortWeekdays[i]));
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
        
        @AuraEnabled
        public String getFullName() {
            return this.fullName;
        }
        
        @AuraEnabled
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