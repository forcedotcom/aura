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
package org.auraframework.expression;

import java.util.List;

/**
 * A reference to some property, i.e. a parsed list of strings separated by dots.
 */
public interface PropertyReference extends Expression {

    /**
     * @return a new PropertyReference representing the everything after the root
     */
    PropertyReference getStem();

    /**
     * @return a part of this PropertyReference
     * @param start the starting position (inclusive)
     * @param end the ending position (exclusive)
     */
    PropertyReference getSub(int start, int end);

    /**
     * @return list of the parts of this PropertyReference
     */
    List<String> getList();

    /**
     * @return the root of this PropertyReference
     */
    String getRoot();

    /**
     * @return the last item in this PropertyReference
     */
    String getLeaf();

    /**
     * @return size of this PropertyReference path
     */
    int size();

}
