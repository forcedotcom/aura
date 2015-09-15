Function.RegisterNamespace("Test.Tools.Aura.Output.OutputStrategy");

Test.Tools.Aura.Output.OutputStrategy.JUnit = function () {
    var _output;

    // IOutputStrategy Members
    this.OutputLevel="";

    this.Prologue = function () {
        _output = {
            errors:[],
            files:{
                list:[]
            },
            facts:{
                list:[],
                failures:[],
                errors:[],
                warnings:[],
                skipped:[]
            },
            run:{
                failures:0,
                errors:0,
                count:0,
                duration:0,
                skipped:0,
                timestamp:new Date()
            }
        };
    };

    this.Epilogue = function () {
        var output=['<?xml version="1.0" encoding="UTF-8"?>'];
        output.push(String.Format(
            '\n<testsuite errors="{0}" failures="{1}" skipped="{2}" warnings="{3}" expected="{4}" name="{5}" tests="{4}" time="{6}" timestamp="{7}">',
            _output.run.errors+_output.errors.length,
            _output.run.failures,
            _output.run.skipped,
            _output.run.warnings,
            _output.run.count,
            encode("js-utest"),
            _output.run.duration,
            Date.Format(_output.run.timestamp,"yyyy-MM-ddThh:mm:ss")
        ));
        writeProperties(output);
        writeFiles(output);
        writeSkipped(output);
        writeFailed(output);
        writeFailed(output,true);
        writeTests(output);
        writeErrors(output);
        output.push('\n</testsuite>\n');
        var parameters=System.Environment.GetParameters();
        if(parameters.named.logfile && parameters.named.logfile.indexOf('.json') === -1){
            System.IO.File.SaveFile(parameters.named.logfile,output.join(''));
        }else{
            System.Environment.Write(output.join(''));
        }
    };

    this.BeginFileLoad = function () {
    };

    this.FileLoadSuccess = function (file,duration) {
    };

    this.CompleteFileLoad = function (files, duration) {
        _output.files.list=files;
        _output.files.duration = duration / 1000;
    };

    this.BeginRun = function () {
        _output.facts.list.length = 0;
        _output.facts.failures.length = 0;
        _output.facts.errors.length = 0;
        _output.facts.warnings.length = 0;
        _output.facts.skippedlength = 0;
        _output.run = {
            count:0,
            failures:0,
            errors:0,
            warnings:0,
            skipped:0,
            duration:0,
            timestamp:new Date()
        };
    };

    this.CompleteRun = function (successes, failures, errors, warnings, skipped, duration) {
        var count = successes.length + failures.length + errors.length + warnings.length + skipped.length;
        _output.run.count = count;
        _output.run.failures = failures.length;
        _output.run.errors = errors.length;
        _output.run.skipped = skipped.length;
        _output.run.duration = duration / 1000;
        if (failures.length) {
            _output.facts.failures = failures;
        }
        if (errors.length) {
            _output.facts.errors = errors;
        }
        if (warnings.length) {
            _output.facts.warnings = warnings;
        }
        if (skipped.length) {
            _output.facts.skipped = skipped;
        }
    };

    this.BeginComponent = function (component) {
        if (!Object.IsType(xUnit.js.Model.Fact, component))return;
        component.duration=0;
    };

    this.CompleteComponent = function (component, duration) {
        if (!Object.IsType(xUnit.js.Model.Fact, component))return;
        component.duration=duration;
        _output.facts.list.push(component);
    };

    this.Enumerate = function (component) {
        throw new Error("Not Implemented.");
    };

    this.Error = function(error){
        _output.errors.push(error);
    };

    // IStrategySpecification Members
    this.IsSatisfiedBy = function (candidate) {
        return String.Equals("junit", candidate);
    };

    // Private Methods
    function encode(value) {
        if (value == undefined || !value.toString)return '';
        value = value.toString();
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getPath(fact) {
        return fact.GetPath().split('.').slice(1).join('.');
    }

    function getFilename(fact) {
        return fact.File.split('/').slice(-1);
    }
    
    function getClassname(fact) {
        return fact.GetPath().split('.').slice(1, -2).join('.');
    }
    
    function getTestname(fact) {
        return fact.GetPath().split('.').slice(-2).join('.');
    }
    
    function writeErrors(output){
        if(!_output.errors||!_output.errors.length)return;
        for(var i=0;i<_output.errors.length;i++){
            output.push(String.Format('\n\t<system-err>\n\t\t<![CDATA[\n\t\t\t{0}\n\t\t]]>\n\t</system-err>',_output.errors[i]));
        }
    }

    function writeFailed(output,errors) {
        var failed=errors?_output.facts.errors:_output.facts.failures;
        if(!failed||!failed.length)return;
        for(var i=0;i<failed.length;i++) {
            var fact=failed[i].Component;
            var state=failed[i].State;
            output.push(String.Format(
                // Additional attributes possible
                // team="ffxeng" owner="ffxeng" prodarea="null" majfuncarea="null" scrumteam="Fileforce" category="All functional tests/Architecture/FileForce/common.storage.FileForceSettingsTest/" module="sfdc"
                '\n\t<testcase classname="{0}" name="{1}" time="{2}">\n\t\t<{7} message="{3}" type="{6}">\n\t\t\t{3}\n\n\t\t\tFile: {4}\n\n\t\t\tStackTrace:{5}\n\t\t<{8}{7}>\n\t</testcase>',
                encode(getClassname(fact)),
                encode(getTestname(fact)),
                fact.duration / 1000,
                encode(state.Message || "[no message]"),
                encode(fact.File),
                encode(state.Message.stackTrace|| state.Message.stack),
                encode(state.Message && (state.Message.name || (Object.IsType(Function, state.Message.constructor) && Function.GetName(state.Message.constructor))) || "Exception"),
                errors?"error":"failure","/"
            ));
        }
    }

    function writeFiles(output){
        var files=_output.files.list;
        if(!files||!files.length)return;
        output.push(String.Format('\n\t<files duration="{0}">',_output.files.duration));
        for(var i=0;i<files.length;i++){
            output.push(String.Format(
                '\n\t\t<file path="{0}"/>',
                encode(files[i])
            ));
        }
        output.push("\n\t</files>");
    }

    function writeProperties(output){
        var parameters=System.Environment.GetParameters();
        output.push('\n\t<properties>');
        for(var x in parameters.named){
            output.push(String.Format('\n\t\t<property name="{0}" value="{1}" />',encode(x),encode(parameters.named[x])));
        }
        var path=0;
        for (var x in parameters.unnamed) {
            output.push(String.Format('\n\t\t<property name="path_{0}" value="{1}" />', ++path, encode(parameters.unnamed[x])));
        }
        output.push('\n\t</properties>');
    }

    function writeSkipped(output){
        var skipped= _output.facts.skipped;
        if(!skipped||!skipped.length)return;
        for(var i=0;i<skipped.length;i++){
            output.push(String.Format(
                    '\n\t<testcase classname="{0}" name="{1}" time="{2}"><skipped message="{3}"/></testcase>',
                    encode(getClassname(skipped[i].Component)),
                    encode(getTestname(skipped[i].Component)),
                    encode(skipped[i].Component.duration/1000),
                    encode(skipped[i].Component.State.Message || "[no message]")
                ));
        }
    }

    function writeTests(output){
        var facts=_output.facts.list;
        if(!facts||!facts.length)return;
        for(var i=0;i<facts.length;i++) {
            var fact=facts[i];
            if(fact.State.Result!=xUnit.js.Model.Result.Success&&fact.State.Result!=xUnit.js.Model.Result.Warning)continue;
            output.push(String.Format(
                '\n\t<testcase classname="{0}" name="{1}" time="{2}"{3}/>',
                encode(getClassname(fact)),
                encode(getTestname(fact)),
                encode(fact.duration/1000),
                fact.State.Result!=xUnit.js.Model.Result.Success?String.Format(' message="Warning: {0}"',encode(fact.State.Message)):''
            ));
        }
    }
};
if(xUnit.js.Console){
    Test.Tools.Aura.Output.OutputStrategy.JUnit.Implement(xUnit.js.Console.Output.IOutputStrategy, 'Test.Tools.Aura.Output.OutputStrategy.JUnit');
    Test.Tools.Aura.Output.OutputStrategy.JUnit.Implement(System.Script.Strategy.IStrategySpecification, 'Test.Tools.Aura.Output.OutputStrategy.JUnit');

    xUnit.js.Console.Output.OutputFormatter.OutputTypes.junit = "junit";
    xUnit.js.Console.Program.Application.Output.Strategies.Add(Test.Tools.Aura.Output.OutputStrategy.JUnit,0);
}