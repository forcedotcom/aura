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

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;

import org.auraframework.Aura;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A Aura model that backs the ui:outputNumber Aura component.
 */
@Model
public class OutputNumberModel {

    /**
     * Returns a formatted value showing the component's value attribute.
     * 
     * The value is formatted using either the default NumberFormat pattern for
     * the current Locale, or the pattern specified in the component's format
     * attribute. If using the Locale default, the thousands separator can be
     * shown or not depending on the component's grouping attribute value.
     * 
     * Any specified pattern should be a {@link java.text.DecimalFormat
     * DecimalFormat} pattern.
     * 
     * @return a formatted number value
     * @throws QuickFixException
     */
    @AuraEnabled
    public String getText() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();
        AttributeSet attributes = component.getAttributes();

        // get the value to format
        Number numberValue;
        try {
            Object valueObj = attributes.getValue("value");
            if (valueObj == null) {
                return "";
            }
            numberValue = (Number) valueObj;
        } catch (ClassCastException e) {
            return "The value attribute must be assigned a numeric value";
        }

        // start with the default for the Locale
        Locale loc = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        DecimalFormat numberFormat = (DecimalFormat) NumberFormat.getNumberInstance(loc);

        String numberFormatPattern = (String) attributes.getValue("format");
        if (numberFormatPattern != null && !numberFormatPattern.isEmpty()) {
            // if a specific format is given, apply it
            try {
                numberFormat.applyPattern(numberFormatPattern);
            } catch (IllegalArgumentException e) {
                return "Invalid format attribute";
            }
        } else {
            // otherwise just toggle thousands separator based on the grouping
            // attribute
            boolean groupThousands = ((Boolean) attributes.getValue("grouping")).booleanValue();
            numberFormat.setGroupingUsed(groupThousands);
        }
        // return the formatted number String
        return numberFormat.format(numberValue);
    }

}
