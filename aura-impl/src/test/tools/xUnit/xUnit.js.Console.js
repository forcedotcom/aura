// Copyright (c) 2006-2012 John Buchanan 
// Permission is hereby granted, free of charge, to any person obtaining  
// a copy of this software and associated documentation files (the "Software"),  
// to deal in the Software without restriction, including without limitation the  
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or  
// sell copies of the Software, and to permit persons to whom the Software is  
// furnished to do so, subject to the following conditions: 
// The above copyright notice and this permission notice shall be included in  
// all copies or substantial portions of the Software. 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,  
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR  
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE  
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR  
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER  
// DEALINGS IN THE SOFTWARE. 
 
// Extensions.js 
 
Array.Clear=function(array){
	if(!Object.IsType(Array,array))throw new Error("Array.Clear: 'array' must be a valid Array.");
	for(var i=0;i<array.length;i++)array[i]=null;
	array.length=0;
};

Array.Contains=function(array,expected,predicate){
	if(!Object.IsType(Array,array))throw new Error("Array.Contains: 'array' must be a valid Array.");
	return Array.IndexOf(array,expected,0,predicate)>-1;
};

Array.Copy=function(sourceArray,sourceIndex,destinationArray,destinationIndex,length){
	if(!Object.IsType(Array,sourceArray))throw new Error("Array.Copy: 'sourceArray' must be a valid Array.");
	if(!Object.IsType(Number,sourceIndex))throw new Error("Array.Copy: 'sourceIndex' must be a valid Number.");
	if(sourceIndex<0)throw new Error("Array.Copy: 'sourceIndex' may not be negative.");
	if(!Object.IsType(Array,destinationArray))throw new Error("Array.Copy: 'destinationArray' must be a valid Array.");
	if(!Object.IsType(Number,destinationIndex))throw new Error("Array.Copy: 'destinationIndex' must be a valid Number.");
	if(destinationIndex<0)throw new Error("Array.Copy: 'destinationIndex' may not be negative.");
	if(arguments.length<5){
		length=sourceArray.length-sourceIndex;
	}else{
		if(!Object.IsType(Number,length))throw new Error("Array.Copy: 'length' must be a valid Number.");
		if(length<0)length=sourceArray.length-sourceIndex;
	}
	destinationArray.splice.apply(destinationArray,[destinationIndex,0].concat(sourceArray.slice(sourceIndex,length)));
};

Array.Equals=function(expected,actual,reason){
	if(!Object.IsType(Array,expected))throw new Error("Array.Equals: 'expected' must be a valid Array.");
	if(!Object.IsType(Array,actual)){
		if(reason)reason.Value="Array.Equals: 'actual' was not a valid Array.";
		return false;
	}
	if(expected.length!=actual.length){
		if(reason)reason.Value=String.Format("Array.Equals: Expected array of length '{0}', found array of length '{1}'.",expected.length,actual.length);
		return false;
	}
	for(var i=0;i<expected.length;i++){
		if(!Object.Equals(expected[i],actual[i])){
			if(reason)reason.Value=String.Format("Array.Equals: Unexpected value found at position [{0}]. Expected '{1}', found '{2}'.",i,expected[i],actual[i]);
			return false;
		}
	}
	return true;
};

Array.Find=function(array,expected,predicate){
	if(!Object.IsType(Array,array))throw new Error("Array.Contains: 'array' must be a valid Array.");
	var index=Array.IndexOf(array,expected,0,predicate);
	if(index>-1)return array[index];
	return null;
};

Array.ForEach=function(array,handler,predicate,context){
	if(!Object.IsType(Array,array))throw new Error("Array.ForEach: 'array' must be a valid Array.");
	if(!Object.IsType(Function,handler))throw new Error("Array.ForEach: argument 'handler' must be a valid Function pointer.");
	if(predicate!=undefined){
		if(!Object.IsType(Function,predicate))throw new Error("Array.ForEach: 'predicate' must be a valid Function pointer.");
	}
	if(!context)context={};
	Object.Copy(context,{
		Cancel:false,
		Current:null,
		Index:-1,
		Instance:array
	});
	for(context.Index=0;context.Index<array.length;context.Index++){
		context.Current=array[context.Index];
		if(!predicate||predicate(context.Current,context)){
			handler(context.Current,context);
			if(context.Cancel)break;
		}
	}
	return context;
};

Array.IndexOf=function(array,expected,startingIndex,predicate,context){
	if(!Object.IsType(Array,array))throw new Error("Array.IndexOf: 'array' must be a valid Array.");
	if(startingIndex!=undefined){
		if(!Object.IsType(Number,startingIndex))throw new Error("Array.IndexOf: 'startingIndex' must be a valid Number.");
	}
	if(predicate!=undefined){
		if(!Object.IsType(Function,predicate))throw new Error("Array.IndexOf: 'predicate' must be a valid Function pointer.");
	}
	if(!context)context={};
	Object.Copy(context,{
		Cancel:false,
		Current:null,
		Expected:expected,
		Index:-1,
		Instance:array
	});
	
	for(context.Index=startingIndex||0;context.Index<array.length;context.Index++){
		context.Current=array[context.Index];
		if(predicate){
			if(predicate(context.Current,context))return context.Index;
		}else{
			if(Object.Equals(expected,context.Current))return context.Index;
		}
		if(context.Cancel)break;
	}
	return -1;
};

Array.IsEmpty=function(array){
	if(!Object.IsType(Array,array))throw new Error("Array.IsEmpty: 'array' must be a valid Array.");
	return array.length==0;
};

Array.Remove=function(array,expected,predicate){
	if(!Object.IsType(Array,array))throw new Error("Array.Remove: 'array' must be a valid Array.");
	var index=Array.IndexOf(array,expected,0,predicate);
	if(index>-1)return array.splice(index,1);
	return null;
};

Array.Shuffle=function(array){
	if(!Object.IsType(Array,array))throw new Error("Array.Shuffle: 'array' must be a valid Array.");
	var result=[];
	var target=array.slice(0);
	while(target.length)result.push(target.splice(Math.floor(Math.random()*target.length),1)[0]);
	return result;
}; 
 
Boolean.Equals=function(expected,actual,reason){
	if(!Object.IsType(Boolean,expected))throw new Error("Boolean.Equals: 'expected' must be a valid Boolean.");
	if(!Object.IsType(Boolean,actual)){
		actual=!!actual;
	}
	if(expected!=actual){
		if(reason)reason.Value=String.Format("Boolean.Equals: Booleans did not match. Expected '{0}', found '{1}'.",expected,actual);
		return false;
	}
	return true;
}; 
 
Date.Equals=function(expected,actual,reason){
	if(!Object.IsType(Date,expected))throw new Error("Date.Equals: 'expected' must be a valid Date.");
	if(!Object.IsType(Date,actual)){
		if(reason)reason.Value="Date.Equals: 'actual' was not a valid Date.";
		return false;
	}
	if(expected.getTime()!=actual.getTime()){
		if(reason)reason.Value=String.Format("Date.Equals: Dates did not match. Expected '{0}', found '{1}'.",expected,actual);
		return false;
	}
	return true;
};

Date.Format=function(date,formatString){
	if(!Object.IsType(Date,date))throw new Error("Date.Format: 'date' must be a valid Date.");
	if(!Object.IsType(Function,formatString&&formatString.toString))throw new Error("Date.Format: 'formatString' must implement toString().");
	switch(formatString){
		case 'd':
			return String.Format("{0}/{1}/{2}",date.getMonth()+1,date.getDate(),date.getFullYear());
		default:
			// Freeform format
			var format=formatString
				.replace(/yyyy/gm,'{0}')
				.replace(/yy/gm,'{1}')
				.replace(/MM/gm,'{2}')
				.replace(/M/gm,'{3}')
				.replace(/dd/gm,'{4}')
				.replace(/d/gm,'{5}')
				.replace(/hh/gm,'{6}')
				.replace(/h/gm,'{7}')
				.replace(/HH/gm,'{8}')
				.replace(/H/gm,'{9}')
				.replace(/mm/gm,'{10}')
				.replace(/m/gm,'{11}')
				.replace(/ss/gm,'{12}')
				.replace(/s/gm,'{13}')
				.replace(/tt/gm,'{14}')
				.replace(/ii/gm,'{15}')
				.replace(/i/gm,'{16}');
			var hours=date.getHours();
			var meridianHours=hours>0?hours>12?hours-12:hours:12;
			return String.Format(
				format,
				date.getFullYear(),
				String.Pad(date.getYear(),0,2),
				String.Pad(date.getMonth()+1,0,2),
				date.getMonth()+1,
				String.Pad(date.getDate(),0,2),
				date.getDate(),
				String.Pad(hours,0,2),
				hours,
				String.Pad(meridianHours,0,2),
				meridianHours,
				String.Pad(date.getMinutes(),0,2),
				date.getMinutes(),
				String.Pad(date.getSeconds(),0,2),
				date.getSeconds(),
				hours<12?'AM':'PM',
				String.Pad(date.getMilliseconds(),0,2),
				date.getMilliseconds()
			);
	}
}; 
 
Error.Equals=function(expected,actual,reason){
	if(!Object.IsType(Error,expected))throw new Error("Error.Equals: 'expected' must be a valid Error.");
	if(!Object.IsType(Error,actual)){
		if(reason)reason.Value="Error.Equals: 'actual' was not a valid Error.";
		return false;
	}
	var fields=["name","message","description","number","fileName"];
	for(var i=0;i<fields.length;i++){
		var field=fields[i];
		if(expected.hasOwnProperty(field)&&!Object.Equals(expected[field],actual[field])){
			if(reason)reason.Value=String.Format("Error.Equals: '{0}' did not match. Expected value '{1}', found '{2}'.",field,expected[field],actual[field]);
			return false;
		}
	}
	return true;
};

Error.IsEmpty=function(error){
	if(!Object.IsType(Error,error))throw new Error("Error.IsEmpty: 'error' must be a valid Error.");
	return String.IsEmpty(String.Trim(error));
};

Error.prototype.toString=function(){
	var message=(this.hasOwnProperty("message")&&!String.IsEmpty(this.message)?this.message:this.description);
	if(message==undefined)message='';
	if(!Object.IsType(String,message))message=this+'';
	return message;
}; 
 
Function.Equals=function(expected,actual,reason){
	if(!Object.IsType(Function,expected))throw new Error("Function.Equals: 'expected' must be a valid Function pointer.");
	if(!Object.IsType(Function,actual)){
		if(reason)reason.Value="Function.Equals: 'actual' must be a valid Function pointer.";
		return false;
	}
	if(expected!=actual&&expected.toString()!=actual.toString()){
		if(reason)reason.Value=String.Format("Function.Equals: function bodies do not match. Expected '{0}', found '{1}'.",expected,actual);
		return false;
	}
	return true;
};

Function.GetDelegate=function(method,instance){
	if(!Object.IsType(Function,method))throw new Error("Function.GetDelegate: 'method' must be a valid Function pointer.");
	if(!instance)throw new Error("Function.GetDelegate: 'instance' must be a valid Object.");
	var preArgs=Array.prototype.slice.call(arguments,2);
	return function delegate(){
        var args=preArgs.slice(0).concat(Array.prototype.slice.call(arguments,0));
		if(this.constructor===arguments.callee||this.constructor===delegate){
			var argumentList=[];
			for(var i=0;i<args.length;i++)argumentList.push(String.Format("args[{0}]",i));
			return Function("constructor","args",String.Format("Object.Copy(constructor.prototype,this.constructor.prototype);return new constructor({0});",argumentList.join(','))).apply(this,[method,args]);
        }else{
            return method.apply(instance,args);
        }
    };
};

