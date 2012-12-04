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
package org.auraframework.util.adapter;

import java.io.*;


public class SourceControlAdapterImpl implements SourceControlAdapter{

    @Override
    public boolean canCheckout() {
        return true; // should find out if running from source or deployed
    }

    @Override
    public void checkout(File f) {
        //TODO: add to stage?
    }

    @Override
    public void add(File f) {
        //TODO: add to stage?
    }

    @Override
    public boolean writeIfDifferent(Appendable newData, File file) throws IOException {
        FileWriter writer = null;

        if(file.exists()){
            file.delete();
        }
        writer = new FileWriter(file);
        try{
            writer.write(newData.toString());
            writer.close();
            // For the finally clause.
            writer = null;
            return true;
        }finally{
            if (writer != null) {
                try {
                    writer.close();
                } catch (Throwable t) {
                    // The only case in which we will call close here is when
                    // we have had an exception. In that case, we want to ignore
                    // this exception, and let the previous one bubble up.
                }
            }
        }
    }

}
