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
/**
 * @namespace The WebSQL adapter for storage service implementation
 * @constructor
 */
var WebSQLStorageAdapter = function WebSQLStorageAdapter() {
	this.db = openDatabase("webSQLStorageAdapter", "1.0",
			"WebSQLStorageAdapter database", 20 * 1024 * 1024);

	// Create the schema if it does not already exist
	this.db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS cache (key unique, value);");
	});
};

WebSQLStorageAdapter.prototype.getName = function() {
	return "websql";
};

WebSQLStorageAdapter.prototype.getItem = function(key) {
	this.db.readTransaction(function(tx) {
		var item;
		tx.executeSql("SELECT value FROM cache WHERE key = ?;", [key],
			function(tx, results) {
				var rows = results.rows;
				if (rows.length > 0) {
					var json = rows.item(0);
					item = json ? $A.util.json.decode(json) : undefined;					
				}
			}
		);

		return item;
	});
};

WebSQLStorageAdapter.prototype.setItem = function(key, value) {
	if (!value) {
		this.removeItem(key);
	} else {
		this.db.transaction(function(tx) {
			var json = $A.util.json.encode(value);
			tx.executeSql("INSERT INTO cache (key, value) VALUES (?, ?);", [key, json], null, function(tx, error) {
				alert(error.message);
			});
		});
	}
};

WebSQLStorageAdapter.prototype.removeItem = function(key) {
	this.db.transaction(function(tx) {
		tx.executeSql("DELETE FROM cache WHERE key = ?;", [key]);
	});
};
