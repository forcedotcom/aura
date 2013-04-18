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
package org.auraframework.util.json;

/**
 * standard jsony stuff
 */
public abstract class BaseJsonSerializationContext implements JsonSerializationContext {
    private final boolean format;
    private final boolean refSupport;
    private final int dataSizeLimit;
    private final int collectionSizeLimit;
    private final boolean nullValues;

    public BaseJsonSerializationContext(boolean format, boolean refSupport, int dataSizeLimit, int collectionSizeLimit,
            boolean nullValues) {
        this.format = format;
        this.refSupport = refSupport;
        this.dataSizeLimit = dataSizeLimit;
        this.collectionSizeLimit = collectionSizeLimit;
        this.nullValues = nullValues;
    }

    @Override
    public boolean format() {
        return format;
    }

    @Override
    public boolean refSupport() {
        return refSupport;
    }

    @Override
    public int getVariableDataSizeLimit() {
        return dataSizeLimit;
    }

    /**
     * Don't render collections over this length, -1 to not truncate
     */
    @Override
    public int getCollectionSizeLimit() {
        return collectionSizeLimit;
    }

    @Override
    public boolean isNullValueEnabled() {
        return nullValues;
    }
}
