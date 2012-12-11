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

import java.math.BigDecimal;
import java.util.Currency;

import org.auraframework.Aura;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.LocalizationService;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.*;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A Aura model that backs the ui:outputCurrency Aura component.
 */
@Model
public class OutputCurrencyModel {

    /**
     * Returns a formatted value showing the value attribute as a currency, eg "$9.98".
     *
     * Formatted using either the default NumberFormat pattern or the given pattern.
     *
     * The pattern be a {@link java.text.DecimalFormat DecimalFormat} pattern.
     * @return a formatted value showing the given value attribute
     * @throws QuickFixException
     */
    @AuraEnabled
    public String getText() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?,?> component = context.getCurrentComponent();
        AttributeSet attrs = component.getAttributes();
        Object valueObj;
        try {
            valueObj = attrs.getValue("value");
            if (valueObj == null) {
                return "";
            }
        } catch (NumberFormatException e) {
            return "The value attribute must be assigned a numeric value";
        }

        Integer fractionDigits;
        String errMsgFractionDigits = "The fractionDigits attribute must be assigned a non-negative integer value";
        try {
            Object fractionDigitsObj = attrs.getValue("fractionDigits");
            fractionDigits = (Integer)fractionDigitsObj;
            if (fractionDigits < 0 ) {
                return errMsgFractionDigits;
            }
        } catch (NumberFormatException e) {
            return errMsgFractionDigits;
        }

        String currencyCode = (String)attrs.getValue("currencyCode");
        Currency currency = null;
        if (currencyCode != null) {
            try {
                currency = Currency.getInstance(currencyCode);
            } catch (IllegalArgumentException e) {
                return "The currencyCode attribute must be a valid ISO 4217 currency code";
            }
        }

        LocalizationService lclService = Aura.getLocalizationService();
        // until Number vs. BigDecimal vs. double is sorted - JamesT?
        if (valueObj instanceof BigDecimal) {
            return lclService.formatCurrency((BigDecimal)valueObj, null, fractionDigits, fractionDigits, currency);
        } else if (valueObj instanceof Double) {
            return lclService.formatCurrency((Double)valueObj, null, fractionDigits, fractionDigits, currency);
        } else {
            return "Expecting BigDecimal or Double for value";
        }
    }
}