Function.GetName=function(method){
	if(!Object.IsType(Function,method))throw new Error("Function.GetName: 'method' must be a valid Function pointer.");
	var funcStr=String.Trim(method.toString());
	var name=null;
	if(funcStr.match(/\bfunction\s?([^(]*)\(/)){
		name=String.Trim(RegExp.$1);
	}
	return name||"[anonymous]";
};

Function.GetParameters=function(method){
	if(!Object.IsType(Function,method))throw new Error("Function.GetParameters: 'method' must be a valid Function pointer.");
	var funcStr=method.toString();
	var parenIndex=funcStr.indexOf('(')+1;
	var paramList=funcStr.substring(parenIndex,funcStr.indexOf(')',parenIndex)).replace(/\s/g,'');
	if(paramList)return paramList.split(',');
	return [];
};

Function.GetTestable=function(method){
	var testables=[
		"if(!this._GetMember)this._GetMember=function(name){return eval(name);};",
		"if(!this._SetMember)this._SetMember=function(name,value){eval(\"if(typeof(\"+name+\")!=\\\"undefined\\\")\"+name+\"=value;\");};"
	];
	var testableFunc=(typeof(method)=="object"?method.constructor:method).toString().replace(/(function[^{]*\{)(\s*)/g,"$1$2"+testables.join("$2")+"$2");
	return Function(String.Format("return false||({0})",testableFunc))();
};

Function.IsEmpty=function(method){
	if(!Object.IsType(Function,method))throw new Error("Function.IsEmpty: 'method' must be a valid Function pointer.");
	var body=method.toString();
	body=body.replace(/^[^{]*{|}\s*$/g,'');
	body=body.replace(/\/\/[^\n]*/g,'');
	while(/\/\*|\*\//.test(body)){
		var startIndex=body.indexOf("/*");
		body=[body.substring(0,startIndex),body.substring(body.indexOf('*/',startIndex)+2)].join('');
	}
	return String.IsEmpty(String.Trim(body));
}

Function.RegisterNamespace=function(path,rootContainer){
	if(!Object.IsType(Function,path&&path.toString))throw new Error("Function.RegisterNamespace: 'path' must be convertible to String.");
	var nameSpaces=path.toString().split('.');
	var container=rootContainer||Object.Global();
	for(var i=0;i<nameSpaces.length;i++){
		if(!container[nameSpaces[i]])container[nameSpaces[i]]={};
		container=container[nameSpaces[i]];
	}
};

Function.prototype.Inherit=function(type,name){
	if(!Object.IsType(Function,type&&type.apply))throw new Error(String.Format("{0}.Inherit: 'type' must be a valid Function pointer.",name||Function.GetName(this)));
	if(this.base&&this.prototype&&this.prototype.base)throw new Error(String.Format("{0}.Inherit: unable to inherit {1}. {0} already inherits {2}.",name||Function.GetName(this),Function.GetName(type),Function.GetName(this.base)));
	this.base=type;
	this.prototype=new function(constructor){
		this.base=getBaseDelegate(constructor,type);
		this.constructor=constructor;
		this.valueOf=function(){return constructor;};
	}(this);
	function getBaseDelegate(constructor,baseType){
		var ancestorBase=baseType&&baseType.base&&baseType.prototype.base||null;
		var delegate=function(){
			var classMembers=getMemberMap(this);
			var result=scopeDelegate.apply(this,[baseType,ancestorBase].concat(Array.prototype.slice.call(arguments,0)));
			var baseMembers=getMemberMap(this,classMembers);
			Object.ForEach(baseMembers,addBaseMember,null,{Members:classMembers,Target:this,Base:ancestorBase});
			return result;
		}
		delegate.base=ancestorBase;
		delegate.constructor=baseType;
		delegate.valueOf=function(){return baseType;}
		return delegate;
	}
	function addBaseMember(member,context){
		if(Object.IsType(Function,member))member=Function.GetDelegate(scopeDelegate,context.Target,member,context.Base);
		if(context.Members.hasOwnProperty(context.Name))context.Target[context.Name]=context.Members[context.Name];
		context.Target.base[context.Name]=member;
	}
	function scopeDelegate(method,scope){
		var base=this.base;
		this.base=scope||null;
		var result=method.apply(this,Array.prototype.slice.call(arguments,2));
		this.base=base;
		return result;
	}
	function getMemberMap(target,exclusions){
		var map={};
		for(var x in target){
			if(!exclusions||exclusions[x]!==target[x])map[x]=target[x];
		}
		return map;
	}
};

Function.prototype.Implement=function(type,name){
	var instance=null;
	for(var x in type){
		if(!Object.IsType(Function,type[x]))continue;
		if(!Object.IsType(Function,this.prototype[x])&&!Object.IsType(Function,getInstance(this)[x]))throw new Error(String.Format("{0}.Implement: does not implement interface member '{1}'",name||Function.GetName(this),x));
		var expectedParams=Function.GetParameters(type[x]);
		var actualParams=Function.GetParameters(this.prototype[x]||getInstance(this)[x]);
		if(!Array.Equals(expectedParams,actualParams))throw new Error(String.Format("{0}.Implement: The signature '{0}.{2}({1})' does not match interface member '{4}.{2}({3})'",name||Function.GetName(this),actualParams,x,expectedParams,Function.GetName(Object.IsType(Function,type)?type:type.constructor)));
	}
	function getInstance(target){
		if(instance)return instance;
		try{
			instance={};
			target.apply(instance,[]);
			return instance;
		}catch(e){
			instance=null;
			throw new Error(String.Format("{0}.Implement: unable to instantiate constructor. {1}",name||Function.GetName(target),e));
		}
	}
}; 
 
Number.Equals=function(expected,actual,reason){
	if(!Object.IsType(Number,expected)){
		expected=parseFloat(expected);
		if(isNaN(expected))throw new Error("Number.Equals: 'expected' must be a valid Number.");
	}
	if(!Object.IsType(Number,actual)){
		actual=parseFloat(actual);
		if(isNaN(actual)){
			if(reason)reason.Value="Number.Equals: 'actual' was not convertible to Number.";
			return false;
		}
	}
	if(expected!=actual){
		if(reason)reason.Value=String.Format("Number.Equals: Numbers do not match. Expected '{0}', found '{1}'.",expected,actual);
		return false;
	}
	return true;
};

Number.Trim=function(number,decimalPlaces){
	if(!decimalPlaces)decimalPlaces=0;
	var factor=Math.pow(10,decimalPlaces);
	return Math.round(number*factor)/factor;
}; 
 
Object.Clone=function(instance){
	if(!arguments.length)throw new Error("Object.Clone: no argument passed for 'instance'.");
	var clone=null;
	if(instance!=undefined){
		switch(Object.GetType(instance)){
			case Boolean:
			case Function:
			case Number:
			case String:
				clone=instance;
				break;
			case Array:
				clone=new Array();
				break;
			case Date:
				clone=new Date(instance.getTime());
				break;
			case Error:
				clone=new Error(instance.toString());
				break;
			case Object:
			default:
				clone=new Object();
				break;
		}
		for(var x in instance){
			if(clone[x]!=instance[x])clone[x]=Object.Clone(instance[x]);
		}
		var glitchedProperties=["constructor","toString","valueOf","toLocaleString","prototype","isPrototypeOf","propertyIsEnumerable","hasOwnProperty","length","unique"];
		for(var g=0;g<glitchedProperties.length;g++){
			var prop=glitchedProperties[g];
			if(typeof(clone[prop])!="undefined"&&clone[prop]!=instance[prop])clone[prop]=instance[prop];
		}
	}else{
		clone=instance;
	}
	return clone;
};

Object.Contains=function(expected,actual){
	if(expected==undefined)throw new Error("Object.Contains: 'expected' must be a valid Object.");
	if(actual==undefined)return false;
	if(Object.IsType(Array,actual))return Array.Contains(actual,expected);
	if(Object.IsType(String,actual))return String.Contains(actual,expected);
	for(var x in expected){
		if(Object.IsType(Function,expected[x])){
			var context={Cancel:false,Current:x,Instance:actual,Matches:expected};
			if(!expected[x](actual[x],context))return false;
			if(context.Cancel)break;
		}else{
			if(!Object.Equals(expected[x],actual[x]))return false;
		}
	}
	return true;
};

Object.Copy=function(target,source,subset){
	if(!subset)subset=source;
	for(var x in source){
		if(subset.hasOwnProperty(x))target[x]=source[x];
	}
	return target;
};

Object.Equals=function(expected,actual,reason){
	if(arguments.length==0)throw new Error("Object.Equals: 'expected' must be a valid reference.");
	if(arguments.length==1)throw new Error("Object.Equals: 'actual' must be a valid reference.");
	if(Object.Same(expected,actual))return true;
	if(expected==undefined){
		if(!Object.Same(expected,actual)){
			if(reason)reason.Value=String.Format("Object.Equals: Expected '{0}', found '{1}'.",String(expected),actual);
			return false;
		}
		return true;
	}
	if(Object.IsType(Array,expected))return Array.Equals(expected,actual,reason);
	if(Object.IsType(Boolean,expected))return Boolean.Equals(expected,actual,reason);
	if(Object.IsType(Error,expected))return Error.Equals(expected,actual,reason);
	if(Object.IsType(Function,expected))return Function.Equals(expected,actual,reason);
	if(Object.IsType(Number,expected))return Number.Equals(expected,actual,reason);
	if(Object.IsType(String,expected))return String.Equals(expected,actual,reason);

	if(typeof(expected)!="object"||actual==undefined){
		if(reason)reason.Value=String.Format("Object.Equals: Expected '{0}', found '{1}'.",expected,actual);
		return false;
	}
	var x=null;
	var list={};
	for(x in expected){
		if(!Object.Equals(expected[x],actual[x],reason)){
			if(reason)reason.Value=String.Format("Object.Equals: property '{0}' does not match. Expected value '{1}', found '{2}'.",x,expected[x],actual[x]);
			return false;
		}
		list[x]=true;
	}
	for(x in actual){
		if(!list[x]){
			if(reason)reason.Value=String.Format("Object.Equals: found unexpected property '{0}' on actual, with value '{1}'",x,actual[x]);
			return false;
		}
	}
	return true;
};

Object.ForEach=function(object,handler,predicate,context){
	if(object==undefined)throw new Error("Object.ForEach: 'object' must be a valid Object.");
	if(!Object.IsType(Function,handler))throw new Error("Object.ForEach: argument 'handler' must be a valid Function pointer.");
	if(predicate!=undefined){
		if(!Object.IsType(Function,predicate))throw new Error("Object.ForEach: 'predicate' must be a valid Function pointer.");
	}
	if(!context)context={};
	Object.Set(context,{
		Cancel:false,
		Current:null,
		Instance:object,
		Name:''
	});
	var blankObject={};
	for(var prop in blankObject)if(!blankObject[prop])blankObject[prop]=true;
	for(var x in object){
		if(blankObject[x])continue;
		context.Current=object[x];
		context.Name=x;
		if(!predicate||predicate(context.Current,context)){
			handler(context.Current,context);
			if(context.Cancel)break;
		}
	}
	return context;
};

Object.Global=function(){
	return Function("return this;")();
};

Object.GetPredicate=function(expected){
	if(expected==undefined)throw new Error("Object.GetPredicate: 'expected' was undefined.");
	return function(actual){
		return Object.IsType(expected,actual);
	};
};

Object.GetType=function(instance){
	if(instance==undefined)return instance;
	var type=typeof(instance);
	switch(type){
		case "boolean":
			type=Boolean;
			break;
		case "number":
			type=Number;
			break;
		case "function":
			switch(Function.GetName(instance.constructor)){
				case "RegExp":
					type=RegExp;
					break;
				case "Function":
					type=Function;
					break;
			}
			break;
		case "object":
			type=instance.constructor;
			break;
		case "string":
			type=String;
			break;
	}
	return type;
};

Object.Inherits=function(type,instance){
	if(!Object.IsType(Function,type))throw new Error("Object.Inherits: 'type' must be a valid Function pointer.");
	if(instance==undefined)return false;
	var constructor=(Object.IsType(Function,instance)&&instance.base)||instance.base||instance.constructor;
	if(!constructor||constructor==constructor.constructor)return false;
	if(constructor==type)return true;
	return Object.IsType(type,constructor);
};

Object.Implements=function(type,target){
	if(!Object.IsType(Function,type&&type.constructor))throw new Error("Object.Implements: 'type' must be a valid Function pointer.");
	if(target==undefined)return false;
	var instance=null;
	if(Object.IsType(Function,target)){
		try{
			instance=new target();
		}catch(e){
			// Not a function? Might be a 2. 0_o
			instance=target;
		}
	}else instance=target;
	for(var x in type){
		if(Object.IsType(Function,type[x])){
			if(!Object.IsType(Function,instance[x]))return false;
			var expectedParams=Function.GetParameters(type[x]);
			var actualParams=Function.GetParameters(instance[x]);
			if(!Array.Equals(expectedParams,actualParams))return false;
		}else{
			if(typeof(instance[x])=='undefined')return false;
		}
	}
	return true;
};

Object.IsEmpty=function(instance){
	if(instance==undefined)throw new Error("Object.IsEmpty: 'instance' was undefined.");
	if(Object.IsType(Array,instance))return Array.IsEmpty(instance);
	if(Object.IsType(Boolean,instance))return false;
	if(Object.IsType(Date,instance))return false;
	if(Object.IsType(Error,instance))return Error.IsEmpty(instance);
	if(Object.IsType(Function,instance))return Function.IsEmpty(instance);
	if(Object.IsType(Number,instance))return false;
	if(Object.IsType(String,instance))return String.IsEmpty(instance);
	for(var x in instance)return false;
	return true;
};

Object.IsType=function(type,instance){
	if(type==undefined||typeof(type)!="function")throw new Error("Object.IsType: 'type' must be a valid Function pointer.");
	if(instance==undefined)return false;
	switch(type){
		case Function:
			return typeof(instance)=="function";
		case RegExp:
			return instance && instance.constructor && instance.constructor==RegExp;
		case Object:
			return instance&&typeof(instance)=="object"&&!Array.Contains([Array,Boolean,Date,Error,Function],instance.constructor);
		case Error:
			if(instance.constructor&&instance.constructor.toString().toLowerCase()=="[object error]")return true;
			//fallthrough, test constructor
		default:
			if(instance instanceof type)return true;
			if(instance.constructor==type||instance.constructor+''==type+'')return true;
			return Object.Inherits(type,instance);
	}
};

Object.Resolve=function(path,rootContainer){
	if(path==undefined)return null;
	var object=null;
	if(Object.IsType(Function,path&&path.toString)){
		path=path.toString().split('.');
		var container=rootContainer||Object.Global();
		for(var i=0;i<path.length;i++){
			if(!(container=container[path[i]]))break;
		}
		object=container;
	}
	return object;
};

Object.Same=function(expected,actual){
	return expected===actual;
};

Object.Set=function(object,properties){
	if(object==undefined)return;
	for(var x in properties){
		var value=properties[x];
		if(value&&typeof(value)=="object"){
			if(object[x]==undefined)object[x]=value;
			Object.Set(object[x],value);
		}else object[x]=value;
	}
	return object;
}; 
 
String.Concat=function(input1,input2,inputN){
	var output=[];
	for(var i=0;i<arguments.length;i++)output.push(arguments[i]||'');
	return output.join('');
}

String.Contains=function(input,pattern,ignoreCase){
	if(arguments.length==0)throw new Error("String.Contains: no argument was passed for 'input'.");
	if(arguments.length==1)throw new Error("String.Contains: no argument was passed for 'pattern'.");
	if(input==undefined||!Object.IsType(Function,input.toString))return false;
	if(pattern==undefined||!Object.IsType(Function,pattern.toString))return false;
	input=input.toString();
	pattern=pattern.toString();
	if(ignoreCase){
		input=input.toLowerCase();
		pattern=pattern.toLowerCase();
	}
	return input.indexOf(pattern)>-1;
};

String.Format=function(formatString){
	if(!Object.IsType(Function,formatString.toString))throw new Error("String.Format: 'formatString' must be convertible to String.");
    var formatArguments=Array.prototype.slice.call(arguments,1);
	return formatString.replace(/\{(\d*)\}/gm,getFormatArgument);
	function getFormatArgument(match,index,position){
		index=parseInt(index);
		if(index>=formatArguments.length)throw new Error(["String.Format: format match index was out of bounds at position [",index,"]."].join(''));
		if(Object.IsType(Function,formatArguments[index]&&formatArguments[index].toString))return formatArguments[index].toString();
		return formatArguments[index]+'';
	}
};

String.EndsWith=function(input,pattern,ignoreCase){
	if(arguments.length==0)throw new Error("String.EndsWith: no argument was provided for 'input'.");
	if(arguments.length==1)throw new Error("String.EndsWith: no argument was provided for 'pattern'.");
	if(input==undefined||!Object.IsType(Function,input.toString))return false;
	if(pattern==undefined||!Object.IsType(Function,pattern.toString))return false;
	input=input.toString();
	pattern=pattern.toString();
	if(ignoreCase){
		input=input.toLowerCase();
		pattern=pattern.toLowerCase();
	}
	return input.lastIndexOf(pattern)==input.length-pattern.length;
};

String.Equals=function(expected,actual,reason){
	if(!Object.IsType(String,expected))throw new Error("String.Equals: 'expected' must contain a valid String.");
	if(actual==undefined)actual=String(actual);
	if(!Object.IsType(Function,expected.toString))throw new Error("String.Equals: 'expected' must be convertible to String.");
	if(!Object.IsType(Function,actual.toString))throw new Error("String.Equals: 'actual' must be convertible to String.");
	if(expected.toString()!=actual.toString()){
		if(reason)reason.Value=String.Format("String.Equals: Strings did not match. Expected '{0}', found '{1}'.",expected,actual);
		return false;
	}
	return true;
};

String.IsEmpty=function(input){
	if(!Object.IsType(String,input))throw new Error("String.IsEmpty: 'input' must contain a valid String.");
	return input.length==0;
};

String.Pad=function(input,pattern,minimumLength){
	if(!Object.IsType(Function,input!=undefined&&input.toString))throw new Error("String.Pad: 'input' must be convertible to String.");
	if(!Object.IsType(Function,pattern!=undefined&&pattern.toString))throw new Error("String.Pad: 'pattern' must be convertible to String.");
	if(!Object.IsType(Number,minimumLength))throw new Error("String.Pad: 'minimumLength' must be a valid Number.");
	input=input.toString();
	pattern=pattern.toString();
	var difference=minimumLength-input.length;
	if(difference>0&&pattern.length){
		var repeater=(new Array(1+Math.ceil(difference/pattern.length)));
		input=String.Format("{0}{1}",repeater.join(pattern),input);
	}
	return input;
};

String.StartsWith=function(input,pattern,ignoreCase){
	if(arguments.length==0)throw new Error("String.StartsWith: no argument was provided for 'input'.");
	if(arguments.length==1)throw new Error("String.StartsWith: no argument was provided for 'pattern'.");
	if(input==undefined||!Object.IsType(Function,input.toString))return false;
	if(pattern==undefined||!Object.IsType(Function,pattern.toString))return false;
	input=input.toString();
	pattern=pattern.toString();
	if(ignoreCase){
		input=input.toLowerCase();
		pattern=pattern.toLowerCase();
	}
	return input.indexOf(pattern)==0;
};

String.Trim=function(input,char1,char2,charN){
	if(input==undefined||!Object.IsType(Function,input.toString))throw new Error("String.Trim: 'input' must be convertible to String.");
	input=input.toString();
	var chars=Array.prototype.slice.call(arguments,1);
	if(chars.length){
		for(var i=0;i<chars.length;i++){
			if(chars[i]==undefined||!Object.IsType(Function,chars[i].toString))throw new Error(String.Format("String.Trim: char at position [{0}] was not convertible to String.",i));
		}
		input=String.TrimEnd.apply(input,[input].concat(chars));
		input=String.TrimStart.apply(input,[input].concat(chars));
		return input;
	}
	return input.replace(/^\s*|\s*$/g,'');
};

String.TrimEnd=function(input,char1,char2,charN){
	if(input==undefined||!Object.IsType(Function,input.toString))throw new Error("String.TrimEnd: 'input' must be convertible to String.");
	input=input.toString();
	var chars=Array.prototype.slice.call(arguments,1);
	if(chars.length){
		var found;
		do{
			found=false;
			for(var i=0;i<chars.length;i++){
				if(chars[i]==undefined||!Object.IsType(Function,chars[i].toString))throw new Error(String.Format("String.TrimEnd: char at position [{0}] was not convertible to String.",i));
				chars[i]=chars[i].toString();
				if(String.EndsWith(input,chars[i])){
					input=input.substring(0,input.length-chars[i].length);
					found=true;
					break;
				};
			}
		}while(found);
		return input;
	}
	return input.replace(/\s*$/g,'');
};

String.TrimStart=function(input,char1,char2,charN){
	if(input==undefined||!Object.IsType(Function,input.toString))throw new Error("String.TrimStart: 'input' must be convertible to String.");
	input=input.toString();
	var chars=Array.prototype.slice.call(arguments,1);
	if(chars.length){
		var found;
		do{
			found=false;
			for(var i=0;i<chars.length;i++){
				if(chars[i]==undefined||!Object.IsType(Function,chars[i].toString))throw new Error(String.Format("String.TrimStart: char at position [{0}] was not convertible to String.",i));
				chars[i]=chars[i].toString();
				if(String.StartsWith(input,chars[i])){
					input=input.substring(chars[i].length,input.length);
					found=true;
					break;
				};
			}
		}while(found);
		return input;
	}
	return input.replace(/^\s*/g,'');
}; 

// System.js.Event 
 
Function.RegisterNamespace("System.Event");

System.Event.EventManager=function(){
	// Private members
	var _events={};
	
	// ctor
	function EventManager(type1,type2,typeN){
		if(arguments.length==0)throw new Error("System.EventManager.ctor: at least one type must be registered.");
		var types=Array.prototype.slice.call(arguments,0);
		Array.ForEach(types,addType);
	}
	EventManager.apply(this,arguments);
	
	// Public methods
	this.Add=function(type,handler){
		type=normalizeType(type);
		if(!_events[type])throw new Error(String.Format("System.EventManager.Add: the event type '{0}' is not registered.",type));
		if(!Object.IsType(Function,handler))throw new Error("System.EventManager.Add: 'handler' must be a valid Function pointer.");
		_events[type].push(handler);
	};

	this.Dispose=function(){
		for(var x in _events){
			this.Remove(x,null);
		}
	};
	
	this.Fire=function(type,context){
		type=normalizeType(type);
		if(!_events[type])throw new Error(String.Format("System.EventManager.Fire: the event type '{0}' is not registered.",type));
		if(!context)context={};
		context.Cancel=false;
		Array.ForEach(_events[type],firePredicate(context));
	};

	this.Get=function(type){
		type=normalizeType(type);
		if(!_events[type])throw new Error(String.Format("System.EventManager.Get: the event type '{0}' is not registered.",type));
		return _events[type].slice(0);		
	};
	
	this.Remove=function(type,handler){
		type=normalizeType(type);
		if(!_events[type])throw new Error(String.Format("System.EventManager.Remove: the event type '{0}' is not registered.",type));
		Array.ForEach(_events[type],removeType,handlerPredicate(handler));
	};
	
	// Private methods
	function addType(type,context){
		type=normalizeType(type);
		if(_events[type])return;
		_events[type]=[];
	}
	
	function normalizeType(type){
		if(type==undefined||!Object.IsType(Function,type.toString))throw new Error("System.EventManager.normalizeType: 'type' must be convertible to String.");
		return type.toString().toLowerCase();
	}

	function removeType(type,context){
		context.Instance.splice(context.Index,1);
		context.Index--;
	}
	
	// Predicates
	function firePredicate(eventContext){
		return function(method,context){
			method(eventContext);
			if(eventContext.Cancel)context.Cancel=true;
		};
	}
	
	function handlerPredicate(handler){
		return function(method,context){
			return !handler||handler==method;
		};
	}
}; 

// xUnit.js 
 
Function.RegisterNamespace("xUnit.js");

xUnit.js.Assert=new function(){
	// Public methods
	this.AssignableFrom=function(expected,actual){
		if(!Object.IsType(Function,expected))throw new xUnit.js.Model.AssertError("Assert.AssignableFrom: 'expected' must be a valid Function pointer.");
		if(Object.Inherits(expected,actual))return;
		if(Object.Implements(expected,actual))return;
		if(Object.IsType(expected,actual))return;
		throw new xUnit.js.Model.AssertError("Assert.AssignableFrom: 'actual' is not assignable from 'expected'");
	};	

	this.Contains=function(expected,actual){
		if(Object.Contains(expected,actual))return;
		throw new xUnit.js.Model.AssertError("Assert.Contains: 'actual' did not contain the 'expected' value.");
	};
	
	this.DoesNotContain=function(expected,actual){
		if(!Object.Contains(expected,actual))return;
		throw new xUnit.js.Model.AssertError("Assert.DoesNotContain: 'actual' contained the 'expected' value.");
	};
	
	this.DoesNotThrow=function(actual){
		try{
			actual();
		}catch(e){
			throw new xUnit.js.Model.AssertError(String.Format("Assert.DoesNotThrow: 'actual' threw an Error. Error: {0}",e));
		}
	};
	
	this.Empty=function(actual){
		try{
			if(!Object.IsEmpty(actual))throw new xUnit.js.Model.AssertError(String.Format("Found value: {0}",!Object.IsType(Function,actual)?new System.Script.ObjectSerializer().Serialize(actual):actual));
		}catch(e){
			throw new xUnit.js.Model.AssertError(String.Format("Assert.Empty: 'actual' was not empty. {0}",e));
		}
	};

	this.Equal=function(expected,actual){
		var reason={};
		if(!Object.Equals(expected,actual,reason))throw new xUnit.js.Model.AssertError(String.Format("Assert.Equal: 'actual' was not equal to 'expected'. Reason: {0}",reason.Value));
	};

	this.Fail=function(reason){
		throw new xUnit.js.Model.AssertError(String.Format("Assert.Fail: {0}",reason||"[No reason given]"));
	};
	
	this.False=function(actual,message){
		if(actual!==false)throw new xUnit.js.Model.AssertError(String.Format("Assert.False: {0}",message||"'actual' was not false."));
	};
	
	this.InRange=function(actual,low,high,comparer){
		if(comparer!=undefined&&!Object.IsType(Function,comparer))throw new xUnit.js.Model.AssertError("Assert.InRange: 'comparer' must be a valid Function pointer.");
		if(comparer){
			if(comparer(low,actual)>0||comparer(actual,high)>0)throw new xUnit.js.Model.AssertError(String.Format("Assert.InRange: 'actual' was not in the range as specified by 'comparer'. Expected low '{0}', high '{1}', found '{2}'.",low,high,actual));
		}else{
			if(low>actual||actual>high)throw new xUnit.js.Model.AssertError(String.Format("Assert.InRange: 'actual' was not in the range specified. Expected low '{0}', high '{1}', found '{2}'.",low,high,actual));
		}
	};

	this.NotEmpty=function(actual){
		if(Object.IsEmpty(actual))throw new xUnit.js.Model.AssertError("Assert.NotEmpty: 'actual' was empty.");
	};

	this.NotEqual=function(expected,actual){
		var reason={};
		if(Object.Equals(expected,actual,reason))throw new xUnit.js.Model.AssertError("Assert.NotEqual: 'actual' was equal to 'expected'.");
	};

	this.NotInRange=function(actual,low,high,comparer){
		if(comparer!=undefined&&!Object.IsType(Function,comparer))throw new xUnit.js.Model.AssertError("Assert.NotInRange: 'comparer' must be a valid Function pointer.");
		if(comparer){
			if(comparer(low,actual)<=0&&comparer(actual,high)<=0)throw new xUnit.js.Model.AssertError(String.Format("Assert.NotInRange: 'actual' was in the range as specified by 'comparer'. Expected low '{0}', high '{1}', found '{2}'.",low,high,actual));
		}else{
			if(low<=actual&&actual<=high)throw new xUnit.js.Model.AssertError(String.Format("Assert.NotInRange: 'actual' was in the range specified. Expected low '{0}', high '{1}', found '{2}'.",low,high,actual));
		}
	};
	
	this.NotNull=function(actual){
		if(actual===null)throw new xUnit.js.Model.AssertError("Assert.NotNull: 'actual' was null.");	
	};

	this.NotSame=function(expected,actual){
		if(expected===actual)throw new xUnit.js.Model.AssertError("Assert.NotSame: 'actual' was the same object as 'expected'.");
	};

	this.NotType=function(expected,actual){
		if(Object.IsType(expected,actual))throw new xUnit.js.Model.AssertError("Assert.NotType: 'actual' was of the 'expected' type.");
	};
	
	this.NotUndefined=function(actual){
		if(typeof(actual)=="undefined")throw new xUnit.js.Model.AssertError("Assert.NotUndefined: 'actual' was undefined.");
	};	
	
	this.Null=function(actual){
		if(actual!==null)throw new xUnit.js.Model.AssertError(String.Format("Assert.Null: 'actual' was not null. Found '{0}'.",actual));
	};

	this.Same=function(expected,actual){
		if(expected!==actual)throw new xUnit.js.Model.AssertError("Assert.Same: 'actual' was not the same object as 'expected'.");
	};	

	this.Throws=function(expected,actual){
		try{
			actual();
		}catch(e){
			var reason={};
			if(Object.IsType(Function,expected)){
				if(!Object.IsType(expected,e))throw new xUnit.js.Model.AssertError(String.Format("Assert.Throws: 'actual' threw an exception, but it was of the wrong type. Expected: '{0}', found: '{1}'.",Function.GetName(expected),Function.GetName(e.constructor)));
			}else{
				if(!Object.IsType(expected.constructor,e))throw new xUnit.js.Model.AssertError(String.Format("Assert.Throws: 'actual' threw an exception, but it was of the wrong type. Expected: '{0}', found: '{1}'.",Function.GetName(expected.constructor),Function.GetName(e.constructor)));
				if(!Object.Equals(expected,e,reason))throw new xUnit.js.Model.AssertError(String.Format("Assert.Throws: 'actual' did not throw the 'expected' exception. Reason: '{0}'.",reason.Value));
			}
			return e;
		}
		throw new xUnit.js.Model.AssertError("Assert.Throws: 'actual' did not throw an Error.");
	};

	this.True=function(actual,message){
		if(actual!==true)throw new xUnit.js.Model.AssertError(String.Format("Assert.True: {0}",message||"'actual' was not true."));
	};

	this.Type=function(expected,actual){
		if(!Object.IsType(expected,actual))throw new xUnit.js.Model.AssertError("Assert.Type: 'actual' was not of the 'expected' type.");
	};
	
	this.Undefined=function(expected){
		if(typeof(expected)!="undefined")throw new xUnit.js.Model.AssertError("Assert.Undefined: 'actual' was not undefined.");
	};
}; 
 
Function.RegisterNamespace("xUnit.js");

xUnit.js.Engine=function(){

	// Private members
	var _events;
	var _pathMap;
	var _rootFixture;

	// Public members
	this.Events;

	// ctor
	function Engine(){
		_pathMap={};
		ensureRootFixture();
		this.Events=_events=new System.Event.EventManager("BeforeRun","AfterRun");
	}
	Engine.apply(this,arguments);

	this.Enumerate=function(){
		var list=[];
		enumerateFixture(_rootFixture,list);
		return list;
	};
	
	this.Get=function(path){
		if(path!=undefined&&!Object.IsType(Function,path.toString))throw new Error("xUnit.js.Engine.Get: 'path' must be convertible to String.");
		return resolveTargets(path);
	};
	
	this.RegisterFixture=function(fixture,path){
		if(!Object.IsType(xUnit.js.Model.Fixture,fixture))throw new Error("xUnit.js.Engine.RegisterFixture: 'fixture' must be an instance of 'xUnit.js.Model.Fixture'.");
		fixture.Events.Add("AfterRun",Fixture_AfterRun);
		fixture.Events.Add("BeforeRun",Fixture_BeforeRun);
		var parentFixture=resolveFixture(path);
		parentFixture.RegisterFixture(fixture);
		updateFixtureMap(path,fixture);
	};

	this.RegisterFact=function(fact,path){
		if(!Object.IsType(xUnit.js.Model.Fact,fact))throw new Error("xUnit.js.Engine.RegisterFact: 'fact' must be an instance of 'xUnit.js.Model.Fact'.");
		fact.Events.Add("AfterRun",Fact_AfterRun);
		fact.Events.Add("BeforeRun",Fact_BeforeRun);
		var parentFixture=resolveFixture(path);
		parentFixture.RegisterFact(fact);
	};

	// IRunnable members
	this.Run=function(path){
		if(path!=undefined&&!Object.IsType(Function,path.toString))throw new Error("xUnit.js.Engine.Run: 'path' must be convertible to String.");
		var targets=resolveTargets(path);
		if(!Object.IsType(Array,targets))targets=[targets];
		Array.ForEach(targets,runDelegate);
	};
	
	// Private methods
	function enumerateFixture(fixture,list){
		if(!Object.IsType(xUnit.js.Model.Fixture,fixture))throw new Error("xUnit.js.Engine.enumerateFixture: 'fixture' must be an instance of 'xUnit.js.Model.Fixture'.");
		var fixtures=fixture.GetFixtures();
		for(var i=0;i<fixtures.length;i++)enumerateFixture(fixtures[i],list);
		var facts=fixture.GetFacts();
		for(var i=0;i<facts.length;i++)list.push(facts[i]);
	}	

	function ensureRootFixture(){
		if(_rootFixture)return;
		_rootFixture=new xUnit.js.Model.Fixture("[Root]");
		_rootFixture.Events.Add("AfterRun",Fixture_AfterRun);
		_rootFixture.Events.Add("BeforeRun",Fixture_BeforeRun);
	}
	
	function findMatches(targetPath,component){
		var targets=[];
		var fixtures=component.GetFixtures();
		for(var i=0;i<fixtures.length;i++){
			if(String.StartsWith(fixtures[i].GetPath(),targetPath)){
				targets.push(fixtures[i]);
				continue;
			}
			targets=targets.concat(findMatches(targetPath,fixtures[i]));
		}
		var facts=component.GetFacts();
		for(var i=0;i<facts.length;i++){
			if(String.StartsWith(facts[i].GetPath(),targetPath)){
				targets.push(facts[i]);
			}
		}
		return targets;
	}

	function normalizePath(path){
		var fullPath=[_rootFixture.Name];
		if(path){
			path=path.toString();
			if(path.length>0)fullPath.push(path);
		}
		return fullPath.join('.');
	}
		
	function resolveFixture(path){
		if(path!=undefined){
			if(!Object.IsType(Function,path.toString))throw new Error("xUnit.js.Engine.resolveFixture: 'path' must be convertible to String.");
			path=path.toString();
			if(_pathMap.hasOwnProperty(path)){
				return _pathMap[path];
			}
		}
		return _rootFixture;
	}

	function resolveTargets(path){
		var fixture=resolveFixture(path);
		if(fixture!=_rootFixture)return fixture;
		
		var fullPath=normalizePath(path);
		if(String.Equals(fullPath,fixture.Name))return _rootFixture;
		
		var matches=findMatches(fullPath,_rootFixture);
		if(matches.length){
			if(matches.length==1&&String.Equals(matches[0].GetPath(),fullPath))return matches[0];
			return matches;
		}
		throw new Error(String.Format("xUnit.js.Engine.resolveTargets: 'path' '{0}' does not resolve to any registered targets.",path));
	}

	function updateFixtureMap(path,fixture){
		var targetPath=String.TrimStart([path,fixture.Name].join('.'),'.');
		if(_pathMap.hasOwnProperty(targetPath)){
			if(_pathMap[targetPath]!=fixture){
				if(typeof(console)!="undefined")console.log(String.Format("xUnit.js.Engine.updateFixtureMap: reloading Fixture '{0}'.",targetPath));
			}
		}
		_pathMap[targetPath]=fixture;
	}

	// Predicates
	function nameComparer(fixture,context){
		return Object.Equals(context.Expected,fixture.Name);
	}
	
	function lengthComparer(a,b){
		return b.Name.length-a.Name.length;
	}

	function runDelegate(runnable,context){
		runnable.Run();
	}
	
	// Events
	function Fact_AfterRun(context){
		_events.Fire("AfterRun",context);
	}

	function Fact_BeforeRun(context){
		_events.Fire("BeforeRun",context);
	}

	function Fixture_AfterRun(context){
		if(!Object.IsType(xUnit.js.Model.Fixture,context.Component))return;
		_events.Fire("AfterRun",context);
	}

	function Fixture_BeforeRun(context){
		if(!Object.IsType(xUnit.js.Model.Fixture,context.Component))return;
		_events.Fire("BeforeRun",context);
	}
};

xUnit.js.Engine.Implement(xUnit.js.IRunnable); 
 
Function.RegisterNamespace("xUnit.js");

xUnit.js.Mocks=new function(){
	// Public methods
	this.GetMock=function(target,member,mockery){
		if(target==undefined||!{"function":1,"object":1}[typeof(target)])throw new Error("xUnit.js.Mocks.GetMock: 'target' must be a valid Object.");
		if(!Object.IsType(String,member)||member.length==0)throw new Error("xUnit.js.Mocks.GetMock: 'member' must be a valid String.");
		var mockeries={};
		mockeries[member]=mockery;
		return this.GetMocks(target,mockeries);		
	};

	this.GetMocks=function(target,mockeries){
		if(target==undefined||!{"function":1,"object":1}[typeof(target)])throw new Error("xUnit.js.Mocks.GetMocks: 'target' must be a valid Object.");
		if(!Object.IsType(Object,mockeries))throw new Error("xUnit.js.Mocks.GetMock: 'mockeries' must be a valid Object containing member to mock mappings.");
		return function Mockery(during,argument1,argument2,argumentN){
			if(!Object.IsType(Function,during))throw new Error("xUnit.js.Mocks.Mockery: 'during' must be a valid Function pointer.");
			var mockTargets=Object.Copy({},target,mockeries);
			try{
				for(var member in mockeries){
					var mockery=mockeries[member];
					var mocked=mockTargets[member];
					if(mockery)mockery.Mocked=Object.IsType(Function,mocked)?Function.GetDelegate(mocked,target):mocked;
					target[member]=mockery;
				}
				return during.apply(target,Array.prototype.slice.call(arguments,1));
			}catch(e){
				throw e;
			}finally{
				for(var member in mockeries){
					var mockery=mockeries[member];
					if(mockery)delete mockery.Mocked;
					target[member]=mockTargets[member];
				}
			}
		};
	};
}; 
 
Function.RegisterNamespace("xUnit.js");

xUnit.js.Record=new function(){
	// Public methods
	this.Exception=function(delegate){
		if(!Object.IsType(Function,delegate))throw new Error("Record.Exception: 'delegate' must be a valid Function pointer.");
		try{
			delegate();
		}catch(e){
			return e;
		}
		return null;
	};
}; 
 
Function.RegisterNamespace("xUnit.js");

xUnit.js.Stubs=new function(){
	// Public Methods
	this.GetList=function(sourceList,methods,properties){
		if(!Object.IsType(Array,sourceList))throw new Error("xUnit.js.Stubs.GetList: 'sourceList' must be a valid Array.");
		if(!properties)properties={};
		var list=[];
		for(var i=0;i<sourceList.length;i++){
			properties.Source_Value=sourceList[i];
			list.push(this.GetObject(methods,properties));
		}
		delete properties.Source_Value;
		return list;
	};
	
	this.GetMethod=function(param1,param2,paramN,returnValue){
		var methodParameters=Array.prototype.slice.call(arguments,0,arguments.length-1);
		var methodReturnValue=arguments.length?arguments[arguments.length-1]:undefined;
		var method=function(){
			// Collect Calling Arguments
			var callingArguments={};
			for(var i=0;i<arguments.length;i++){
				callingArguments[method.Parameters[i]||String.Format("Argument_{0}",i)]=arguments[i];
			}
			
			// Collect Expectation
			var expectedResult=null;
			if(Object.IsType(Function,method.ReturnValue)){
				expectedResult=method.ReturnValue.apply(this,arguments);
			}else{
				expectedResult=method.ReturnValue;
			}

			// Store Invocation
			method.Calls.push({
				Arguments:callingArguments,
				ReturnValue:expectedResult
			});

			return expectedResult;
		};
		method.Calls=[];
		method.Parameters=methodParameters;
		method.ReturnValue=methodReturnValue;
		return method;
	};

	this.GetObject=function(methods,properties){
		var object={};
		if(methods){
			for(var x in methods){
				var parameters=[];
				var returnValue=null;
				if(Object.IsType(Function,methods[x])){
					parameters=Function.GetParameters(methods[x]);
					returnValue=methods[x];
				}else{
					parameters=methods[x].parameters||[];
					returnValue=methods[x].returnValue;
				}
				object[x]=this.GetMethod.apply(this,parameters.concat(returnValue));
			}
		}
		if(properties){
			Object.Copy(object,properties);
		}
		return object;
	};
}; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.ICompositeFixture=new function(){
	this.Clear=function(){};
	this.GetFacts=function(){};
	this.GetFixtures=function(){};
	this.RegisterFact=function(fact){};
	this.RegisterFixture=function(fixture){};
}; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.IRunnable=new function(){
	this.Run=function(){};
}; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.ISkippable=new function(){
	this.Skip=function(reason){};
}; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.Result={
	Error:-1,
	Failure:0,
	Success:1,
	Skipped:2,
	Unknown:3
}; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.AssertError=function(){
	// Public Properties
	this.name="AssertError";
	this.message="";
	this.stack="";

	// ctor
	function AssertError(message){
		if(message==null)message='';
		if(Object.IsType(Function,message.toString))message=message.toString();
		var error=new Error(message);
		error.name=this.name;
		this.lineNumber=error.lineNumber;
		this.number=error.number;
		this.message=message;
		this.stack=error.stack||error.getStack&&error.getStack()||getStack(this);
	}
	AssertError.apply(this,arguments);

	// Private Methods
	function getStack(error){
		var map={};
		var stack=[String.Format("{0}: {1}",error.name,error.message)];
		var caller=getStack.caller&&getStack.caller.caller;
		while(caller){
			if(map[caller]){
				stack.push(String.Format("{0} (Recursion Entry Point)",Function.GetName(caller)));
				break;
			}
			if(caller.caller==System.Script.Attributes.DecoratedFunction){
				stack.push(Function.GetName(caller.arguments[0]));
			}else stack.push(Function.GetName(caller));
			map[caller]=true;
			caller=caller.caller;
		}
		return stack.join('\n\tat ');
	}
};

xUnit.js.Model.AssertError.prototype=new Error();
xUnit.js.Model.AssertError.prototype.constructor=xUnit.js.Model.AssertError; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.EventContext=function(component,result){
	this.Cancel=false;
	this.Component=component||null;
	this.Result=result||null;
}; 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.Fact=function(method,name){
	// Private members
	var _events;
	var _skip;
	var _reason;


	// Public members
	this.Events;
	this.Method;
	this.Name;
	this.Parent;
	this.State;

	// ctor
	function Fact(method,name,parent){
		if(!Object.IsType(Function,method))throw new Error("xUnit.js.Model.Fact.ctor: 'method' must be a valid Function pointer.");
		this.Events=_events=new System.Event.EventManager("BeforeRun","AfterRun");
		this.Method=method;
		this.Name=name||method&&Function.GetName(method)||"[Anonymous]";
		this.Parent=parent||null;
		this.State={
			Message:'',
			Result:xUnit.js.Model.Result.Unknown
		};
	}
	if(this.constructor==xUnit.js.Model.Fact)Fact.apply(this,arguments);
	
	this.GetPath=function(){
		var path=[];
		var step=this;
		while(step){
			path.unshift(step.Name);
			step=step.Parent;
		}
		return path.join('.');
	};
	
	// IRunnable members
	this.Run=function(){
		this.State.Result=xUnit.js.Model.Result.Unknown;
		var context=new xUnit.js.Model.EventContext(this,this.State.Result);
		_events.Fire("BeforeRun",context);
		try{
			if(_skip||context.Cancel){
				this.State.Message=_reason||"[No reason given]";
				this.State.Result=xUnit.js.Model.Result.Skipped;
			}else{
				if(Function.IsEmpty(this.Method)||(Object.IsType(Function,this.Method.GetDecoration)&&Function.IsEmpty(this.Method.GetDecoration().GetMethod()))){
					throw new xUnit.js.Model.AssertError("No method body found. Assuming intentional failure (TDD).");
				}
				this.Method.apply(Object.Global(),[]);
				this.State.Result=xUnit.js.Model.Result.Success;
			}
		}catch(e){
			this.State.Message=e;
			this.State.Result=Object.IsType(xUnit.js.Model.AssertError,e)?xUnit.js.Model.Result.Failure:xUnit.js.Model.Result.Error;
		}
		context.Result=this.State.Result;
		_events.Fire("AfterRun",context);
		return this.State;
	};
	
	// ISkippable members
	this.Skip=function(reason){
		_skip=true;
		_reason=reason;
	};
		
};

xUnit.js.Model.Fact.Implement(xUnit.js.Model.IRunnable,"xUnit.js.Model.Fact");
xUnit.js.Model.Fact.Implement(xUnit.js.Model.ISkippable,"xUnit.js.Model.Fact"); 
 
Function.RegisterNamespace("xUnit.js.Model");

xUnit.js.Model.Fixture=function(){
	
	// Private members
	var _events;
	var _facts;
	var _fixtures;
	
	// Public members
	this.Events;
	this.Name;
	this.Parent;

	// ctor
	function Fixture(name,parent){
		_facts=[];
		_fixtures=[];
		this.Events=_events=new System.Event.EventManager("BeforeRun","AfterRun");
		this.Name=name||"[Anonymous]";
		this.Parent=parent||null;
	}
	Fixture.apply(this,arguments);

	this.GetPath=function(){
		var path=[];
		var step=this;
		while(step){
			path.unshift(step.Name);
			step=step.Parent;
		}
		return path.join('.');
	};

	// ICompositeFixture members
	this.Clear=function(){
		_fixtures.length=0;
		_facts.length=0;
	};
	
	this.GetFacts=function(){
		return _facts.slice(0);
	};

	this.GetFixtures=function(){
		return _fixtures.slice(0);
	};
	
	this.RegisterFixture=function(fixture){
		if(!Object.IsType(xUnit.js.Model.Fixture,fixture))throw new Error("xUnit.js.Model.Fixture.RegisterFixture: 'fixture' must be an instance of 'xUnit.js.Model.Fixture'.");
		fixture.Parent=this;
		_fixtures.push(fixture);
	};

	this.RegisterFact=function(fact){
		if(!Object.IsType(xUnit.js.Model.Fact,fact))throw new Error("xUnit.js.Model.Fixture.RegisterFact: 'fact' must be an instance of 'xUnit.js.Model.Fact'.");
		fact.Parent=this;
		_facts.push(fact);
	};

	this.RemoveFixture=function(fixture){
		if(!Object.IsType(xUnit.js.Model.Fixture,fixture))throw new Error("xUnit.js.Model.Fixture.RemoveFixture: 'fixture' must be an instance of 'xUnit.js.Model.Fixture'.");
		if(fixture.Parent!=this)throw new Error("xUnit.js.Model.Fixture.RemoveFixture: 'fixture' is not registered to this fixture.");
		fixture.Parent=null;
		Array.Remove(_fixtures,fixture);
	};
	
	this.RemoveFact=function(fact){
		if(!Object.IsType(xUnit.js.Model.Fact,fact))throw new Error("xUnit.js.Model.Fixture.RemoveFact: 'fact' must be an instance of 'xUnit.js.Model.Fact'.");
		if(fact.Parent!=this)throw new Error("xUnit.js.Model.Fixture.RemoveFact: 'fact' is not registered to this fixture.");
		fact.Parent=null;
		Array.Remove(_facts,fact);
	};

	// IRunnable members
	this.Run=function(){
		var context=new xUnit.js.Model.EventContext(this,xUnit.js.Model.Result.Unknown);
		_events.Fire("BeforeRun",context);
		if(context.Cancel){
			context.State=xUnit.js.Model.Result.Skipped;
		}else{
			Array.ForEach(_fixtures,runTarget);
			Array.ForEach(_facts,runTarget);
			context.State=xUnit.js.Model.Result.Success;
			_events.Fire("AfterRun",context);
		}
		return null;
	};
	
	// ISkippable members
	this.Skip=function(reason){
		Array.ForEach(_fixtures,skipHandler,null,{Reason:reason});
		Array.ForEach(_facts,skipHandler,null,{Reason:reason});
	};
	
	// Private methods
	function nameSorter(a,b){
		if(!a)return -1;
		if(!b)return 1;
		if(a.Name<b.Name)return -1;
		if(a.Name>b.Name)return 1;
		return 0;
	}

	function runTarget(target,arrayContext){
		target.Run();
	}
	
	function skipHandler(skippable,context){
		skippable.Skip(context.Reason);
	}
};

xUnit.js.Model.Fixture.Implement(xUnit.js.Model.ICompositeFixture,"xUnit.js.Model.Fixture");
xUnit.js.Model.Fixture.Implement(xUnit.js.Model.IRunnable,"xUnit.js.Model.Fixture");
xUnit.js.Model.Fixture.Implement(xUnit.js.Model.ISkippable,"xUnit.js.Model.Fixture"); 

// System.js.Script 
 
Function.RegisterNamespace("System.Script");

System.Script.DelayedConstructor=function(scope,constructor,callback,preloadArguments){
	if(!Object.IsType(Function,constructor))throw new Error("System.Script.DelayedConstructor: 'constructor' must be a valid Function pointer.");
	if(callback!=undefined&&!Object.IsType(Function,callback))throw new Error("System.Script.DelayedConstructor: 'callback' must be a valid Function pointer.");
	var args=Array.prototype.slice.call(preloadArguments||[],0);
	if(scope&&scope.constructor===constructor){
		if(callback)callback.apply(scope,args);
		return scope;
	}else{
		if(args&&args.length){
			return Function.GetDelegate.apply(Function,[constructor,scope].concat(args));
		}
		return constructor;
	}
}; 
 
 
Function.RegisterNamespace("System.Script");

System.Script.ObjectSerializer=function(){
	var _safeRegex=/^\(?("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?\)?$/;
	
	this.Deserialize=function(source){
		var target=null;
		if(source){
			if(!_safeRegex.test(source))throw new Error(String.Format("System.Script.ObjectSerializer.Deserialize: 'source' is invalid or unsafe object notation.\nSource: {0}",source));
			try{
				target=eval(['(',')'].join(source));
				target.toString=Function.GetDelegate(overrideToString,this,source);
			}catch(e){
				throw new Error(String.Format("System.Script.ObjectSerializer.Deserialize: unable to deserialize source.\nError: {0}.\nSource: {1}",e,source));
			};
		}
		return target;
	};

	this.Serialize=function(target){
		if(target==null)return "null";
		if(target instanceof Array){
			var ret=[];
			for(var i=0;i<target.length;i++)ret.push(this.Serialize(target[i]));
			return String.Format("[{0}]",ret.join(','));
		}
		if(Object.IsType(Date,target)){
			return String.Format("\"{0}/{1}/{2}T{3}:{4}:{5}Z\"",target.getUTCFullYear(),pad(1+target.getUTCMonth()),pad(target.getUTCDate()),pad(target.getUTCHours()),pad(target.getUTCMinutes()),pad(target.getUTCSeconds()));
		}
		if(typeof(target)=="object"){
			var ret=[];
			for(var x in target)ret.push(String.Format("\"{0}\":{1}",x,this.Serialize(target[x])));
			return String.Format("{{0}}",ret.join(','));
		}
		if(typeof(target)=="string")return String.Format("\"{0}\"",target.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/\n/g,"\\n").replace(/\r/g,"\\r"));
		if(!(typeof(target)==="function"))return target.toString();
		return "\"\"";
	};
	
	function overrideToString(source){
		return source;
	}
	
	function pad(number){
		return String.Pad(number,'0',2);
	}
}; 
 
Function.RegisterNamespace("System.Script.Strategy");

System.Script.Strategy.IStrategySpecification=new function(){
	this.IsSatisfiedBy=function(candidate){};
};
 
 
Function.RegisterNamespace("System.Script.Strategy");

System.Script.Strategy.StrategyManager=function(){
	var _strategies;
	var _strategy;
	var _candidate;
	
	// ctor
	function StrategyManager(strategy1,strategy2,strategyN){
		_strategies=[];
		Array.ForEach(Array.prototype.slice.call(arguments,0),addStrategy,strategyPredicate);
	}
	StrategyManager.apply(this,arguments);
	
	this.Add=function(strategy){
		if(!isStrategy(strategy))throw new Error("System.Script.Strategy.StrategyManager.Add: 'strategy' must implement System.Script.Strategy.IStrategySpecification");
		addStrategy(strategy);
		clearCache();
	};
	
	this.Clear=function(){
		_strategies=[];
		clearCache();
	};
	
	this.Get=function(candidate,isVolatile){
		if(isVolatile||!_strategy||_candidate!=candidate){
			var context={
				Candidate:candidate,
				Strategy:null
			};
			Array.ForEach(_strategies,getStrategy,null,context);
			if(context.Strategy){
				_candidate=candidate;
				_strategy=context.Strategy;
			}
		}
		if(!_strategy)throw new Error("System.Script.Strategy.StrategyManager.Get: No viable strategy found.");
		return _strategy;
	};
	
	this.Enumerate=function(){
		return _strategies.slice(0);
	};
	
	this.Remove=function(strategy){
		if(!isStrategy(strategy))throw new Error("System.Script.Strategy.StrategyManager.Remove: 'strategy' must implement System.Script.Strategy.IStrategySpecification");
		Array.Remove(_strategies,strategy);
		clearCache();
	};
	
	// Private methods
	function addStrategy(strategy){
		_strategies.push(strategy);
	}
	
	function clearCache(){
		_strategy=null;
		_candidate=null;
	}

	function getStrategy(strategy,context){
		try{
			var instance=new strategy();
			if(instance.IsSatisfiedBy(context.Candidate)){
				context.Strategy=instance;
				context.Cancel=true;
			}
		}catch(e){
			throw new Error(String.Format("System.IO.File.getStrategy: unable to instantiate strategy '{0}'. Check your constructor logic for dependencies. Error: {1}",Function.GetName(_strategies[context.Index]),e));
		}
	}
	
	function isStrategy(strategy){
		return Object.Implements(System.Script.Strategy.IStrategySpecification,strategy);
	}

	// Predicates
	function strategyPredicate(strategy,context){
		if(!isStrategy(strategy))throw new Error(String.Format("System.Script.Strategy.StrategyManager.ctor: 'strategy' at position [{0}] does not implement IStrategySpecification.",context.Index));
		return true;
	}
}; 
 
Function.RegisterNamespace("System.Script.Attributes");

System.Script.Attributes.IAttribute=new function(){
	this.BeforeInvoke=function(context){};
	this.AfterInvoke=function(context){};
}; 
 
Function.RegisterNamespace("System.Script.Attributes");

System.Script.Attributes.Attribute=function(){
	// Public members
	this.Name;
	this.Target;

	// ctor
	function Attribute(name,target){
		this.Name=name||'';
		this.Target=target||this.Target||getTarget(this);
	}
	Attribute.apply(this,arguments);

	// Public methods
	this.BeforeInvoke=function(context){
		// no-op
	};

	this.AfterInvoke=function(context){
		// no-op
	};
	
	// Private methods
	function getTarget(attribute){
        var map={};
		var caller=getTarget;
		while(caller&&!map[caller]){
			if(caller.caller==System.Script.Attributes.DecoratedFunction){
				return caller.Decoration;
			}
			map[caller]=true;
			caller=caller.caller;
		}
		return null;
	}
};

System.Script.Attributes.Attribute.Implement(System.Script.Attributes.IAttribute,"System.Script.Attributes.Attribute"); 
 
Function.RegisterNamespace("System.Script.Attributes");

System.Script.Attributes.AttributeParser=function(){
	var _attributeRegEx=/(^|.\n?\s*)(((\[[^\]]*\])\s*)+)(\n)((var )?\s*[$_A-Za-z][$_A-Za-z0-9\.]*\s*=)?(\s*function\s*)(\s+([^(\s]+))?\s*\(/g;

	// Public methods
	this.Parse=function(source){
		if(!source)return source;
		var parsedScript=parseFunctions(source.toString());
		return parsedScript;
	};
	
	// Private methods
	function parseFunctions(source){
		return source.replace(_attributeRegEx,decorationBuilder);
	}
	
	function decorationBuilder(fullMatch,leadingSpace,attributesCluster,attributeCluster,attribute,whiteSpace,variableAssignment,variableTag,functionTag,functionSpace,functionName,stringPosition,sourceString){
		if(fullMatch.toString().indexOf('=')==0)return fullMatch;
		var format="{0}{1}{2}new System.Script.Attributes.DecoratedFunction({3},\"{4}\",{5});{6}function {3}(";
		var name=functionName||(variableAssignment?variableAssignment.replace(/\bvar |\bthis.|=/g,''):getAnonymousName());
		var safeName=name.split('.').join('_');
		return String.Format(format,	
			leadingSpace||'',
			variableAssignment||'var ',
			!functionName&&variableAssignment?'':name+'=',
			safeName,
			name,
			String.TrimEnd(attributesCluster.replace(/\]\s*(,?)\s*(\[|$)/g,'],$2'),','),
			(leadingSpace||'').replace(/^[^\s]*/g,'')
		);
	}
	
	function getAnonymousName(){
		return 'anonymous_'+(new Date().getTime()+Math.round(Math.random()*100000));
	}
}; 
 
Function.RegisterNamespace("System.Script.Attributes");

System.Script.Attributes.DecoratedFunction=function(){
	// Private members
	var _attributes;
	var _decoration;
	var _method;
	var _name;
	
	//Public members
	this.Name;
	
	// ctor`
	function DecoratedFunction(method,name,attributes1,attributes2,attributesN){
		if(!Object.IsType(Function,method))throw new Error("System.Script.Attributes.DecoratedFunction.ctor: 'method' must be a valid Function pointer.");
		_attributes=[];
		_decoration=this;
		_method=method;
		_name=name||Function.GetName(method);
		this.Name=_name;
		Array.ForEach(Array.prototype.slice.call(arguments,2),addAttributeArgument,null,{Target:_attributes});
		DecoratedFunction.Decoration=DecorationWrapper;
		processAttributes();
	}
	
	// Decorated ctor
	function DecorationWrapper(){
		var context=Array.ForEach(_attributes,beforeInvokeAttribute);
		if(context.Cancel)return null;
		try{
			return _method.apply(_decoration,arguments);
		}catch(e){
			context.Error=e;
		}finally{
			Array.ForEach(_attributes,afterInvokeAttribute,null,context);
			if(context.Error)throw context.Error;
		}
	}
	
	DecorationWrapper.GetDecoration=function(){
		return _decoration;
	};
	
	// Public Methods
	this.GetAttributes=function(match){
		if(match==undefined)return _attributes.slice(0);
		if(!Object.IsType(Function,match.toString))throw new Error("System.Script.Attributes.DecoratedFunction.GetAttributes: 'match' must be convertible to String.");
		var context=Array.ForEach(_attributes,addAttribute,attributeMatchPredicate,{Match:match,Target:[]});
		return context.Target;
	};
	
	this.GetMethod=function(){
		return _method;
	};
	
	// ctor invocation
	DecoratedFunction.apply(this,arguments);
	return DecorationWrapper;

	// Private methods
	function addAttribute(attribute,context){
		context.Target.push(attribute);
	}

	function addAttributeArgument(attributeArgument,context){
		if(Object.IsType(Array,attributeArgument))addAttributeCluster(attributeArgument,context);
		else addAttribute(attributeArgument,context);
	}

	function addAttributeCluster(attributeCluster,context){
		Array.ForEach(attributeCluster,addAttribute,null,{Target:context.Target});
	}

	function afterInvokeAttribute(attribute,context){
		invokeAttribute(attribute,context,"AfterInvoke");
	}

	function beforeInvokeAttribute(attribute,context){
		invokeAttribute(attribute,context,"BeforeInvoke");
	}
	
	function invokeAttribute(attribute,context,method){
		if(!Object.IsType(Function,attribute&&attribute[method]))return;
		if(attribute[method]==System.Script.Attributes.Attribute[method])return;
		attribute[method](context);
	}

	function processAttributes(){
		for(var i=0;i<_attributes.length;i++){
			if(!Object.IsType(Function,_attributes[i]))continue;
			try{
                if(!processAttributes.caller)_attributes[i].prototype.Target=DecorationWrapper;
				_attributes[i]=new _attributes[i]();
			}catch(e){
				throw new Error(String.Format("System.Script.Attributes.DecoratedFunction.processAttributes: unable to instantiate attribute '{0}' at position [{1}]: {2}",Function.GetName(_attributes[i]),i,e));
			}
		}
	}
	
	// Predicates	
	function attributeMatchPredicate(attribute,context){
		if(!attribute)return false;
		var match=context.Match;
		if(Object.IsType(Function,match))return attribute==match||attribute.constructor==match;
		match=match.Name||match.toString();
		return attribute.Name==match||Function.GetName(attribute.constructor)==match;
	}
};
 
 
Function.RegisterNamespace("System.Script.ScriptLoadStrategy");

System.Script.ScriptLoadStrategy.ILoadStrategy=new function(){
	this.Import=function(path,callback){};
	this.ImportJson=function(path,callback){};
	this.Load=function(source){};
}; 
 
Function.RegisterNamespace("System.Script");

System.Script.ScriptLoader=new function(){
	var _strategyManager;

	// Public Members
	this.Strategies;
	
	// ctor
	function ScriptLoader(){
		this.Strategies=_strategyManager=new System.Script.Strategy.StrategyManager();
	}
	ScriptLoader.apply(this,arguments);

	// ILoadStrategy Members
	this.Import=function(path,callback){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.Script.ScriptLoader.Import: 'path' must be convertible to String.");
		path=path.toString();
		if(arguments.length>1){
			if(!Object.IsType(Function,callback))throw new Error("System.Script.ScriptLoader.Import: 'callback' must be a valid Function pointer.");
		}
		try{
			return _strategyManager.Get(this).Import(path,callback);
		}catch(e){
			throw new Error(String.Format("System.Script.ScriptLoader.Import: There was an error importing script: '{0}'. Error: '{1}'.",path,e));
		}
	};

	this.ImportJson=function(path,callback){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.Script.ScriptLoader.ImportJson: 'path' must be convertible to String.");
		path=path.toString();
		if(arguments.length>1){
			if(!Object.IsType(Function,callback))throw new Error("System.Script.ScriptLoader.ImportJson: 'callback' must be a valid Function pointer.");
		}
		try{
			return _strategyManager.Get(this).ImportJson(path,callback);
		}catch(e){
			throw new Error(String.Format("System.Script.ScriptLoader.ImportJson: There was an error importing json: '{0}'. Error: '{1}'.",path,e));
		}
	};
	
	this.Load=function(source){
		if(source==undefined||!Object.IsType(Function,source.toString))throw new Error("System.Script.ScriptLoader.Load: 'source' must be convertible to String.");
		source=source.toString();
		try{
			return _strategyManager.Get(this).Load(source);
		}catch(e){
			throw new Error(String.Format("System.Script.ScriptLoader.Load: There was an error loading script. Error: '{0}'.",e));
		}
	};
		
};

System.Script.ScriptLoader.constructor.Implement(System.Script.ScriptLoadStrategy.ILoadStrategy,'System.Script.ScriptLoader');
 
 
Function.RegisterNamespace("System.Script");
if(!System.Script.ScriptLoader)throw new Error("Required dependency 'System.Script.ScriptLoader' was not found. Are you missing a script reference?");

Function.RegisterNamespace("System.Script.ScriptLoader.Attributes");

System.Script.ScriptLoader.Attributes.ImportAttribute=function(path,callback){
	if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.Script.ScriptLoader.Attributes.ImportAttribute: 'path' must be convertible to String.");
	path=path.toString();
	System.Script.ScriptLoader.Import.apply(System.Script.ScriptLoader,arguments);
};

System.Script.ScriptLoader.Attributes.ImportAttribute.Inherit(System.Script.Attributes.Attribute); 
 
Function.RegisterNamespace("System.Script");
if(!System.Script.ScriptLoader)throw new Error("Required dependency 'System.Script.ScriptLoader' was not found. Are you missing a script reference?");

Function.RegisterNamespace("System.Script.ScriptLoader.Attributes");

System.Script.ScriptLoader.Attributes.ImportJsonAttribute=function(path,callback){
	if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.Script.ScriptLoader.Attributes.ImportJsonAttribute: 'path' must be convertible to String.");
	path=path.toString();
	System.Script.ScriptLoader.ImportJson(path,callback);
};

System.Script.ScriptLoader.Attributes.ImportJsonAttribute.Inherit(System.Script.Attributes.Attribute); 
 
Function.RegisterNamespace("System.Script.ScriptLoadStrategy");

System.Script.ScriptLoadStrategy.Dom=function(){	
	// ILoadStrategy Members
	this.Import=function(path,callback){
		var script=document.createElement('script');
		var loadDelegate=Function.GetDelegate(Script_OnLoad,this,path,callback);
		var errorDelegate=Function.GetDelegate(Script_OnError,this,path,callback);
		Object.Set(script,{type:'text/javascript',onload:loadDelegate,onerror:errorDelegate,src:path});
		return document.body.appendChild(script);
	};
	
	this.ImportJson=function(path,callback){
		var target=document.createElement('iframe');
		var loadDelegate=Function.GetDelegate(Frame_OnLoad,this,path,callback,target);
		var errorDelegate=Function.GetDelegate(Frame_OnError,this,path,callback,target);
		Object.Set(script,{onload:loadDelegate,onerror:errorDelegate,src:path});
		document.body.appendChild(target);
	};   

	this.Load=function(source){
		var script=document.createElement('script');
		Object.Set(script,{type:'text/javascript',text:source});
		return document.body.appendChild(script);
	};
	
	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return typeof(document)!='undefined';
	};
	
	// Events
	function Frame_OnLoad(path,callback,frame){
		frame.parentNode.removeChild(frame);
		var frameContent=frame.contentWindow.documentElement;
		var script=frameContent.textContent||frameContent.innerText;
		var serializer=new System.Script.ObjectSerializer();
		var result=serializer.Deserialize(String.Format("return false||({0})",script));
		if(callback)callback(path,result);
	}

	function Frame_OnError(path,callback,frame,error){
		frame.parentNode.removeChild(frame);
		var errorMessage=String.Format("System.Script.ScriptLoadStrategy.Dom.ImportJson: There was an error loading '{0}'. Error: {1}.",path,error||"Unknown");
		if(callback)callback(path,null,errorMessage);
		else throw new Error(errorMessage);		
	}
	
	function Script_OnLoad(path,callback){
		if(callback)callback(path);
	}

	function Script_OnError(path,callback,error){
		var errorMessage=String.Format("System.Script.ScriptLoadStrategy.Dom.ImportJson: There was an error loading '{0}'. Error: {1}.",path,error||"Unknown");
		if(callback)callback(path,errorMessage);
		else throw new Error(errorMessage);		
	}
};

System.Script.ScriptLoadStrategy.Dom.Implement(System.Script.ScriptLoadStrategy.ILoadStrategy,'System.Script.ScriptLoadStrategy.Dom');
System.Script.ScriptLoadStrategy.Dom.Implement(System.Script.Strategy.IStrategySpecification,'System.Script.ScriptLoadStrategy.Dom');

System.Script.ScriptLoader.Strategies.Add(System.Script.ScriptLoadStrategy.Dom); 
 
Function.RegisterNamespace("System.Script.ScriptLoadStrategy");

System.Script.ScriptLoadStrategy.Generic=function(){
	var _hasIndirectEval=false;
	var _needsReturnStatement=true;

	var _collapseRegex=/\{[^\{\}]*\}/g;
	var _identifierRegex=/(;?\s*)(var|function)(\s+)([^\s=(){}]+)(\s*=|\()/gm;

	new function Generic(){
		if(Object.Global()===eval.call(null,"this")){
			_hasIndirectEval=true;
			try{
				eval.call(null,"return {}");
			}catch(e){
				_needsReturnStatement=false;
			}
		}
	}

	// ILoadStrategy Members
	this.Import=function(path,callback){
		var script=System.IO.File.GetFile(System.IO.Path.GetFullPath(path));
		if(script==null)throw new Error(String.Format("System.Script.ScriptLoadStrategy.Generic.Import: There was an error loading '{0}'. Error: File not found.",path));
		var result=this.Load(script);
		if(callback)callback(path);
	};

	this.ImportJson=function(path,callback){
		var script=System.IO.File.GetFile(System.IO.Path.GetFullPath(path));
		if(script==null)throw new Error(String.Format("System.Script.ScriptLoadStrategy.Generic.ImportJson: There was an error loading '{0}'. Error: File not found.",path));
		var result=this.Load(String.Format("{1}false||({0});",script,_needsReturnStatement?"return ":""));
		if(callback)callback(path,result);
	};

	this.Load=function(source){
		if(_hasIndirectEval){
			return eval.call(null,source);
		}
		return Function(promoteIdentifiers(source))();
	};

	// IStrategSpecification Members
	this.IsSatisfiedBy=function(candidate){
		return true;
	};

	// Private Methods
	function promoteIdentifiers(source){
		if(!source)return source;
		var identifiers=[];
		var collapsedSource=source;
		while(String.Contains(collapsedSource,'{')&&String.Contains(collapsedSource,'}')){
			collapsedSource=collapsedSource.replace(_collapseRegex,'');
		}
		collapsedSource.replace(_identifierRegex,addIdentifier);
		return [source].concat(identifiers).join('\n');
		function addIdentifier(fullMatch,leadingSpace,keyword,keywordSpace,identifier,trailingSpace){
			identifiers.push(String.Format("try{ {0}; Object.Global()[\"{0}\"]={0};}catch(e){ }",identifier));
			return fullMatch;
		}
	}
};

System.Script.ScriptLoadStrategy.Generic.Implement(System.Script.ScriptLoadStrategy.ILoadStrategy,'System.Script.ScriptLoadStrategy.Generic');
System.Script.ScriptLoadStrategy.Generic.Implement(System.Script.Strategy.IStrategySpecification,'System.Script.ScriptLoadStrategy.Generic');

System.Script.ScriptLoader.Strategies.Add(System.Script.ScriptLoadStrategy.Generic); 

// xUnit.js.Attributes 
 
Function.RegisterNamespace("xUnit.js.Attributes");

xUnit.js.Attributes.Engine=function(){
	// Private members
	var _currentPath;
	var _events;
	var _skipped;
	
	// ctor
	function Engine(){
		this.base();
		_currentPath=[];
		_skipped=[];
	}
	Engine.apply(this,arguments);
	
	// Public methods
	this.Enumerate=function(target,trait,negativeTrait){
		if(target!=undefined&&!Object.IsType(Function,target.toString))throw new Error("xUnit.js.Attributes.Engine.Enumerate: 'target' must be convertible to String.");
		if(trait!=undefined&&!Object.IsType(Function,trait.toString))throw new Error("xUnit.js.Attributes.Engine.Enumerate: 'trait' must be convertible to String.");
		if(negativeTrait!=undefined&&!Object.IsType(Function,negativeTrait.toString))throw new Error("xUnit.js.Attributes.Engine.Enumerate: 'negativeTrait' must be convertible to String.");
		target=(target||'').toString();
		trait=(trait||'').toString();
		negativeTrait=(negativeTrait||'').toString();
		var traits=null;
		var targets=null;
		if(trait.length>0){
			targets=getTargets(this,target);
			traits=Array.ForEach(targets,findTraits,null,{Expand:true,Trait:trait,Traits:[]}).Traits;
		}
		if(negativeTrait.length>0){
			if(traits!=null){
				traits=Array.ForEach(traits,addTrait,matchNegativeTrait,{Trait:negativeTrait,Traits:[]}).Traits;
			}else{
				if(!targets)targets=getTargets(this,target);
				traits=Array.ForEach(targets,findTraits,null,{Expand:true,IsNegativeMatch:true,Trait:negativeTrait,Traits:[]}).Traits;
			}
		}
		if(traits)return traits;
		if(target.length>0)return getTargets(this,target);
		return this.base.Enumerate();
	};
	
	this.InstantiateFixture=function(fixture){
		_currentPath.push(fixture.Name);
		instantiateFixture(fixture.Method);
		_currentPath.pop();
	}
	
	this.RegisterFixture=function(targetMethod){
		if(!Object.IsType(Function,targetMethod))throw new Error("xUnit.js.Attributes.Engine.RegisterFixture: 'targetMethod' must be a valid Function pointer.");
		var name=getName(targetMethod);
		var fixture=new xUnit.js.Attributes.Model.Fixture(name,null,targetMethod);
		this.base.RegisterFixture(fixture,_currentPath.join('.'));
		return fixture;
	};

	this.RegisterFact=function(targetMethod){
		if(!Object.IsType(Function,targetMethod))throw new Error("xUnit.js.Attributes.Engine.RegisterFact: 'targetMethod' must be a valid Function pointer.");
		var fact=new xUnit.js.Model.Fact(targetMethod,getName(targetMethod));
		this.base.RegisterFact(fact,_currentPath.join('.'));
		return fact;
	};
	
	this.Run=function(target,trait,negativeTrait){
		markSkippedComponents(this);
		if(trait!=undefined||negativeTrait!=undefined){
			Array.ForEach(this.Enumerate(target,trait,negativeTrait),runTrait);
		}else{
			if(target!=undefined&&!Object.IsType(Function,target.toString))throw new Error("xUnit.js.Attributes.Engine.Run: 'target' must be convertible to String.");
			target=(target||'').toString();
			if(target.length>0){
				var targets=target.split(',');
				for(var i=0;i<targets.length;i++){
					var currentTarget=String.Trim(targets[i]);
					if(currentTarget.length>0)this.base.Run(currentTarget);
				}
			}else{
				this.base.Run();
			}
		}
	};
	
	this.Skip=function(targetMethod,reason){
		if(!Object.IsType(Function,targetMethod))throw new Error("xUnit.js.Attributes.Engine.Skip: 'targetMethod' must be a valid Function pointer.");
		var name=getName(targetMethod);
		var path=_currentPath.slice(0);
		path.push(name);
		_skipped.push({
			Path:path.join('.'),
			Reason:reason
		});
	};
	
	// Privates
	function getName(targetMethod){
		var decoration=null;
		var target=targetMethod;
		if(Object.IsType(Function,target.GetDecoration)){
			decoration=target.GetDecoration();
			if(Object.IsType(Function,decoration&&decoration.GetMethod))target=decoration.GetMethod();
		}
		return String.Trim(decoration&&decoration.Name||Function.GetName(target));
	}
	
	function getTargets(engine,target){
		var targets=target.split(',');
		var targetComponents=[];
		for(var i=0;i<targets.length;i++){
			targetComponents=targetComponents.concat(engine.Get(targets[i]));
		}
		return targetComponents;			
	}
	
	function instantiateFixture(target){
		try{
			target();
		}catch(e){
			throw new Error(String.Format("xUnit.js.Attributes.Engine.instantiate: unable to instantiate the targeted fixture '{0}'. Error: '{1}'",Function.GetName(target),e));
		}
	}
	
	function markSkippedComponents(engine){
		Array.ForEach(_skipped,markSkipped,null,{Engine:engine});
	}
	
	//Predicates
	function addFixtures(fixture,context){
		Array.ForEach(fixture.GetFixtures(),addFixtures,null,{Traits:context.Traits});			
		Array.ForEach(fixture.GetFacts(),addTrait,null,{Traits:context.Traits});			
	}

	function addModel(model,context){
		if(Object.IsType(xUnit.js.Model.Fixture,model)){
			addFixtures(model,context);
		}else{
			addTrait(model,context);
		}
	}

	function addTrait(fact,context){
		if(Object.IsType(Array,context&&context.Traits))context.Traits.push(fact);
	}

	function findTraits(model,context){
		var traitContext={IsNegativeMatch:context.IsNegativeMatch,Trait:context.Trait,Traits:context.Traits};
		if(matchTrait(model,context)){
			if(!context.IsNegativeMatch){
				addModel(model,context);
			}
		}else{
			if(Object.IsType(xUnit.js.Model.Fixture,model)){
				Array.ForEach(model.GetFixtures(),findTraits,null,traitContext);
				Array.ForEach(model.GetFacts(),findTraits,null,traitContext);
			}else{
				if(context.IsNegativeMatch){
					addModel(model,context);
				}
			}
		}
		return context.Traits;
	}
		
	function markSkipped(skip,context){
		var components=context.Engine.Get(skip.Path);
		if(!Object.IsType(Array,components))components=[components];
		Array.ForEach(components,skipComponent,null,{Reason:skip.Reason});
	}

	function matchNegativeTrait(model,context){
		while(model){
			if(matchTrait(model,context))return false;
			model=model.Parent;
		}
		return true;
	}

	function matchTrait(model,context){
		var traitAttributes=null;
		if(Object.IsType(xUnit.js.Attributes.Model.Fixture,model)||Object.IsType(xUnit.js.Model.Fact,model)){
			traitAttributes=model.Method.GetDecoration().GetAttributes(xUnit.js.Attributes.TraitAttribute);
			var traits=context.Trait.split(',');
			for(var i=0;i<traitAttributes.length;i++){
				for(var j=0;j<traits.length;j++){
					if(String.Equals(String.Trim(traits[j]),traitAttributes[i].Trait))return true;
				}
			}
		}
		return false;
	}
	
	function runTrait(fact,context){
		fact.Run();
	}

	function skipComponent(component,context){
		if(component)component.Skip(context.Reason);
	}
};

xUnit.js.Attributes.Engine.Inherit(xUnit.js.Engine,'xUnit.js.Attributes.Engine');

xUnit.js.Attributes.Engine.Instance=new function(){
	return new xUnit.js.Attributes.Engine();
}; 
 
Function.RegisterNamespace("xUnit.js.Attributes");

xUnit.js.Attributes.FactAttribute=function(){
	// Public Members
	this.Fact=null;

	// ctor
	function FactAttribute(){
		this.base();
		if(!Object.IsType(Function,this.Target))throw new Error("xUnit.js.Attributes.FactAttribute.ctor: unable to locate attribute target.");
		this.Fact=xUnit.js.Attributes.Engine.Instance.RegisterFact(this.Target);
		addModelDecoration(this);
	}
	FactAttribute.apply(this,arguments);

	// Private Methods
	function addModelDecoration(attribute){
		var target=attribute.Target;
		if(Object.IsType(Function,target.GetDecoration))target=target.GetDecoration().GetMethod();
		target.GetModel=Function.GetDelegate(getModel,attribute);
	}

	function getModel(){
		return this.Fact;
	}
};

xUnit.js.Attributes.FactAttribute.Inherit(System.Script.Attributes.Attribute); 
 
Function.RegisterNamespace("xUnit.js.Attributes");

xUnit.js.Attributes.FixtureAttribute=function(){
	// Public Members
	this.Fixture=null;

	// ctor
	function FixtureAttribute(){
		this.base();
		if(!Object.IsType(Function,this.Target))throw new Error("xUnit.js.Attributes.FixtureAttribute.ctor: unable to locate attribute target.");
		this.Fixture=xUnit.js.Attributes.Engine.Instance.RegisterFixture(this.Target);
		addModelDecoration(this);
		xUnit.js.Attributes.Engine.Instance.InstantiateFixture(this.Fixture);
	}
	FixtureAttribute.apply(this,arguments);

	// Private Methods
	function addModelDecoration(attribute){
		var target=attribute.Target;
		if(Object.IsType(Function,target.GetDecoration))target=target.GetDecoration().GetMethod();
		target.GetModel=Function.GetDelegate(getModel,attribute);
	}

	function getModel(){
		return this.Fixture;
	}
};

xUnit.js.Attributes.FixtureAttribute.Inherit(System.Script.Attributes.Attribute);
 
 
Function.RegisterNamespace("xUnit.js.Attributes");

xUnit.js.Attributes.MockedImportAttribute=function(path,mock,callback){	
	// ctor
	function MockedImportAttribute(path,mock,callback){
		if(!Object.IsType(Function,mock))throw new Error("xUnit.js.Attributes.MockedImportAttribute.ctor: 'mock' must be a valid Function pointer.");
		var target=this;
		mock(function(){
			target.base(path,callback);
		});
	}
	return System.Script.DelayedConstructor(this,xUnit.js.Attributes.MockedImportAttribute,MockedImportAttribute,arguments);
}

xUnit.js.Attributes.MockedImportAttribute.Inherit(System.Script.ScriptLoader.Attributes.ImportAttribute);
 
 
Function.RegisterNamespace("xUnit.js.Attributes");

xUnit.js.Attributes.SkipAttribute=function(reason){
	this.Reason;
	
	// ctor
	function SkipAttribute(reason){
		this.base();
		if(!Object.IsType(Function,this.Target))throw new Error("xUnit.js.Attributes.SkipAttribute.ctor: unable to locate attribute target.");
		this.Reason=reason;
		xUnit.js.Attributes.Engine.Instance.Skip(this.Target,reason);
	}
	return System.Script.DelayedConstructor(this,xUnit.js.Attributes.SkipAttribute,SkipAttribute,arguments);
}

xUnit.js.Attributes.SkipAttribute.Inherit(System.Script.Attributes.Attribute);
 
 
Function.RegisterNamespace("xUnit.js.Attributes");

xUnit.js.Attributes.TraitAttribute=function(trait,invert){
	this.Trait;

	// ctor
	function TraitAttribute(trait){
		this.base();
		if(!Object.IsType(Function,this.Target))throw new Error("xUnit.js.Attributes.TraitAttribute.ctor: unable to locate attribute target.");
		this.Trait=trait;
	}
	return System.Script.DelayedConstructor(this,xUnit.js.Attributes.TraitAttribute,TraitAttribute,arguments);
}

xUnit.js.Attributes.TraitAttribute.Inherit(System.Script.Attributes.Attribute);
 
 
// Global Attribute Convenience Mapping
Import=System.Script.ScriptLoader.Attributes.ImportAttribute;
ImportJson=System.Script.ScriptLoader.Attributes.ImportJsonAttribute;

Assert=xUnit.js.Assert;
Mocks=xUnit.js.Mocks;
Record=xUnit.js.Record;
Stubs=xUnit.js.Stubs;

Fixture=xUnit.js.Attributes.FixtureAttribute;
Fact=xUnit.js.Attributes.FactAttribute;
MockedImport=xUnit.js.Attributes.MockedImportAttribute;
Skip=xUnit.js.Attributes.SkipAttribute;
Trait=xUnit.js.Attributes.TraitAttribute; 
 
Function.RegisterNamespace("xUnit.js.Attributes.Model");

xUnit.js.Attributes.Model.Fixture=function(name,parent,method){
	this.Method;

	// ctor
	function Fixture(name,parent,method){
		if(!Object.IsType(Function,method))throw new Error("xUnit.js.Attributes.Model.Fixture.ctor: 'method' must be a valid Function pointer.");
		this.Method=method;
		this.base(name,parent);
	}
	Fixture.apply(this,arguments);
};

xUnit.js.Attributes.Model.Fixture.Inherit(xUnit.js.Model.Fixture); 

// System.js.Environment 
 
Function.RegisterNamespace("System.EnvironmentStrategy");

System.EnvironmentStrategy.IEnvironmentStrategy=new function(){
	this.Execute=function(command,parameters,voidOutput){};
	this.Exit=function(errorCode){};
	this.GetNewLine=function(){};
	this.GetParameters=function(){};
	this.GetWorkingDirectory=function(){};
	this.Write=function(message1,message2,messageN){};
	this.WriteError=function(message1,message2,messageN){};
}; 
 
Function.RegisterNamespace("System");

System.Environment=new function(){
	var _strategyManager;

	// Public Members
	this.Strategies;
	
	// ctor
	function Environment(){
		this.Strategies=_strategyManager=new System.Script.Strategy.StrategyManager();
	}
	Environment.apply(this,arguments);
	
	this.Execute=function(command,parameters,voidOutput){
		return _strategyManager.Get(this).Execute(command,parameters,voidOutput);
	};
	
	this.Exit=function(errorCode){
		return _strategyManager.Get(this).Exit(errorCode);
	};

	this.GetNewLine=function(){
		return _strategyManager.Get(this).GetNewLine();
	};

	this.GetParameters=function(){
		return _strategyManager.Get(this).GetParameters();
	};
	
	this.GetWorkingDirectory=function(){
		return _strategyManager.Get(this).GetWorkingDirectory();
	};
	
	this.Write=function(message1,message2,messageN){
		var strategy=_strategyManager.Get(this);
		return strategy.Write.apply(strategy,Array.prototype.slice.call(arguments,0));
	};
	
	this.WriteError=function(message1,message2,messageN){
		var strategy=_strategyManager.Get(this);
		return strategy.WriteError.apply(strategy,Array.prototype.slice.call(arguments,0));
	};
};

System.Environment.constructor.Implement(System.EnvironmentStrategy.IEnvironmentStrategy,'System.Environment'); 
 
Function.RegisterNamespace("System.EnvironmentStrategy");

System.EnvironmentStrategy.Dom=function(){
	var _newLine=null;
	var _outputDiv;
	var _oldUnload;
	
	// ctor
	new function DomStrategy(){
		if(typeof(window)=="undefined")return;
		if(Object.IsType(Function,window.onunload))_oldUnload=window.onunload;
		window.onunload=dispose;
	};
	
	// IEnvironmentStrategy methods
	this.Execute=function(command,parameters,voidOutput){
		throw new Error("System.EnvironmentStrategy.Dom.Execute: Not Implemented. Sandbox violations are not allowed.");
	};

	this.Exit=function(errorCode){
		window.close();
	};

	this.GetNewLine=function(){
		if(_newLine!=undefined)return _newLine;
		var container=document.createElement("div");
		container.innerHTML="<br/>";
		return _newLine=(container.textContent||container.innerText);
	};

	this.GetParameters=function(){
		var args={
			named:{},
			unnamed:[]
		};
		var params=((document.location+'').split('?')[1]||'').split('&');
		for(var i=0;i<params.length;i++){
			if(String.Contains(params[i],'=')){
				var param=params[i].split('=');
				args.named[param[0].toLowerCase()]=param[1];
			}else args.unnamed.push(params[i]);
		}
		return args;
	};
	
	this.GetWorkingDirectory=function(){
		return System.IO.Path.GetPath(location.href);
	};

	this.Write=function(message1,message2,messageN){
		for(var i=0;i<arguments.length;i++){
			writeLine(arguments[i]);
		}
	};
	
	this.WriteError=function(message1,message2,messageN){
		for(var i=0;i<arguments.length;i++){
			writeLine(arguments[i]).className="Error";
		}
	};
	
	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		return typeof(document)!="undefined";
	};
	
	// Private methods
	function writeLine(text){
		ensureOutput();
		var line=document.createElement('div');
		line.appendChild(document.createTextNode(arguments[i]));
		return _outputDiv.appendChild(line);
	}
	
	function ensureOutput(){
		if(_outputDiv)return;
		var outputDiv=document.createElement('div');
		Object.Set(outputDiv,{className:'Output'});
		document.body.appendChild(outputDiv);
		_outputDiv=outputDiv;
	}
	
	function dispose(){
		var unload=_oldUnload;
		_outputDiv=_oldUnload=null;
		if(unload)unload();
	}
	
};

System.EnvironmentStrategy.Dom.Implement(System.EnvironmentStrategy.IEnvironmentStrategy,'System.EnvironmentStrategy.Dom');
System.EnvironmentStrategy.Dom.Implement(System.Script.Strategy.IStrategySpecification,'System.EnvironmentStrategy.Dom');

System.Environment.Strategies.Add(System.EnvironmentStrategy.Dom); 
 
Function.RegisterNamespace("System.EnvironmentStrategy");

System.EnvironmentStrategy.Rhino=function(){
	var _newline=null;

	// IEnvironmentStrategy members
	this.Execute=function(command,parameters,voidOutput){
		return runCommand.apply(Object.Global(),[command].concat(parameters))+'';
	};

	this.Exit=function(errorCode){
		quit(errorCode);
	};

	this.GetNewLine=function(){
		if(_newline!=undefined)return _newline;
		return _newline=java.lang.System.getProperty("line.separator")+'';
	};

	this.GetParameters=function(){
		var args={
			named:{},
			unnamed:[]
		};
		var params=Object.Global().arguments;
		for(var i=0;i<params.length;i++){
			var param=String.Trim(params[i]+'');
			if(String.StartsWith(param,'/')&&String.Contains(param,':')){
				param=String.TrimStart(param,'/').split(':');
				args.named[param[0].toLowerCase()]=param[1];
			}else args.unnamed.push(param);
		}
		return args;
	};
	
	this.GetWorkingDirectory=function(){
		return java.lang.System.getProperty("user.dir")+'';
	};

	this.Write=function(message1,message2,messageN){
		java.lang.System.out.print(Array.prototype.slice.call(arguments,0).join(''));
	};
	
	this.WriteError=function(message1,message2,messageN){
		java.lang.System.err.print(Array.prototype.slice.call(arguments,0).join(''));
	};

	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		return (typeof(java)!='undefined' && typeof(environment)!='undefined' && typeof(defineClass)=="function" && typeof(loadClass)=="function");
	};
};

System.EnvironmentStrategy.Rhino.Implement(System.EnvironmentStrategy.IEnvironmentStrategy,'System.EnvironmentStrategy.Rhino');
System.EnvironmentStrategy.Rhino.Implement(System.Script.Strategy.IStrategySpecification,'System.EnvironmentStrategy.Rhino');

System.Environment.Strategies.Add(System.EnvironmentStrategy.Rhino);
 
 
Function.RegisterNamespace("System.EnvironmentStrategy");

System.EnvironmentStrategy.SpiderMonkey=function(){
	// IEnvironmentStrategy members
	this.Execute=function(command,parameters,voidOutput){
		throw new Error("System.EnvironmentStrategy.SpiderMonkey.Execute: Not Implemented. This method is abstract and must be overridden.");
	};

	this.Exit=function(errorCode){
		quit(errorCode);
	};

	this.GetNewLine=function(){
		throw new Error("System.EnvironmentStrategy.SpiderMonkey.GetNewLine: Not Implemented. This method is abstract and must be overridden.");
	};

	this.GetParameters=function(){
		var args={
			named:{},
			unnamed:[]
		};
		var params=Object.Global().arguments;
		for(var i=0;i<params.length;i++){
			var param=String.Trim(params[i]);
			if(String.StartsWith(param,'/')&&String.Contains(param,':')){
				param=String.TrimStart(param,'/').split(':');
				args.named[param[0].toLowerCase()]=param[1];
			}else args.unnamed.push(param);
		}
		return args;
	};
	
	this.GetWorkingDirectory=function(){
		throw new Error("System.EnvironmentStrategy.SpiderMonkey.GetWorkingDirectory: Not Implemented. This method is abstract and must be overridden.");
	};

	this.Write=function(message1,message2,messageN){
		putstr(Array.prototype.slice.call(arguments,0).join(''));
	};
	
	this.WriteError=this.Write;
	
	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		return (typeof(system)!='undefined' && typeof(version)!='undefined' && typeof(snarf)!="undefined");
	};
};

System.EnvironmentStrategy.SpiderMonkey.Implement(System.EnvironmentStrategy.IEnvironmentStrategy,'System.EnvironmentStrategy.SpiderMonkey');
System.EnvironmentStrategy.SpiderMonkey.Implement(System.Script.Strategy.IStrategySpecification,'System.EnvironmentStrategy.SpiderMonkey'); 
 
Function.RegisterNamespace("System.EnvironmentStrategy");
if(!System.EnvironmentStrategy.SpiderMonkey)throw new Error("System.EnvironmentStrategy.SpiderMonkey.Posix: Required dependency 'System.EnvironmentStrategy.SpiderMonkey' was not found. Are you missing a script reference?");

System.EnvironmentStrategy.SpiderMonkey.Posix=function(){
	var _outputFileName="SpiderMonkey_CommandOutput.tmp";

	this.base();

	// IEnvironmentStrategy members
	this.Execute=function(command,parameters,voidOutput){
		try{
			var fullCommand=[command].concat(parameters||[]).join(' ');
			var exitCode=system(voidOutput?fullCommand:[fullCommand,">",_outputFileName].join(' '));
			if(exitCode!=0)throw new Error(String.Format("Command '{0}' exited with code {1}.",fullCommand,exitCode));
			if(!voidOutput)return read(_outputFileName);
		}catch(e){
			throw e;
		}finally{
			system("rm -f "+_outputFileName);
		}
	};

	this.GetNewLine=function(){
		return "\n";
	};

	this.GetWorkingDirectory=function(){
		return String.Trim(this.Execute("pwd"));
	};

	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		if(this.base.IsSatisfiedBy(candidate)){
			try{
				var exitCode=system("uname > NUL 2>&1");
				if(exitCode==0){
					system("rm -f NUL");
					return true;
				}
			}catch(e){}
		}
		return false;
	};
};

System.EnvironmentStrategy.SpiderMonkey.Posix.Inherit(System.EnvironmentStrategy.SpiderMonkey,'System.EnvironmentStrategy.SpiderMonkey.Posix');

System.Environment.Strategies.Add(System.EnvironmentStrategy.SpiderMonkey.Posix);
 
 
Function.RegisterNamespace("System.EnvironmentStrategy");
if(!System.EnvironmentStrategy.SpiderMonkey)throw new Error("System.EnvironmentStrategy.SpiderMonkey.Windows: Required dependency 'System.EnvironmentStrategy.SpiderMonkey' was not found. Are you missing a script reference?");

System.EnvironmentStrategy.SpiderMonkey.Windows=function(){
	var _outputFileName="SpiderMonkey_CommandOutput.tmp";

	this.base();

	// IEnvironmentStrategy members
	this.Execute=function(command,parameters,voidOutput){
		try{
			var fullCommand=[command].concat(parameters||[]).join(' ');
			var exitCode=system(voidOutput?fullCommand:[fullCommand,">",_outputFileName].join(' '));
			if(exitCode!=0)throw new Error(String.Format("Command '{0}' exited with code {1}.",fullCommand,exitCode));
			if(!voidOutput)return read(_outputFileName);
		}catch(e){
			throw e;
		}finally{
			system(String.Format("IF EXIST \"{0}\" del /F \"{0}\"",_outputFileName));
		}
	};

	this.GetNewLine=function(){
		return "\r\n";
	};

	this.GetWorkingDirectory=function(){
		return String.Trim(this.Execute("cd"));
	};

	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		if(this.base.IsSatisfiedBy(candidate)){
			try{
				var exitCode=system("ver > NUL 2>&1");
				if(exitCode==0)return true;
			}catch(e){}
		}
		return false;
	};
};

System.EnvironmentStrategy.SpiderMonkey.Windows.Inherit(System.EnvironmentStrategy.SpiderMonkey,'System.EnvironmentStrategy.SpiderMonkey.Windows');

System.Environment.Strategies.Add(System.EnvironmentStrategy.SpiderMonkey.Windows);
 
 
Function.RegisterNamespace("System.EnvironmentStrategy.V8");

System.EnvironmentStrategy.V8=function(){
	// IEnvironmentStrategy members
	this.Execute=function(command, parameters,voidOutput){
		var result=os.system(command,parameters);
		if(!voidOutput)return result;
	};

	this.Exit=function(errorCode){
		quit(errorCode);
	};

	this.GetNewLine=function(){
		throw new Error("System.EnvironmentStrategy.SpiderMonkey.GetNewLine: Not Implemented. This method is abstract and must be overridden.");
	};

	this.GetParameters=function(){
		var args={
			named:{},
			unnamed:[]
		};
		var params=Object.Global().arguments;
		for(var i=0;i<params.length;i++){
			var param=String.Trim(params[i]);
			if(String.StartsWith(param,'/')&&String.Contains(param,':')){
				param=String.TrimStart(param,'/').split(':');
				args.named[param[0].toLowerCase()]=param[1];
			}else args.unnamed.push(param);
		}
		return args;
	};
	
	this.GetWorkingDirectory=function(){
		throw new Error("System.EnvironmentStrategy.SpiderMonkey.GetWorkingDirectory: Not Implemented. This method is abstract and must be overridden.");
	};

	this.Write=function(message1,message2,messageN){
		write.apply(Object.Global(),arguments);
	};
	
	this.WriteError=this.Write;
	
	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		return (typeof(os)!='undefined' && typeof(os.system)!='undefined');
	};
		
};

System.EnvironmentStrategy.V8.Implement(System.EnvironmentStrategy.IEnvironmentStrategy,'System.EnvironmentStrategy.V8');
System.EnvironmentStrategy.V8.Implement(System.Script.Strategy.IStrategySpecification,'System.EnvironmentStrategy.V8');
 
 
Function.RegisterNamespace("System.EnvironmentStrategy");
if(!System.EnvironmentStrategy.V8)throw new Error("System.EnvironmentStrategy.V8.Posix: Required dependency 'System.EnvironmentStrategy.V8' was not found. Are you missing a script reference?");

System.EnvironmentStrategy.V8.Posix=function(){
	this.base();

	// IEnvironmentStrategy members
	this.GetNewLine=function(){
		return "\n";
	};
	
	this.GetWorkingDirectory=function(){
		return String.Trim(os.system("pwd"));
	};

	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		if(this.base.IsSatisfiedBy(candidate)){
			try{
				os.system("uname");
				return true;
			}catch(e){}
		}
		return false;
	};
};

