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
package org.auraframework.impl.visitor;

import java.util.Map;
import java.util.Set;
import java.util.function.BinaryOperator;

import org.auraframework.system.Location;

/**
 * A visitor class to extract labels from a set of definitions.
 */
public class UsageMapCombiner<T> implements BinaryOperator<UsageMap<T>> {
    @Override
    public UsageMap<T> apply(UsageMap<T> t, UsageMap<T> u) {
        UsageMap<T> result = new UsageMap<>();

        if (t != null) {
            for (Map.Entry<T, Set<Location>> entry : t.entrySet()) {
                result.addAll(entry.getKey(), entry.getValue());
            }
        }
        if (u != null) {
            for (Map.Entry<T, Set<Location>> entry : u.entrySet()) {
                result.addAll(entry.getKey(), entry.getValue());
            }
        }
        return result;
    }
}
