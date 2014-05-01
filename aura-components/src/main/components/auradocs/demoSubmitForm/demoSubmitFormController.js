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
		cmp.set('v.myDate', newdate.getFullYear() + "-" + (newdate.getMonth() + 1) + "-" + newdate.getDate());
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

		outName.set("v.value", fullName);
		var emVal = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (email.search(emVal) === 0) {
			outEmail.set("v.label", email);
			outEmail.set("v.title", email);
			outEmail.set("v.value", email);
			cmp.set("v.invalidEmail", false);
		} else {
			cmp.set("v.invalidEmail", true);
		}

		if (pw.length >= 6) {
			outPW.set("v.value", pw);
			cmp.set("v.invalidPW", false);
		} else {
			cmp.set("v.invalidPW", true);
		}

		var urlVal = /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
		if (website.search(urlVal) === 0) {
			outURL.set("v.label", website);
			outURL.set("v.value", website);
			cmp.set("v.invalidURL", false);

		} else {
			cmp.set("v.invalidURL", true);
		}

		outDOB.set("v.value", dob);
		outSize.set("v.value", size);
		outAppt.set("v.value", appt);

		if (fName === "" || lName === "") {
			cmp.set("v.filled", false);
		} else {
			cmp.set("v.filled", true);
		}

	}
})