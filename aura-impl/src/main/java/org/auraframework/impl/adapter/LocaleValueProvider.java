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
package org.auraframework.impl.adapter;

import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.throwable.quickfix.InvalidExpressionException;

public class LocaleValueProvider implements GlobalValueProvider {

    public LocaleValueProvider() {
    }

    @Override
    public Object getValue(PropertyReference expr) {
        return null;
        // Access in the form of $L10N.number.currency
        // This probably breaks down quite a bit when referring
        // to particular local information like days of the week.
        // List<String> parts = expr.getList();

        // Generalize the retrieval of date formats.
        // return Aura.getLocalizationAdapter().getFormat(parts.get(0),
        // parts.get(1));
    }

    @Override
    public ValueProviderType getValueProviderKey() {
        return ValueProviderType.LOCALE;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        // If we access $L10N.time, would it return a DateTimeFormat?
        // If we access $L10N.percent it would be... NumberFormat?

        // Assuming a format string at the moment.
        return DefDescriptorImpl.getInstance("String", TypeDef.class);
    }

    @Override
    public void validate(PropertyReference expr) throws InvalidExpressionException {
        // Verify that the section and format exists?
        return;
    }

    @Override
    public boolean isEmpty() {
        // Would it ever make sense for this to be empty?
        // Seems like that would mean we have no culture defined
        // which I figure we would just default to English.
        return false;
    }

    @Override
    public Map<String, ?> getData() {
        return null;
        // Get a serializable object that contains all the information
        // for the client to access the format strings.
        // return Aura.getLocalizationAdapter().getLocale();
    }
}