System.EnvironmentStrategy.V8.Posix.Inherit(System.EnvironmentStrategy.V8,'System.EnvironmentStrategy.V8.Posix');

System.Environment.Strategies.Add(System.EnvironmentStrategy.V8.Posix); 
 
Function.RegisterNamespace("System.EnvironmentStrategy");
if(!System.EnvironmentStrategy.V8)throw new Error("System.EnvironmentStrategy.V8.Windows: Required dependency 'System.EnvironmentStrategy.V8' was not found. Are you missing a script reference?");

System.EnvironmentStrategy.V8.Windows=function(){
	this.base();

	// IEnvironmentStrategy members
	this.GetNewLine=function(){
		return "\r\n";
	};

	this.GetWorkingDirectory=function(){
		return String.Trim(os.system("cd"));
	};

	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		if(this.base.IsSatisfiedBy(candidate)){
			try{
				os.system("ver");
				return true;
			}catch(e){}
		}
		return false;
	};
};

System.EnvironmentStrategy.V8.Windows.Inherit(System.EnvironmentStrategy.V8,'System.EnvironmentStrategy.V8.Windows');

System.Environment.Strategies.Add(System.EnvironmentStrategy.V8.Windows); 
 
Function.RegisterNamespace("System.EnvironmentStrategy");

