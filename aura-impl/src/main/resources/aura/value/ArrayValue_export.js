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
/*jslint sub: true */
var p = ArrayValue.prototype;
exp(p,
    "auraType", p.auraType,
    "getValue", p.getValue,
    "getRawValue", p.getRawValue,
    "get", p.get,
    "getLength", p.getLength,
    "getReferenceNode", p.getReferenceNode,
    "insert", p.insert,
    "push", p.push,
    "remove", p.remove,
    "isExpression", p.isExpression,
    "isLiteral", p.isLiteral,
    "isDirty", p.isDirty,
    "isEmpty", p.isEmpty,
    "setValue", p.setValue,
    "clear", p.clear,
    "commit", p.commit,
    "rollback", p.rollback,
    "destroy", p.destroy,
    "toString", p.toString,
    "unwrap", p.unwrap,
    "each", p.each,
    "addHandler", p.addHandler,
    "compare", p.compare
);
