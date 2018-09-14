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
package org.auraframework.util.type.converter;

import java.util.HashSet;
import java.util.List;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.type.Converter;
import org.springframework.context.annotation.Lazy;

import com.google.common.collect.Sets;

/**
 * Converts a {@link String} to a {@link HashSet}.
 *
 * <p><i>Note: The suppress warnings "rawtypes" here is because of the broken Java handling of parameterized
 * types. It is not possible to properly type things here (syntax errors result).</i></p>
 */
@Lazy
@SuppressWarnings("rawtypes")
@ServiceComponent
public class StringToHashSetConverter implements Converter<String, HashSet> {

    @Override
    public HashSet<?> convert(String value) {
        if(value == null) {
            return null;
        }

        if (value.length() == 0) {
            return new HashSet<>();
        }

        if(value.startsWith("[") && value.endsWith("]")) {
             try {
                 final JsonStreamReader reader = new JsonStreamReader(value);
                 reader.next();
                 return new HashSet<>(reader.getList());
             } catch (Exception ignore) {
                 // Didn't parse, fall back to splitSimple down below.
             }
        }

        // This flow is considered deprecated because it does not respect the single or double quotes.
        // For example, "'a,a','b,b'" will become {"'a", "a'", "'b", "b'"} splitting on the commas in the Strings 
        // Another example, "'a','b'" will become {"'a'", "'b'"} preserving the single quotes in the Strings
        // This is being tracked in bug: W-5416395
        
        // TODO display a warning to the developer to use the square bracket syntax.
        List<String> splitList = AuraTextUtil.splitSimple(",", value);
        return Sets.newHashSet(splitList);
    }

    @Override
    public Class<String> getFrom() {
        return String.class;
    }

    @Override
    public Class<HashSet> getTo() {
        return HashSet.class;
    }

    @Override
    public Class<?>[] getToParameters() {
        return null;
    }
}
