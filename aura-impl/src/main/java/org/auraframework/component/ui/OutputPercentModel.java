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

import org.auraframework.Aura;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.LocalizationService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraLocale;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;

/**
 * A Aura model that backs the ui:outputPercent Aura component.
 */
@Model
public class OutputPercentModel {

    /**
     * Returns a formatted value showing the given value attribute as a percent.
     *
     * The value attribute is multiplied by 100 and shown as a percent, e.g. a value of 0.5 is shown as 50%.
     * If the format attribute is given, a '%' character is appended.
     * If the format attribute is not given, the format is set to "#%".
     *
     * The pattern be a {@link java.text.DecimalFormat DecimalFormat} pattern.
     * @return a formatted value showing the given value attribute as a percent
     * @throws QuickFixException
     */
    @AuraEnabled
    public String getText() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?,?> component = context.getCurrentComponent();
        Number numberValue;
        try {
            Object valueObj = component.getAttributes().getValue("value");
            if (valueObj == null) {
                return "";
            }
            numberValue = (Number)valueObj;
        } catch (NumberFormatException e) {
            return "The value attribute must be assigned a numeric value";
        }

        Integer valueScale = (Integer)component.getAttributes().getValue("valueScale");
        if (valueScale != null) {
            //workaround to ensure we don't end up rounding BigDecimals by converting them into double
            if(numberValue instanceof BigDecimal){
                numberValue = ((BigDecimal)numberValue).scaleByPowerOfTen(valueScale);
            }
            else{
                numberValue = BigDecimal.valueOf(numberValue.doubleValue()).scaleByPowerOfTen(valueScale);
            }
        }

        AuraLocale locale = Aura.getLocalizationAdapter().getAuraLocale();

        // using formatNumber instead of formatPercent to preserve behavior for legacy uses.
        // in a different world, would expect that this component would:
        // 1) accept a number like .12 and use formatPercent to turn it into 12%
        // 2) and not use valueScale
        LocalizationService lclService = Aura.getLocalizationService();
        String numberFormatPattern = (String)component.getAttributes().getValue("format");
        if (numberFormatPattern!=null) {
            // using getNumberInstance as the LocalizationService doesn't expose a pattern-based formatter.
            DecimalFormat numberFormat = (DecimalFormat)NumberFormat.getNumberInstance(locale.getNumberLocale());
            if (!numberFormatPattern.isEmpty() && !numberFormatPattern.endsWith("%")) {
                numberFormatPattern += "%";
            } else {
                numberFormatPattern = "#%";
            }
            try {
                numberFormat.applyPattern(numberFormatPattern);
            } catch (IllegalArgumentException e) {
                return "Invalid format attribute";
            }
            // this is a percent object, valueScale is implied as -2 and should not be passed in
            return numberFormat.format(numberValue);
        } else {
            String out = lclService.formatNumber(numberValue.doubleValue());
            // this recreates the numberFormatPattern % literal logic when a pattern is not passed in
            if (!out.contains(("%"))) {
                out += "%";
            }
            return out;
        }

    }

}