System.EnvironmentStrategy.Wscript=function(){
	
	// Private members
	var _useStdIo=true;

	// IEnvironmentStrategy members
	this.Execute=function(command,parameters,voidOutput){
		 var shell=WScript.CreateObject("WScript.Shell");
		 var result=shell.Run([command].concat(parameters).join(' '),0,true);
		 if(!voidOutput)return result;
	};

	this.Exit=function(errorCode){
		WScript.Quit(errorCode);
	};


	this.GetNewLine=function(){
		return "\r\n";
	};
	
	this.GetParameters=function(){
		var args={
			named:{},
			unnamed:[]
		};
		var params=WScript.Arguments;
		for(var i=0;i<params.length;i++){
			var param=String.Trim(params(i));
			if(String.StartsWith(param,'/')&&String.Contains(param,':')){
				param=String.TrimStart(param,'/').split(':');
				args.named[param[0].toLowerCase()]=param[1];
			}else args.unnamed.push(param);
		}
		return args;
	};
	
	this.GetWorkingDirectory=function(){
		return WScript.CreateObject("WScript.Shell").CurrentDirectory;
	};

	this.Write=function(message1,message2,messageN){
		Array.ForEach(Array.prototype.slice.call(arguments,0),writeHandlerPredicate(WScript.StdOut));
	};
	
	this.WriteError=function(message1,message2,messageN){
		Array.ForEach(Array.prototype.slice.call(arguments,0),writeHandlerPredicate(WScript.StdErr));
	};
	
	// IStrategySpecification members
	this.IsSatisfiedBy=function(candidate){
		return typeof(WScript)!="undefined";
	};
	
	//Private methods
	function writeHandlerPredicate(pipe){
		return function(message,context){
			if(_useStdIo){
				try{
					pipe.Write(message);
					return;
				}catch(e){
					_useStdIo=false;
				}
			}
			WScript.Echo(message);
		}
	}
	
};

