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
/**
 * Maps java types to and from javascript types to run jslint in rhino
 * through the java.script APIs which do not offer access to the js object
 * implementations/factory methods that Rhino's API does.
 *
 * @param javaSourceLines A java array of Strings.  Each string represents a line of code.
 * @param javaOptions A java map of options
 * @returns A java String[] of error messages or an empty array.
 */
var jslintHelper = function(javaSourceLines, allowDebugger, allowUnfilteredForIn){
    var jsSourceLines = [];

    //Convert the java String[] into a javascript String[]
    for(var i=0;i<javaSourceLines.length;i++){
        jsSourceLines.push(new String(javaSourceLines[i]));
    }

    var jsOptions = {
                        laxbreak : true,
                        ass       : true,
                        bitwise   : false,
                        browser   : true,
                        closure   : false,
                        'continue'  : true,
                        couch     : false,
                        devel     : false,
                        eqeq      : true,
                        evil      : false,
                        indent    :   4,
                        maxerr    : 100,
                        maxlen    : 1000,
                        newcap    : true,
                        node      : false,
                        nomen     : true,
                        passfail  : false,
                        plusplus  : true,
                        properties: false,
                        regexp    : true,
                        rhino     : false,
                        unparam   : true,
                        sloppy    : true,
                        stupid    : false,
                        sub       : false,
                        todo      : true,
                        vars      : true,
                        white     : true,
                        debug : allowDebugger,
                        forin : allowUnfilteredForIn,
                        predef : ['$A', 'aura'],
                        // options we had to add to get 0 errors on framework js
                        arguments: true, // allow arguments[.]
                        emptyBlock: true,
                        weirdAssignment: true,
                        weirdRelation: true,
                        weirdTypeof: true,
                        usedBefore: true,
                        moveVar: true,
                        varLoop: true,
                        unnecessaryInitialize: true,
                        useOr: true,
                        moveInvocation: true,
                        forInVariable: true,
                        infixIn: true,
                        weirdCondition: true,
                        blockDisrupt: true,
                        wrapImmediate: true,
                        unused: false,
                        reserved: false,
                        stringConcat: true,
                        unexpectedTypeof: true,
                        confusingNot: true,
                        unexpectedCall: true
                    };

    JSLINT(jsSourceLines, jsOptions);

    var jsErrors = JSLINT.errors;

    var javaErrors = new java.util.ArrayList();
    for(var i=0;i<jsErrors.length;i++){
        var jsError = jsErrors[i];
        if(jsError){
            var javaError = new java.util.HashMap();
            javaError.put("line", jsError.line);
            javaError.put("startColumn", jsError.character);
            javaError.put("message", jsError.reason);
            javaError.put("evidence", new java.lang.String(jsError.evidence));
            javaErrors.add(javaError);
        }
    }

    return javaErrors;
};
