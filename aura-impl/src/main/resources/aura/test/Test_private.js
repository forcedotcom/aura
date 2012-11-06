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
var priv = {
        /*Complete and errors are used in case Tests invoke actions on the server. Such actions have callback functions. These
         * two variables help in accounting for assertions in the call back functions.
         */
        waits : [],
        complete : -1, // -1:uninitialized, 0:complete, 1:tearing down, 2:running, 3+:waiting
        errors : [],
        timeoutTime : 0
};