System.EnvironmentStrategy.Wscript.Implement(System.EnvironmentStrategy.IEnvironmentStrategy,'System.EnvironmentStrategy.Wscript');
System.EnvironmentStrategy.Wscript.Implement(System.Script.Strategy.IStrategySpecification,'System.EnvironmentStrategy.Wscript');

System.Environment.Strategies.Add(System.EnvironmentStrategy.Wscript); 

// System.js.IO 
 
Function.RegisterNamespace("System.IO");

System.IO.Path=new function(){
	var _root;

	this.DirectorySeparator="/";
	
	this.Combine=function(path1,path2){
		if(path1==undefined||!Object.IsType(Function,path1.toString))throw new Error("System.IO.Path.Combine: 'path1' must be convertible to String.");
		if(path2==undefined||!Object.IsType(Function,path2.toString))throw new Error("System.IO.Path.Combine: 'path2' must be convertible to String.");
		path1=path1.toString();
		path2=path2.toString();
		if(path1.charAt(path1.length-1)==this.DirectorySeparator)path1=path1.substr(0,path1.length-1);
		if(path2.charAt(0)==this.DirectorySeparator)path2=path2.substr(1,path2.length);
		return [path1,path2].join(this.DirectorySeparator);
	};
	
	this.GetFileName=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Path.GetFileName: 'path' must be convertible to String.");
		path=path.toString();
		return path.substring(path.lastIndexOf(this.DirectorySeparator)+1,path.length);
	};
	
	this.GetFullPath=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Path.GetFullPath: 'path' must be convertible to String.");
		path=path.toString();
		if(this.GetRoot().indexOf(this.DirectorySeparator)==0){
			if(path.indexOf(this.DirectorySeparator)!=0)return this.Combine(this.GetRoot(),path);
		}else{
			if(path.indexOf(':')<0)return this.Combine(this.GetRoot(),path);
		}
		return path;
	};
	
	this.GetPath=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Path.GetPath: 'path' must be convertible to String.");
		path=path.toString();
		if(path.lastIndexOf(this.DirectorySeparator)>-1)return path.substr(0,path.lastIndexOf(this.DirectorySeparator));
		return path;
	};
		
	this.GetRoot=function(){
		return _root||'';
	};

	this.SetRoot=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Path.SetRoot: 'path' must be convertible to String.");
		path=path.toString()+'';
		var separator=this.DirectorySeparator;
		path=path.replace(/\/|\\/gm,separator);
		if(path.indexOf(separator)>-1){
			var parts=path.split(separator);
			var last=parts[parts.length-1];
			if(!last||(last.indexOf('.')>-1&&!System.IO.Directory.Exists(path)))parts.length--;
			_root=parts.join(separator)+separator;
		}else _root=path+separator;
	};
}; 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy");

