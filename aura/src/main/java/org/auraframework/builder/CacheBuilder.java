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
package org.auraframework.builder;

import org.auraframework.cache.Cache;

public interface CacheBuilder<K, T> {

	/**
	 * Set a hint for initial cache size.
	 * 
	 * @param initialCapacity
	 * @return the same CacheBuilder with this property set
	 */
	CacheBuilder<K, T> setInitialSize(int initialCapacity);

	/**
	 * Set a hint for maximum cache size, before evictions occur
	 * 
	 * @param maximumSize
	 * @return the same CacheBuilder with this property set
	 */
	CacheBuilder<K, T> setMaximumSize(long maximumSize);

	/**
	 * Set true to hint the cache to use a non-memory storage strategy,
	 * typically for large, stable objects.
	 * 
	 * @param useSecondaryStorage
	 * @return the same CacheBuilder with this property set
	 */
	CacheBuilder<K, T> setUseSecondaryStorage(boolean useSecondaryStorage);

	/**
	 * Set true to hint that the cache should record statistics
	 * 
	 * @param recordStats
	 * @return the same CacheBuilder with this property set
	 */
	CacheBuilder<K, T> setRecordStats(boolean recordStats);

	/**
	 * Set true to hint that the cache should wrap every value (not key) in a
	 * softReference
	 * 
	 * @param softValues
	 * @return the same CacheBuilder with this property set
	 */
	CacheBuilder<K, T> setSoftValues(boolean softValues);

	/**
	 * Set value to hint the desired concurrency level for update behavior
	 * Higher indicates more required concurrency.
	 * 
	 * @param concurrencyLevel
	 *            - default 4. not required.
	 * @return the same CacheBuilder with this property set
	 */
	CacheBuilder<K, T> setConcurrencyLevel(int concurrencyLevel);

	Cache<K, T> build();

	/** Associates a human-readable name with the cache */
    CacheBuilder<K, T> setName(String string);
}
