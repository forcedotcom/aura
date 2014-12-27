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
({
    testVerifyIfTestLoaded : {
        test:function(cmp){
            var children = cmp.find("iterCmp")
            $A.test.assertEquals(4, children.length);

            $A.test.assertEquals("markup://ifTest:testIf", children[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("It is not true.It is literally not false.", $A.test.getTextByComponent(children[0]));

            $A.test.assertEquals("markup://ifTest:testIfElse", children[1].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("It wishes it was true.It is not true.", $A.test.getTextByComponent(children[1]));

            $A.test.assertEquals("markup://ifTest:testIfNested", children[2].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("It wishes it was true.It is not true.", $A.test.getTextByComponent(children[2]));

            $A.test.assertEquals("markup://ifTest:testIfServer", children[3].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("It is not true.It is literally not false.", $A.test.getTextByComponent(children[3]));
        }
    }
})