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
package org.auraframework.cache;

import java.util.Set;


public interface Cache<K,T> {
	
	// TODO - add a loader-based getter
	//Optional<T> get(K key, Loader loader);
	
	T getIfPresent(K key);

	void put(K key, T data);

	Set<K> getKeySet();

	void invalidate(K key);

	void invalidate(Iterable<K> keys);
	
	void invalidateAll();

	/**
	 * Invalidate those keys whose toString beginsWith the provided partial string
	 * @param partial - target keys will be invalidated if their toString representation beginsWith partial
	 */
	void invalidatePartial(String partial);

	/**
	 * returns a reference to the implementing cache - this should NEVER be 
	 * used for anything but admin and statistical access, specific to an implementation
	 * @return
	 */
	Object getPrivateUnderlyingCache();


}
