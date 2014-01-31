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

package org.auraframework.impl.context;
import java.util.List;
import java.util.Map;

import org.auraframework.impl.LoggingAdapterImpl;
import org.auraframework.system.LoggingContext;
import org.auraframework.test.adapter.TestLoggingAdapter;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Hook into logger so we can do some basic request monitoring in tests, as
 * AuraContextFilter logs all incoming.
 * 
 * 
 * @since 0.0.224
 */
public class TestLoggingAdapterImpl extends LoggingAdapterImpl implements TestLoggingAdapter 
{
    private static ThreadLocal<LoggingContext> currentContext = new ThreadLocal<LoggingContext>();
    private final List<Map<String, Object>> logs = Lists.newLinkedList();
    private boolean isCapturing=false;
    
    @Override
    public LoggingContext establish() {
    		TestLoggingContext lc = new TestLoggingContext();
    		currentContext.set(lc);
        	return lc;
    }

    @Override
    public boolean isEstablished() {
        return (currentContext.get() != null);
    }

    @Override
    public void release() {
    	currentContext.set(null);
    	super.release();
    }
    
    @Override
    public List<Map<String, Object>> getLogs() {
        return logs;
    } 

    @Override
    public LoggingContext getLoggingContext() {
        return currentContext.get();
    }

    @Override
    public void beginCapture() {
        isCapturing = true;
    }

    @Override
    public void endCapture() {
        isCapturing = false;
    }

    @Override
    public void clear() {
        logs.clear();
    }

    public class TestLoggingContext extends LoggingContextImpl {
        
        @Override
        protected void log(Map<String, Object> valueMap) {
            if (isCapturing) {
                logs.add(Maps.newHashMap(valueMap));
            }
            super.log(valueMap);//keep logging-adapter informed
        }

    }

}