System.IO.DirectoryStrategy.IDirectoryStrategy=new function(){
	this.Exists=function(path){};
	this.GetFiles=function(path){};
	this.GetDirectories=function(path){};
}; 
 
Function.RegisterNamespace("System.IO");

System.IO.Directory=new function(){
	var _strategyManager;

	// Public Members
	this.Strategies;
	
	// ctor
	function Directory(){
		this.Strategies=_strategyManager=new System.Script.Strategy.StrategyManager();
	}
	Directory.apply(this,arguments);
	
	// IDirectoryStrategy Members
	this.Exists=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Directory.Exists: 'path' must be convertible to String.");
		path=path.toString();
		try{
			return _strategyManager.Get(this).Exists(path);
		}catch(e){
			throw new Error(String.Format("System.IO.Directory.Exists: {0}",e));
		}
	};
	
	this.GetFiles=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Directory.GetFiles: 'path' must be convertible to String.");
		path=path.toString();
		if(this.Exists(path)){
			try{
				return sort(_strategyManager.Get(this).GetFiles(path));
			}catch(e){
				throw new Error(String.Format("System.IO.Directory.GetFiles: {0}",e));
			}
		}
		return [];
	};
	
	this.GetDirectories=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.Directory.GetDirectories: 'path' must be convertible to String.");
		path=path.toString();
		if(this.Exists(path)){
			try{
				return sort(_strategyManager.Get(this).GetDirectories(path));
			}catch(e){
				throw new Error(String.Format("System.IO.Directory.GetDirectories: {0}",e));
			}
		}
		return [];
	};

	// Private Methods
	function pathSorter(a,b){
		if(!a)return -1;
		if(!b)return 1;
		a=a.toLowerCase();
		b=b.toLowerCase();
		if(!a||a<b)return -1;
		if(!b||a>b)return 1;
		return 0;
	}

	function sort(paths){
		if(!Object.IsType(Array,paths))return paths;
		return paths.sort(pathSorter);
	}
};

System.IO.Directory.constructor.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.Directory');
 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy");

System.IO.DirectoryStrategy.FileSystemObject=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		if(!path)return false;
		var fso=new ActiveXObject("Scripting.FileSystemObject");	
		return fso.FolderExists(path);
	};

	this.GetFiles=function(path){
		var fso=new ActiveXObject("Scripting.FileSystemObject");
		var directory=fso.GetFolder(path);
		if(directory){
			var files=[];
			var fileList=new Enumerator(directory.Files);
			for(; !fileList.atEnd(); fileList.moveNext())files.push(fileList.item().Path);
			return files;
		}
		return null;
	};
	
	this.GetDirectories=function(path){
		var fso=new ActiveXObject("Scripting.FileSystemObject");
		var directory=fso.GetFolder(path);
		if(directory){
			var directories=[];
			var directoryList=new Enumerator(directory.SubFolders);
			for(; !directoryList.atEnd(); directoryList.moveNext())directories.push(directoryList.item().Path);
			return directories;
		}
		return null;
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return typeof(ActiveXObject)!='undefined';
	};
};

System.IO.DirectoryStrategy.FileSystemObject.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.FileSystemObject');
System.IO.DirectoryStrategy.FileSystemObject.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.FileSystemObject');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.FileSystemObject); 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy");

System.IO.DirectoryStrategy.Rhino=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		if(!!path){
			var file=new java.io.File(normalizePath(path));
			return file.exists()&&file.isDirectory();
		}
		return false;
	};

	this.GetFiles=function(path){
		var files=[];
		if(this.Exists(path)){
			var directory=new java.io.File(normalizePath(path));
			var fileList=directory.listFiles();
			for(var i=0;i<fileList.length;i++){
				if(fileList[i].isFile()){
					files.push(fileList[i].getAbsolutePath()+'');
				}
			}
		}
		return files;
	};
	
	this.GetDirectories=function(path){
		var directories=[];
		if(this.Exists(path)){
			var directory=new java.io.File(normalizePath(path));
			var directoryList=directory.listFiles();
			for(var i=0;i<directoryList.length;i++){
				if(directoryList[i].isDirectory()){
					directories.push(directoryList[i].getAbsolutePath()+'');
				}
			}
		}
		return directories;
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return (typeof(java)!='undefined' && typeof(environment)!='undefined' && typeof(defineClass)=="function" && typeof(loadClass)=="function");
	};

	// Private Methods
	function normalizePath(path){
		if(!Object.IsType(String,path))return path;
		return path.replace(/\\/g,'/');
	}

};

System.IO.DirectoryStrategy.Rhino.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.Rhino');
System.IO.DirectoryStrategy.Rhino.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.Rhino');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.Rhino); 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy.SpiderMonkey");

System.IO.DirectoryStrategy.SpiderMonkey.Posix=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		return !!path&&System.Environment.Execute("sh",["-c",String.Format("'test -d {0} && echo 1 || echo 0'",path)])==1;
	};

	this.GetFiles=function(path){
		return String.Trim(System.Environment.Execute("find", [path,"-maxdepth","1","-type","f","-print"])).split("\n");
	};
	
	this.GetDirectories=function(path){
		var directories=String.Trim(System.Environment.Execute("find", [path,"-maxdepth","1","-type","d","-print"])).split("\n");
		for(var i=0;i<directories.length;i++){
			if(directories[i]==path)directories.splice(i--,1);
		}
		return directories;
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(system)!='undefined' && typeof(version)!='undefined' && typeof(snarf)!="undefined"){
			try{
				var exitCode=system("uname > NUL 2>&1");
				if(exitCode==0){
					system("rm -f NUL");
					return true;
				}
			}catch(e){}
		}
		return false;
	};
};

System.IO.DirectoryStrategy.SpiderMonkey.Posix.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.SpiderMonkey.Posix');
System.IO.DirectoryStrategy.SpiderMonkey.Posix.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.SpiderMonkey.Posix');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.SpiderMonkey.Posix); 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy.SpiderMonkey");

System.IO.DirectoryStrategy.SpiderMonkey.Windows=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		if(!path||System.Environment.Execute("cmd", ["/C",String.Format("IF NOT EXIST \"{0}\" (ECHO 1)",path)])==1)return false;
		return System.Environment.Execute("cmd", ["/C",String.Format("\"2>NUL PUSHD \"\"{0}\"\" && (POPD&ECHO 1) || (ECHO 0)\"",path)])==1;
	};

	this.GetFiles=function(path){
		return get(path, false);
	};
	
	this.GetDirectories=function(path){
		return get(path, true);
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(system)!='undefined' && typeof(version)!='undefined' && typeof(snarf)!="undefined"){
			try{
				var exitCode=system("ver > NUL 2>&1");
				if(exitCode==0)return true;
			}catch(e){}
		}
		return false;
	};

	// Private Methods
	function get(path,directories){
		path=System.IO.Path.GetFullPath(path);
		var items=String.Trim(System.Environment.Execute("cmd", ["/C",String.Format("for {1}%a in (\"{0}\") do @echo %a",System.IO.Path.Combine(path,"*"),directories?"/d ":'')])).split("\n");
		for(var i=0;i<items.length;i++)items[i]=String.Trim(items[i]);
		return items;
	}
};

System.IO.DirectoryStrategy.SpiderMonkey.Windows.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.SpiderMonkey.Windows');
System.IO.DirectoryStrategy.SpiderMonkey.Windows.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.SpiderMonkey.Windows');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.SpiderMonkey.Windows); 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy.V8");

System.IO.DirectoryStrategy.V8.Posix=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		return !!path&&System.Environment.Execute("sh", ["-c",String.Format("test -d {0} && echo 1 || echo 0",path)])==1;
	};

	this.GetFiles=function(path){
		return String.Trim(System.Environment.Execute("find", [path,"-maxdepth","1","-type","f","-print"])).split("\n");
	};
	
	this.GetDirectories=function(path){
		var directories=String.Trim(System.Environment.Execute("find", [path,"-maxdepth","1","-type","d","-print"])).split("\n");
		for(var i=0;i<directories.length;i++){
			if(directories[i]==path)directories.splice(i--,1);
		}
		return directories;
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(os)!='undefined' && typeof(os.system)!='undefined'){
			try{
				os.system("uname");
				return true;
			}catch(e){}
		}
		return false;
	};
};

System.IO.DirectoryStrategy.V8.Posix.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.V8.Posix');
System.IO.DirectoryStrategy.V8.Posix.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.V8.Posix');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.V8.Posix); 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy.V8");

System.IO.DirectoryStrategy.V8.Windows=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		if(!path||System.Environment.Execute("cmd", ["/C",String.Format("IF NOT EXIST \"{0}\" (ECHO 1)",path)])==1)return false;
		return System.Environment.Execute("cmd", ["/C",String.Format("2>NUL PUSHD \"{0}\" && (POPD&ECHO 1) || (ECHO 0)",path)])==1;
	};

	this.GetFiles=function(path){
		return get(path, false);
	};
	
	this.GetDirectories=function(path){
		return get(path, true);
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(os)!='undefined' && typeof(os.system)!='undefined'){
			try{
				os.system("ver");
				return true;
			}catch(e){}
		}
		return false;
	};

	// Private Methods
	function get(path,directories){
		path=System.IO.Path.GetFullPath(path);
		var items=String.Trim(System.Environment.Execute("cmd", ["/C",String.Format("for {1}%a in (\"{0}\") do @echo %a",System.IO.Path.Combine(path,"*"),directories?"/d ":'')])).split("\n");
		for(var i=0;i<items.length;i++)items[i]=String.Trim(items[i]);
		return items;
	}
};

System.IO.DirectoryStrategy.V8.Windows.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.V8.Windows');
System.IO.DirectoryStrategy.V8.Windows.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.V8.Windows');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.V8.Windows); 
 
Function.RegisterNamespace("System.IO.DirectoryStrategy");

System.IO.DirectoryStrategy.Xhr=function(){
	// IDirectoryStrategy Members
	this.Exists=function(path){
		path=System.IO.Path.GetFullPath(path);
		var transport=getTransport();
		transport.open('HEAD',String.Format("{0}?type=directory&path={1}",getTarget(),encodeURIComponent(path)),false);
		transport.send();
		if(!transport.status||transport.status==200)return true;
		return false;
	};

	this.GetFiles=function(path){
		return getList("files",path);
	};
	
	this.GetDirectories=function(path){
		return getList("directories",path);
	};

	// IStrategySpecification Members
	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return getTransport()!=null;
	};

	// Private Methods
	function getList(type,path){
		path=System.IO.Path.GetFullPath(path);
		var transport=getTransport();
		if(transport.overrideMimeType)transport.overrideMimeType("text/plain");
		transport.open('GET',String.Format("{0}?type={1}&path={2}",getTarget(),encodeURIComponent(type),encodeURIComponent(path)),false);
		transport.send();
		if(!transport.status||transport.status==200)return transport.responseText.split('\n');
		return null;
	}

	function getTarget(){
		if(!System.IO.DirectoryStrategy.Xhr.ResourceUri)throw new Error("'System.IO.DirectoryStrategy.Xhr.ResourceUri' must be set before invoking IDirectoryStrategy methods.");
		return System.IO.DirectoryStrategy.Xhr.ResourceUri;
	}

	function getTransport(){
		if(typeof(XMLHttpRequest)!='undefined')return new XMLHttpRequest();
		if(typeof(ActiveXObject)!='undefined')return new ActiveXObject('Microsoft.XMLHTTP');
		return null;
	}
};

