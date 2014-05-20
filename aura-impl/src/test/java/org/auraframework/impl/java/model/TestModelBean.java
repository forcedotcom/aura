package org.auraframework.impl.java.model;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

@Model (bean=true)
public class TestModelBean {
	private int counter=-1;
	private boolean debug=false;
	
	public TestModelBean() {
		this.counter = 0;
		if(debug) System.out.println("create TestModelBean#"+this.hashCode());
	}
	
	@AuraEnabled
	public int getCounter() {
		this.counter++;
		if(debug) System.out.println("getCounter from TestModelBean#"+this.hashCode()+":"+this.counter);
		return this.counter;
	}
}
