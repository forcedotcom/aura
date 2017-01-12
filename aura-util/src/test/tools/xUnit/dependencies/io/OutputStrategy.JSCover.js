Function.RegisterNamespace("Test.Tools.Aura.Output.OutputStrategy");

Test.Tools.Aura.Output.OutputStrategy.JsCover = function () {
    // IOutputStrategy Members
    this.OutputLevel="";

    this.Prologue=function(){

    };

    this.Epilogue=function(){
        //System.Environment.Write("\n <<<<<<<<<<<<<<<<<<<< "+"\n");
        if(typeof(_$jscoverage)=="undefined")throw new Error("No jscoverage instrumentation found.");
        var parameters = System.Environment.GetParameters();
        //System.Environment.Write("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+parameters.named.logfile+"\n");
        //System.Environment.Write("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+parameters.named.coverage+"\n");
        if (parameters.named.coverage === "true" && parameters.named.logfile) {
            System.IO.File.SaveFile(parameters.named.logfile, new System.Script.ObjectSerializer().Serialize(_$jscoverage));
        } else {
            System.Environment.Write("\n\nJavascript xUnit.js Test Coverage:\n");
            var output={};
            for(var file in _$jscoverage){
                output[file]={
                    lineCoverage:{count:0,hits:0,total:0},
                    functionCoverage:{count:0,hits:0,total:0},
                    branchCoverage:{count:0,hits:0,total:0,misses:{evalFalse:[],evalTrue:[]}}
                }
                Array.ForEach(_$jscoverage[file].lineData,hitCountHandler,notNullPredicate,{Coverage:output[file].lineCoverage});
                Array.ForEach(_$jscoverage[file].functionData,hitCountHandler,notNullPredicate,{Coverage:output[file].functionCoverage});
                Object.ForEach(_$jscoverage[file].branchData,branchCountHandler,notNullPredicate,{Coverage:output[file].branchCoverage});
                Object.ForEach(output[file],coverageHandler);

                System.Environment.Write(String.Format("\n{0}:\n\tLines: {1}%, Functions: {2}%, Branches:{3}%\n", file, output[file].lineCoverage.total, output[file].functionCoverage.total, output[file].branchCoverage.total));
            }

            System.Environment.Write("\n\nDone.");
        }
    };

    this.BeginFileLoad=function(){
    };

    this.FileLoadSuccess=function (file,duration) {
    };

    this.CompleteFileLoad=function(files,duration){
    };

    this.BeginRun=function(){
    };

    this.CompleteRun=function(successes,failures,errors,warnings,skipped,duration){
    };

    this.BeginComponent=function(component){
    };

    this.CompleteComponent=function(component,duration){
    };

    this.Enumerate=function(component){
    };

    this.Error=function(error){
    }

    // IStrategySpecification Members
    this.IsSatisfiedBy=function(candidate){
        return String.Equals(xUnit.js.Console.Output.OutputFormatter.OutputTypes.jscover,candidate);
    };

    // Private Methods
    function branchCountHandler(branch,context){
        if(!branch)return;

        context.Coverage.count++;
        if(branch[1].evalFalse>0)context.Coverage.hits++;
        else context.Coverage.misses.evalFalse.push(branch[1].src);

        context.Coverage.count++;
        if(branch[1].evalTrue>0)context.Coverage.hits++;
        else context.Coverage.misses.evalTrue.push(branch[1].src);
    }

    function coverageHandler(coverage,context){
        coverage.total=round(100*(coverage.hits/coverage.count));
    }

    function hitCountHandler(hit,context){
        context.Coverage.count++;
        if(hit>0)context.Coverage.hits++;
    }

    function round(value,precision){
        if(precision==undefined)precision=2;
        if(value==undefined||isNaN(value))return 0;
        return Math.round(value*Math.pow(10,precision))/Math.pow(10,precision);
    }

    // Predicates
    function notNullPredicate(entry,context){
        return entry!=null;
    }

};

if(xUnit.js.Console){
    Test.Tools.Aura.Output.OutputStrategy.JsCover.Implement(xUnit.js.Console.Output.IOutputStrategy, 'Test.Tools.Aura.Output.OutputStrategy.JsCover');
    Test.Tools.Aura.Output.OutputStrategy.JsCover.Implement(System.Script.Strategy.IStrategySpecification, 'Test.Tools.Aura.Output.OutputStrategy.JsCover');

    xUnit.js.Console.Output.OutputFormatter.OutputTypes.jscover = "jscover";
    xUnit.js.Console.Program.Application.Output.Strategies.Add(Test.Tools.Aura.Output.OutputStrategy.JsCover);
}