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
{
    fillLocalStorage: function(component) {
        var ITERS_TO_TRIGGER_LOCAL_STORAGE_ERROR = 100000
        try{
            for(var i = 0; i < ITERS_TO_TRIGGER_LOCAL_STORAGE_ERROR; i ++){
                localStorage.setItem('localStorageFiller'+i,'junk data');
            }
        }
        catch(err){
            $A.log('Triggered following error in '+i+' iterations,');
            $A.log(err);
            $A.log('Rethrowing....');
            throw err;
        }
        $A.log('Unable to cause local storage to fill up..');
    }
}
