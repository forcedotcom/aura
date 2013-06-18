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
import java.util.*;

import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.system.LoggingContext;
import org.auraframework.test.adapter.TestLoggingAdapter;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Hook into logger so we can do some basic request monitoring in tests, as
 * AuraContextFilter logs all incoming.
 * 
 * 
 * @since 0.0.224
 */
public class TestLoggingAdapterImpl implements TestLoggingAdapter {
    private static ThreadLocal<LoggingContext> currentContext = new ThreadLocal<LoggingContext>();
    private final List<Map<String, Object>> logs = Lists.newLinkedList();
    private boolean isCapturing = false;
    
    protected LoggingAdapter delegate;

    public TestLoggingAdapterImpl(LoggingAdapter delegate) {
        this.delegate = delegate;
    }
    
    @Override
    public LoggingContext establish() {
        LoggingContext lc = delegate.establish();
        if (lc instanceof LoggingContextImpl) {
            LoggingContextImpl mock = (LoggingContextImpl)Mockito.spy(lc);
            Mockito.doAnswer(new Answer<Void>() {
                @SuppressWarnings("unchecked")
                @Override
                public Void answer(InvocationOnMock invocation) throws Throwable {
	                if (isCapturing) {
		                Map<String, Object> arg = (Map<String, Object>)invocation.getArguments()[0];
		                logs.add(Maps.newHashMap(arg));
	                }
	                invocation.callRealMethod();
	                return null;
                }
            }).when(mock).log(Mockito.<Map<String, Object>> any());
            lc = mock;
        }
        currentContext.set(lc);
        return lc;
    }

    @Override
    public boolean isEstablished() {
        return currentContext.get() != null;
    }

    @Override
    public void release() {
        delegate.release();
            currentContext.set(null);
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
    public List<Map<String, Object>> getLogs() {
        return logs;
    }

    @Override
    public void clear() {
        logs.clear();
    }
}