System.IO.DirectoryStrategy.Xhr.Implement(System.IO.DirectoryStrategy.IDirectoryStrategy,'System.IO.DirectoryStrategy.Xhr');
System.IO.DirectoryStrategy.Xhr.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.DirectoryStrategy.Xhr');

System.IO.Directory.Strategies.Add(System.IO.DirectoryStrategy.Xhr); 
 
Function.RegisterNamespace("System.IO.FileStrategy");

System.IO.FileStrategy.IFileStrategy=new function(){
	this.DeleteFile=function(path){};
	this.Exists=function(path){};
	this.GetFile=function(path){};
	this.SaveFile=function(path,text){};
}; 
 
Function.RegisterNamespace("System.IO");

System.IO.File=new function(){
	var _strategyManager;

	// Public Members
	this.Strategies;
	
	// ctor
	function File(){
		this.Strategies=_strategyManager=new System.Script.Strategy.StrategyManager();
	}
	File.apply(this,arguments);
	
	// Public Methods
	this.DeleteFile=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.File.DeleteFile: 'path' must be convertible to String.");
		path=path.toString();
		if(this.Exists(path)){
			try{
				return _strategyManager.Get(this).DeleteFile(path);
			}catch(e){
				throw new Error(String.Format("System.IO.File.DeleteFile: {0}",e));
			}
		}
	};

	this.Exists=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.File.Exists: 'path' must be convertible to String.");
		path=path.toString();
		try{
			return _strategyManager.Get(this).Exists(path);
		}catch(e){
			throw new Error(String.Format("System.IO.File.Exists: {0}",e));
		}
	};
	
	this.GetFile=function(path){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.File.GetFile: 'path' must be convertible to String.");
		path=path.toString();
		try{
			return _strategyManager.Get(this).GetFile(path);
		}catch(e){
			throw new Error(String.Format("System.IO.File.GetFile: {0}",e));
		}
	};

	this.SaveFile=function(path,text){
		if(path==undefined||!Object.IsType(Function,path.toString))throw new Error("System.IO.File.SaveFile: 'path' must be convertible to String.");
		path=path.toString();
		try{
			_strategyManager.Get(this).SaveFile(path,text);
			return true;
		}catch(e){
			return false;
		}
	};
};

System.IO.File.constructor.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.File'); 
 
Function.RegisterNamespace("System.IO.FileStrategy");

System.IO.FileStrategy.FileSystemObject=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		var fso=new ActiveXObject("Scripting.FileSystemObject");
		return fso.DeleteFile(path,true);
	};

	this.Exists=function(path){
		var fso=new ActiveXObject("Scripting.FileSystemObject");
		return fso.FileExists(path);
	};

	this.GetFile=function(path){
		var text=null;
		var fso=new ActiveXObject("Scripting.FileSystemObject");
		var file=fso.FileExists(path)&&fso.GetFile(path);
		if(file){
			var stream=file.OpenAsTextStream(1);
			var BOM='';
			try{
				if(!stream.AtEndOfStream)BOM=stream.Read(3);
			}catch(e){
				if(!stream.AtEndOfStream)BOM=stream.ReadAll();
			}
			switch(BOM.charCodeAt(0)){
				case 0xFF:
					if(BOM.charCodeAt(1)==0xFE){ 
						//UTF-16 little-endian
						stream.Close();
						stream=file.OpenAsTextStream(1,-1);
					}
					break;
				case 0xFE:
					if(BOM.charCodeAt(1)==0xFF){ 
						//UTF-16 big-endian
						stream.Close();
						stream=file.OpenAsTextStream(1,-1);
					}
					break;
				case 0xEF:
					if(BOM.charCodeAt(1)==0xBB&&BOM.charCodeAt(2)==0xBF){ 
						//UTF-8 BOM
						stream.Close();
						stream=new ActiveXObject("ADODB.Stream");
						stream.CharSet="UTF-8";
						stream.Open();
						stream.LoadFromFile(path);
						text=stream.ReadText();
						break;
					}
				default: 
					// Unkown BOM or BOM not present
					text=BOM;
					break;
			}
			if(typeof(stream.ReadAll)!="undefined"&&!stream.AtEndOfStream){
				text=(text||'')+stream.ReadAll();
			}
			stream.Close();
		}
		return text;
	};
		
	this.SaveFile=function(path,text){
		var fso=new ActiveXObject("Scripting.FileSystemObject");
		var file=fso.CreateTextFile(path, true);
		file.Write(text);
		file.Close();
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return typeof(ActiveXObject)!='undefined';
	};
	
};

System.IO.FileStrategy.FileSystemObject.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.FileSystemObject');
System.IO.FileStrategy.FileSystemObject.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.FileSystemObject');

System.IO.File.Strategies.Add(System.IO.FileStrategy.FileSystemObject); 
 
Function.RegisterNamespace("System.IO.FileStrategy");

System.IO.FileStrategy.Rhino=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		if(this.Exists(path)){
			var file=new java.io.File(normalizePath(path));
			file["delete"]();
		}
		return false;
	};
	
	this.Exists=function(path){
		if(!!path){
			var file=new java.io.File(normalizePath(path));
			return file.exists()&&file.isFile();
		}
		return false;
	};

	this.GetFile=function(path){
		if(this.Exists(path)){
			return readFile(normalizePath(path),"UTF-8")+'';
		}
		return null;
	};
		
	this.SaveFile=function(path,text){
		var fileWriter=null;
		try {
			var file=new java.io.File(normalizePath(path));
			fileWriter=new java.io.FileWriter(file);
			fileWriter.write(text);
		}catch(e) {
			throw e;
		}finally{
			if(fileWriter!=null)fileWriter.close();
		}
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return (typeof(java)!='undefined' && typeof(environment)!='undefined' && typeof(defineClass)=="function" && typeof(loadClass)=="function");
	};

	// Private Methods
	function normalizePath(path){
		if(!Object.IsType(String,path))return path;
		return path.replace(/\\/g,'/');
	}

};

System.IO.FileStrategy.Rhino.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.Rhino');
System.IO.FileStrategy.Rhino.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.Rhino');

System.IO.File.Strategies.Add(System.IO.FileStrategy.Rhino); 
 
Function.RegisterNamespace("System.IO.FileStrategy.SpiderMonkey");

System.IO.FileStrategy.SpiderMonkey.Posix=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		if(this.Exists(path)){
			return system("rm -f "+path);
		}
		return false;
	};
	
	this.Exists=function(path){
		return System.Environment.Execute("sh", ["-c",String.Format("'test -f {0} && echo 1 || echo 0'",path)])==1;
	};

	this.GetFile=function(path){
		if(this.Exists(path)){
			return read(path);
		}
		return null;
	};
		
	this.SaveFile=function(path,text){
		return System.Environment.Execute("sh", ["-c",String.Format("cat > {0} << EOF\n{1}EOF",path,text)],true);
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(system)!='undefined' && typeof(version)!='undefined' && typeof(snarf)!="undefined"){
			try{
				var exitCode=system("uname > NUL 2>&1");
				if(exitCode==0){
					system("rm -f NUL");
					return true;
				}
			}catch(e){}
		}
		return false;
	};

};

System.IO.FileStrategy.SpiderMonkey.Posix.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.SpiderMonkey.Posix');
System.IO.FileStrategy.SpiderMonkey.Posix.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.SpiderMonkey.Posix');

System.IO.File.Strategies.Add(System.IO.FileStrategy.SpiderMonkey.Posix); 
 
Function.RegisterNamespace("System.IO.FileStrategy.SpiderMonkey");

System.IO.FileStrategy.SpiderMonkey.Windows=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		if(this.Exists(path)){
			return system("del /F "+String.Format("\"{0}\"",normalizePath(path)));
		}
		return false;
	};
	
	this.Exists=function(path){
		if(System.Environment.Execute("cmd", ["/C",String.Format("IF NOT EXIST \"{0}\" (ECHO 1)",path)])==1)return false;
		return System.Environment.Execute("cmd", ["/C",String.Format("\"2>NUL PUSHD \"\"{0}\"\" && (POPD&ECHO 0) || (echo 1)\"",path)])==1;
	};

	this.GetFile=function(path){
		if(this.Exists(path)){
			return read(normalizePath(path));
		}
		return null;
	};
		
	this.SaveFile=function(path,text){
		this.DeleteFile(path);
		if(text==undefined||String.IsEmpty(text))return System.Environment.Execute("cmd", ["/C",String.Format("ECHO. 2>\"{0}\">NUL",path)],true);
		var lines=text.split(System.Environment.GetNewLine());
		for(var i=0;i<lines.length;i++){
			try{
				if(i)System.Environment.Execute("cmd", ["/C",String.Format("ECHO.>>\"{0}\"",path)],true);
				System.Environment.Execute("cmd", ["/C",String.Format("ECHO|SET /P=\"{0}\">>\"{1}\"",lines[i],path)],true);
			}catch(e){}
		}
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(system)!='undefined' && typeof(version)!='undefined' && typeof(snarf)!="undefined"){
			try{
				var exitCode=system("ver > NUL 2>&1");
				if(exitCode==0)return true;
			}catch(e){}
		}
		return false;
	};

	// Private Methods
	function normalizePath(path){
		if(!path)return '';
		return path.replace(/\//g,"\\");
	}

};

System.IO.FileStrategy.SpiderMonkey.Windows.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.SpiderMonkey.Windows');
System.IO.FileStrategy.SpiderMonkey.Windows.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.SpiderMonkey.Windows');

System.IO.File.Strategies.Add(System.IO.FileStrategy.SpiderMonkey.Windows); 
 
Function.RegisterNamespace("System.IO.FileStrategy.V8");

System.IO.FileStrategy.V8.Posix=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		if(this.Exists(path)){
			return System.Environment.Execute("rm",["-f",path]);
		}
		return false;
	};
	
	this.Exists=function(path){
		return System.Environment.Execute("sh", ["-c",String.Format("test -f {0} && echo 1 || echo 0",path)])==1;
	};

	this.GetFile=function(path){
		if(this.Exists(path)){
			return read(path);
		}
		return null;
	};
		
	this.SaveFile=function(path,text){
		return System.Environment.Execute("sh", ["-c",String.Format("cat > {0} << EOF\n{1}EOF",path,text)]);
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(os)!='undefined' && typeof(os.system)!='undefined'){
			try{
				os.system("uname");
				return true;
			}catch(e){}
		}
		return false;
	};

};

System.IO.FileStrategy.V8.Posix.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.V8.Posix');
System.IO.FileStrategy.V8.Posix.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.V8.Posix');

System.IO.File.Strategies.Add(System.IO.FileStrategy.V8.Posix); 
 
Function.RegisterNamespace("System.IO.FileStrategy.V8");

System.IO.FileStrategy.V8.Windows=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		if(this.Exists(path)){
			return System.Environment.Execute("del",["/F",String.Format("\"{0}\"",normalizePath(path))]);
		}
		return false;
	};
	
	this.Exists=function(path){
		if(System.Environment.Execute("cmd", ["/C",String.Format("IF NOT EXIST \"{0}\" (ECHO 1)",path)])==1)return false;
		return System.Environment.Execute("cmd", ["/C",String.Format("2>NUL PUSHD \"{0}\" && (POPD&ECHO 0) || (echo 1)",path)])==1;
	};

	this.GetFile=function(path){
		if(this.Exists(path)){
			return read(normalizePath(path));
		}
		return null;
	};
		
	this.SaveFile=function(path,text){
		this.DeleteFile(path);
		if(text==undefined||String.IsEmpty(text))return System.Environment.Execute("cmd", ["/C",String.Format("ECHO. 2>\"{0}\"",path)]);
		var lines=text.split(System.Environment.GetNewLine());
		for(var i=0;i<lines.length;i++){
			try{
				if(i)System.Environment.Execute("cmd", ["/C",String.Format("ECHO.>>\"{0}\"",path,System.Environment.GetNewLine())]);
				System.Environment.Execute("cmd", ["/C",String.Format("ECHO|SET /P=\"{0}\">>\"{1}\"",lines[i],path)]);
			}catch(e){}
		}
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		if(typeof(os)!='undefined' && typeof(os.system)!='undefined'){
			try{
				os.system("ver");
				return true;
			}catch(e){}
		}
		return false;
	};

	// Private Methods
	function normalizePath(path){
		if(!path)return '';
		return path.replace(/\//g,"\\");
	}

};

System.IO.FileStrategy.V8.Windows.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.V8.Windows');
System.IO.FileStrategy.V8.Windows.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.V8.Windows');

System.IO.File.Strategies.Add(System.IO.FileStrategy.V8.Windows); 
 
Function.RegisterNamespace("System.IO.FileStrategy");

System.IO.FileStrategy.Xhr=function(){
	// IFileStrategy Members
	this.DeleteFile=function(path){
		var transport=getTransport();
		if(transport.overrideMimeType)transport.overrideMimeType("text/plain");
		transport.open('DELETE',getTarget(),false);
		transport.send(String.Format("path={0}",encodeURIComponent(System.IO.Path.GetFullPath(path))));
		if(!transport.status||transport.status==200)return transport.responseText;
		return null;
	};

	this.Exists=function(path){
		var transport=getTransport();
		transport.open('HEAD',String.Format("{0}?type=file&path={1}",getTarget(),encodeURIComponent(System.IO.Path.GetFullPath(path))),false);
		transport.send();
		if(!transport.status||transport.status==200)return true;
		return false;
	};

	this.GetFile=function(path){
		var transport=getTransport();
		if(transport.overrideMimeType)transport.overrideMimeType("text/plain");
		transport.open('GET',String.Format("{0}?type=file&path={1}",getTarget(),encodeURIComponent(System.IO.Path.GetFullPath(path))),false);
		transport.send();
		if(!transport.status||transport.status==200)return transport.responseText;
		return null;
	};

	this.SaveFile=function(path,text){
		var transport=getTransport();
		if(transport.overrideMimeType)transport.overrideMimeType("text/plain");
		transport.open('POST',getTarget(),false);
		transport.send(String.Format("type=file&path={0}&content={1}",encodeURIComponent(System.IO.Path.GetFullPath(path)),encodeURIComponent(text)||''));
		if(!transport.status||transport.status==200)return transport.responseText;
		return null;
	};

	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return getTransport()!=null;
	};

	// Private Methods
	function getTarget(){
		if(!System.IO.FileStrategy.Xhr.ResourceUri)throw new Error("'System.IO.FileStrategy.Xhr.ResourceUri' must be set before invoking IFileStrategy methods.");
		return System.IO.FileStrategy.Xhr.ResourceUri;
	}

	function getTransport(){
		if(typeof(XMLHttpRequest)!='undefined')return new XMLHttpRequest();
		if(typeof(ActiveXObject)!='undefined')return new ActiveXObject('Microsoft.XMLHTTP');
		return null;
	}
};

System.IO.FileStrategy.Xhr.Implement(System.IO.FileStrategy.IFileStrategy,'System.IO.FileStrategy.Xhr');
System.IO.FileStrategy.Xhr.Implement(System.Script.Strategy.IStrategySpecification,'System.IO.FileStrategy.Xhr');

System.IO.File.Strategies.Add(System.IO.FileStrategy.Xhr); 

// xUnit.js.Console 
 
Function.RegisterNamespace("xUnit.js.Console");

xUnit.js.Console.ScriptLoader=function(){
	// Private members
	var _attributeParser;

	var _scriptList;
	var _extensions;
	var _defaultExtensions=['.js'];

	// ctor
	new function ScriptLoader(){
		_attributeParser=new System.Script.Attributes.AttributeParser();
	};
	
	// Public methods
	this.GetScriptList=function(pathList,extensions){
		if(!Object.IsType(Array,pathList))throw new Error("xUnit.js.Console.ScriptLoader.GetScriptList: 'pathList' must be an array of valid file or Directory paths.");
		_scriptList=[];
		_extensions=Object.IsType(Array,extensions)?extensions:_defaultExtensions;
		Array.ForEach(pathList,addDirectory,directoryPredicate);
		Array.ForEach(pathList,addScript,scriptPredicate);
		return _scriptList;
	};
	
	this.LoadScripts=function(scriptList){
		if(!Object.IsType(Array,scriptList))throw new Error("xUnit.js.Console.ScriptLoader.LoadScripts: 'scriptList' must be an array of valid file paths.");
		Array.ForEach(scriptList,loadScript);
	};

	// Private methods
	function addDirectory(path,context){
		var directories=System.IO.Directory.GetDirectories(path);
		if(directories)Array.ForEach(directories,addDirectory);
		var files=System.IO.Directory.GetFiles(path);
		if(files)Array.ForEach(files,addScript,scriptPredicate);
	}

	function addScript(path,context){
		_scriptList.push(path);
	}

	function loadScript(path,context){
		var filePath=System.IO.Path.GetFullPath(path);
		if(!System.IO.File.Exists(filePath))return;
		var root=System.IO.Path.GetRoot();
		System.IO.Path.SetRoot(System.IO.Path.GetPath(filePath));
		try{
			var scriptText=System.IO.File.GetFile(filePath);
			scriptText=_attributeParser.Parse(scriptText);
			System.Script.ScriptLoader.Load(scriptText);
		}catch(e){
			throw new Error(String.Format("Error loading script: '{0}'. Error: '{1}'.",filePath,e));
		}
		System.IO.Path.SetRoot(root);
	}
	
	// Predicates
	function directoryPredicate(path,context){
		return System.IO.Directory.Exists(path);
	}

	function scriptPredicate(path,context){
		for(var i=0;i<_extensions.length;i++){
			if(String.EndsWith(path,_extensions[i]))return !directoryPredicate(path,context);
		}
		return false;
	}
}; 
 
Function.RegisterNamespace("xUnit.js.Console");

