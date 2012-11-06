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
var p = ActionReferenceValue.prototype;
exp(p,
    "auraType", p.auraType,
    "getValue", p.getValue,
    "unwrap", p.unwrap,
    "merge", p.merge,
    "isDefined", p.isDefined,
    "isDirty", p.isDirty,
    "isLiteral", p.isLiteral,
    "isExpression", p.isExpression,
    "destroy", p.destroy,
    "toString", p.toString
);
