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
package org.auraframework.impl.cache;

import java.util.ArrayList;
import java.util.Set;

import org.auraframework.cache.Cache;

public class CacheImpl<K, T> implements Cache<K, T> {

	private com.google.common.cache.Cache<K, T> cache;

	CacheImpl(com.google.common.cache.Cache<K, T> cache) {
		this.cache = cache;
	}

	public CacheImpl(Builder<K, T> builder) {
		// if builder.useSecondaryStorage is true, we should try to use a
		// non-quava secondary-storage cache with streaming ability

		com.google.common.cache.CacheBuilder<Object, Object> cb = com.google.common.cache.CacheBuilder
				.newBuilder().initialCapacity(builder.initialCapacity)
				.maximumSize(builder.maximumSize)
				.concurrencyLevel(builder.concurrencyLevel);

		if (builder.recordStats) {
			cb = cb.recordStats();
		}

		if (builder.softValues) {
			cb = cb.softValues();
		}
		cache = cb.build();
	}

	@Override
	public T getIfPresent(K key) {
		return cache.getIfPresent(key);
	}

	@Override
	public void put(K key, T data) {
		cache.put(key, data);

	}

	@Override
	public void invalidate(K key) {
		cache.invalidate(key);

	}

	@Override
	public void invalidate(Iterable<K> keys) {
		cache.invalidate(keys);
	}

	@Override
	public void invalidateAll() {
		cache.invalidateAll();
	}

	@Override
	public Set<K> getKeySet() {
		return cache.asMap().keySet();
	}

	@Override
	public void invalidatePartial(String keyBeginsWith) {
		// everything is a match if the match length is zero
		if (keyBeginsWith == null || keyBeginsWith.length() == 0) {
			invalidateAll();
			return;
		}

		// add beginsWith matches to invalidItems
		Set<K> set = getKeySet();
		ArrayList<K> invalidItems = new ArrayList<K>();
		for (K key : set) {
			if (key.toString().startsWith(keyBeginsWith)) {
				invalidItems.add(key);
			}
		}

		// invalidate collected items
		if (!invalidItems.isEmpty()) {
			cache.invalidate(invalidItems);
		}
	}

	@Override
	public Object getPrivateUnderlyingCache() {
		return cache;
	}

	public static class Builder<K, T> implements
			org.auraframework.builder.CacheBuilder<K, T> {
		// builder defaults
		public int initialCapacity = 128;
		public int concurrencyLevel = 4;
		public long maximumSize = 1024;
		public boolean recordStats = false;
		public boolean softValues = true;
		public boolean useSecondaryStorage = false;

		public Builder() {

		}

		@Override
		public Builder<K, T> setInitialSize(int initialCapacity) {
			this.initialCapacity = initialCapacity;
			return this;
		};

		@Override
		public Builder<K, T> setMaximumSize(long maximumSize) {
			this.maximumSize = maximumSize;
			return this;
		};

		@Override
		public Builder<K, T> setUseSecondaryStorage(boolean useSecondaryStorage) {
			this.useSecondaryStorage = useSecondaryStorage;
			return this;
		}

		@Override
		public Builder<K, T> setRecordStats(boolean recordStats) {
			this.recordStats = recordStats;
			return this;
		}

		@Override
		public Builder<K, T> setSoftValues(boolean softValues) {
			this.softValues = softValues;
			return this;
		}

		@Override
		public Builder<K, T> setConcurrencyLevel(int concurrencyLevel) {
			this.concurrencyLevel = concurrencyLevel;
			return this;
		}

		@Override
		public CacheImpl<K, T> build() {
			return new CacheImpl<K, T>(this);
		}

	}

}
