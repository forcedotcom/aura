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
package org.auraframework.service;

import java.io.*;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.*;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.util.concurrent.ExecutionError;

/**
 * @hierarchy Aura.Services.SerializationService
 * @userStory a07B0000000Eb3M
 *
 *
 */
public class SerializationServiceTest extends BaseServiceTest<SerializationService, SerializationServiceTest.Config> implements SerializationService {

    private static final long serialVersionUID = 7136575085875114482L;

    public SerializationServiceTest(String name) {
        super(name);
    }

    @Override
    public <T> T read(Reader in, Class<T> type) throws IOException, QuickFixException {

        try{
            service.read(in, type);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            /*
             * Try to read something that we really don't expect to be able to
             */
            try{
                service.read(in, SerializationServiceTest.class);
                fail("Did not expect to find formatter");
            }catch(AuraRuntimeException e){
                //good
            }catch(AuraError e){
                //good, will happen if format adapter not found
            }catch(ExecutionError e){
                //good, will happen if format adapter not found (fail load to cache)
            }

            /*
             * Try to read something we expect to be able to
             */
            in = new StringReader("{descriptor : 'java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething', params : {}}");
            try{
                service.read(in, Action.class);
                if(config.format != Format.JSON){
                    fail("Not expected to succeed.");
                }
            }catch(AuraRuntimeException e){
                if(config.format == Format.JSON){
                    throw e;
                }
            }
        }finally{
            contextService.endContext();
        }
        return null;
    }

    @Override
    public <T> T read(Reader in, Class<T> type, String format) throws IOException, QuickFixException {

        try{
            service.read(in,type,format);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            /*
             * Try to read something that we really don't expect to be able to
             */
            try{
                service.read(in, SerializationServiceTest.class, "HTML");
                fail("Did not expect to find formatter");
            }catch(AuraRuntimeException e){
                //good
            }catch(AuraError e){
                //good, will happen if format adapter not found
            }catch(ExecutionError e){
                //good, will happen if format adapter not found (fail load to cache)
            }

            /*
             * Try to read something we expect to be able to
             */
            in = new StringReader("{descriptor : 'java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething', params : {}}");
            assertNotNull(service.read(in, Action.class, Format.JSON.name()));
            try{
                service.read(in, Action.class, Format.HTML.name());
                fail("Did not expect success.");
            }catch(AuraRuntimeException e){
                //good
            }

        }finally{
            contextService.endContext();
        }
        return null;
    }

    @Override
    public <T> Collection<T> readCollection(Reader in, Class<T> type) throws IOException, QuickFixException {

        try{
            service.readCollection(in,type);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            /*
             * Try to read something that we really don't expect to be able to
             */
            try{
                service.readCollection(in, SerializationServiceTest.class);
                fail("Did not expect to find formatter");
            }catch(AuraRuntimeException e){
                //good
            }catch(AuraError e){
                //good, will happen if format adapter not found
            }catch(ExecutionError e){
                //good, will happen if format adapter not found (fail load to cache)
            }

            /*
             * Try to read something we expect to be able to
             */

            in = new StringReader("{actions : [{descriptor : 'java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething', params : {}}]}");
            try{
                service.readCollection(in, Action.class);
                if(config.format != Format.JSON){
                    fail("Not expected to succeed.");
                }
            }catch(AuraRuntimeException e){
                if(config.format == Format.JSON){
                    throw e;
                }
            }

        }finally{
            contextService.endContext();
        }
        return null;
    }

    @Override
    public <T> Collection<T> readCollection(Reader in, Class<T> type, String format) throws IOException,
            QuickFixException {

        try{
            service.readCollection(in,type,format);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }catch(AuraError e){
            //good, will happen if format adapter not found
        }catch(ExecutionError e){
            //good, will happen if format adapter not found (fail load to cache)
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));


            /*
             * Try to read something that we really don't expect to be able to
             */
            try{
                service.readCollection(in, SerializationServiceTest.class, "JSON");
                fail("Did not expect to find formatter");
            }catch(AuraRuntimeException e){
                //good
            }

            /*
             * Try to read something we expect to be able to
             */

