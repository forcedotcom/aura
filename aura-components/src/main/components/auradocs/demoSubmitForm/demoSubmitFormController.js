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
	doInit : function(cmp) {
		var newdate = new Date();
		var attributes = cmp.getAttributes();
		attributes.setValue('myDate', newdate.getFullYear() + "-"
				+ (newdate.getMonth() + 1) + "-" + newdate.getDate());
	},

	getInput : function(cmp, event) {

		var fName = cmp.find("inFName").get("v.value");
		var lName = cmp.find("inLName").get("v.value");
		var fullName = fName + " " + lName;
		var email = cmp.find("inEmail").get("v.value");
		var pw = cmp.find("inPW").get("v.value");
		var website = cmp.find("inURL").get("v.value");
		var dob = cmp.find("inDOB").get("v.value");
		var size = cmp.find("inSize").get("v.value");
		var appt = cmp.find("inAppt").get("v.value");

		var outName = cmp.find("outName");
		var outEmail = cmp.find("outEmail");
		var outPW = cmp.find("outPW");
		var outURL = cmp.find("outURL");
		var outDOB = cmp.find("outDOB");
		var outSize = cmp.find("outSize");
		var outAppt = cmp.find("outAppt");

		outName.getValue("v.value").setValue(fullName);
		var emVal = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (email.search(emVal) === 0) {
			outEmail.getValue("v.label").setValue(email);
			outEmail.getValue("v.title").setValue(email);
			outEmail.getValue("v.value").setValue(email);
			cmp.getValue("v.invalidEmail").setValue(false);
		} else {
			cmp.getValue("v.invalidEmail").setValue(true);
		}

		if (pw.length >= 6) {
			outPW.getValue("v.value").setValue(pw);
			cmp.getValue("v.invalidPW").setValue(false);
		} else {
			cmp.getValue("v.invalidPW").setValue(true);
		}
		
		var urlVal = /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
		if (website.search(urlVal) === 0) {
			outURL.getValue("v.label").setValue(website);
			outURL.getValue("v.value").setValue(website);
			cmp.getValue("v.invalidURL").setValue(false);

		} else {
			cmp.getValue("v.invalidURL").setValue(true);
		}

		outDOB.getValue("v.value").setValue(dob);
		outSize.getValue("v.value").setValue(size);
		outAppt.getValue("v.value").setValue(appt);

		if (fName === "" || lName === "") {
			cmp.getValue("v.filled").setValue(false);
		} else {
			cmp.getValue("v.filled").setValue(true);
		}
		
	}
})