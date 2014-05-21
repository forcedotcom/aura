package org.auraframework.impl.java.controller;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

@Controller(bean=true)
public class TestControllerBean {
	private int counter = -1;
	boolean debug=false;
	
	public TestControllerBean() {
		this.counter=0;
		if(debug) System.out.println("create TestControllerBean#"+this.hashCode());
    }
	
	@AuraEnabled
    public int increaseCounter() {
		this.counter++;
		if(debug) System.out.println("increaseCounter of TestControllerBean#"+this.hashCode()+":"+this.counter);
		return this.counter;
    } 
	
	@AuraEnabled
    public int decreaseCounter() {
		this.counter--;
		if(debug) System.out.println("decrease of TestControllerBean#"+this.hashCode()+":"+this.counter);
		return this.counter;
    }
	
	@AuraEnabled
    public void setCounter(@Key("value") int value) {
		this.counter = value;
		if(debug) System.out.println("setCounter of TestControllerBean#"+this.hashCode()+" to "+value);
	}
	
	@AuraEnabled
    public int getCounter() {
		if(debug) System.out.println("getCounter of TestControllerBean#"+this.hashCode()+":"+this.counter);
		return this.counter;
	}
	
}
