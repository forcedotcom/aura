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
Function.RegisterNamespace("Test.Tools.Aura.Attributes");

Test.Tools.Aura.Attributes.ImportAttribute=function(groupName, callback){
    var root=System.IO.Path.GetRoot();
    System.IO.Path.SetRoot(Test.Tools.Aura.Attributes.ImportAttribute.BuildDirectory);
    groupName = groupName.replace(/\./g,'/');
    var args=[String.Format("target/xunitjs/{0}.js",groupName)];
    if(Object.IsType(Function,callback))args.push(callback);
    System.Script.ScriptLoader.Attributes.ImportAttribute.apply(this,args);
    System.IO.Path.SetRoot(root);
}

Test.Tools.Aura.Attributes.ImportAttribute.BuildDirectory=(System.Environment&&System.Environment.GetWorkingDirectory() || "");

//Global Convenience Mappings
Import = Test.Tools.Aura.Attributes.ImportAttribute;