xUnit.js.Console.Runner=function(){	
	// Private members
	var _durations;
	var _engine;
	var _exitCode;
	var _output;
	var _scriptLoader;

	var _results={
		errors:[],
		failures:[],
		skipped:[],
		success:[]
	}
	
	// ctor
	function Runner(){
		_durations=[];
		_exitCode=0;
		_scriptLoader=new xUnit.js.Console.ScriptLoader();
		_output=xUnit.js.Console.Output.OutputFormatter;
		_engine=xUnit.js.Attributes.Engine.Instance;
		_engine.Events.Add("AfterRun",Component_AfterRun);
		_engine.Events.Add("BeforeRun",Component_BeforeRun);
		System.IO.Path.DirectorySeparator=System.Environment.GetWorkingDirectory().indexOf('\\')>-1?'\\':'/';
	}
	if(this.constructor==xUnit.js.Console.Runner)Runner.apply(this,arguments);
	
	// IRunnable Members
	this.Run=function(){
		try{
			var parameters=System.Environment.GetParameters();
			if(parameters.unnamed.length>0){
				loadDependency(parameters.named.dependency);
				_output.SetType(parameters.named.output);
				_output.Prologue();
				try{
					loadScripts(parameters.unnamed,parameters.named.extensions);
					runAction(parameters.named.action,parameters.named.target||null,parameters.named.trait||null,parameters.named["-trait"]||null);
				}catch(error){
					_exitCode=0x10AD; // LOAD: Runtime exception during script load or test run.
					_output.Error(error);
				}
				_output.Epilogue();
			}else{
				usage();
			}
		}catch(criticalError){
			_exitCode=0xDEAD; // DEAD: Game over, man.
			System.Environment.Write(criticalError);
		}
		System.Environment.Exit(_exitCode);
	};

	// Private methods
	function loadDependency(dependency){
		if(dependency==undefined||!dependency.length)return;
		System.IO.Path.SetRoot(System.Environment.GetWorkingDirectory());
		var dependencies=_scriptLoader.GetScriptList([dependency]);
		_scriptLoader.LoadScripts(dependencies);
	}

	function loadScripts(pathList,extensions){
		var timeStamp=new Date();
		_output.BeginFileLoad();
		System.IO.Path.SetRoot(System.Environment.GetWorkingDirectory());
		if(extensions)extensions=extensions.split(',');
		var scriptList=_scriptLoader.GetScriptList(pathList,extensions);
		_scriptLoader.LoadScripts(scriptList);
		_output.CompleteFileLoad(scriptList,new Date()-timeStamp);
	}
	
	function runAction(action,target,trait,negativeTrait){
		if(!Object.IsType(String,action))action='';
		switch(action.toLowerCase()){
			case 'enumerate':
				enumerateTests(target,trait,negativeTrait);
				break;
			case 'runtests':
			default:
				runTests(target,trait,negativeTrait);
				break;
		}
	}
	
	function enumerateTests(target,trait,negativeTrait){
		Array.ForEach(_engine.Enumerate(target,trait,negativeTrait),enumerate);
	}
	
	function enumerate(model){
		_output.Enumerate(model);
	}
	
	function runTests(target,trait,negativeTrait){
		var startTime=new Date();
		_durations.length=_results.success.length=_results.failures.length=_results.errors.length=_results.skipped.length=0;
		_output.BeginRun();
		_engine.Run(target,trait,negativeTrait);
		_output.CompleteRun(_results.success,_results.failures,_results.errors,_results.skipped,new Date()-startTime);
	}

	function factCompleted(fact){
		switch(fact.State.Result){
			case xUnit.js.Model.Result.Error:
				_results.errors.push(fact);
				_exitCode=0xBAD; // BAD: Your test is bad and you should feel bad.
				break;
			case xUnit.js.Model.Result.Failure:
				_results.failures.push(fact);
				_exitCode=0xFAE1; // FAIL: Your test has failed. Get well soon.
				break;
			case xUnit.js.Model.Result.Skipped:
				_results.skipped.push(fact);
				break;
			case xUnit.js.Model.Result.Success:
				_results.success.push(fact);
				break;
		}
	}	

	function usage(){
		var message=[
			"",
			"xUnit.js Console Runner v0.8.3.8",
			"",
			"Usage:",
			"<environment> xUnit.js.Console.js [/action:<action>] [/extensions:<extensions>] [/dependency:<dependency>] [/output:<output>] [/target:<name>] [/-target:<name>] [/trait:<name>] [/-trait:<name>] <path>[ <path>...] ",
			"",
			"<environment> The environment in which the tests are to be run.",
			"",
			"              Supported environments include:",
			"",
            "                - Microsoft Script Engine (cscript.exe, Windows only)",
            "                - Google's V8 developer console (D8 executable)",
            "                - Mozilla's SpiderMonkey console (js executable)",
            "                - Mozilla's Rhino console (js.jar)",
			"",
			"<action>      The action to perform. Optional. Valid actions are ",
			"              [Enumerate|RunTests]. If omitted, defaults to 'RunTests'.",
			"",
			"<target>      The name of a fact, fixture, or partial namespace to run. ",
			"              Optional. If omitted, runs all facts and fixtures found and ",
			"              registered at <path>.",
			"",
			"<trait>       The name, or comma separated list of names, of traits to run. ",
			"              Optional. If omitted, runs all facts and fixtures found and ",
			"              registered at <path>. If specified, runs only targets designated ",
			"              with the matching trait attribute, e.g. '[Trait(\"trait\")]'.",
			"",
			"<-trait>      The name, or comma separated list of names, of traits to skip. ",
			"              Optional. If omitted, runs all facts and fixtures found and ",
			"              registered at <path>. If specified, runs only targets not ",
			"              designated with a matching trait attribute.",
			"",
			"<extensions>  A comma separated list of file extensions to include while ",
			"              searching <path> for files to load. If omitted, defaults to '.js'.",
			"",
			"<output>      The desired output type. Optional. Valid outputs are ",
			"              [Text|Xml|Json]. If omitted, defaults to 'Text'.",
			"",
			"<dependency>  The path to a script file or directory containing dependencies to ",
			"              load before beginning the test run. These filse will load before ",
			"              any of the files in <path>, and before any output is written.",
			"",
			"<path>        The path to a script file or directory containing files to load",
			"              and parse for tests. Additional paths may be separated by a space.",
			"",
			"",
			"Examples:",
			"",
			"  cscript xUnit.js.Console.js /action:Enumerate xUnit.js/Tests",
			"",
			"  d8 - xUnit.js.Console.js -- /target:Test.xUnit.js.Console xUnit.js/Tests",
			"",
			"  js xUnit.js.Console.js xUnit.js/Tests/xUnit.js.Console/Runner.js",
			"",
			"  java -jar js.jar xUnit.js.Console.js /output:Xml xUnit.js/Tests",
			"",
            ""
		];
		System.Environment.Write(message.join('\n'));
	}
	
	// Events
	function Component_BeforeRun(context){
		_durations.push(new Date());
		_output.BeginComponent(context.Component);
	}

	function Component_AfterRun(context){
		if(Object.IsType(xUnit.js.Model.Fact,context.Component)){
			factCompleted(context.Component);
		}
		_output.CompleteComponent(context.Component,new Date()-_durations.pop());
	}
};

xUnit.js.Console.Runner.Implement(xUnit.js.IRunnable,'xUnit.js.Console.Runner'); 
 
Function.RegisterNamespace("xUnit.js.Console.Output");

xUnit.js.Console.Output.IOutputStrategy=new function(){
	this.Prologue=function(){};
	this.Epilogue=function(){};
	
	this.BeginFileLoad=function(){};
	this.CompleteFileLoad=function(files,duration){};

	this.BeginRun=function(){};
	this.CompleteRun=function(successes,failures,errors,skipped,duration){};

	this.BeginComponent=function(component){};
	this.CompleteComponent=function(component,duration){};
	
	this.Enumerate=function(component){};
	this.Error=function(error){};
}; 
 
Function.RegisterNamespace("xUnit.js.Console.Output");

xUnit.js.Console.Output.OutputFormatter=new function(){
	var _strategyManager;
	var _candidate;
	var _types={
		json:"json",
		text:"text",
		xml:"xml"
	};

	// Public Members
	this.Strategies;
	this.OutputTypes;

	// ctor
	function OutputFormatter(){
		_candidate=_types.text;
		this.OutputTypes=_types;
		this.Strategies=_strategyManager=new System.Script.Strategy.StrategyManager();
	}
	OutputFormatter.apply(this,arguments);

	this.SetType=function(type){
		if(Object.IsType(Function,type&&type.toString)){
			type=type.toString().toLowerCase();
			if(_types[type])_candidate=_types[type];
		}
	};
	
	// IOutputStrategy Members
	this.Prologue=function(){
		return _strategyManager.Get(_candidate).Prologue();
	};

	this.Epilogue=function(){
		return _strategyManager.Get(_candidate).Epilogue();
	};
	
	this.BeginFileLoad=function(){
		return _strategyManager.Get(_candidate).BeginFileLoad();
	};

	this.CompleteFileLoad=function(files,duration){
		return _strategyManager.Get(_candidate).CompleteFileLoad(files,duration);
	};
	
	this.BeginRun=function(){
		return _strategyManager.Get(_candidate).BeginRun();
	};

	this.CompleteRun=function(successes,failures,errors,skipped,duration){
		return _strategyManager.Get(_candidate).CompleteRun(successes,failures,errors,skipped,duration);
	};

	this.BeginComponent=function(component){
		return _strategyManager.Get(_candidate).BeginComponent(component);
	};

	this.CompleteComponent=function(component,duration){
		return _strategyManager.Get(_candidate).CompleteComponent(component,duration);
	};

	this.Enumerate=function(component){
		return _strategyManager.Get(_candidate).Enumerate(component);
	};

	this.Error=function(error){
		return _strategyManager.Get(_candidate).Error(error);
	};

};

xUnit.js.Console.Output.OutputFormatter.constructor.Implement(xUnit.js.Console.Output.IOutputStrategy,'xUnit.js.Console.Output.OutputFormatter'); 
 
Function.RegisterNamespace("xUnit.js.Console.Output.OutputStrategy");

xUnit.js.Console.Output.OutputStrategy.Json=function(){
	var _output;

	// IOutputStrategy Members
	this.Prologue=function(){
		_output={
			files:{
				list:[]
			},
			facts:{
				list:[]
			}
		};
	};

	this.Epilogue=function(){
		System.Environment.Write(new System.Script.ObjectSerializer().Serialize(_output));
	};

	this.BeginFileLoad=function(){};

	this.CompleteFileLoad=function(files,duration){
		Array.ForEach(files,listFile);
		_output.files.duration=duration/1000;
	};

	this.BeginRun=function(){
		_output.facts.list.length=0;
		_output.run={
			count:0,
			errors:0,
			failures:0,
			skipped:0,
			duration:0,
			timestamp:new Date()
		};
	};

	this.CompleteRun=function(successes,failures,errors,skipped,duration){
		var count=successes.length+failures.length+errors.length+skipped.length;
		_output.run.count=count;
		_output.run.failures=failures.length;
		_output.run.errors=errors.length;
		_output.run.skipped=skipped.length;
		_output.run.duration=duration/1000;
		if(errors.length){
			_output.run.errors=[];
			Array.ForEach(errors,listError);
		}
		if(failures.length){
			_output.run.failures=[];
			Array.ForEach(failures,listFailure);
		}
		if(skipped.length){
			_output.run.skipped=[];
			Array.ForEach(skipped,listSkipped);
		}
	};
	
	this.BeginComponent=function(component){
		// no-op
	};

	this.CompleteComponent=function(component,duration){
		if(!Object.IsType(xUnit.js.Model.Fact,component))return;
		_output.facts.list.push({
			path:getPath(component),
			result:getResult(component.State.Result),
			message:component.State.Message||'',
			duration:duration/1000
		});
	};

	this.Enumerate=function(component){
		_output.facts.list.push({
			path:getPath(component)
		});
	};

	this.Error=function(error){
		var output={message:error.toString()};
		if(error.lineNumber)output.lineNumber=error.lineNumber;
		if(error.number)output.number=error.number;
		if(error.toSource)output.source=error.toSource();
		if(error.stack)output.stack=error.stack;
		_output.error=output;
	}
	
	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return String.Equals(xUnit.js.Console.Output.OutputFormatter.OutputTypes.json,candidate);
	};
	
	// Private Methods
	function getPath(fact){
		return fact.GetPath().split('.').slice(1).join('.');
	}
	
	function getResult(result){
		switch(result){
			case xUnit.js.Model.Result.Error:
				return "Error";
			case xUnit.js.Model.Result.Failure:
				return "Failure";
			case xUnit.js.Model.Result.Skipped:
				return "Skipped";
			case xUnit.js.Model.Result.Success:
				return "Success";
		}
		return '';
	}
	
	function listError(fact,context){
		_output.run.errors.push({
			path:getPath(fact),
			type:fact.State.Message&&fact.State.Message.name||"Exception",
			message:fact.State.Message||"[no message]"
		});
	}

	function listFile(file,context){
		_output.files.list.push({
			path:file
		});
	}

	function listFailure(fact,context){
		_output.run.failures.push({
			path:getPath(fact),
			type:fact.State.Message&&fact.State.Message.name||"Exception",
			message:fact.State.Message||"[no message]"
		});
	}

	function listSkipped(fact,context){
		_output.run.failures.push({
			path:getPath(fact),
			message:fact.State.Message||"[no message]"
		});
	}	
};

xUnit.js.Console.Output.OutputStrategy.Json.Implement(xUnit.js.Console.Output.IOutputStrategy,'xUnit.js.Console.Output.OutputStrategy.Json');
xUnit.js.Console.Output.OutputStrategy.Json.Implement(System.Script.Strategy.IStrategySpecification,'xUnit.js.Console.Output.OutputStrategy.Json');

xUnit.js.Console.Output.OutputFormatter.Strategies.Add(xUnit.js.Console.Output.OutputStrategy.Json);
 
 
Function.RegisterNamespace("xUnit.js.Console.Output.OutputStrategy");

xUnit.js.Console.Output.OutputStrategy.Text=function(){
	// IOutputStrategy Members
	this.Prologue=function(){
		System.Environment.Write("xUnit.js Console Runner");
	};

	this.Epilogue=function(){
		System.Environment.Write('\nDone.');
	};
	
	this.BeginFileLoad=function(){
		var startTime=new Date();
		System.Environment.Write("\nLoading Scripts:\n");
	};
	
	this.CompleteFileLoad=function(files,duration){
		Array.ForEach(files,listFile,null,{WorkingDirectory:System.Environment.GetWorkingDirectory()});
		if(files.length)System.Environment.Write('\n\n');
		System.Environment.Write(String.Format("Finished Loading Scripts in {0}.\n",formatDuration(duration)));
	};

	this.BeginRun=function(){
		System.Environment.Write("\nRunning tests:\n\n");	
	};
	
	this.CompleteRun=function(successes,failures,errors,skipped,duration){
		System.Environment.Write("\n\n");
		if(failures.length){
			System.Environment.Write("Failed Tests:\n");
			Array.ForEach(failures,reportFailure);			
		}
		if(errors.length){
			System.Environment.Write("Errored Tests:\n");
			Array.ForEach(errors,reportFailure);			
		}
		if(skipped.length){
			System.Environment.Write("\nSkipped Tests:\n");
			Array.ForEach(skipped,reportSkipped);			
		}
		var count=successes.length+failures.length+errors.length+skipped.length;
		System.Environment.Write(String.Format("\n\nTotal tests: {0}, Errors: {1}, Failures: {2}, Skipped: {3}, Time: {4}\n\n",count,errors.length,failures.length,skipped.length,formatDuration(duration)));
	};
	
	this.BeginComponent=function(component){};

	this.CompleteComponent=function(component,duration){
		if(!Object.IsType(xUnit.js.Model.Fact,component))return;
		var result='';
		switch(component.State.Result){
			case xUnit.js.Model.Result.Error:
				result='E';
				break;
			case xUnit.js.Model.Result.Failure:
				result='F';
				break;
			case xUnit.js.Model.Result.Skipped:
				result='S';
				break;
			case xUnit.js.Model.Result.Success:
				result='.';
				break;
		}
		System.Environment.Write(result);
	};

	this.Enumerate=function(component){
		System.Environment.Write(getPath(component));
		System.Environment.Write('\r\n');
	};

	this.Error=function(error){
		System.Environment.Write(String.Format("\nError: \n{0}",formatError(error)));
	}
	
	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return String.Equals(xUnit.js.Console.Output.OutputFormatter.OutputTypes.text,candidate);
	};
	
	// Private Methods	
	function formatDuration(duration){
		if(!Object.IsType(Number,duration))return "an unknown amount of time";
		duration=duration/1000;
		var components={
			hours:{
				format:"{0} hour{1}",
				value:Math.floor(duration/60/60)
			},
			minutes:{
				format:"{0} minute{1}",
				value:Math.floor(duration/60)%60
			},
			seconds:{
				format:"{0} second{1}",
				value:duration%60
			}
		};
		var result=[];
		for(var x in components){
			var value=components[x].value;
			if(value)result.push(String.Format(components[x].format,value,value!=1?'s':''));
		}
		return result.join(", ");
	}

	function formatError(e){
		var errorText=e+'';
		if(e){
			if(e.line)errorText=String.Format("\n{0} (line: {1})",errorText,e.line);
			if(e.lineNumber)errorText=String.Format("\n{0} (line: {1})",errorText,e.lineNumber);
			if(e.number)errorText=String.Format("\n{0} (number: {1})",errorText,e.number);
			if(e.stack)errorText=String.Format("{0}\nStackTrace: {1}",errorText,e.stack);
		}
		return errorText;
	}

	function getPath(fact){
		return fact.GetPath().split('.').slice(1).join('.');
	}
	
	function listFile(file,context){
		var fileName=file;
		if(String.StartsWith(fileName,context.WorkingDirectory)){
			fileName=fileName.substr(context.WorkingDirectory.length+1);
		}
		System.Environment.Write('\n\t',fileName);
	}

	function reportFailure(fact,context){
		var msg=String.Format("{0} -- {1}: {2}",getPath(fact),fact.State.Message&&fact.State.Message.name||"Exception",formatError(fact.State.Message)||"[no message]");
		var err=String.Format("\t{0}) {1}\n\n",context.Index+1,msg);
		System.Environment.WriteError(err);
	}

	function reportSkipped(fact,context){
		var msg=String.Format("{0} -- {1}",getPath(fact),fact.State.Message||"[no message]");
		System.Environment.Write(String.Format("\t{0}) {1}\n\n",context.Index+1,msg));
	}	

};

xUnit.js.Console.Output.OutputStrategy.Text.Implement(xUnit.js.Console.Output.IOutputStrategy,'xUnit.js.Console.Output.OutputStrategy.Text');
xUnit.js.Console.Output.OutputStrategy.Text.Implement(System.Script.Strategy.IStrategySpecification,'xUnit.js.Console.Output.OutputStrategy.Text');

xUnit.js.Console.Output.OutputFormatter.Strategies.Add(xUnit.js.Console.Output.OutputStrategy.Text); 
 
Function.RegisterNamespace("xUnit.js.Console.Output.OutputStrategy");

xUnit.js.Console.Output.OutputStrategy.Xml=function(){
	// IOutputStrategy Members
	this.Prologue=function(){
		System.Environment.Write("<xunit>");
	};

	this.Epilogue=function(){
		System.Environment.Write("</xunit>");
	};

	this.BeginFileLoad=function(){};

	this.CompleteFileLoad=function(files,duration){
		System.Environment.Write(String.Format("<files duration=\"{0}\">",duration/1000));
		Array.ForEach(files,listFile);
		System.Environment.Write("</files>");
	};
	
	this.BeginRun=function(){
		System.Environment.Write("<facts>");
	};

	this.CompleteRun=function(successes,failures,errors,skipped,duration){
		System.Environment.Write("</facts>");
		var count=successes.length+failures.length+errors.length+skipped.length;
		System.Environment.Write(String.Format("<run count=\"{0}\" failures=\"{1}\" errors=\"{2}\" skipped=\"{3}\" duration=\"{4}\" timestamp=\"{5}\"",count,failures.length,errors.length,skipped.length,duration/1000,new Date()));
		if(failures.length||skipped.length){
			System.Environment.Write(">");
			if(errors.length){
				System.Environment.Write("<errors>");
				Array.ForEach(failures,listFailure);
				System.Environment.Write("</errors>");
			}
			if(failures.length){
				System.Environment.Write("<failures>");
				Array.ForEach(failures,listFailure);
				System.Environment.Write("</failures>");
			}
			if(skipped.length){
				System.Environment.Write("<skipped>");
				Array.ForEach(skipped,listSkipped);
				System.Environment.Write("</skipped>");
			}
			System.Environment.Write("</run>");
		}else System.Environment.Write(" />");
	};

	this.BeginComponent=function(component){};

	this.CompleteComponent=function(component,duration){
		if(!Object.IsType(xUnit.js.Model.Fact,component))return;
		System.Environment.Write(String.Format("<fact path=\"{0}\" result=\"{1}\" message=\"{2}\" duration=\"{3}\" />",encode(getPath(component)),getResult(component.State.Result),encode(component.State.Message||''),duration/1000));
	};

	this.Enumerate=function(component){
		System.Environment.Write(String.Format("<fact path=\"{0}\" />",encode(getPath(component))));
	};

	this.Error=function(error){
		var output=String.Concat(
			"<error",
				error.lineNumber?String.Format(" lineNumber=\"{0}\"",encode(error.lineNumber)):'',
				error.number?String.Format(" number=\"{0}\"",encode(error.number)):'',
			">",
			"<message>",encode(error),"</message>",
			error.toSource?String.Format("<source>{0}</source>",encode(error.toSource())):'',
			error.stack?String.Format("<stack>{0}</stack>",encode(error.stack)):'',
			"</error>"
		);	
		System.Environment.Write(output);
	}
	
	// IStrategySpecification Members
	this.IsSatisfiedBy=function(candidate){
		return String.Equals(xUnit.js.Console.Output.OutputFormatter.OutputTypes.xml,candidate);
	};
	
	// Private Methods
	function encode(value){
		if(value==undefined||!value.toString)return '';
		value=value.toString();
		return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
	}
	
	function getPath(fact){
		return fact.GetPath().split('.').slice(1).join('.');
	}
	
	function getResult(result){
		switch(result){
			case xUnit.js.Model.Result.Error:
				return "Error";
			case xUnit.js.Model.Result.Failure:
				return "Failure";
			case xUnit.js.Model.Result.Skipped:
				return "Skipped";
			case xUnit.js.Model.Result.Success:
				return "Success";
		}
		return '';
	}
	
	function listFile(file,context){
		System.Environment.Write(String.Format("<file path=\"{0}\" />",encode(file)));
	}
	
	function listFailure(fact,context){
		System.Environment.Write(String.Format("<fact path=\"{0}\" type=\"{1}\" message=\"{2}\" />",encode(getPath(fact)),encode(fact.State.Message&&fact.State.Message.name||"Exception"),encode(fact.State.Message||"[no message]")));
	}

	function listSkipped(fact,context){
		System.Environment.Write(String.Format("<fact path=\"{0}\" message=\"{1}\" />",encode(getPath(fact)),encode(fact.State.Message||"[no message]")));
	}
};

xUnit.js.Console.Output.OutputStrategy.Xml.Implement(xUnit.js.Console.Output.IOutputStrategy,'xUnit.js.Console.Output.OutputStrategy.Xml');
xUnit.js.Console.Output.OutputStrategy.Xml.Implement(System.Script.Strategy.IStrategySpecification,'xUnit.js.Console.Output.OutputStrategy.Xml');

xUnit.js.Console.Output.OutputFormatter.Strategies.Add(xUnit.js.Console.Output.OutputStrategy.Xml);
 
 
Function.RegisterNamespace('xUnit.js.Console');

xUnit.js.Console.Program=function(){
	this.Application;

	// Application Entry Point
	function Program(){
		this.Application=new xUnit.js.Console.Runner();
		this.Application.Run();
	}
	Program.apply(this,arguments);

};
xUnit.js.Console.Program=new xUnit.js.Console.Program(); 
