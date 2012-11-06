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
package org.auraframework.http;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.throwable.AuraRuntimeException;

/**
 */
public abstract class RequestParam<T> {
    protected final String name;
    protected final boolean required;

    protected RequestParam(String name, boolean required){
        this.name = name;
        this.required = required;
    }

    protected String getRawValue(HttpServletRequest request){
        String ret = request.getParameter(name);
        if(required && ret == null){
            throw new MissingParamException(name);
        }
        return ret;
    }

    public abstract T get(HttpServletRequest request);
    public abstract T get(HttpServletRequest request, T theDefault);

    public static class InvalidParamException extends AuraRuntimeException{
        /**
         */
        private static final long serialVersionUID = -4184060092142799781L;
        private static final String message = "Invalid parameter value for %s";

        public InvalidParamException(String name) {
            super(String.format(message, name));
        }
    }

    public static class MissingParamException extends AuraRuntimeException{
        /**
         */
        private static final long serialVersionUID = -1357285133277767121L;
        private static final String message = "Missing parameter value for %s";

        public MissingParamException(String name) {
            super(String.format(message, name));
        }
    }

    public static class StringParam extends RequestParam<String>{
        private final int length;

        public StringParam(String name, int length, boolean required){
            super(name, required);
            this.length = length;
        }

        @Override
        public String get(HttpServletRequest request){
            String ret = getRawValue(request);
            if(length > 0 && ret != null && ret.length() > length){
                throw new InvalidParamException(name);
            }

            return ret;
        }

        @Override
        public String get(HttpServletRequest request, String theDefault){
            String ret = get(request);
            return ret==null?theDefault:ret;
        }
    }

    public static class BooleanParam extends RequestParam<Boolean>{

        public BooleanParam(String name, boolean required){
            super(name, required);
        }

        @Override
        public Boolean get(HttpServletRequest request){
            String ret = getRawValue(request);

            if(ret == null){
                return false;
            }

            return "1".equals(ret) || "true".equalsIgnoreCase(ret) || "yes".equalsIgnoreCase(ret);
        }

        @Override
        public Boolean get(HttpServletRequest request, Boolean theDefault){
            Boolean ret = get(request);
            return ret==null?theDefault:ret;
        }
    }

    public static class LongParam extends RequestParam<Long>{

        public LongParam(String name, boolean required){
            super(name, required);
        }

        @Override
        public Long get(HttpServletRequest request){
            String ret = getRawValue(request);
            return ret == null?null:Long.valueOf(ret);
        }

        @Override
        public Long get(HttpServletRequest request, Long theDefault){
            Long ret = get(request);
            return ret==null?theDefault:ret;
        }
    }

    public static class IntegerParam extends RequestParam<Integer>{

        public IntegerParam(String name, boolean required){
            super(name, required);
        }

        @Override
        public Integer get(HttpServletRequest request){
            String ret = getRawValue(request);
            return ret == null?null:Integer.valueOf(ret);
        }

        @Override
        public Integer get(HttpServletRequest request, Integer theDefault){
            Integer ret = get(request);
            return ret==null?theDefault:ret;
        }
    }

    public static class EnumParam<E extends Enum<E>> extends RequestParam<E>{
        private final Class<E> clz;

        public EnumParam(String name, boolean required, Class<E> clz){
            super(name, required);
            this.clz = clz;
        }

        @Override
        public E get(HttpServletRequest request){
            String ret = getRawValue(request);
            if(ret == null){
                return null;
            }
            ret = ret.toUpperCase();
            try{
                return Enum.valueOf(clz, ret);
            }catch(Throwable e){
                throw new InvalidParamException(name);
            }
        }

        @Override
        public E get(HttpServletRequest request, E theDefault){
            E ret = get(request);
            return ret==null?theDefault:ret;
        }
    }
}