            in = new StringReader("{actions : [{descriptor : 'java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething', params : {}}]}");
            Collection<Action> actions = service.readCollection(in, Action.class, "JSON");
            assertNotNull(actions);
            assertEquals(1, actions.size());
            for(Action action : actions){
                assertEquals(State.NEW, action.getState());
            }

        }finally{
            contextService.endContext();
        }
        return null;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException {}
    @Override
    public <T> void write(Object value, Map<String, Object> attributes, Class<T> type, Appendable out)
            throws IOException, QuickFixException {

        try{
            service.write(value,attributes,type,out);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));
            Format format = Aura.getContextService().getCurrentContext().getFormat();


            ComponentDef cmp = Aura.getDefinitionService().getDefinition("test:text", ComponentDef.class);
            out = new StringBuilder();
            attributes = Maps.newHashMap();
            try{
                service.write(cmp, attributes, ComponentDef.class, out);
                if(format != Format.HTML){
                    fail("Did not expect success.");
                }else{
                    assertTrue(out.toString().indexOf("$A.init") > -1);
                }
            }catch(UnsupportedOperationException e){
                if(format == Format.HTML){
                    throw e;
                }
            }catch(AuraRuntimeException e){
                if(format == Format.HTML){
                    throw e;
                }
            }catch(AuraError e){
                if(format == Format.HTML){
                    throw e;
                }
            } catch (ExecutionError e) {
                if(format == Format.HTML){
                    throw e;
                }
            }

        }catch(AuraException e){
            throw new AuraRuntimeException(e);
        }finally{
            contextService.endContext();
        }
    }

    @Override
    public <T> void write(Object value, Map<String, Object> attributes, Class<T> type, Appendable out, String fmt)
            throws IOException, QuickFixException {

        try{
            service.write(value,attributes,type,out,fmt);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            ComponentDef cmp = Aura.getDefinitionService().getDefinition("test:text", ComponentDef.class);
            out = new StringBuilder();
            attributes = Maps.newHashMap();
            Format format = config.format;
            try{
                service.write(cmp, attributes, ComponentDef.class, out, format.name());
                if(format != Format.HTML){
                    fail("Did not expect success.");
                }else{
                    assertTrue(out.toString().indexOf("$A.init") > -1);
                }
            }catch(UnsupportedOperationException e){
                if(format == Format.HTML){
                    throw e;
                }
            }catch(AuraRuntimeException e){
                if(format == Format.HTML){
                    throw e;
                }
            }catch(AuraError e){
                if(format == Format.HTML){
                    throw e;
                }
            } catch (ExecutionError e) {
                if(format == Format.HTML){
                    throw e;
                }
            }
        }catch(AuraException e){
            throw new AuraRuntimeException(e);
        }finally{
            contextService.endContext();
        }
    }

    @Override
    public <T> void writeBinary(Object value, Map<String, Object> attributes, Class<T> type, OutputStream out)
            throws IOException, QuickFixException {

        //There are currently no implementations of writeBinary
        /*
        */
    }

    @Override
    public <T> void writeBinary(Object value, Map<String, Object> attributes, Class<T> type, OutputStream out, String fmt) throws IOException, QuickFixException {
        //There are currently no implementations of writeBinary
        /*
        */
    }

    @Override
    public <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out) throws IOException, QuickFixException {

        try{
            service.writeCollection(values, type, out);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            Format format = Aura.getContextService().getCurrentContext().getFormat();

            Action action = Aura.getInstanceService().getInstance("java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
            out = new StringBuilder();
            try{
                service.writeCollection(Lists.newArrayList(action), Action.class, out);
                if(format != Format.JSON){
                    fail("Did not expect success.");
                }else{
                    assertTrue(out.toString().indexOf("returnValue") > -1);
                }
            }catch(UnsupportedOperationException e){
                if(format == Format.JSON){
                    throw e;
                }
            }catch(AuraRuntimeException e){
                if(format == Format.JSON){
                    throw e;
                }
            }catch(AuraError e){
                if(format == Format.HTML){
                    throw e;
                }
            } catch (ExecutionError e) {
                if(format == Format.HTML){
                    throw e;
                }
            }

        }catch(AuraException e){
            throw new AuraRuntimeException(e);
        }finally{
            contextService.endContext();
        }
    }

    @Override
    public <T> void writeCollection(Collection<? extends T> values, Class<T> type, Appendable out, String fmt)
            throws IOException, QuickFixException {

        try{
            service.writeCollection(values,type,out,fmt);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            Format format = Format.JSON;

            Action action = Aura.getInstanceService().getInstance("java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
            out = new StringBuilder();
            service.writeCollection(Lists.newArrayList(action), Action.class, out, format.name());
            assertTrue(out.toString().indexOf("returnValue") > -1);
        }catch(AuraException e){
            throw new AuraRuntimeException(e);
        }finally{
            contextService.endContext();
        }
    }

    @Override
    public List<Config> getConfigs() {
        return permuteConfigs(Lists.newArrayList(new Config()));
    }

    public static class Config extends BaseServiceTest.Config{

    }


}
