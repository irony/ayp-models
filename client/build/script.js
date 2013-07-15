/*! IndexedDBShim - v0.1.2 - 2013-06-12 */
var idbModules={};(function(e){function t(e,t,n,o){n.target=t,"function"==typeof t[e]&&t[e].apply(t,[n]),"function"==typeof o&&o()}function n(t,n,o){var i=new DOMException.constructor(0,n);throw i.name=t,i.message=n,i.stack=arguments.callee.caller,e.DEBUG&&console.log(t,n,o,i),i}var o=function(){this.length=0,this._items=[],Object.defineProperty&&Object.defineProperty(this,"_items",{enumerable:!1})};if(o.prototype={contains:function(e){return-1!==this._items.indexOf(e)},item:function(e){return this._items[e]},indexOf:function(e){return this._items.indexOf(e)},push:function(e){this._items.push(e),this.length+=1;for(var t=0;this._items.length>t;t++)this[t]=this._items[t]},splice:function(){this._items.splice.apply(this._items,arguments),this.length=this._items.length;for(var e in this)e===parseInt(e,10)+""&&delete this[e];for(e=0;this._items.length>e;e++)this[e]=this._items[e]}},Object.defineProperty)for(var i in{indexOf:!1,push:!1,splice:!1})Object.defineProperty(o.prototype,i,{enumerable:!1});e.util={throwDOMException:n,callback:t,quote:function(e){return"'"+e+"'"},StringList:o}})(idbModules),function(e){var t=function(){return{encode:function(e){return JSON.stringify(e)},decode:function(e){return JSON.parse(e)}}}();e.Sca=t}(idbModules),function(e){var t=["","number","string","boolean","object","undefined"],n=function(){return{encode:function(e){return t.indexOf(typeof e)+"-"+JSON.stringify(e)},decode:function(e){return e===void 0?void 0:JSON.parse(e.substring(2))}}},o={number:n("number"),"boolean":n(),object:n(),string:{encode:function(e){return t.indexOf("string")+"-"+e},decode:function(e){return""+e.substring(2)}},undefined:{encode:function(){return t.indexOf("undefined")+"-undefined"},decode:function(){return void 0}}},i=function(){return{encode:function(e){return o[typeof e].encode(e)},decode:function(e){return o[t[e.substring(0,1)]].decode(e)}}}();e.Key=i}(idbModules),function(e){var t=function(e,t){return{type:e,debug:t,bubbles:!1,cancelable:!1,eventPhase:0,timeStamp:new Date}};e.Event=t}(idbModules),function(e){var t=function(){this.onsuccess=this.onerror=this.result=this.error=this.source=this.transaction=null,this.readyState="pending"},n=function(){this.onblocked=this.onupgradeneeded=null};n.prototype=t,e.IDBRequest=t,e.IDBOpenRequest=n}(idbModules),function(e,t){var n=function(e,t,n,o){this.lower=e,this.upper=t,this.lowerOpen=n,this.upperOpen=o};n.only=function(e){return new n(e,e,!0,!0)},n.lowerBound=function(e,o){return new n(e,t,o,t)},n.upperBound=function(e){return new n(t,e,t,open)},n.bound=function(e,t,o,i){return new n(e,t,o,i)},e.IDBKeyRange=n}(idbModules),function(e,t){function n(n,o,i,r,s,a){this.__range=n,this.source=this.__idbObjectStore=i,this.__req=r,this.key=t,this.direction=o,this.__keyColumnName=s,this.__valueColumnName=a,this.source.transaction.__active||e.util.throwDOMException("TransactionInactiveError - The transaction this IDBObjectStore belongs to is not active."),this.__offset=-1,this.__lastKeyContinued=t,this["continue"]()}n.prototype.__find=function(n,o,i,r){var s=this,a=["SELECT * FROM ",e.util.quote(s.__idbObjectStore.name)],u=[];a.push("WHERE ",s.__keyColumnName," NOT NULL"),s.__range&&(s.__range.lower||s.__range.upper)&&(a.push("AND"),s.__range.lower&&(a.push(s.__keyColumnName+(s.__range.lowerOpen?" >":" >= ")+" ?"),u.push(e.Key.encode(s.__range.lower))),s.__range.lower&&s.__range.upper&&a.push("AND"),s.__range.upper&&(a.push(s.__keyColumnName+(s.__range.upperOpen?" < ":" <= ")+" ?"),u.push(e.Key.encode(s.__range.upper)))),n!==t&&(s.__lastKeyContinued=n,s.__offset=0),s.__lastKeyContinued!==t&&(a.push("AND "+s.__keyColumnName+" >= ?"),u.push(e.Key.encode(s.__lastKeyContinued))),a.push("ORDER BY ",s.__keyColumnName),a.push("LIMIT 1 OFFSET "+s.__offset),e.DEBUG&&console.log(a.join(" "),u),o.executeSql(a.join(" "),u,function(n,o){if(1===o.rows.length){var r=e.Key.decode(o.rows.item(0)[s.__keyColumnName]),a="value"===s.__valueColumnName?e.Sca.decode(o.rows.item(0)[s.__valueColumnName]):e.Key.decode(o.rows.item(0)[s.__valueColumnName]);i(r,a)}else e.DEBUG&&console.log("Reached end of cursors"),i(t,t)},function(t,n){e.DEBUG&&console.log("Could not execute Cursor.continue"),r(n)})},n.prototype["continue"]=function(e){var n=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,s){n.__offset++,n.__find(e,o,function(e,o){n.key=e,n.value=o,r(n.key!==t?n:t,n.__req)},function(e){s(e)})})},n.prototype.advance=function(n){0>=n&&e.util.throwDOMException("Type Error - Count is invalid - 0 or negative",n);var o=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(e,i,r,s){o.__offset+=n,o.__find(t,e,function(e,n){o.key=e,o.value=n,r(o.key!==t?o:t,o.__req)},function(e){s(e)})})},n.prototype.update=function(n){var o=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(i,r,s,a){o.__find(t,i,function(t){var r="UPDATE "+e.util.quote(o.__idbObjectStore.name)+" SET value = ? WHERE key = ?";e.DEBUG&&console.log(r,n,t),i.executeSql(r,[e.Sca.encode(n),e.Key.encode(t)],function(e,n){1===n.rowsAffected?s(t):a("No rowns with key found"+t)},function(e,t){a(t)})},function(e){a(e)})})},n.prototype["delete"]=function(){var n=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,s){n.__find(t,o,function(i){var a="DELETE FROM  "+e.util.quote(n.__idbObjectStore.name)+" WHERE key = ?";e.DEBUG&&console.log(a,i),o.executeSql(a,[e.Key.encode(i)],function(e,n){1===n.rowsAffected?r(t):s("No rowns with key found"+i)},function(e,t){s(t)})},function(e){s(e)})})},e.IDBCursor=n}(idbModules),function(idbModules,undefined){function IDBIndex(e,t){this.indexName=this.name=e,this.__idbObjectStore=this.objectStore=this.source=t;var n=t.__storeProps&&t.__storeProps.indexList;n&&(n=JSON.parse(n)),this.keyPath=n&&n[e]&&n[e].keyPath||e,["multiEntry","unique"].forEach(function(t){this[t]=!!(n&&n[e]&&n[e].optionalParams&&n[e].optionalParams[t])},this)}IDBIndex.prototype.__createIndex=function(indexName,keyPath,optionalParameters){var me=this,transaction=me.__idbObjectStore.transaction;transaction.__addToTransactionQueue(function(tx,args,success,failure){me.__idbObjectStore.__getStoreProps(tx,function(){function error(){idbModules.util.throwDOMException(0,"Could not create new index",arguments)}2!==transaction.mode&&idbModules.util.throwDOMException(0,"Invalid State error, not a version transaction",me.transaction);var idxList=JSON.parse(me.__idbObjectStore.__storeProps.indexList);idxList[indexName]!==undefined&&idbModules.util.throwDOMException(0,"Index already exists on store",idxList);var columnName=indexName;idxList[indexName]={columnName:columnName,keyPath:keyPath,optionalParams:optionalParameters},me.__idbObjectStore.__storeProps.indexList=JSON.stringify(idxList);var sql=["ALTER TABLE",idbModules.util.quote(me.__idbObjectStore.name),"ADD",columnName,"BLOB"].join(" ");idbModules.DEBUG&&console.log(sql),tx.executeSql(sql,[],function(tx,data){tx.executeSql("SELECT * FROM "+idbModules.util.quote(me.__idbObjectStore.name),[],function(tx,data){(function initIndexForRow(i){if(data.rows.length>i)try{var value=idbModules.Sca.decode(data.rows.item(i).value),indexKey=eval("value['"+keyPath+"']");tx.executeSql("UPDATE "+idbModules.util.quote(me.__idbObjectStore.name)+" set "+columnName+" = ? where key = ?",[idbModules.Key.encode(indexKey),data.rows.item(i).key],function(){initIndexForRow(i+1)},error)}catch(e){initIndexForRow(i+1)}else idbModules.DEBUG&&console.log("Updating the indexes in table",me.__idbObjectStore.__storeProps),tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?",[me.__idbObjectStore.__storeProps.indexList,me.__idbObjectStore.name],function(){me.__idbObjectStore.__setReadyState("createIndex",!0),success(me)},error)})(0)},error)},error)},"createObjectStore")})},IDBIndex.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"value"),n},IDBIndex.prototype.openKeyCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"key"),n},IDBIndex.prototype.__fetchIndexData=function(e,t){var n=this;return n.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,s){var a=["SELECT * FROM ",idbModules.util.quote(n.__idbObjectStore.name)," WHERE",n.indexName,"NOT NULL"],u=[];e!==undefined&&(a.push("AND",n.indexName," = ?"),u.push(idbModules.Key.encode(e))),idbModules.DEBUG&&console.log("Trying to fetch data for Index",a.join(" "),u),o.executeSql(a.join(" "),u,function(e,n){var o;o="count"==typeof t?n.rows.length:0===n.rows.length?undefined:"key"===t?idbModules.Key.decode(n.rows.item(0).key):idbModules.Sca.decode(n.rows.item(0).value),r(o)},s)})},IDBIndex.prototype.get=function(e){return this.__fetchIndexData(e,"value")},IDBIndex.prototype.getKey=function(e){return this.__fetchIndexData(e,"key")},IDBIndex.prototype.count=function(e){return this.__fetchIndexData(e,"count")},idbModules.IDBIndex=IDBIndex}(idbModules),function(idbModules){var IDBObjectStore=function(e,t,n){this.name=e,this.transaction=t,this.__ready={},this.__setReadyState("createObjectStore",n===void 0?!0:n),this.indexNames=new idbModules.util.StringList};IDBObjectStore.prototype.__setReadyState=function(e,t){this.__ready[e]=t},IDBObjectStore.prototype.__waitForReady=function(e,t){var n=!0;if(t!==void 0)n=this.__ready[t]===void 0?!0:this.__ready[t];else for(var o in this.__ready)this.__ready[o]||(n=!1);if(n)e();else{idbModules.DEBUG&&console.log("Waiting for to be ready",t);var i=this;window.setTimeout(function(){i.__waitForReady(e,t)},100)}},IDBObjectStore.prototype.__getStoreProps=function(e,t,n){var o=this;this.__waitForReady(function(){o.__storeProps?(idbModules.DEBUG&&console.log("Store properties - cached",o.__storeProps),t(o.__storeProps)):e.executeSql("SELECT * FROM __sys__ where name = ?",[o.name],function(e,n){1!==n.rows.length?t():(o.__storeProps={name:n.rows.item(0).name,indexList:n.rows.item(0).indexList,autoInc:n.rows.item(0).autoInc,keyPath:n.rows.item(0).keyPath},idbModules.DEBUG&&console.log("Store properties",o.__storeProps),t(o.__storeProps))},function(){t()})},n)},IDBObjectStore.prototype.__deriveKey=function(tx,value,key,callback){function getNextAutoIncKey(){tx.executeSql("SELECT * FROM sqlite_sequence where name like ?",[me.name],function(e,t){1!==t.rows.length?callback(0):callback(t.rows.item(0).seq)},function(e,t){idbModules.util.throwDOMException(0,"Data Error - Could not get the auto increment value for key",t)})}var me=this;me.__getStoreProps(tx,function(props){if(props||idbModules.util.throwDOMException(0,"Data Error - Could not locate defination for this table",props),props.keyPath)if(key!==void 0&&idbModules.util.throwDOMException(0,"Data Error - The object store uses in-line keys and the key parameter was provided",props),value)try{var primaryKey=eval("value['"+props.keyPath+"']");primaryKey?callback(primaryKey):"true"===props.autoInc?getNextAutoIncKey():idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath")}catch(e){idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath",e)}else idbModules.util.throwDOMException(0,"Data Error - KeyPath was specified, but value was not");else key!==void 0?callback(key):"false"===props.autoInc?idbModules.util.throwDOMException(0,"Data Error - The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ",props):getNextAutoIncKey()})},IDBObjectStore.prototype.__insertData=function(tx,value,primaryKey,success,error){var paramMap={};primaryKey!==void 0&&(paramMap.key=idbModules.Key.encode(primaryKey));var indexes=JSON.parse(this.__storeProps.indexList);for(var key in indexes)try{paramMap[indexes[key].columnName]=idbModules.Key.encode(eval("value['"+indexes[key].keyPath+"']"))}catch(e){error(e)}var sqlStart=["INSERT INTO ",idbModules.util.quote(this.name),"("],sqlEnd=[" VALUES ("],sqlValues=[];for(key in paramMap)sqlStart.push(key+","),sqlEnd.push("?,"),sqlValues.push(paramMap[key]);sqlStart.push("value )"),sqlEnd.push("?)"),sqlValues.push(idbModules.Sca.encode(value));var sql=sqlStart.join(" ")+sqlEnd.join(" ");idbModules.DEBUG&&console.log("SQL for adding",sql,sqlValues),tx.executeSql(sql,sqlValues,function(){success(primaryKey)},function(e,t){error(t)})},IDBObjectStore.prototype.add=function(e,t){var n=this;return n.transaction.__addToTransactionQueue(function(o,i,r,s){n.__deriveKey(o,e,t,function(t){n.__insertData(o,e,t,r,s)})})},IDBObjectStore.prototype.put=function(e,t){var n=this;return n.transaction.__addToTransactionQueue(function(o,i,r,s){n.__deriveKey(o,e,t,function(t){var i="DELETE FROM "+idbModules.util.quote(n.name)+" where key = ?";o.executeSql(i,[idbModules.Key.encode(t)],function(o,i){idbModules.DEBUG&&console.log("Did the row with the",t,"exist? ",i.rowsAffected),n.__insertData(o,e,t,r,s)},function(e,t){s(t)})})})},IDBObjectStore.prototype.get=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("SELECT * FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Fetched data",t);try{if(0===t.rows.length)return i();i(idbModules.Sca.decode(t.rows.item(0).value))}catch(n){idbModules.DEBUG&&console.log(n),i(void 0)}},function(e,t){r(t)})})})},IDBObjectStore.prototype["delete"]=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("DELETE FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Deleted from database",t.rowsAffected),i()},function(e,t){r(t)})})})},IDBObjectStore.prototype.clear=function(){var e=this;return e.transaction.__addToTransactionQueue(function(t,n,o,i){e.__waitForReady(function(){t.executeSql("DELETE FROM "+idbModules.util.quote(e.name),[],function(e,t){idbModules.DEBUG&&console.log("Cleared all records from database",t.rowsAffected),o()},function(e,t){i(t)})})})},IDBObjectStore.prototype.count=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o="SELECT * FROM "+idbModules.util.quote(t.name)+(e!==void 0?" WHERE key = ?":""),s=[];e!==void 0&&s.push(idbModules.Key.encode(e)),n.executeSql(o,s,function(e,t){i(t.rows.length)},function(e,t){r(t)})})})},IDBObjectStore.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this,n,"key","value"),n},IDBObjectStore.prototype.index=function(e){var t=new idbModules.IDBIndex(e,this);return t},IDBObjectStore.prototype.createIndex=function(e,t,n){var o=this;n=n||{},o.__setReadyState("createIndex",!1);var i=new idbModules.IDBIndex(e,o);return o.__waitForReady(function(){i.__createIndex(e,t,n)},"createObjectStore"),o.indexNames.push(e),i},IDBObjectStore.prototype.deleteIndex=function(e){var t=new idbModules.IDBIndex(e,this,!1);return t.__deleteIndex(e),t},idbModules.IDBObjectStore=IDBObjectStore}(idbModules),function(e){var t=0,n=1,o=2,i=function(o,i,r){if("number"==typeof i)this.mode=i,2!==i&&e.DEBUG&&console.log("Mode should be a string, but was specified as ",i);else if("string"==typeof i)switch(i){case"readwrite":this.mode=n;break;case"readonly":this.mode=t;break;default:this.mode=t}this.storeNames="string"==typeof o?[o]:o;for(var s=0;this.storeNames.length>s;s++)r.objectStoreNames.contains(this.storeNames[s])||e.util.throwDOMException(0,"The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",this.storeNames[s]);this.__active=!0,this.__running=!1,this.__requests=[],this.__aborted=!1,this.db=r,this.error=null,this.onabort=this.onerror=this.oncomplete=null};i.prototype.__executeRequests=function(){if(this.__running&&this.mode!==o)return e.DEBUG&&console.log("Looks like the request set is already running",this.mode),void 0;this.__running=!0;var t=this;window.setTimeout(function(){2===t.mode||t.__active||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",t.__active),t.db.__db.transaction(function(n){function o(t,n){n&&(s.req=n),s.req.readyState="done",s.req.result=t,delete s.req.error;var o=e.Event("success");e.util.callback("onsuccess",s.req,o),a++,r()}function i(){s.req.readyState="done",s.req.error="DOMError";var t=e.Event("error",arguments);e.util.callback("onerror",s.req,t),a++,r()}function r(){return a>=t.__requests.length?(t.__active=!1,t.__requests=[],void 0):(s=t.__requests[a],s.op(n,s.args,o,i),void 0)}t.__tx=n;var s=null,a=0;try{r()}catch(u){e.DEBUG&&console.log("An exception occured in transaction",arguments),"function"==typeof t.onerror&&t.onerror()}},function(){e.DEBUG&&console.log("An error in transaction",arguments),"function"==typeof t.onerror&&t.onerror()},function(){e.DEBUG&&console.log("Transaction completed",arguments),"function"==typeof t.oncomplete&&t.oncomplete()})},1)},i.prototype.__addToTransactionQueue=function(t,n){this.__active||this.mode===o||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished.",this.__mode);var i=new e.IDBRequest;return i.source=this.db,this.__requests.push({op:t,args:n,req:i}),this.__executeRequests(),i},i.prototype.objectStore=function(t){return new e.IDBObjectStore(t,this)},i.prototype.abort=function(){!this.__active&&e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",this.__active)},i.prototype.READ_ONLY=0,i.prototype.READ_WRITE=1,i.prototype.VERSION_CHANGE=2,e.IDBTransaction=i}(idbModules),function(e){var t=function(t,n,o,i){this.__db=t,this.version=o,this.__storeProperties=i,this.objectStoreNames=new e.util.StringList;for(var r=0;i.rows.length>r;r++)this.objectStoreNames.push(i.rows.item(r).name);this.name=n,this.onabort=this.onerror=this.onversionchange=null};t.prototype.createObjectStore=function(t,n){var o=this;n=n||{},n.keyPath=n.keyPath||null;var i=new e.IDBObjectStore(t,o.__versionTransaction,!1),r=o.__versionTransaction;return r.__addToTransactionQueue(function(r,s,a){function u(){e.util.throwDOMException(0,"Could not create new object store",arguments)}o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction);var c=["CREATE TABLE",e.util.quote(t),"(key BLOB",n.autoIncrement?", inc INTEGER PRIMARY KEY AUTOINCREMENT":"PRIMARY KEY",", value BLOB)"].join(" ");e.DEBUG&&console.log(c),r.executeSql(c,[],function(e){e.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)",[t,n.keyPath,n.autoIncrement?!0:!1,"{}"],function(){i.__setReadyState("createObjectStore",!0),a(i)},u)},u)}),o.objectStoreNames.push(t),i},t.prototype.deleteObjectStore=function(t){var n=function(){e.util.throwDOMException(0,"Could not delete ObjectStore",arguments)},o=this;!o.objectStoreNames.contains(t)&&n("Object Store does not exist"),o.objectStoreNames.splice(o.objectStoreNames.indexOf(t),1);var i=o.__versionTransaction;i.__addToTransactionQueue(function(){o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction),o.__db.transaction(function(o){o.executeSql("SELECT * FROM __sys__ where name = ?",[t],function(o,i){i.rows.length>0&&o.executeSql("DROP TABLE "+e.util.quote(t),[],function(){o.executeSql("DELETE FROM __sys__ WHERE name = ?",[t],function(){},n)},n)})})})},t.prototype.close=function(){},t.prototype.transaction=function(t,n){var o=new e.IDBTransaction(t,n||1,this);return o},e.IDBDatabase=t}(idbModules),function(e){var t=4194304;if(window.openDatabase){var n=window.openDatabase("__sysdb__",1,"System Database",t);n.transaction(function(t){t.executeSql("SELECT * FROM dbVersions",[],function(){},function(){n.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);",[],function(){},function(){e.util.throwDOMException("Could not create table __sysdb__ to save DB versions")})})})},function(){e.DEBUG&&console.log("Error in sysdb transaction - when selecting from dbVersions",arguments)});var o={open:function(o,i){function r(){if(!u){var t=e.Event("error",arguments);a.readyState="done",a.error="DOMError",e.util.callback("onerror",a,t),u=!0}}function s(s){var u=window.openDatabase(o,1,o,t);a.readyState="done",i===void 0&&(i=s||1),(0>=i||s>i)&&e.util.throwDOMException(0,"An attempt was made to open a database using a lower version than the existing version.",i),u.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)",[],function(){t.executeSql("SELECT * FROM __sys__",[],function(t,c){var d=e.Event("success");a.source=a.result=new e.IDBDatabase(u,o,i,c),i>s?n.transaction(function(t){t.executeSql("UPDATE dbVersions set version = ? where name = ?",[i,o],function(){var t=e.Event("upgradeneeded");t.oldVersion=s,t.newVersion=i,a.transaction=a.result.__versionTransaction=new e.IDBTransaction([],2,a.source),e.util.callback("onupgradeneeded",a,t,function(){var t=e.Event("success");e.util.callback("onsuccess",a,t)})},r)},r):e.util.callback("onsuccess",a,d)},r)},r)},r)}var a=new e.IDBOpenRequest,u=!1;return n.transaction(function(e){e.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(e,t){0===t.rows.length?e.executeSql("INSERT INTO dbVersions VALUES (?,?)",[o,i||1],function(){s(0)},r):s(t.rows.item(0).version)},r)},r),a},deleteDatabase:function(o){function i(t){if(!a){s.readyState="done",s.error="DOMError";var n=e.Event("error");n.message=t,n.debug=arguments,e.util.callback("onerror",s,n),a=!0}}function r(){n.transaction(function(t){t.executeSql("DELETE FROM dbVersions where name = ? ",[o],function(){s.result=void 0;var t=e.Event("success");t.newVersion=null,t.oldVersion=u,e.util.callback("onsuccess",s,t)},i)},i)}var s=new e.IDBOpenRequest,a=!1,u=null;return n.transaction(function(n){n.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(n,a){if(0===a.rows.length){s.result=void 0;var c=e.Event("success");return c.newVersion=null,c.oldVersion=u,e.util.callback("onsuccess",s,c),void 0}u=a.rows.item(0).version;var d=window.openDatabase(o,1,o,t);d.transaction(function(t){t.executeSql("SELECT * FROM __sys__",[],function(t,n){var o=n.rows;(function s(n){n>=o.length?t.executeSql("DROP TABLE __sys__",[],function(){r()},i):t.executeSql("DROP TABLE "+e.util.quote(o.item(n).name),[],function(){s(n+1)},function(){s(n+1)})})(0)},function(){r()})},i)})},i),s},cmp:function(t,n){return e.Key.encode(t)>e.Key.encode(n)?1:t===n?0:-1}};e.shimIndexedDB=o}}(idbModules),function(e,t){e.openDatabase!==void 0&&(e.shimIndexedDB=t.shimIndexedDB,e.shimIndexedDB&&(e.shimIndexedDB.__useShim=function(){e.indexedDB=t.shimIndexedDB,e.IDBDatabase=t.IDBDatabase,e.IDBTransaction=t.IDBTransaction,e.IDBCursor=t.IDBCursor,e.IDBKeyRange=t.IDBKeyRange},e.shimIndexedDB.__debug=function(e){t.DEBUG=e})),e.indexedDB=e.indexedDB||e.webkitIndexedDB||e.mozIndexedDB||e.oIndexedDB||e.msIndexedDB,e.indexedDB===void 0&&e.openDatabase!==void 0?e.shimIndexedDB.__useShim():(e.IDBDatabase=e.IDBDatabase||e.webkitIDBDatabase,e.IDBTransaction=e.IDBTransaction||e.webkitIDBTransaction,e.IDBCursor=e.IDBCursor||e.webkitIDBCursor,e.IDBKeyRange=e.IDBKeyRange||e.webkitIDBKeyRange,e.IDBTransaction||(e.IDBTransaction={}),e.IDBTransaction.READ_ONLY=e.IDBTransaction.READ_ONLY||"readonly",e.IDBTransaction.READ_WRITE=e.IDBTransaction.READ_WRITE||"readwrite")}(window,idbModules);


/*
 * Binary Ajax 0.1.10
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */


var BinaryFile = function(strData, iDataOffset, iDataLength) {
  var data = strData;
  var dataOffset = iDataOffset || 0;
  var dataLength = 0;

  this.getRawData = function() {
    return data;
  }

  if (typeof strData == "string") {
    dataLength = iDataLength || data.length;

    this.getByteAt = function(iOffset) {
      return data.charCodeAt(iOffset + dataOffset) & 0xFF;
    }
    
    this.getBytesAt = function(iOffset, iLength) {
      var aBytes = [];
      
      for (var i = 0; i < iLength; i++) {
        aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF
      };
      
      return aBytes;
    }
  } else if (typeof strData == "unknown") {
    dataLength = iDataLength || IEBinary_getLength(data);

    this.getByteAt = function(iOffset) {
      return IEBinary_getByteAt(data, iOffset + dataOffset);
    }

    this.getBytesAt = function(iOffset, iLength) {
      return new VBArray(IEBinary_getBytesAt(data, iOffset + dataOffset, iLength)).toArray();
    }
  }

  this.getLength = function() {
    return dataLength;
  }

  this.getSByteAt = function(iOffset) {
    var iByte = this.getByteAt(iOffset);
    if (iByte > 127)
      return iByte - 256;
    else
      return iByte;
  }

  this.getShortAt = function(iOffset, bBigEndian) {
    var iShort = bBigEndian ? 
      (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
      : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
    if (iShort < 0) iShort += 65536;
    return iShort;
  }
  this.getSShortAt = function(iOffset, bBigEndian) {
    var iUShort = this.getShortAt(iOffset, bBigEndian);
    if (iUShort > 32767)
      return iUShort - 65536;
    else
      return iUShort;
  }
  this.getLongAt = function(iOffset, bBigEndian) {
    var iByte1 = this.getByteAt(iOffset),
      iByte2 = this.getByteAt(iOffset + 1),
      iByte3 = this.getByteAt(iOffset + 2),
      iByte4 = this.getByteAt(iOffset + 3);

    var iLong = bBigEndian ? 
      (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
      : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
    if (iLong < 0) iLong += 4294967296;
    return iLong;
  }
  this.getSLongAt = function(iOffset, bBigEndian) {
    var iULong = this.getLongAt(iOffset, bBigEndian);
    if (iULong > 2147483647)
      return iULong - 4294967296;
    else
      return iULong;
  }

  this.getStringAt = function(iOffset, iLength) {
    var aStr = [];
    
    var aBytes = this.getBytesAt(iOffset, iLength);
    for (var j=0; j < iLength; j++) {
      aStr[j] = String.fromCharCode(aBytes[j]);
    }
    return aStr.join("");
  }
  
  this.getCharAt = function(iOffset) {
    return String.fromCharCode(this.getByteAt(iOffset));
  }
  this.toBase64 = function() {
    return window.btoa(data);
  }
  this.fromBase64 = function(strBase64) {
    data = window.atob(strBase64);
  }
}


var BinaryAjax = (function() {

  function createRequest() {
    var oHTTP = null;
    if (window.ActiveXObject) {
      oHTTP = new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
      oHTTP = new XMLHttpRequest();
    }
    return oHTTP;
  }

  function getHead(strURL, fncCallback, fncError) {
    var oHTTP = createRequest();
    if (oHTTP) {
      if (fncCallback) {
        if (typeof(oHTTP.onload) != "undefined") {
          oHTTP.onload = function() {
            if (oHTTP.status == "200") {
              fncCallback(this);
            } else {
              if (fncError) fncError();
            }
            oHTTP = null;
          };
        } else {
          oHTTP.onreadystatechange = function() {
            if (oHTTP.readyState == 4) {
              if (oHTTP.status == "200") {
                fncCallback(this);
              } else {
                if (fncError) fncError();
              }
              oHTTP = null;
            }
          };
        }
      }
      oHTTP.open("HEAD", strURL, true);
      oHTTP.send(null);
    } else {
      if (fncError) fncError();
    }
  }

  function sendRequest(strURL, fncCallback, fncError, aRange, bAcceptRanges, iFileSize) {
    var oHTTP = createRequest();
    if (oHTTP) {

      var iDataOffset = 0;
      if (aRange && !bAcceptRanges) {
        iDataOffset = aRange[0];
      }
      var iDataLen = 0;
      if (aRange) {
        iDataLen = aRange[1]-aRange[0]+1;
      }

      if (fncCallback) {
        if (typeof(oHTTP.onload) != "undefined") {
          oHTTP.onload = function() {
            if (oHTTP.status == "200" || oHTTP.status == "206" || oHTTP.status == "0") {
              oHTTP.binaryResponse = new BinaryFile(oHTTP.responseText, iDataOffset, iDataLen);
              oHTTP.fileSize = iFileSize || oHTTP.getResponseHeader("Content-Length");
              fncCallback(oHTTP);
            } else {
              if (fncError) fncError();
            }
            oHTTP = null;
          };
        } else {
          oHTTP.onreadystatechange = function() {
            if (oHTTP.readyState == 4) {
              if (oHTTP.status == "200" || oHTTP.status == "206" || oHTTP.status == "0") {
                // IE6 craps if we try to extend the XHR object
                var oRes = {
                  status : oHTTP.status,
                  // IE needs responseBody, Chrome/Safari needs responseText
                  binaryResponse : new BinaryFile(
                    typeof oHTTP.responseBody == "unknown" ? oHTTP.responseBody : oHTTP.responseText, iDataOffset, iDataLen
                  ),
                  fileSize : iFileSize || oHTTP.getResponseHeader("Content-Length")
                };
                fncCallback(oRes);
              } else {
                if (fncError) fncError();
              }
              oHTTP = null;
            }
          };
        }
      }
      oHTTP.open("GET", strURL, true);

      if (oHTTP.overrideMimeType) oHTTP.overrideMimeType('text/plain; charset=x-user-defined');

      if (aRange && bAcceptRanges) {
        oHTTP.setRequestHeader("Range", "bytes=" + aRange[0] + "-" + aRange[1]);
      }

      oHTTP.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 1970 00:00:00 GMT");

      oHTTP.send(null);
    } else {
      if (fncError) fncError();
    }
  }

  return function(strURL, fncCallback, fncError, aRange) {

    if (aRange) {
      getHead(
        strURL, 
        function(oHTTP) {
          var iLength = parseInt(oHTTP.getResponseHeader("Content-Length"),10);
          var strAcceptRanges = oHTTP.getResponseHeader("Accept-Ranges");

          var iStart, iEnd;
          iStart = aRange[0];
          if (aRange[0] < 0) 
            iStart += iLength;
          iEnd = iStart + aRange[1] - 1;

          sendRequest(strURL, fncCallback, fncError, [iStart, iEnd], (strAcceptRanges == "bytes"), iLength);
        }
      );

    } else {
      sendRequest(strURL, fncCallback, fncError);
    }
  }

}());

/*
document.write(
  "<script type='text/vbscript'>\r\n"
  + "Function IEBinary_getByteAt(strBinary, iOffset)\r\n"
  + " IEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\n"
  + "End Function\r\n"
  + "Function IEBinary_getLength(strBinary)\r\n"
  + " IEBinary_getLength = LenB(strBinary)\r\n"
  + "End Function\r\n"
  + "</script>\r\n"
);
*/

document.write(
  "<script type='text/vbscript'>\r\n"
  + "Function IEBinary_getByteAt(strBinary, iOffset)\r\n"
  + " IEBinary_getByteAt = AscB(MidB(strBinary, iOffset + 1, 1))\r\n"
  + "End Function\r\n"
  + "Function IEBinary_getBytesAt(strBinary, iOffset, iLength)\r\n"
  + "  Dim aBytes()\r\n"
  + "  ReDim aBytes(iLength - 1)\r\n"
  + "  For i = 0 To iLength - 1\r\n"
  + "   aBytes(i) = IEBinary_getByteAt(strBinary, iOffset + i)\r\n"  
  + "  Next\r\n"
  + "  IEBinary_getBytesAt = aBytes\r\n" 
  + "End Function\r\n"
  + "Function IEBinary_getLength(strBinary)\r\n"
  + " IEBinary_getLength = LenB(strBinary)\r\n"
  + "End Function\r\n"
  + "</script>\r\n"
);

(function ( window , undefined ) {
    'use strict';
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange,
        transactionModes = {
            readonly: 'readonly',
            readwrite: 'readwrite'
        };
        
    var hasOwn = Object.prototype.hasOwnProperty;

    if ( !indexedDB ) {
        throw 'IndexedDB required';
    }

    var CallbackList = function () {
        var state,
            list = [];

        var exec = function ( context , args ) {
            if ( list ) {
                args = args || [];
                state = state || [ context , args ];

                for ( var i = 0 , il = list.length ; i < il ; i++ ) {
                    list[ i ].apply( state[ 0 ] , state[ 1 ] );
                }

                list = [];
            }
        };

        this.add = function () {
            for ( var i = 0 , il = arguments.length ; i < il ; i ++ ) {
                list.push( arguments[ i ] );
            }

            if ( state ) {
                exec();
            }

            return this;
        };

        this.execute = function () {
            exec( this , arguments );
            return this;
        };
    };

    var Deferred = function ( func ) {
        var state = 'progress',
            actions = [
                [ 'resolve' , 'done' , new CallbackList() , 'resolved' ],
                [ 'reject' , 'fail' , new CallbackList() , 'rejected' ],
                [ 'notify' , 'progress' , new CallbackList() ],
            ],
            deferred = {},
            promise = {
                state: function () {
                    return state;
                },
                then: function ( /* doneHandler , failedHandler , progressHandler */ ) {
                    var handlers = arguments;

                    return Deferred(function ( newDefer ) {
                        actions.forEach(function ( action , i ) {
                            var handler = handlers[ i ];

                            deferred[ action[ 1 ] ]( typeof handler === 'function' ?
                                function () {
                                    var returned = handler.apply( this , arguments );

                                    if ( returned && typeof returned.promise === 'function' ) {
                                        returned.promise()
                                            .done( newDefer.resolve )
                                            .fail( newDefer.reject )
                                            .progress( newDefer.notify );
                                    }
                                } : newDefer[ action[ 0 ] ]
                            );
                        });
                    }).promise();
                },
                promise: function ( obj ) {
                    if ( obj ) {
                        Object.keys( promise )
                            .forEach(function ( key ) {
                                obj[ key ] = promise[ key ];
                            });

                        return obj;
                    }
                    return promise;
                }
            };

        actions.forEach(function ( action , i ) {
            var list = action[ 2 ],
                actionState = action[ 3 ];

            promise[ action[ 1 ] ] = list.add;

            if ( actionState ) {
                list.add(function () {
                    state = actionState;
                });
            }

            deferred[ action[ 0 ] ] = list.execute;
        });

        promise.promise( deferred );

        if ( func ) {
            func.call( deferred , deferred );
        }

        return deferred;
    };

    var Server = function ( db , name ) {
        var that = this,
            closed = false;

        this.add = function( table ) {
            if ( closed ) {
                throw 'Database has been closed';
            }

            var records = [];
            for (var i = 0; i < arguments.length - 1; i++) {
                records[i] = arguments[i + 1];
            }

            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                deferred = Deferred();
            
            records.forEach( function ( record ) {
                var req;
                if ( record.item && record.key ) {
                    var key = record.key;
                    record = record.item;
                    req = store.add( record , key );
                } else {
                    req = store.add( record );
                }

                req.onsuccess = function ( e ) {
                    var target = e.target;
                    var keyPath = target.source.keyPath;
                    if ( keyPath === null ) {
                        keyPath = '__id__';
                    }
                    Object.defineProperty( record , keyPath , {
                        value: target.result,
                        enumerable: true
                    });
                    deferred.notify();
                };
            } );
            
            transaction.oncomplete = function () {
                deferred.resolve( records , that );
            };
            transaction.onerror = function ( e ) {
                deferred.reject( records , e );
            };
            transaction.onabort = function ( e ) {
                deferred.reject( records , e );
            };
            return deferred.promise();
        };

        this.update = function( table ) {
            if ( closed ) {
                throw 'Database has been closed';
            }

            var records = [];
            for ( var i = 0 ; i < arguments.length - 1 ; i++ ) {
                records[ i ] = arguments[ i + 1 ];
            }

            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                keyPath = store.keyPath,
                deferred = Deferred();

            records.forEach( function ( record ) {
                var req;
                if ( record.item && record.key ) {
                    var key = record.key;
                    record = record.item;
                    req = store.put( record , key );
                } else {
                    req = store.put( record );
                }

                req.onsuccess = function ( e ) {
                    deferred.notify();
                };
            } );
            
            transaction.oncomplete = function () {
                deferred.resolve( records , that );
            };
            transaction.onerror = function ( e ) {
                deferred.reject( records , e );
            };
            transaction.onabort = function ( e ) {
                deferred.reject( records , e );
            };
            return deferred.promise();
        };
        
        this.remove = function ( table , key ) {
            if ( closed ) {
                throw 'Database has been closed';
            }
            var transaction = db.transaction( table , transactionModes.readwrite ),
                store = transaction.objectStore( table ),
                deferred = Deferred();
            
            var req = store.delete( key );
            req.onsuccess = function ( ) {
                deferred.resolve( key );
            };
            req.onerror = function ( e ) {
                deferred.reject( e );
            };
            return deferred.promise();
        };
        
        this.close = function ( ) {
            if ( closed ) {
                throw 'Database has been closed';
            }
            db.close();
            closed = true;
            delete dbCache[ name ];
        };

        this.get = function ( table , id ) {
            if ( closed ) {
                throw 'Database has been closed';
            }
            var transaction = db.transaction( table ),
                store = transaction.objectStore( table ),
                deferred = Deferred();

            var req = store.get( id );
            req.onsuccess = function ( e ) {
                deferred.resolve( e.target.result );
            };
            req.onerror = function ( e ) {
                deferred.reject( e );
            };
            return deferred.promise();
        };

        this.query = function ( table , index ) {
            if ( closed ) {
                throw 'Database has been closed';
            }
            return new IndexQuery( table , db , index );
        };

        for ( var i = 0 , il = db.objectStoreNames.length ; i < il ; i++ ) {
            (function ( storeName ) {
                that[ storeName ] = { };
                for ( var i in that ) {
                    if ( !hasOwn.call( that , i ) || i === 'close' ) {
                        continue;
                    }
                    that[ storeName ][ i ] = (function ( i ) {
                        return function () {
                            var args = [ storeName ].concat( [].slice.call( arguments , 0 ) );
                            return that[ i ].apply( that , args );
                        };
                    })( i );
                }
            })( db.objectStoreNames[ i ] );
        }
    };

    var IndexQuery = function ( table , db , indexName ) {
        var that = this;
        var runQuery = function ( type, args , cursorType , direction ) {
            var transaction = db.transaction( table ),
                store = transaction.objectStore( table ),
                index = indexName ? store.index( indexName ) : store,
                keyRange = type ? IDBKeyRange[ type ].apply( null, args ) : null,
                results = [],
                deferred = Deferred(),
                indexArgs = [ keyRange ];

            if ( cursorType !== 'count' ) {
                indexArgs.push( direction || 'next' );
            };

            index[cursorType].apply( index , indexArgs ).onsuccess = function ( e ) {
                var cursor = e.target.result;

                if ( typeof cursor === typeof 0 ) {
                    results = cursor;
                } else if ( cursor ) {
                    results.push( 'value' in cursor ? cursor.value : cursor.key );
                    cursor.continue();
                }
            };

            transaction.oncomplete = function () {
                deferred.resolve( results );
            };
            transaction.onerror = function ( e ) {
                deferred.reject( e );
            };
            transaction.onabort = function ( e ) {
                deferred.reject( e );
            };
            return deferred.promise();
        };

        var Query = function ( type , args ) {
            var direction = 'next',
                cursorType = 'openCursor',
                filters = [],
                unique = false;

            var execute = function () {
                var deferred = Deferred();
                
                runQuery( type , args , cursorType , unique ? direction + 'unique' : direction )
                    .then( function ( data ) {
                        if ( data.constructor === Array ) {
                            filters.forEach( function ( filter ) {
                                if ( !filter || !filter.length ) {
                                    return;
                                }

                                if ( filter.length === 2 ) {
                                    data = data.filter( function ( x ) {
                                        return x[ filter[ 0 ] ] === filter[ 1 ];
                                    });
                                } else {
                                    data = data.filter( filter[ 0 ] );
                                }
                            });
                        }
                        deferred.resolve( data );
                    }, deferred.reject , deferred.notify );
                ;

                return deferred.promise();
            };
            var count = function () {
                direction = null;
                cursorType = 'count';

                return {
                    execute: execute
                };
            };
            var keys = function () {
                cursorType = 'openKeyCursor';

                return {
                    desc: desc,
                    execute: execute,
                    filter: filter,
                    distinct: distinct
                };
            };
            var filter = function ( ) {
                filters.push( Array.prototype.slice.call( arguments , 0 , 2 ) );

                return {
                    keys: keys,
                    execute: execute,
                    filter: filter,
                    desc: desc,
                    distinct: distinct
                };
            };
            var desc = function () {
                direction = 'prev';

                return {
                    keys: keys,
                    execute: execute,
                    filter: filter,
                    distinct: distinct
                };
            };
            var distinct = function () {
                unique = true;
                return {
                    keys: keys,
                    count: count,
                    execute: execute,
                    filter: filter,
                    desc: desc
                };
            };

            return {
                execute: execute,
                count: count,
                keys: keys,
                filter: filter,
                desc: desc,
                distinct: distinct
            };
        };
        
        'only bound upperBound lowerBound'.split(' ').forEach(function (name) {
            that[name] = function () {
                return new Query( name , arguments );
            };
        });

        this.filter = function () {
            var query = new Query( null , null );
            return query.filter.apply( query , arguments );
        };

        this.all = function () {
            return this.filter();
        };
    };
    
    var createSchema = function ( e , schema , db ) {
        if ( typeof schema === 'function' ) {
            schema = schema();
        }
        
        for ( var tableName in schema ) {
            var table = schema[ tableName ];
            if ( !hasOwn.call( schema , tableName ) ) {
                continue;
            }

            var store = db.createObjectStore( tableName , table.key );

            for ( var indexKey in table.indexes ) {
                var index = table.indexes[ indexKey ];
                store.createIndex( indexKey , index.key || indexKey , Object.keys(index).length ? index : { unique: false } );
            }
        }
    };
    
    var open = function ( e , server , version , schema ) {
        var db = e.target.result;
        var s = new Server( db , server );
        var upgrade;

        var deferred = Deferred();
        deferred.resolve( s );
        dbCache[ server ] = db;

        return deferred.promise();
    };

    var dbCache = {};

    var db = {
        version: '0.8.0',
        open: function ( options ) {
            var request;

            var deferred = Deferred();

            if ( dbCache[ options.server ] ) {
                open( {
                    target: {
                        result: dbCache[ options.server ]
                    }
                } , options.server , options.version , options.schema )
                .done(deferred.resolve)
                .fail(deferred.reject)
                .progress(deferred.notify);
            } else {
                request = indexedDB.open( options.server , options.version );
                            
                request.onsuccess = function ( e ) {
                    open( e , options.server , options.version , options.schema )
                        .done(deferred.resolve)
                        .fail(deferred.reject)
                        .progress(deferred.notify);
                };
            
                request.onupgradeneeded = function ( e ) {
                    createSchema( e , options.schema , e.target.result );
                };
                request.onerror = function ( e ) {
                    deferred.reject( e );
                };
            }

            return deferred.promise();
        }
    };
    if ( typeof define === 'function' && define.amd ) {
        define( function() { return db; } );
    } else {
        window.db = db;
    }
})( window );
/*
 * Javascript EXIF Reader 0.1.4
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */


var EXIF = {};

(function() {

var bDebug = false;

EXIF.Tags = {

  // version tags
  0x9000 : "ExifVersion",     // EXIF version
  0xA000 : "FlashpixVersion",   // Flashpix format version

  // colorspace tags
  0xA001 : "ColorSpace",      // Color space information tag

  // image configuration
  0xA002 : "PixelXDimension",   // Valid width of meaningful image
  0xA003 : "PixelYDimension",   // Valid height of meaningful image
  0x9101 : "ComponentsConfiguration", // Information about channels
  0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

  // user information
  0x927C : "MakerNote",     // Any desired information written by the manufacturer
  0x9286 : "UserComment",     // Comments by user

  // related file
  0xA004 : "RelatedSoundFile",    // Name of related sound file

  // date and time
  0x9003 : "DateTimeOriginal",    // Date and time when the original image was generated
  0x9004 : "DateTimeDigitized",   // Date and time when the image was stored digitally
  0x9290 : "SubsecTime",      // Fractions of seconds for DateTime
  0x9291 : "SubsecTimeOriginal",    // Fractions of seconds for DateTimeOriginal
  0x9292 : "SubsecTimeDigitized",   // Fractions of seconds for DateTimeDigitized

  // picture-taking conditions
  0x829A : "ExposureTime",    // Exposure time (in seconds)
  0x829D : "FNumber",     // F number
  0x8822 : "ExposureProgram",   // Exposure program
  0x8824 : "SpectralSensitivity",   // Spectral sensitivity
  0x8827 : "ISOSpeedRatings",   // ISO speed rating
  0x8828 : "OECF",      // Optoelectric conversion factor
  0x9201 : "ShutterSpeedValue",   // Shutter speed
  0x9202 : "ApertureValue",   // Lens aperture
  0x9203 : "BrightnessValue",   // Value of brightness
  0x9204 : "ExposureBias",    // Exposure bias
  0x9205 : "MaxApertureValue",    // Smallest F number of lens
  0x9206 : "SubjectDistance",   // Distance to subject in meters
  0x9207 : "MeteringMode",    // Metering mode
  0x9208 : "LightSource",     // Kind of light source
  0x9209 : "Flash",     // Flash status
  0x9214 : "SubjectArea",     // Location and area of main subject
  0x920A : "FocalLength",     // Focal length of the lens in mm
  0xA20B : "FlashEnergy",     // Strobe energy in BCPS
  0xA20C : "SpatialFrequencyResponse",  // 
  0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
  0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
  0xA210 : "FocalPlaneResolutionUnit",  // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
  0xA214 : "SubjectLocation",   // Location of subject in image
  0xA215 : "ExposureIndex",   // Exposure index selected on camera
  0xA217 : "SensingMethod",     // Image sensor type
  0xA300 : "FileSource",      // Image source (3 == DSC)
  0xA301 : "SceneType",       // Scene type (1 == directly photographed)
  0xA302 : "CFAPattern",      // Color filter array geometric pattern
  0xA401 : "CustomRendered",    // Special processing
  0xA402 : "ExposureMode",    // Exposure mode
  0xA403 : "WhiteBalance",    // 1 = auto white balance, 2 = manual
  0xA404 : "DigitalZoomRation",   // Digital zoom ratio
  0xA405 : "FocalLengthIn35mmFilm", // Equivalent foacl length assuming 35mm film camera (in mm)
  0xA406 : "SceneCaptureType",    // Type of scene
  0xA407 : "GainControl",     // Degree of overall image gain adjustment
  0xA408 : "Contrast",      // Direction of contrast processing applied by camera
  0xA409 : "Saturation",      // Direction of saturation processing applied by camera
  0xA40A : "Sharpness",     // Direction of sharpness processing applied by camera
  0xA40B : "DeviceSettingDescription",  // 
  0xA40C : "SubjectDistanceRange",  // Distance to subject

  // other tags
  0xA005 : "InteroperabilityIFDPointer",
  0xA420 : "ImageUniqueID"    // Identifier assigned uniquely to each image
};

EXIF.TiffTags = {
  0x0100 : "ImageWidth",
  0x0101 : "ImageHeight",
  0x8769 : "ExifIFDPointer",
  0x8825 : "GPSInfoIFDPointer",
  0xA005 : "InteroperabilityIFDPointer",
  0x0102 : "BitsPerSample",
  0x0103 : "Compression",
  0x0106 : "PhotometricInterpretation",
  0x0112 : "Orientation",
  0x0115 : "SamplesPerPixel",
  0x011C : "PlanarConfiguration",
  0x0212 : "YCbCrSubSampling",
  0x0213 : "YCbCrPositioning",
  0x011A : "XResolution",
  0x011B : "YResolution",
  0x0128 : "ResolutionUnit",
  0x0111 : "StripOffsets",
  0x0116 : "RowsPerStrip",
  0x0117 : "StripByteCounts",
  0x0201 : "JPEGInterchangeFormat",
  0x0202 : "JPEGInterchangeFormatLength",
  0x012D : "TransferFunction",
  0x013E : "WhitePoint",
  0x013F : "PrimaryChromaticities",
  0x0211 : "YCbCrCoefficients",
  0x0214 : "ReferenceBlackWhite",
  0x0132 : "DateTime",
  0x010E : "ImageDescription",
  0x010F : "Make",
  0x0110 : "Model",
  0x0131 : "Software",
  0x013B : "Artist",
  0x8298 : "Copyright"
}

EXIF.GPSTags = {
  0x0000 : "GPSVersionID",
  0x0001 : "GPSLatitudeRef",
  0x0002 : "GPSLatitude",
  0x0003 : "GPSLongitudeRef",
  0x0004 : "GPSLongitude",
  0x0005 : "GPSAltitudeRef",
  0x0006 : "GPSAltitude",
  0x0007 : "GPSTimeStamp",
  0x0008 : "GPSSatellites",
  0x0009 : "GPSStatus",
  0x000A : "GPSMeasureMode",
  0x000B : "GPSDOP",
  0x000C : "GPSSpeedRef",
  0x000D : "GPSSpeed",
  0x000E : "GPSTrackRef",
  0x000F : "GPSTrack",
  0x0010 : "GPSImgDirectionRef",
  0x0011 : "GPSImgDirection",
  0x0012 : "GPSMapDatum",
  0x0013 : "GPSDestLatitudeRef",
  0x0014 : "GPSDestLatitude",
  0x0015 : "GPSDestLongitudeRef",
  0x0016 : "GPSDestLongitude",
  0x0017 : "GPSDestBearingRef",
  0x0018 : "GPSDestBearing",
  0x0019 : "GPSDestDistanceRef",
  0x001A : "GPSDestDistance",
  0x001B : "GPSProcessingMethod",
  0x001C : "GPSAreaInformation",
  0x001D : "GPSDateStamp",
  0x001E : "GPSDifferential"
}

EXIF.StringValues = {
  ExposureProgram : {
    0 : "Not defined",
    1 : "Manual",
    2 : "Normal program",
    3 : "Aperture priority",
    4 : "Shutter priority",
    5 : "Creative program",
    6 : "Action program",
    7 : "Portrait mode",
    8 : "Landscape mode"
  },
  MeteringMode : {
    0 : "Unknown",
    1 : "Average",
    2 : "CenterWeightedAverage",
    3 : "Spot",
    4 : "MultiSpot",
    5 : "Pattern",
    6 : "Partial",
    255 : "Other"
  },
  LightSource : {
    0 : "Unknown",
    1 : "Daylight",
    2 : "Fluorescent",
    3 : "Tungsten (incandescent light)",
    4 : "Flash",
    9 : "Fine weather",
    10 : "Cloudy weather",
    11 : "Shade",
    12 : "Daylight fluorescent (D 5700 - 7100K)",
    13 : "Day white fluorescent (N 4600 - 5400K)",
    14 : "Cool white fluorescent (W 3900 - 4500K)",
    15 : "White fluorescent (WW 3200 - 3700K)",
    17 : "Standard light A",
    18 : "Standard light B",
    19 : "Standard light C",
    20 : "D55",
    21 : "D65",
    22 : "D75",
    23 : "D50",
    24 : "ISO studio tungsten",
    255 : "Other"
  },
  Flash : {
    0x0000 : "Flash did not fire",
    0x0001 : "Flash fired",
    0x0005 : "Strobe return light not detected",
    0x0007 : "Strobe return light detected",
    0x0009 : "Flash fired, compulsory flash mode",
    0x000D : "Flash fired, compulsory flash mode, return light not detected",
    0x000F : "Flash fired, compulsory flash mode, return light detected",
    0x0010 : "Flash did not fire, compulsory flash mode",
    0x0018 : "Flash did not fire, auto mode",
    0x0019 : "Flash fired, auto mode",
    0x001D : "Flash fired, auto mode, return light not detected",
    0x001F : "Flash fired, auto mode, return light detected",
    0x0020 : "No flash function",
    0x0041 : "Flash fired, red-eye reduction mode",
    0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
    0x0047 : "Flash fired, red-eye reduction mode, return light detected",
    0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
    0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
    0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
    0x0059 : "Flash fired, auto mode, red-eye reduction mode",
    0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
    0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
  },
  SensingMethod : {
    1 : "Not defined",
    2 : "One-chip color area sensor",
    3 : "Two-chip color area sensor",
    4 : "Three-chip color area sensor",
    5 : "Color sequential area sensor",
    7 : "Trilinear sensor",
    8 : "Color sequential linear sensor"
  },
  SceneCaptureType : {
    0 : "Standard",
    1 : "Landscape",
    2 : "Portrait",
    3 : "Night scene"
  },
  SceneType : {
    1 : "Directly photographed"
  },
  CustomRendered : {
    0 : "Normal process",
    1 : "Custom process"
  },
  WhiteBalance : {
    0 : "Auto white balance",
    1 : "Manual white balance"
  },
  GainControl : {
    0 : "None",
    1 : "Low gain up",
    2 : "High gain up",
    3 : "Low gain down",
    4 : "High gain down"
  },
  Contrast : {
    0 : "Normal",
    1 : "Soft",
    2 : "Hard"
  },
  Saturation : {
    0 : "Normal",
    1 : "Low saturation",
    2 : "High saturation"
  },
  Sharpness : {
    0 : "Normal",
    1 : "Soft",
    2 : "Hard"
  },
  SubjectDistanceRange : {
    0 : "Unknown",
    1 : "Macro",
    2 : "Close view",
    3 : "Distant view"
  },
  FileSource : {
    3 : "DSC"
  },

  Components : {
    0 : "",
    1 : "Y",
    2 : "Cb",
    3 : "Cr",
    4 : "R",
    5 : "G",
    6 : "B"
  }
}

function addEvent(oElement, strEvent, fncHandler) 
{
  if (oElement.addEventListener) { 
    oElement.addEventListener(strEvent, fncHandler, false); 
  } else if (oElement.attachEvent) { 
    oElement.attachEvent("on" + strEvent, fncHandler); 
  }
}


function imageHasData(oImg) 
{
  return !!(oImg.exifdata);
}

function getImageData(oImg, fncCallback) 
{
  BinaryAjax(
    oImg.src,
    function(oHTTP) {
      var oEXIF = findEXIFinJPEG(oHTTP.binaryResponse);
      oImg.exifdata = oEXIF || {};
      if (fncCallback) fncCallback();
    }
  )
}

function findEXIFinJPEG(oFile) {
  var aMarkers = [];

  if (oFile.getByteAt(0) != 0xFF || oFile.getByteAt(1) != 0xD8) {
    return false; // not a valid jpeg
  }

  var iOffset = 2;
  var iLength = oFile.getLength();
  while (iOffset < iLength) {
    if (oFile.getByteAt(iOffset) != 0xFF) {
      if (bDebug) console.log("Not a valid marker at offset " + iOffset + ", found: " + oFile.getByteAt(iOffset));
      return false; // not a valid marker, something is wrong
    }

    var iMarker = oFile.getByteAt(iOffset+1);

    // we could implement handling for other markers here, 
    // but we're only looking for 0xFFE1 for EXIF data

    if (iMarker == 22400) {
      if (bDebug) console.log("Found 0xFFE1 marker");
      return readEXIFData(oFile, iOffset + 4, oFile.getShortAt(iOffset+2, true)-2);
      iOffset += 2 + oFile.getShortAt(iOffset+2, true);

    } else if (iMarker == 225) {
      // 0xE1 = Application-specific 1 (for EXIF)
      if (bDebug) console.log("Found 0xFFE1 marker");
      return readEXIFData(oFile, iOffset + 4, oFile.getShortAt(iOffset+2, true)-2);

    } else {
      iOffset += 2 + oFile.getShortAt(iOffset+2, true);
    }

  }

}


function readTags(oFile, iTIFFStart, iDirStart, oStrings, bBigEnd) 
{
  var iEntries = oFile.getShortAt(iDirStart, bBigEnd);
  var oTags = {};
  for (var i=0;i<iEntries;i++) {
    var iEntryOffset = iDirStart + i*12 + 2;
    var strTag = oStrings[oFile.getShortAt(iEntryOffset, bBigEnd)];
    if (!strTag && bDebug) console.log("Unknown tag: " + oFile.getShortAt(iEntryOffset, bBigEnd));
    oTags[strTag] = readTagValue(oFile, iEntryOffset, iTIFFStart, iDirStart, bBigEnd);
  }
  return oTags;
}


function readTagValue(oFile, iEntryOffset, iTIFFStart, iDirStart, bBigEnd)
{
  var iType = oFile.getShortAt(iEntryOffset+2, bBigEnd);
  var iNumValues = oFile.getLongAt(iEntryOffset+4, bBigEnd);
  var iValueOffset = oFile.getLongAt(iEntryOffset+8, bBigEnd) + iTIFFStart;

  switch (iType) {
    case 1: // byte, 8-bit unsigned int
    case 7: // undefined, 8-bit byte, value depending on field
      if (iNumValues == 1) {
        return oFile.getByteAt(iEntryOffset + 8, bBigEnd);
      } else {
        var iValOffset = iNumValues > 4 ? iValueOffset : (iEntryOffset + 8);
        var aVals = [];
        for (var n=0;n<iNumValues;n++) {
          aVals[n] = oFile.getByteAt(iValOffset + n);
        }
        return aVals;
      }
      break;

    case 2: // ascii, 8-bit byte
      var iStringOffset = iNumValues > 4 ? iValueOffset : (iEntryOffset + 8);
      return oFile.getStringAt(iStringOffset, iNumValues-1);
      break;

    case 3: // short, 16 bit int
      if (iNumValues == 1) {
        return oFile.getShortAt(iEntryOffset + 8, bBigEnd);
      } else {
        var iValOffset = iNumValues > 2 ? iValueOffset : (iEntryOffset + 8);
        var aVals = [];
        for (var n=0;n<iNumValues;n++) {
          aVals[n] = oFile.getShortAt(iValOffset + 2*n, bBigEnd);
        }
        return aVals;
      }
      break;

    case 4: // long, 32 bit int
      if (iNumValues == 1) {
        return oFile.getLongAt(iEntryOffset + 8, bBigEnd);
      } else {
        var aVals = [];
        for (var n=0;n<iNumValues;n++) {
          aVals[n] = oFile.getLongAt(iValueOffset + 4*n, bBigEnd);
        }
        return aVals;
      }
      break;
    case 5: // rational = two long values, first is numerator, second is denominator
      if (iNumValues == 1) {
        return oFile.getLongAt(iValueOffset, bBigEnd) / oFile.getLongAt(iValueOffset+4, bBigEnd);
      } else {
        var aVals = [];
        for (var n=0;n<iNumValues;n++) {
          aVals[n] = oFile.getLongAt(iValueOffset + 8*n, bBigEnd) / oFile.getLongAt(iValueOffset+4 + 8*n, bBigEnd);
        }
        return aVals;
      }
      break;
    case 9: // slong, 32 bit signed int
      if (iNumValues == 1) {
        return oFile.getSLongAt(iEntryOffset + 8, bBigEnd);
      } else {
        var aVals = [];
        for (var n=0;n<iNumValues;n++) {
          aVals[n] = oFile.getSLongAt(iValueOffset + 4*n, bBigEnd);
        }
        return aVals;
      }
      break;
    case 10: // signed rational, two slongs, first is numerator, second is denominator
      if (iNumValues == 1) {
        return oFile.getSLongAt(iValueOffset, bBigEnd) / oFile.getSLongAt(iValueOffset+4, bBigEnd);
      } else {
        var aVals = [];
        for (var n=0;n<iNumValues;n++) {
          aVals[n] = oFile.getSLongAt(iValueOffset + 8*n, bBigEnd) / oFile.getSLongAt(iValueOffset+4 + 8*n, bBigEnd);
        }
        return aVals;
      }
      break;
  }
}


function readEXIFData(oFile, iStart, iLength) 
{
  if (oFile.getStringAt(iStart, 4) != "Exif") {
    if (bDebug) console.log("Not valid EXIF data! " + oFile.getStringAt(iStart, 4));
    return false;
  }

  var bBigEnd;

  var iTIFFOffset = iStart + 6;

  // test for TIFF validity and endianness
  if (oFile.getShortAt(iTIFFOffset) == 0x4949) {
    bBigEnd = false;
  } else if (oFile.getShortAt(iTIFFOffset) == 0x4D4D) {
    bBigEnd = true;
  } else {
    if (bDebug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
    return false;
  }

  if (oFile.getShortAt(iTIFFOffset+2, bBigEnd) != 0x002A) {
    if (bDebug) console.log("Not valid TIFF data! (no 0x002A)");
    return false;
  }

  if (oFile.getLongAt(iTIFFOffset+4, bBigEnd) != 0x00000008) {
    if (bDebug) console.log("Not valid TIFF data! (First offset not 8)", oFile.getShortAt(iTIFFOffset+4, bBigEnd));
    return false;
  }

  var oTags = readTags(oFile, iTIFFOffset, iTIFFOffset+8, EXIF.TiffTags, bBigEnd);

  if (oTags.ExifIFDPointer) {
    var oEXIFTags = readTags(oFile, iTIFFOffset, iTIFFOffset + oTags.ExifIFDPointer, EXIF.Tags, bBigEnd);
    for (var strTag in oEXIFTags) {
      switch (strTag) {
        case "LightSource" :
        case "Flash" :
        case "MeteringMode" :
        case "ExposureProgram" :
        case "SensingMethod" :
        case "SceneCaptureType" :
        case "SceneType" :
        case "CustomRendered" :
        case "WhiteBalance" : 
        case "GainControl" : 
        case "Contrast" :
        case "Saturation" :
        case "Sharpness" : 
        case "SubjectDistanceRange" :
        case "FileSource" :
          oEXIFTags[strTag] = EXIF.StringValues[strTag][oEXIFTags[strTag]];
          break;
  
        case "ExifVersion" :
        case "FlashpixVersion" :
          oEXIFTags[strTag] = String.fromCharCode(oEXIFTags[strTag][0], oEXIFTags[strTag][1], oEXIFTags[strTag][2], oEXIFTags[strTag][3]);
          break;
  
        case "ComponentsConfiguration" : 
          oEXIFTags[strTag] = 
            EXIF.StringValues.Components[oEXIFTags[strTag][0]]
            + EXIF.StringValues.Components[oEXIFTags[strTag][1]]
            + EXIF.StringValues.Components[oEXIFTags[strTag][2]]
            + EXIF.StringValues.Components[oEXIFTags[strTag][3]];
          break;
      }
      oTags[strTag] = oEXIFTags[strTag];
    }
  }

  if (oTags.GPSInfoIFDPointer) {
    var oGPSTags = readTags(oFile, iTIFFOffset, iTIFFOffset + oTags.GPSInfoIFDPointer, EXIF.GPSTags, bBigEnd);
    for (var strTag in oGPSTags) {
      switch (strTag) {
        case "GPSVersionID" : 
          oGPSTags[strTag] = oGPSTags[strTag][0] 
            + "." + oGPSTags[strTag][1] 
            + "." + oGPSTags[strTag][2] 
            + "." + oGPSTags[strTag][3];
          break;
      }
      oTags[strTag] = oGPSTags[strTag];
    }
  }

  return oTags;
}


EXIF.getData = function(oImg, fncCallback) 
{
  if (!oImg.complete) return false;
  if (!imageHasData(oImg)) {
    getImageData(oImg, fncCallback);
  } else {
    if (fncCallback) fncCallback();
  }
  return true;
}

EXIF.getTag = function(oImg, strTag) 
{
  if (!imageHasData(oImg)) return;
  return oImg.exifdata[strTag];
}

EXIF.getAllTags = function(oImg) 
{
  if (!imageHasData(oImg)) return {};
  var oData = oImg.exifdata;
  var oAllTags = {};
  for (var a in oData) {
    if (oData.hasOwnProperty(a)) {
      oAllTags[a] = oData[a];
    }
  }
  return oAllTags;
}


EXIF.pretty = function(oImg) 
{
  if (!imageHasData(oImg)) return "";
  var oData = oImg.exifdata;
  var strPretty = "";
  for (var a in oData) {
    if (oData.hasOwnProperty(a)) {
      if (typeof oData[a] == "object") {
        strPretty += a + " : [" + oData[a].length + " values]\r\n";
      } else {
        strPretty += a + " : " + oData[a] + "\r\n";
      }
    }
  }
  return strPretty;
}

EXIF.readFromBinaryFile = function(oFile) {
  return findEXIFinJPEG(oFile);
}

function loadAllImages() 
{
  var aImages = document.getElementsByTagName("img");
  for (var i=0;i<aImages.length;i++) {
    if (aImages[i].getAttribute("exif") == "true") {
      if (!aImages[i].complete) {
        addEvent(aImages[i], "load", 
          function() {
            EXIF.getData(this);
          }
        ); 
      } else {
        EXIF.getData(aImages[i]);
      }
    }
  }
}

addEvent(window, "load", loadAllImages); 

})();

(function(){var h={},k=null,m=null,e=null,f=null,g={},n={color:"#ff0084",background:"#bbb",shadow:"#fff",fallback:!1},r=1<window.devicePixelRatio,d=function(){var c=navigator.userAgent.toLowerCase();return function(a){return-1!==c.indexOf(a)}}(),s=d("msie");d("chrome");d("chrome")||d("safari");var t=d("safari")&&!d("chrome");d("mozilla")&&!d("chrome")&&d("safari");var p=function(c){for(var a=document.getElementsByTagName("link"),b=document.getElementsByTagName("head")[0],l=0,d=a.length;l<d;l++)("icon"===
a[l].getAttribute("rel")||"shortcut icon"===a[l].getAttribute("rel"))&&b.removeChild(a[l]);a=document.createElement("link");a.type="image/x-icon";a.rel="icon";a.href=c;document.getElementsByTagName("head")[0].appendChild(a)},q=function(){f||(f=document.createElement("canvas"),r?(f.width=32,f.height=32):(f.width=16,f.height=16));return f},u=function(c){var a=q(),b=a.getContext("2d");c=c||0;var d=k,e=new Image;e.onload=function(){b&&(b.clearRect(0,0,a.width,a.height),b.beginPath(),b.moveTo(a.width/
2,a.height/2),b.arc(a.width/2,a.height/2,Math.min(a.width/2,a.height/2),0,2*Math.PI,!1),b.fillStyle=g.shadow,b.fill(),b.beginPath(),b.moveTo(a.width/2,a.height/2),b.arc(a.width/2,a.height/2,Math.min(a.width/2,a.height/2)-2,0,2*Math.PI,!1),b.fillStyle=g.background,b.fill(),0<c&&(b.beginPath(),b.moveTo(a.width/2,a.height/2),b.arc(a.width/2,a.height/2,Math.min(a.width/2,a.height/2)-2,-0.5*Math.PI,(-0.5+2*c/100)*Math.PI,!1),b.lineTo(a.width/2,a.height/2),b.fillStyle=g.color,b.fill()),p(a.toDataURL()))};
d.match(/^data/)||(e.crossOrigin="anonymous");e.src=d};h.setOptions=function(c){g={};for(var a in n)g[a]=c.hasOwnProperty(a)?c[a]:n[a];return this};h.setProgress=function(c){e||(e=document.title);if(!m||!k){var a;a:{a=document.getElementsByTagName("link");for(var b=0,d=a.length;b<d;b++)if("icon"===a[b].getAttribute("rel")||"shortcut icon"===a[b].getAttribute("rel")){a=a[b];break a}a=!1}m=k=a?a.getAttribute("href"):"/favicon.ico"}if(!isNaN(parseFloat(c))&&isFinite(c)){if(!q().getContext||s||t||!0===
g.fallback){document.title=0<c?"("+c+"%) "+e:e;return}"force"===g.fallback&&(document.title=0<c?"("+c+"%) "+e:e);return u(c)}return!1};h.reset=function(){e&&(document.title=e);m&&(k=m,p(k))};h.setOptions(n);window.Piecon=h})();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(q,k){var e={},l=e.lib={},p=function(){},c=l.Base={extend:function(a){p.prototype=this;var b=new p;a&&b.mixIn(a);b.hasOwnProperty("init")||(b.init=function(){b.$super.init.apply(this,arguments)});b.init.prototype=b;b.$super=this;return b},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var b in a)a.hasOwnProperty(b)&&(this[b]=a[b]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
s=l.WordArray=c.extend({init:function(a,b){a=this.words=a||[];this.sigBytes=b!=k?b:4*a.length},toString:function(a){return(a||d).stringify(this)},concat:function(a){var b=this.words,m=a.words,n=this.sigBytes;a=a.sigBytes;this.clamp();if(n%4)for(var r=0;r<a;r++)b[n+r>>>2]|=(m[r>>>2]>>>24-8*(r%4)&255)<<24-8*((n+r)%4);else if(65535<m.length)for(r=0;r<a;r+=4)b[n+r>>>2]=m[r>>>2];else b.push.apply(b,m);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<
32-8*(b%4);a.length=q.ceil(b/4)},clone:function(){var a=c.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],m=0;m<a;m+=4)b.push(4294967296*q.random()|0);return new s.init(b,a)}}),b=e.enc={},d=b.Hex={stringify:function(a){var b=a.words;a=a.sigBytes;for(var m=[],n=0;n<a;n++){var r=b[n>>>2]>>>24-8*(n%4)&255;m.push((r>>>4).toString(16));m.push((r&15).toString(16))}return m.join("")},parse:function(a){for(var b=a.length,m=[],n=0;n<b;n+=2)m[n>>>3]|=parseInt(a.substr(n,
2),16)<<24-4*(n%8);return new s.init(m,b/2)}},a=b.Latin1={stringify:function(a){var b=a.words;a=a.sigBytes;for(var m=[],n=0;n<a;n++)m.push(String.fromCharCode(b[n>>>2]>>>24-8*(n%4)&255));return m.join("")},parse:function(a){for(var b=a.length,m=[],n=0;n<b;n++)m[n>>>2]|=(a.charCodeAt(n)&255)<<24-8*(n%4);return new s.init(m,b)}},u=b.Utf8={stringify:function(b){try{return decodeURIComponent(escape(a.stringify(b)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(b){return a.parse(unescape(encodeURIComponent(b)))}},
t=l.BufferedBlockAlgorithm=c.extend({reset:function(){this._data=new s.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=u.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,m=b.words,n=b.sigBytes,r=this.blockSize,c=n/(4*r),c=a?q.ceil(c):q.max((c|0)-this._minBufferSize,0);a=c*r;n=q.min(4*a,n);if(a){for(var t=0;t<a;t+=r)this._doProcessBlock(m,t);t=m.splice(0,a);b.sigBytes-=n}return new s.init(t,n)},clone:function(){var a=c.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=t.extend({cfg:c.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){t.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,m){return(new a.init(m)).finalize(b)}},_createHmacHelper:function(a){return function(b,m){return(new w.HMAC.init(a,
m)).finalize(b)}}});var w=e.algo={};return e}(Math);
(function(){var q=CryptoJS,k=q.lib.WordArray;q.enc.Base64={stringify:function(e){var l=e.words,p=e.sigBytes,c=this._map;e.clamp();e=[];for(var k=0;k<p;k+=3)for(var b=(l[k>>>2]>>>24-8*(k%4)&255)<<16|(l[k+1>>>2]>>>24-8*((k+1)%4)&255)<<8|l[k+2>>>2]>>>24-8*((k+2)%4)&255,d=0;4>d&&k+0.75*d<p;d++)e.push(c.charAt(b>>>6*(3-d)&63));if(l=c.charAt(64))for(;e.length%4;)e.push(l);return e.join("")},parse:function(e){var l=e.length,p=this._map,c=p.charAt(64);c&&(c=e.indexOf(c),-1!=c&&(l=c));for(var c=[],s=0,b=0;b<
l;b++)if(b%4){var d=p.indexOf(e.charAt(b-1))<<2*(b%4),a=p.indexOf(e.charAt(b))>>>6-2*(b%4);c[s>>>2]|=(d|a)<<24-8*(s%4);s++}return k.create(c,s)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
(function(q){function k(a,b,c,d,m,n,r){a=a+(b&c|~b&d)+m+r;return(a<<n|a>>>32-n)+b}function e(a,b,c,d,m,n,r){a=a+(b&d|c&~d)+m+r;return(a<<n|a>>>32-n)+b}function l(a,b,c,d,m,n,r){a=a+(b^c^d)+m+r;return(a<<n|a>>>32-n)+b}function p(a,b,c,d,m,n,r){a=a+(c^(b|~d))+m+r;return(a<<n|a>>>32-n)+b}for(var c=CryptoJS,s=c.lib,b=s.WordArray,d=s.Hasher,s=c.algo,a=[],u=0;64>u;u++)a[u]=4294967296*q.abs(q.sin(u+1))|0;s=s.MD5=d.extend({_doReset:function(){this._hash=new b.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(b,c){for(var d=0;16>d;d++){var s=c+d,m=b[s];b[s]=(m<<8|m>>>24)&16711935|(m<<24|m>>>8)&4278255360}var d=this._hash.words,s=b[c+0],m=b[c+1],n=b[c+2],r=b[c+3],x=b[c+4],u=b[c+5],q=b[c+6],y=b[c+7],z=b[c+8],A=b[c+9],B=b[c+10],C=b[c+11],D=b[c+12],E=b[c+13],F=b[c+14],G=b[c+15],f=d[0],g=d[1],h=d[2],j=d[3],f=k(f,g,h,j,s,7,a[0]),j=k(j,f,g,h,m,12,a[1]),h=k(h,j,f,g,n,17,a[2]),g=k(g,h,j,f,r,22,a[3]),f=k(f,g,h,j,x,7,a[4]),j=k(j,f,g,h,u,12,a[5]),h=k(h,j,f,g,q,17,a[6]),g=k(g,h,j,f,y,22,a[7]),
f=k(f,g,h,j,z,7,a[8]),j=k(j,f,g,h,A,12,a[9]),h=k(h,j,f,g,B,17,a[10]),g=k(g,h,j,f,C,22,a[11]),f=k(f,g,h,j,D,7,a[12]),j=k(j,f,g,h,E,12,a[13]),h=k(h,j,f,g,F,17,a[14]),g=k(g,h,j,f,G,22,a[15]),f=e(f,g,h,j,m,5,a[16]),j=e(j,f,g,h,q,9,a[17]),h=e(h,j,f,g,C,14,a[18]),g=e(g,h,j,f,s,20,a[19]),f=e(f,g,h,j,u,5,a[20]),j=e(j,f,g,h,B,9,a[21]),h=e(h,j,f,g,G,14,a[22]),g=e(g,h,j,f,x,20,a[23]),f=e(f,g,h,j,A,5,a[24]),j=e(j,f,g,h,F,9,a[25]),h=e(h,j,f,g,r,14,a[26]),g=e(g,h,j,f,z,20,a[27]),f=e(f,g,h,j,E,5,a[28]),j=e(j,f,
g,h,n,9,a[29]),h=e(h,j,f,g,y,14,a[30]),g=e(g,h,j,f,D,20,a[31]),f=l(f,g,h,j,u,4,a[32]),j=l(j,f,g,h,z,11,a[33]),h=l(h,j,f,g,C,16,a[34]),g=l(g,h,j,f,F,23,a[35]),f=l(f,g,h,j,m,4,a[36]),j=l(j,f,g,h,x,11,a[37]),h=l(h,j,f,g,y,16,a[38]),g=l(g,h,j,f,B,23,a[39]),f=l(f,g,h,j,E,4,a[40]),j=l(j,f,g,h,s,11,a[41]),h=l(h,j,f,g,r,16,a[42]),g=l(g,h,j,f,q,23,a[43]),f=l(f,g,h,j,A,4,a[44]),j=l(j,f,g,h,D,11,a[45]),h=l(h,j,f,g,G,16,a[46]),g=l(g,h,j,f,n,23,a[47]),f=p(f,g,h,j,s,6,a[48]),j=p(j,f,g,h,y,10,a[49]),h=p(h,j,f,g,
F,15,a[50]),g=p(g,h,j,f,u,21,a[51]),f=p(f,g,h,j,D,6,a[52]),j=p(j,f,g,h,r,10,a[53]),h=p(h,j,f,g,B,15,a[54]),g=p(g,h,j,f,m,21,a[55]),f=p(f,g,h,j,z,6,a[56]),j=p(j,f,g,h,G,10,a[57]),h=p(h,j,f,g,q,15,a[58]),g=p(g,h,j,f,E,21,a[59]),f=p(f,g,h,j,x,6,a[60]),j=p(j,f,g,h,C,10,a[61]),h=p(h,j,f,g,n,15,a[62]),g=p(g,h,j,f,A,21,a[63]);d[0]=d[0]+f|0;d[1]=d[1]+g|0;d[2]=d[2]+h|0;d[3]=d[3]+j|0},_doFinalize:function(){var a=this._data,b=a.words,c=8*this._nDataBytes,d=8*a.sigBytes;b[d>>>5]|=128<<24-d%32;var m=q.floor(c/
4294967296);b[(d+64>>>9<<4)+15]=(m<<8|m>>>24)&16711935|(m<<24|m>>>8)&4278255360;b[(d+64>>>9<<4)+14]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;a.sigBytes=4*(b.length+1);this._process();a=this._hash;b=a.words;for(c=0;4>c;c++)d=b[c],b[c]=(d<<8|d>>>24)&16711935|(d<<24|d>>>8)&4278255360;return a},clone:function(){var a=d.clone.call(this);a._hash=this._hash.clone();return a}});c.MD5=d._createHelper(s);c.HmacMD5=d._createHmacHelper(s)})(Math);
(function(){var q=CryptoJS,k=q.lib,e=k.Base,l=k.WordArray,k=q.algo,p=k.EvpKDF=e.extend({cfg:e.extend({keySize:4,hasher:k.MD5,iterations:1}),init:function(c){this.cfg=this.cfg.extend(c)},compute:function(c,e){for(var b=this.cfg,d=b.hasher.create(),a=l.create(),k=a.words,p=b.keySize,b=b.iterations;k.length<p;){q&&d.update(q);var q=d.update(c).finalize(e);d.reset();for(var v=1;v<b;v++)q=d.finalize(q),d.reset();a.concat(q)}a.sigBytes=4*p;return a}});q.EvpKDF=function(c,e,b){return p.create(b).compute(c,
e)}})();
CryptoJS.lib.Cipher||function(q){var k=CryptoJS,e=k.lib,l=e.Base,p=e.WordArray,c=e.BufferedBlockAlgorithm,s=k.enc.Base64,b=k.algo.EvpKDF,d=e.Cipher=c.extend({cfg:l.extend(),createEncryptor:function(a,b){return this.create(this._ENC_XFORM_MODE,a,b)},createDecryptor:function(a,b){return this.create(this._DEC_XFORM_MODE,a,b)},init:function(a,b,c){this.cfg=this.cfg.extend(c);this._xformMode=a;this._key=b;this.reset()},reset:function(){c.reset.call(this);this._doReset()},process:function(a){this._append(a);return this._process()},
finalize:function(a){a&&this._append(a);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(a){return{encrypt:function(b,c,d){return("string"==typeof c?H:v).encrypt(a,b,c,d)},decrypt:function(b,c,d){return("string"==typeof c?H:v).decrypt(a,b,c,d)}}}});e.StreamCipher=d.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var a=k.mode={},u=function(a,b,c){var d=this._iv;d?this._iv=q:d=this._prevBlock;for(var e=0;e<c;e++)a[b+e]^=
d[e]},t=(e.BlockCipherMode=l.extend({createEncryptor:function(a,b){return this.Encryptor.create(a,b)},createDecryptor:function(a,b){return this.Decryptor.create(a,b)},init:function(a,b){this._cipher=a;this._iv=b}})).extend();t.Encryptor=t.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize;u.call(this,a,b,d);c.encryptBlock(a,b);this._prevBlock=a.slice(b,b+d)}});t.Decryptor=t.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize,e=a.slice(b,b+d);c.decryptBlock(a,b);u.call(this,
a,b,d);this._prevBlock=e}});a=a.CBC=t;t=(k.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,e=[],k=0;k<c;k+=4)e.push(d);c=p.create(e,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};e.BlockCipher=d.extend({cfg:d.cfg.extend({mode:a,padding:t}),reset:function(){d.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,
this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var w=e.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),a=(k.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?p.create([1398893684,
1701076831]).concat(a).concat(b):b).toString(s)},parse:function(a){a=s.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=p.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return w.create({ciphertext:a,salt:c})}},v=e.SerializableCipher=l.extend({cfg:l.extend({format:a}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var e=a.createEncryptor(c,d);b=e.finalize(b);e=e.cfg;return w.create({ciphertext:b,key:c,iv:e.iv,algorithm:a,mode:e.mode,padding:e.padding,blockSize:a.blockSize,formatter:d.format})},
decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),k=(k.kdf={}).OpenSSL={execute:function(a,c,d,e){e||(e=p.random(8));a=b.create({keySize:c+d}).compute(a,e);d=p.create(a.words.slice(c),4*d);a.sigBytes=4*c;return w.create({key:a,iv:d,salt:e})}},H=e.PasswordBasedCipher=v.extend({cfg:v.cfg.extend({kdf:k}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);c=d.kdf.execute(c,
a.keySize,a.ivSize);d.iv=c.iv;a=v.encrypt.call(this,a,b,c.key,d);a.mixIn(c);return a},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);c=d.kdf.execute(c,a.keySize,a.ivSize,b.salt);d.iv=c.iv;return v.decrypt.call(this,a,b,c.key,d)}})}();
(function(){function q(){for(var b=this._X,d=this._C,a=0;8>a;a++)p[a]=d[a];d[0]=d[0]+1295307597+this._b|0;d[1]=d[1]+3545052371+(d[0]>>>0<p[0]>>>0?1:0)|0;d[2]=d[2]+886263092+(d[1]>>>0<p[1]>>>0?1:0)|0;d[3]=d[3]+1295307597+(d[2]>>>0<p[2]>>>0?1:0)|0;d[4]=d[4]+3545052371+(d[3]>>>0<p[3]>>>0?1:0)|0;d[5]=d[5]+886263092+(d[4]>>>0<p[4]>>>0?1:0)|0;d[6]=d[6]+1295307597+(d[5]>>>0<p[5]>>>0?1:0)|0;d[7]=d[7]+3545052371+(d[6]>>>0<p[6]>>>0?1:0)|0;this._b=d[7]>>>0<p[7]>>>0?1:0;for(a=0;8>a;a++){var e=b[a]+d[a],k=e&65535,
l=e>>>16;c[a]=((k*k>>>17)+k*l>>>15)+l*l^((e&4294901760)*e|0)+((e&65535)*e|0)}b[0]=c[0]+(c[7]<<16|c[7]>>>16)+(c[6]<<16|c[6]>>>16)|0;b[1]=c[1]+(c[0]<<8|c[0]>>>24)+c[7]|0;b[2]=c[2]+(c[1]<<16|c[1]>>>16)+(c[0]<<16|c[0]>>>16)|0;b[3]=c[3]+(c[2]<<8|c[2]>>>24)+c[1]|0;b[4]=c[4]+(c[3]<<16|c[3]>>>16)+(c[2]<<16|c[2]>>>16)|0;b[5]=c[5]+(c[4]<<8|c[4]>>>24)+c[3]|0;b[6]=c[6]+(c[5]<<16|c[5]>>>16)+(c[4]<<16|c[4]>>>16)|0;b[7]=c[7]+(c[6]<<8|c[6]>>>24)+c[5]|0}var k=CryptoJS,e=k.lib.StreamCipher,l=[],p=[],c=[],s=k.algo.Rabbit=
e.extend({_doReset:function(){for(var b=this._key.words,c=this.cfg.iv,a=0;4>a;a++)b[a]=(b[a]<<8|b[a]>>>24)&16711935|(b[a]<<24|b[a]>>>8)&4278255360;for(var e=this._X=[b[0],b[3]<<16|b[2]>>>16,b[1],b[0]<<16|b[3]>>>16,b[2],b[1]<<16|b[0]>>>16,b[3],b[2]<<16|b[1]>>>16],b=this._C=[b[2]<<16|b[2]>>>16,b[0]&4294901760|b[1]&65535,b[3]<<16|b[3]>>>16,b[1]&4294901760|b[2]&65535,b[0]<<16|b[0]>>>16,b[2]&4294901760|b[3]&65535,b[1]<<16|b[1]>>>16,b[3]&4294901760|b[0]&65535],a=this._b=0;4>a;a++)q.call(this);for(a=0;8>
a;a++)b[a]^=e[a+4&7];if(c){var a=c.words,c=a[0],a=a[1],c=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360,a=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360,e=c>>>16|a&4294901760,k=a<<16|c&65535;b[0]^=c;b[1]^=e;b[2]^=a;b[3]^=k;b[4]^=c;b[5]^=e;b[6]^=a;b[7]^=k;for(a=0;4>a;a++)q.call(this)}},_doProcessBlock:function(b,c){var a=this._X;q.call(this);l[0]=a[0]^a[5]>>>16^a[3]<<16;l[1]=a[2]^a[7]>>>16^a[5]<<16;l[2]=a[4]^a[1]>>>16^a[7]<<16;l[3]=a[6]^a[3]>>>16^a[1]<<16;for(a=0;4>a;a++)l[a]=(l[a]<<8|l[a]>>>24)&
16711935|(l[a]<<24|l[a]>>>8)&4278255360,b[c+a]^=l[a]},blockSize:4,ivSize:2});k.Rabbit=e._createHelper(s)})();
function Utils(_){
  if(!_) throw "underscore or lo-dash is required";
  var self = this;

  this.dateDiff = function(start, end){
    var periods =['years', 'months', 'weeks', 'days', 'hours'];
    var numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

    return periods.reduce(function(result, period){
      if (result) return result;

      var val = end.diff(start, period);
      if (val) result = numbers[val] + " " + (val > 1 && period || period.slice(0, -1));
      return result;
    }, null);

  };

  this.formatMoment = function(start, end){
    var periods =['years', 'months', 'weeks', 'days', 'hours'];
    var formats = ['YYYY','MMMM YYYY', 'MMMM YYYY', 'D MMM', 'ddd D MMMM'];
    return periods.reduce(function(result, period, i){
      if (result) return result;

      var val = end.diff(start, period);
      if (val) return start.format(formats[i]);
    }, null) + " (" + self.dateDiff(start, end) + ")";

  };

 // returns a summary of the changes in two arrays
  this.diff = function (a,b,id, merge){
    var oldIds = _.pluck(a, id);
    var newIds = _.pluck(b, id);

    var insert = _.difference(newIds, oldIds);
    var remove = _.difference(oldIds, newIds);
    var summary = {
      insert    : _.filter(b, function(item){return insert.indexOf(item.id) > -1; }),
      remove    : _.filter(a, function(item){return remove.indexOf(item.id) > -1; })
    };
    
    if (merge){
      summary.remainder = _.filter(a, function(item){return remove.indexOf(item.id) === -1; });
      summary.merged = summary.insert.concat(summary.remainder);
    }

    return summary;
  };

  /**
   * Take two array (or more) and weave them together into one array so that [1,2,3,4] + [1,2,3,4] => [1,1,2,2,3,3,4,4]
   * @param  {[type]} a [description]
   * @param  {[type]} b [description]
   * @return {[type]}   [description]
   */
  this.weave = function(a,b){
    var arrays = Array.prototype.slice.call(arguments.length === 1 ? arguments[0] : arguments);
    var maxLength = Math.max.apply(Math, arrays.map(function (el) { return el.length }));

    if (isNaN(maxLength)) return arrays[0].length && arrays[0] || arrays; // no need to weave one single array

    var result = [];
    for(var i=0; i<maxLength; i++){
      _.each(arrays, function(array){
          if(array[i]) result.push(array[i]);
      });
    }
    return result;
  };
/*
  this.weave = function() {
    if (!_.some(arguments)) return [];

    return _.compact(_.filter(_.flatten(_.zip.apply(null, arguments), true), function(elem) {
      return elem !== null;
    }));
  };*/

  /**
   * Sort an array on the total distance between each row so that we get an even spread
   * @param  {[type]} array     [description]
   * @param  {[type]} sortField [description]
   * @return {[type]}           [description]
   */
  this.gapSort = function(array, sortField){

    var sorted = _.sortBy(array,sortField);

    var result = [];
    while(sorted.length) {
      if (sorted.length % 2){
        result.push(sorted.splice(0,1)[0]);
      } else {
        result.push(sorted.splice(-1)[0]);
      }
    }
    return result;
  };

  /**
   * Cluster a single dimension array into subarrays. This is very approxamative but very fast. Define what is the minimum amount of clusters. 
   * Example: [1,2,3,4,99,55,22,33,44,55,11] -> [[1,2,3,4,11],[22],[33],[44],[55,55],[99]]]
   *
   * @param  {[number]} array     [vector to cluster]
   * @param  {number} minClusters [minimum number of clusters]
   * @return {[type]}             [returns a array of clusters. For example [[1,2,3,4,11],[22],[33],[44],[55,55],[99]]]
   */
  this.cluster = function(array, minClusters){
    var sorted = _.sortBy(array);
    var stdDiff = sorted.reduce(function(a,b){return a + b}) / sorted.length;
    var result;
    
    for (var factor = 1; factor<10; factor++){
      var i = sorted.length;
      result = [];
      var cluster = [];
      while(i--){
        var next = sorted[i-1];
        var current = sorted[i];

        if(current && Math.abs(current - next ) < (stdDiff / factor))
        {
          cluster.unshift(current);
        } else {
          if (current) cluster.unshift(current);
          result.unshift(cluster);
          cluster = [];
        }
      }
      if (result.length >= (minClusters || Math.sqrt(array.length/2))) break;
    }

    return result;
  };


  // [123         5        7      9]
  // =>
  // 195
/* NOT WORKING YET */
  this.distSort = function(array, sortField){

    var combinations = [];
    var i = array.length;

    // create each combination pair: [1,99, 98], [1,98, 97],  .. [99,1], [99,99]
    while(i--){
      var j = array.length;
      while(j--){
        if (array[i] !== array[j]){
          combinations.push([array[i],array[j], (array[i] + array[j]) / 2]);
        }
      }
    }

    var stdDiff = combinations.reduce(function(a,b){return a + b[2]}) / combinations.length;
/*
    var groupedArrays = _.sort(array, sortField).reduce(function(a,b){
      if (Math.abs(a.slice(-1)[0].slice(-1)[0] - b))
    }, [[]]);
*/
    combinations = _.sortBy(combinations, 2, true);

    var next = combinations[0];
    var result = [];
    while(next){
      result.push(next);
      next = _.sortBy(combinations, function(a){
        return Math.abs(next[2]-a[1]);
      }).first();
    }

    console.log(combinations);
    var result = combinations.reverse().reduce(function(a,b){
      if (a.indexOf(b[0]) === -1) a.push(b[0]);
      if (a.indexOf(b[1]) === -1) a.push(b[1]);
      return a;
    }, []);


    return result;
  };

    // returns a merged array with items from a but and new from b, all items from a which isnt present in b are removed 
  this.merge = function (a,b,id){
    var diff = this.diff(a,b,id,true);
    return diff.merged;
  };

  // returns a merged array with items from a but and new from b, all items from a which isnt present in b are removed 
  this.filterMerge = function(a,b,id){
    if (!a || !b || !a instanceof Array || !b instanceof Array) throw "Two arrays required";

    var oldIds = _.pluck(a, id);
    var newIds = _.pluck(b, id);

    var insert = _.difference(newIds, oldIds);
    var remove = _.difference(oldIds, newIds);
    var newItems = _.filter(b, function(item){return insert.indexOf(item.id) > -1; });

    for(var item in remove){
      a.splice(a.indexOf(item), 1);
    }
    _.each(newItems.reverse(), function(item){
      a.unshift(item);
    });
    return;
  };


  return this;
}

if (typeof(module)!=="undefined") {
  module.exports = Utils;
}



var loadTimeout;
var appProvider = angular.module('app', []);

function AppController($scope, $http, socket, library, storage)
{

  $scope.loading = false;

  $scope.stats = localStorage && localStorage.getObject('stats');


  setInterval(function(){
    $scope.stats = null; // reset and load new every 30 seconds
  }, 30000);

  $scope.$watch('stats', function(value){
    if (!value){
      console.log('loading stats');
      
      $http.get('/api/stats', {params: null}).success(function(stats){
        $scope.stats = stats;

        if ($scope.library && $scope.library.modified && $scope.stats.modified > $scope.library.modified)
        {
          console.log('found changes', $scope.stats.modified);
          library.loadLatest($scope.library.modified);
        }
      }).error(function(err){
        console.log('stats error');
      });
    }
  });


}



appProvider.factory('utils', function(_){
  return new Utils(_);
});

appProvider.factory('_', function(){
  return _;
});


appProvider.factory('moment', function(){
  return moment;
});


appProvider.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = document.body;
    window.onscroll = function(event) {
      appScope.loadingReverse = $(window).scrollTop() < 0;
      appScope.scrollPosition = $(window).scrollTop();
      appScope.apply(attr.whenScrolled);
    };
  };
});

appProvider.directive('rightClick', function($parse) {
  return function(scope, element, attr) {
    element.bind('contextmenu', function(event) {
      var fn = $parse(attr.rightClick);
      if (fn){
        scope.$apply(function() {
          if (fn(scope, {
            $event: event
          })) {
            // only stop menu if we have something meaningful to do (returns true)
            event.preventDefault();
          }
        });
        return false;
      }
    });
  };
});

/*appProvider.directive('dragstart', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['dragstart']);
    element.bind('dragstart', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
})*/

appProvider.directive('fullscreen', function(){

  return function(scope, element, attr){
    element.bind('click', function(event) {
      var documentElement = document.documentElement;
      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen(scope.fullscreen);
      }
      else if (documentElement.mozRequestFullScreen) {
        documentElement.mozRequestFullScreen(scope.fullscreen);
      }
      else if (documentElement.webkitRequestFullScreen) {
        documentElement.webkitRequestFullScreen(scope.fullscreen);
      }
      scope.fullscreen = !scope.fullscreen;
    });
  };
});

appProvider.directive('lazy', function($parse){
  
  return function(scope, element, attr){
    element.bind('load', function(event) {
      var fn = $parse(attr.lazy);
      if (fn){
        scope.$apply(function() {
          fn(scope);
        });
      }
    });
  };
});

appProvider.directive('dropzone', function($parse){
  return function(scope, element, attr){
    $(document).bind('dragover', function(e){e.preventDefault()});
    $(document).bind('drop', function(event) {
      var e = event.originalEvent;
      e.preventDefault();

      element.modal();
      
      var updateTimeout;
      var addFile = function(file, path){
        if(file.type.match(/image\.*/)){
          file.path = path;
          scope.files.push(file);
          scope.files.sort(function(a,b){
            return b.lastModifiedDate - a.lastModifiedDate;
          });
          // wait until we have found all files before updating the view
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(function(){
            scope.$apply();
          }, 200);
        }
      };
      var i = 0;
      angular.forEach(e.dataTransfer.items, function(item){
        var entry = item.webkitGetAsEntry();
        var file = e.dataTransfer.files[i];
        i++;
        if (entry.isFile) {
          addFile(file);
          console.log('file', file, entry);
        } else if (entry.isDirectory) {
          traverseFileTree(entry, null, addFile);
        }


      });
      // initial binding
      scope.$apply();

    });


    /* Traverse through files and directories */
    function traverseFileTree(item, path, callback, done) {
      path = path || "";
      if (item.isFile) {
        // Get file
        item.file(function(file) {
          if(file.type.match(/image\.*/)){
            callback(file, path);
          } else {
            // TODO: identify iPhoto package and extract it
          }
        });
      } else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function(entries) {
          angular.forEach(entries, function(entry){
            setTimeout(function(){
              traverseFileTree(entry, path + item.name + "/", callback, scope.$apply);
            },20);
          });
        });
        if (done) done();
      }
    }
    /* Main unzip function */
    /*function unzip(zip){
        model.getEntries(zip, function(entries) {
            entries.forEach(function(entry) {
                model.getEntryFile(entry, "Blob");
            });
        });
}*/

    //model for zip.js
    /*var model = (function() {

        return {
            getEntries : function(file, onend) {
                zip.createReader(new zip.BlobReader(file), function(zipReader) {
                    zipReader.getEntries(onend);
                }, onerror);
            },
            getEntryFile : function(entry, creationMethod, onend, onprogress) {
                var writer, zipFileEntry;

                function getData() {
                    entry.getData(writer, function(blob) {

                    //read the blob, grab the base64 data, send to upload function
                    oFReader = new FileReader()
                    oFReader.onloadend = function(e) {
                      upload(this.result.split(',')[1]);
                    };
                    oFReader.readAsDataURL(blob);
                 
                    }, onprogress);
                }
                    writer = new zip.BlobWriter();
                    getData();
            }
        };
    })();
*/
};
});

appProvider.directive('dateFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$formatters.unshift(function(valueFromModel) {
        return valueFromModel && moment(valueFromModel).format('YYYY MMM DD');
        // return how data will be shown in input
      });

      ngModelCtrl.$parsers.push(function(valueFromInput) {
        var date = moment(valueFromInput);
        return date.isValid()? date.toDate().getTime() : null;
        // return how data should be stored in model
      });

      $(element).bind('mouseover', function(e){
        this.select();
      });

      $(element).bind('mouseout', function(e){
        window.getSelection().removeAllRanges();
      });
    }
  };
});

appProvider.directive('datepicker', function() {
 return function(scope, element, attrs) {

  $(element).daterangepicker(
  {
    format: 'yyyy-MM-dd',
    ranges: {
      'Today': ['today', 'today'],
      'Yesterday': ['yesterday', 'yesterday']
    }
  },
  function(start, end) {
    var modelPath = $(element).attr('ng-model');
    scope[modelPath] = start.toString('yyyy-MM-dd') + ' - ' + end.toString('yyyy-MM-dd 23:59:59');
    scope.$apply();
  }
  );

};
});
function GroupCtrl($scope, utils){
  $scope.group = null;

  $scope.$watch('group.active', function(state, oldState){
    if (state){
      $scope.group.left = state && 300 || 0;
      $scope.group.zoomLevel = state && 0 || $scope.zoomLevel;
//      $scope.group.bind($scope.group.top, $scope.group.left, $scope.height, $scope.group.zoomLevel);
    }

  });

  $scope.click =function(){
    $scope.group.active = !$scope.group.active;
  };
}

appProvider.factory('Group', function(moment, utils){

  function Group(){
    this.photos = [];
    return this;
  }

  Group.prototype.finish = function(){


    if (!this.rows.length) return null;

    var first = (this.rows[0][0]); //+ 20;
    var last = this.rows[this.rows.length-1].slice(-1)[0];

    //photos.forEach(function(photo){photo.top += 20});
    
    //this.id = first.cluster.split('.')[0];
    this.visible = this.rows.reduce(function(a,b){return a+b.length},0);
    this.height = (last.top + last.height - this.top);
    this.bottom = (last.top + last.height) || this.top;
    this.right = (last.left + last.width);
    this.from = this.photos[0].taken;
    this.to = this.photos.slice(-1)[0].taken;
    this.left = first.left;
    this.top = first.top;
    this.duration = moment(this.from).from(this.to, true);
    this.name = utils.formatMoment(moment(this.from), moment(this.to));

  };

  Group.prototype.bind = function(top, left, rowHeight, zoomLevel){
    var padding = 1;
    var maxWidth = window.innerWidth;
    var group = this;
    this.left = left;
    this.top = top;
    group.zoomLevel = zoomLevel || group.zoomLevel;

    this.rows = (this.photos).reduce(function(rows, photo, i){

      if (!photo) return rows;

      // Only show visible photos
      if (photo && photo.src && (photo.vote <= group.zoomLevel )) {

        photo.active = true;
        group.id = photo.cluster && photo.cluster.split('.')[0] || null;

        photo.height = Math.floor(rowHeight);
        photo.width = Math.floor(photo.height * (photo.ratio || 1));
        photo.top = Math.floor(top);
        photo.left = Math.floor(left) + padding;
        var row = rows.slice(-1)[0];
        row.push(photo);

        if (photo.left + photo.width > maxWidth){
          closeRow(row, maxWidth);
          // row.map(function(photo){photo.left += group.left});
          top = photo.top + photo.height + padding;
          left = 5;
          rows.push([]);
        } else {
          left = photo.left + photo.width + padding;
        }

      } else{
        photo.active = false;
      }

      return rows;

    }, [[]]);

    this.rows = this.rows.filter(function(a){return a.length});

  /*
    if (this.rows && this.rows.length){
      if (left < ){
        var totalHeight = this.rows.reduce(function(a,b){return a+b[0].height}, 0);
        var remainder = maxWidth - 
        group.bind(this.top, this.left, totalHeight * )
      }

      closeRow(this.rows.slice(-1)[0], maxWidth);
    }*/
    
    this.finish();
  };



  function closeRow(row, maxWidth){
    if (!row) throw "Row is empty";

    var visible = row.filter(function(photo){return photo.active});
    var last = visible[visible.length-1];
    if (!last) return;

    var rowWidth = last.left + last.width;

    var percentageAdjustment = maxWidth / (rowWidth);

    // adjust height
    visible.forEach(function(photo, i){
      photo.left *= percentageAdjustment;
      photo.width *= percentageAdjustment;
      photo.height *= percentageAdjustment;
    });
  }
  return Group;
});
function GroupsController($scope, $http){
  
  var zoomTimeout = null;
  $scope.startDate = new Date();
  $scope.zoomLevel = 5;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;
  $scope.nrPhotos = undefined;

  $scope.scroll = function(){
    if ( $scope.loadingReverse) // reverse scroll, TODO: send as parameter instead
    {
      //var firstDate = $scope.groups[0].photos[$scope.groups[0].photos.length-1].taken;
      //if ($scope.groups.length && $scope.groups[0].photos) $scope.startDate = new Date(firstDate);
      // $scope.counter = 0;
    }
    return $scope.loadMore();
  };

  $scope.dblclick = function(photo){
    $scope.loadMore(photo.taken, $scope.zoomLevel+1, function(err){
      $('#' + photo.taken)[0].scrollIntoView();
    });
  };

  $scope.loadMore = function(resetDate, zoomLevel, done) {


    if (resetDate){
      $scope.counter = 0;
      $scope.photos = [];
      $scope.endDate = null;
      $scope.startDate = new Date(resetDate);
      //window.stop(); // cancel all image downloads
      $scope.loading = false;
    }

    // prevent hammering
    if ($scope.loading) return;
    $scope.loading = true;


    if (zoomLevel) $scope.zoomLevel = Math.min(100, zoomLevel);
    

    var query = {skip : $scope.counter, startDate: $scope.startDate.toISOString(), reverse : $scope.loadingReverse, vote : $scope.zoomLevel + 1, limit: 100};
    $http.get('/api/photoFeed', {params : query})
    .success(function(photos){
      $scope.loading = false;

      if (photos.length)
      {
/*
        var averageDiff = photos.reduce(function(a,b){
          return {taken : b.taken, count : a.count++, sumDiff : (a.sumDiff || 0 ) + b.taken.getTime() - a.taken.getTime()};
        });

        averageDiff = averageDiff.sumDiff / averageDiff.count;
*/
        var startDate = photos[0].taken.split('T')[0],
            stopDate = photos[photos.length-1].taken.split('T')[0],
            group = {photos: photos, viewMode:'grid', id: photos[0].taken, range: (startDate !== stopDate ? startDate + " - ": "") + stopDate};

        // calculate the most popular tags in this group
        group.tags = group.photos.map(function(photo){
          return photo.tags;
        })
        // merge all tags to one array
        .reduce(function(a,b){return a.concat(b)}, [])
        // reduce them to a new struct with count and tag
        .reduce(function(a,b){
          b = b.trim(' ');

          var tag = a.filter(function(t){return t.tag === b})[0] || {tag:b, count:0};
          
          if (tag.count === 0)
            a.push(tag);

          tag.count++;
          return a;
        }, [])
        // get the most used tag
        .sort(function(a,b){return b.count - a.count})
        // take out the actual tags
        .map(function(tag){return tag.tag});

        group.photo = photos[0]; // .sort(function(a,b){return b.interestingness - a.interestingness}).slice();
        group.name = group.tags.slice(0,3).join(' ');

        if (resetDate) $scope.groups = [];
        
        if ($scope.loadingReverse) {
          $scope.groups.unshift(group);
        } else {
          $scope.groups.push(group);
        }

        $scope.counter += photos.length;

        if (done) done();

      }
    }).error(function(err){
      $scope.loading = false;
      $scope.loadingReverse = false;
      
      if (done) done(err);
      // alert somehow?
    });
  };
/*
  $scope.$watch('photos', function(value){
    var groups = [],
        lastPhoto = null,
        group = null;

    value.forEach(function(photo){

      if (!lastPhoto || photo.taken.getTime() - lastPhoto.taken.getTime() > 24*60*60)
      {
        group = {photos : []};
        groups.push(group);
      }

      group.photos.push(photo);
      lastPhoto = photo;

    });
    console.log(groups);
    $scope.groups = groups;
  });*/

  $scope.$watch('zoomLevel + (stats && stats.all)', function(value, oldValue){
    
    if ($scope.zoomLevel > $scope.zoomLevel)
      $scope.startDate = new Date(); // reset the value when zooming out

    clearTimeout(zoomTimeout);

    $scope.nrPhotos = $scope.stats && Math.round($scope.stats.all * $scope.zoomLevel / 10) || $scope.photos.length;

    zoomTimeout = setTimeout(function(){
      $scope.loadMore($scope.startDate);
    }, 100);

  });

  $scope.$watch('groups.length',function(){
    setTimeout(function(){
      var $spy = $(document.body).scrollspy('refresh');
      $("ul.nav li").on("activate", function(elm)
      {
          $scope.startDate = new Date(elm.target.attributes['data-date'].value);
          document.location = '#' + $scope.startDate;
      });
    }, 100);
  });
  
  if (document.location.hash)
    $scope.startDate = new Date(document.location.hash.slice(1));
}
appProvider.factory('library', function($http, socket, storage){
  console.log('library factory')
  var server;
  var photos = [];

  var library = {

    listeners : [],
    meta : {},
    propagateChanges : function(photos){
      console.log('propagateChanges')
      library.listeners.map(function(fn){
        fn(photos);
      });
    },

    // load all photos based on modify date. It means we can fill up the library on newly changed
    // photos or recently added photos without loading the whole library again.
    loadLatest : function(modified, done){
          console.log('latest ', modified);

      $http.get('/api/library', {params: {modified:modified}, cache: true})
      .success(function(page){
          console.log('latest page', page);

        if (!page || !page.photos) return;

        // we want to replace the old ones with the new ones or insert the newest ones first
        _.reduce(page.photos, function(a,b){
          b.src=b.src && b.src.replace('$', page.baseUrl) || null;
          _.find(a, {_id: b._id}, function(existing){
          // look for this photo in the library and update if it was found
            if (existing) {
              existing = b;
            } else {
              a.unshift(b);  // otherwise - insert it first
            }
          });

          return a;
        }, photos || []);

        // next is a cursor to the next date in the library
        if (page.next){
          console.log('next latest', page.next);
          return library.loadLatest(page.next, done);
        } else{
          // THE END
          console.log('done latest', page.modified);
          library.meta.modified = page.modified;
          return done && done(null, photos);
        }

      })
      .error(function(err){
        console.log('library error', err);
        return done(err);
      });

    },
    find : function(taken){
      var photo = _.first(library.photos, {'taken' : new Date(taken).getTime()});
      return photo;
    },
    // Load library based on photo taken, this will recurse until it reaches the end of the library
    loadMore: function(taken, done){
      $http.get('/api/library', {params: {taken:taken || new Date().getTime() }, cache: true})
      .success(function(page){
        console.log('more success', page);
        if (!page || !page.photos || !page.photos.length) return done && done();

        if (library.meta.userId !== page.userId || !photos){
          library.photos =[];          
          library.meta = {userId : page.userId }; // reset if we are logged in as new user
        }


        // if (_.find(photos, {taken:page.photos[0].taken})) return done && done();

        _.each(page.photos, function(photo){
          photo.src=photo.src && photo.src.replace('$', page.baseUrl) || null;
          library.photos.push(photo);
        });

        // next is a cursor to the next date in the library
        if (page.next || !taken){
          if (_.any(photos, {taken:page.next})) return done && done(null, page.photos);
          console.log('next more', page.next);
          library.loadMore(page.next, done);
        } else{
          console.log('done more', page.modified);
          library.meta.modified = page.modified;

          return done && done(null, page.photos);
        }

      })
      .error(function(err){
        console.log('library error', err);
        return done(err);
      });
    },
    sortAndRemoveDuplicates: function(){
      library.photos.sort(function(a,b){
          return b.taken - a.taken;
      });

      var i = library.photos.length;
      while (i--) {
        if (i && library.photos[i-1].taken === library.photos[i].taken) {
          library.photos.splice(i,1);
        }
      }
    },
    init:function(){

      library.meta = storage.getObject('meta') || {modified:null, userId:null}; 
      library.photos = library.photos || [];


      if (window.shimIndexedDB) window.shimIndexedDB.__useShim();

      async.series({
        db : function(done){
          console.log('__db');
          db.open({
            server: 'my-app',
            version: 1,
            schema: {
              photos: {
                key: { keyPath: 'taken' , autoIncrement: false }
              }
            }
          }).done( function ( s ) {
            server = s;

            console.log('indexdb opened ok', s);

            server.photos.query()
            .all()
            .execute()
            .fail(function(err){
              console.log('db fail', err);
              done(err);
            })
            .done( function ( photos ) {
              console.log('db done', photos);

              photos = photos.reverse();
              library.propagateChanges(photos); // prerender with the last known library if found
              // descending order
              library.photos.concat(photos);
              done(null, photos);
            });
          });
        },
         beginning : function(done){
          console.log('__beginning')
          library.loadMore(null, function(err, photos){
            library.propagateChanges(photos); // prerender with the last known library if found
            done(err, photos);
          });
        },
        changes : function(done){
          console.log('__changes')
          var lastModifyDate = library.meta.modified && new Date(library.meta.modified).getTime() || null;
          if (lastModifyDate){
            library.loadLatest(lastModifyDate, done);
          }
          else done();
        },
        end : function(done){
          console.log('__end')
          var lastPhoto = (library.photos || []).slice(-1)[0];
          library.loadMore(lastPhoto && lastPhoto.taken || new DateTime(), done);
        }
      }, function(err, result){
        console.log('__result', result)

        library.sortAndRemoveDuplicates();
        library.propagateChanges(library.photos);

        storage.setObject('meta', library.meta);
        if (server) {
          server.photos.update.call(library.photos); // update means put == insert or update
        } else {
          // load every time as fallback
        }
      });
     }

  };


  socket.on('connect', function(data){
    socket.on('trigger', function(trigger){

      var photo = library.find(new Date(trigger.item.taken).getTime());

      if (photo){
        angular.extend(photo, trigger.item); // update existing
      }
      else{
        library.photos.push(trigger.item); // add
      }


    });
  });

  return library;
  //initialize();
})
function MetadataCtrl($scope){
  
  $scope.star = function(photo){
    photo.vote = 0;
    socket.emit('vote', photo, 0);
    photo.starred = !photo.starred;
    console.log('star', photo);
  };


  $scope.hide = function(photo){
    photo.vote = 10;
    socket.emit('vote', photo, 10);
    photo.hidden = true;
    console.log('hide', photo);
  };

  $scope.rightClick = function(){
    $scope.$parentScope.selectedPhoto = null;

  };
  

}
var socket = io.connect();

function PhotoController ($scope, $http, socket){
  var activePhoto = null;
  
  $scope.mouseMove = function(photo){
    console.log('move', photo._id);
      socket.emit('views', photo._id);
      activePhoto = photo;

      // photo.src = photo.src.replace('thumbnail', 'original');

      setTimeout(function(){
        if (activePhoto === photo)
          $scope.click(photo);
      }, 1000);
  };

  $scope.dragstart = function(photo){
    photo.class = 'clear';
    event.preventDefault();
  };

  $scope.rightClick = function(photo){
    $scope.photoInCenter = photo === $scope.photoInCenter ? null : $scope.photoInCenter;

    return true;
  };

  $scope.click = function(photo){

    if ($scope.selectedPhoto === photo){
      clearTimeout(photo.updateClick);
      $scope.select(null);
    }
    else {
      $scope.select(photo);
      photo.updateClick = setTimeout(function(){
        console.log('click', photo);
        socket.emit('click', photo, 1);
      }, 300);
    }

  };

  $scope.hide = function(photo, group){
    console.log('hide', photo);
    socket.emit('hide', photo._id);
    photo.vote = 10;
  };


  socket.on('update', function(photos){
    console.log('update', photos);
    _.each(photos, function(photo){
      _.first($scope.photos, {_id : photo._id}, function(existing){
        _.assign(existing, photo);
      });
    });
  });

}
var loadTimeout;

function PhotosController($scope, $http){
  
  var zoomTimeout = null;
  $scope.photos = [];
  $scope.groups = {};
  $scope.dateRange = new Date();
  $scope.lastDate = null;
  $scope.startDate = new Date();

  $scope.zoomLevel = 50;

  var counter = 0;
  
  $scope.loadMore = function(zoomLevel, startDate) {

    $scope.loading = true;

    var query = {skip : $scope.counter, startDate: $scope.startDate.toISOString(), reverse : $scope.loadingReverse, vote : $scope.zoomLevel, limit: 100};
    $http.get('/photoFeed', {params : query})
    .success(function(photos){
      $scope.loading = false;

      photos.map(function(photo){

        photo.class = "v" + photo.mine.vote;
        return photo;
      });

      counter += photos.length;
      if (startDate){ // append instead of reloading
        Array.prototype.push.apply($scope.photos, photos);
        /*$scope.photos = data.sort(function(a,b){
          return a.taken - b.taken;
        }.reduce(function(a,b){
          return a.taken !== b.taken ? [a,b] : [a];
        }, []));*/
      } else {
        $scope.photos = photos;
        counter = photos.length; // reset counter
      }


      // counter += data.length;

      $scope.photos = $scope.photos.reduce(function(a,b){
        
        if (!a.some(function(photo){return photo._id === b._id})) {
          a.push(b);
        }

        return a;
      }, []);

      // $scope.recalculateGroups($scope.photos);
    });
  };

  $scope.recalculateGroups = function(photos){
      var groups = {};
      var groupArray = []; //  fix to reverse sort order
     
      var filteredPhotos = photos.filter(function(photo){
        return (photo.interestingness > 100 - $scope.zoomLevel);  
      });


      if (filteredPhotos.length > 0){
        (filteredPhotos||[]).forEach(function(photo){
          var group = getGroup(groups, photo);
          group.photos.push(photo);
        });
        

        angular.forEach(groups, function(group){
          groupArray.push(group);

          setTimeout(function(){
            new Masonry( document.getElementById(group.id), {
              columnWidth: 240,
              gutterWidth:0,
              isAnimated: true
            });
          }, 400);

          group.photos.sort(function(photoA, photoB){
            return photoA.interestingness < photoB.interestingness;
          })
          .map(function(photo){
            photo.class = "span3"; // default span3
            return photo;
          })
          .slice(0, Math.max(1, Math.round(group.photos.length / 8 ))) // top 3 per twelve
          .forEach(function(photo){
            photo.class = "span6 pull-left"; // span6 for most interesting photos
          });
        });
      }

      $scope.groups = groupArray;

      console.log(groupArray);

  };

  var timeout = null;

  $scope.$watch('zoomLevel', function(value){
    
    clearTimeout(timeout);

    timeout = setTimeout(function(){
      $scope.loadMore(value);
    }, 100);

  });


  var getGroup = function(groups, photo){
    // group on date per default, TODO: add switch and control for this
    var groupName = getGroupName(photo),
        group = groups[groupName] = groups[groupName] || {};
    
    // split the groups if they are too big
    while(group.length > 20) {
      groupName = groupName + "_2";
      group = groups[groupName] = groups[groupName] || {};
    }

    group.photos = group.photos || [];

    if (group.photos.length){
      if (group.photos[group.photos.length-1].taken.split('T')[0] === group.photos[0].taken.split('T')[0])
      {
        group.name = group.photos[0].taken.split('T')[0];
      }
      else
      {
        group.name = group.photos[group.photos.length-1].taken.split('T')[0] + " - " + group.photos[0].taken.split('T')[0];
      }
      group.id = groupName;
    }
    return group;
  };

  var getGroupName = function(photo){

    return photo.groups[0];

    if ($scope.zoomLevel > 80) {
      return photo.taken.split('T')[0]; // whole date
    }

    if ($scope.zoomLevel >= 50) {
      return photo.taken.substring(0, 7); // month
    }

    if ($scope.zoomLevel > 20){
      return photo.taken.substring(0, 4); // year
    }

    return photo.taken.substring(0, 3); // decade

  };

  // initial loading of photos
  $scope.loadMore($scope.zoomLevel);
}

function ShareController($scope, $http){
  $scope.email = "";
  $scope.photos = [];
  $scope.dateRange = [];
  $scope.fromDate = undefined;
  $scope.toDate = undefined;

  $scope.toggle = true;

  $scope.$watch('fromDate+toDate', function() {
    $scope.dateRange = $scope.fromDate + " - " + $scope.toDate;
  });

  $scope.$watch('defaultDateRange', function(value){
    $scope.dateRange = value;
  });

  $scope.select = function(photo){
    
    if ($scope.toggle = !$scope.toggle) {
      $scope.fromDate = photo.taken; //.replace('T', ' ').split('.')[0];
    } else {
      $scope.toDate = photo.taken; //.replace('T', ' ').split('.')[0];
    }

  };

  $scope.reset = function()
  {
    $scope.toggle = true;
    $scope.dateRange = $scope.defaultDateRange;
  };

  $scope.$watch('dateRange', function(newVal) {
    var query = {email : $scope.email.toString(), dateRange : $scope.dateRange.toString()};
    console.log(query);
    $http.post('/api/photoRange', query)
    .success(function(data){
      console.log(data);
      $scope.photos = data;
    });
  });
}

function SlideshowController ($scope, $http){
  $scope.group = undefined;
  this.setModel = function(data) {
    $scope.$apply( function() {
       $scope.data = data;
    });
  };
  $scope.setModel = this.setModel;
}

appProvider.factory('socket', function(){

  var socket = io.connect();

  return socket;

});

appProvider.factory('storage', function(){

	Storage.prototype.setObject = function(key, value) {
		this.setItem(key, JSON.stringify(value));
	};

	Storage.prototype.getObject = function(key) {
		var value = this.getItem(key);
		return value && JSON.parse(value);
	};

  return localStorage;
});
function UploadController($scope, $http){

  $scope.state = null;
  $scope.channels = 2;
  $scope.queue = [];
  $scope.uploading = true;
  $scope.files = [];
  $scope.doneSize = 0;

  $scope.$watch('channels + queue.length', function(channels){
    $scope.uploading = channels > 0 && $scope.queue.length > 0;
  });

  $scope.$watch('uploading', function(uploading){
    $scope.files.filter(function(file){return file.state === "Processing" || file.state === "Uploading" }).map(function(file){
      file.state = ''; // restart the current uploading files and try again
      file.progress = 0;
      file.thumbnail = null;
    });
  });

  $scope.$watch('files.length - queue.length', function(left){
    var progress = $scope.doneSize / $scope.allSize;
    if (progress) Piecon.setProgress(progress * 100);
  });

  $scope.$watch('files.length', function(files){
    if (!$scope.files) return;

    $scope.allSize = 0;
    $scope.files
    .sort(function(a,b){
      return b.modified - a.modified;
    })    //.reduce(function(a,b){a.slice(-1).modified !== b.modified && a.push(b); return a}, [])
    .filter(function(file){
      return file.status !== "Error" && file.state !== "Duplicate";
    })
    .forEach(function(photo){
      $scope.allSize += photo.size;
    });
//     console.log($scope.allSize);
  });

  var uploadInterval;
  $scope.$watch('uploading', function(on){
    clearInterval(uploadInterval);

    if (on){
      // check every interval for new files to process but don't add new if the current ones are in a processing state
      uploadInterval = setInterval(function(){

        // rebuild the queue
        $scope.queue = $scope.files.filter(function(file){
          return !file.state || file.state === "Processing" || file.state === "Uploading";
        });

        // remove duplicates and read exif
        $scope.queue.slice(0, $scope.channels * 2).forEach(function(file){
          if (file.exif === undefined){
            readExif(file, function(err, exif){
              if (err)
                return file.status = "Error";

              file.exif = exif;
              file.taken = exif && exif.DateTime ? exif.DateTime.slice(0,10).split(':').join('-') + exif.DateTime.slice(10) : null;
              var exists = exif && ($scope.library.photos.filter(function(photo){
                return photo.taken === new Date(file.taken).getTime();
              }).length);

              if (exists) {
                // $scope.doneSize += file.size;
                return file.state = "Duplicate";
              }
            });
          }
        });

        // of the processed files in the queue, start processing a few
        $scope.queue.filter(function(file){ return file.exif !== undefined})
        .slice(0,$scope.channels + 1).forEach(function(file){
          if (!file.started){
            file.started = true;

            // TODO: replace these to calls to worker instead
            generateThumbnail(file, {
              width:640,
              height:480
            },
            function(err, thumbnail){
              if (err) return file.state = 'Error';
              file.thumbnail = thumbnail;
              uploadFile(file, function(err, file, photo){
                if (err) {
                  file.state = 'Error';
                  file.error = err;
                  file.progress = 30;
                  console.log('Error:', file.error);
                } else {
                  $scope.doneSize += file.size;
                  file.state = 'Done';
                  file.progress = 100;
                }
              });
            });
          }
        });

        if ($scope.queue.length === 0){
          $scope.uploading = false;
          clearInterval(uploadInterval);
        }

        $scope.$apply();
      }, 500);
    }
  });


  // TODO: move these to a worker instead
  function readExif(file, done){
    if(!done) throw "Callback required";

    var fr   = new FileReader;
    fr.onloadend = function() {
      try{
        var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
        done(null, exif);
      } catch(err){
        done(err);
      }
    };
    fr.readAsBinaryString(file);
  }

  // API: http://code.google.com/p/crypto-js/
  function encrypt(file, secret){
    var encrypted = CryptoJS.Rabbit.encrypt(file, secret);
    var decrypted = CryptoJS.Rabbit.decrypt(encrypted, secret);
  }

  function uploadFile(file, done){
    var fd = new FormData();
    var thumbnail = dataURItoBlob(file.thumbnail);

    // TODO: add encryption here
    
    if (file.exif)
      fd.append('exif', JSON.stringify(file.exif));

    if (file.path)
      fd.append('path', file.path + file.filename);

    // fd.append('original|' + file.taken + '|' + file.size, file);
    fd.append('thumbnail' + '|' + file.taken + '|' + thumbnail.size, thumbnail);
    console.log('uploading...', file.taken, thumbnail.size);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2 * 60 * 1000;
    xhr.open("POST", "/api/upload", true);

    xhr.onload = function() {
      if(this.status !== 200){
        return done(new Error(xhr.responseText), file);
      } else {
          var response = xhr.responseText;
          var photo = JSON.parse(response);

          delete file.thumbnail; // save memory
          delete file.exif;
          return done(null, file, photo);
      }
    };

    xhr.ontimeout = function(){
      file.state = 'Error';
    };

    // Listen to the upload progress.
    xhr.upload.onprogress = function(e) {
        file.state = 'Uploading';
      if (e.lengthComputable) {
        file.progress = (e.loaded / e.total) * 100;
      } else {
        file.progress = Math.min(file.progress++, 100);
      }
    };

    xhr.onreadystatechange=function(){
      if (xhr.status > 200)
        done(xhr.status, file);
    };

    file.progress = 1;
    try{
      xhr.send(fd);
    } catch(err){
      done(err, file);
    }
  }


  function generateThumbnail(file, options, done){

    options = options || {};
    var img = document.createElement("img");
    var reader = new FileReader();
    
    try {
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        img.src = this.result;
        var MAX_WIDTH = options.width || 640;
        var MAX_HEIGHT = options.height || 480;

        img.onload = function(){

          var width = img.width;
          var height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          var ctx = canvas.getContext("2d");
          ctx.drawImage(this, 0, 0, width, height);

          var thumbnail = canvas.toDataURL('image/jpeg');
          if (done) return done(null, thumbnail);
        };
      };
    } catch(err){
      if (done) return done(err);
    }
  }

  function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }
}
 
function LoginController($http, $scope){
//  $scope.register = undefined;
  $scope.agree = false;
  $scope.username = undefined;
  $scope.password = undefined;

  $scope.$watch('username', function(val){
    if (val && val.indexOf('@') && val.length > 4){
      $http.get('/api/user/exist', {params: {q:val}})
      .success(function(result){
        $scope.register = !JSON.parse(result);
      });
    }
  });

}
function WallController($scope, $http, $window, library, Group){
  
  var zoomTimeout = null;
  var scrollTimeout = null;
  var windowHeight = window.innerHeight;

  $scope.startDate = new Date();
  $scope.zoomLevel = 5;
  $scope.height = 240;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;
  $scope.nrPhotos = undefined;
  $scope.photosInView = [];
  $scope.selectedPhoto = null;
  $scope.q = null;
  $scope.fullscreen = false;
  $scope.loading = true;

  library.init();

  var lastPosition = null;
  var waiting = false;

  $window.onresize = function(event) {
    windowHeight = window.innerHeight;
  };
   
  $window.onscroll = function(event) {

    $scope.loadingReverse = $(window).scrollTop() < 0;
    $scope.scrollPosition = $(window).scrollTop();

    var delta = $scope.scrollPosition - lastPosition;
    $scope.scrolling = (Math.abs(delta) > 10);

    if (isInViewPort($scope.scrollPosition + delta * 2)) return ;


    filterView(delta);



    // if (!waiting && $scope.photosInView) $scope.photoInCenter = _.filter($scope.photosInView, function(a){return a.top >= $scope.scrollPosition + window.outerHeight / 2 - $scope.height / 2}).sort(function(a,b){ return b.taken-a.taken })[0];

    lastPosition = $scope.scrollPosition;

  };


  $scope.dblclick = function(photo){
    $scope.select(null);
    //$scope.zoomLevel += 3;
/*
    var index=$scope.library.photos.indexOf(photo);

    $scope.library.photos.slice(index, index + 10).map(function(photo){
      photo.vote = 0;
    });

    recalculateSizes();*/

  };

  $scope.select = function(photo){
    if (photo) {
      $scope.photoInCenter = photo;
    }

    $scope.selectedPhoto = photo;
  };



  $scope.$watch('stats', function(value){
    if ($scope.stats && $scope.stats.all && !$scope.totalHeight) $scope.totalHeight = $scope.height * $scope.stats.all / 5; // default to a height based on the known amount of images
  });

  $scope.$watch('photoInCenter', function(photo){
    if (!photo) return;

    $scope.q = photo && photo.taken;
    var meta = $('#meta')[0];
    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
    });

  });

  $scope.$watch('selectedPhoto', function(photo, old){

    if (old){
      if (old.original) {
        old.src = old.original.src;
        angular.copy(old.original, old);
      }
      old.src = old.src.replace('original', 'thumbnail').split('?')[0];
      old.class = 'done';

      delete old.original;
    }

    if (!photo) return;

    if (window.history.pushState) {
      window.history.pushState(photo, "Photo #" + photo._id, "#" + photo.taken);
    }
    photo.original = angular.copy(photo);
    photo.class="selected";

    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
      photo.src = fullPhoto.store.original.url;
      $scope.loading = true;
      $scope.$apply();
      photo.loaded = function(){
        photo.loaded = null;
        $scope.loading = false;
        photo.class="selected loaded";
        $scope.$apply();
      };
    });

    photo.top = $(document).scrollTop() - 20; // zoom in a little bit more - gives the wide screen a little more space to fill the screen
    photo.height = window.innerHeight + 40;
    photo.width = Math.round(photo.height * photo.ratio);
    photo.left = Math.max(0,(window.innerWidth/2 - photo.width/2));

  });

  library.listeners.push(function(photos){

    $scope.groups = (photos).reduce(function(groups, photo, i){

      var group = groups.slice(-1)[0];
      var lastPhoto = group && group.photos.slice(-1)[0];

      if (!group || (lastPhoto && lastPhoto.cluster && photo.cluster && photo.cluster.split('.')[0] !== lastPhoto.cluster.split('.')[0])) {
        group = new Group();
        groups.push(group);
      }
      group.photos.push(photo);
      return groups;
    }, []);
        
    recalculateSizes();
    filterView(); // initial view

  });
  

  $scope.$watch('zoomLevel + fullscreen', function(value, oldValue){
    
    
    if ($scope.zoomLevel){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){
        
        $scope.loading = true;

        // Recalculate all widths and heights in the current window size and vote level
        recalculateSizes();
        
        if(!$scope.$$phase) $scope.$apply();

        // Waiting is a semaphore for preventing the scoll method of
        // changing the scroll-position until we are done with our filtering.
        
        waiting = true;
        setTimeout(function(){
          filterView();
          waiting = false;
          $scope.loading = false;
          $scope.scrolling = false;

        }, 500);

      }, 300);
    }

  });

  $scope.$watch('activeGroup', function(group){
    if (group) $('body,html').animate({scrollTop: group.top}, 300);
  });

  function isInViewPort(top, delta){
    return top > $scope.scrollPosition - (windowHeight * 2) && top < $scope.scrollPosition + windowHeight * 2;
  }
  function visible(photo, delta){
//    if (Math.abs(delta) > windowHeight / 2) return;
    return photo && photo.active && isInViewPort(photo.top, delta) || photo && isInViewPort(photo.top + photo.height, delta);
  }

  // by using a queue we can make sure we only prioritize loading images that are visible
  var loadQueue = async.queue(function(photo, done){
    if (!photo || photo.visible) return done(); // we already have this one

    photo.visible = visible(photo);
    if (!photo.visible) return done();
    return photo.loaded = function(){
      photo.loaded = null;
      photo.class = 'done';
      done(); // let the image load attribute determine when the image is loaded
    };
  }, 20);


  function filterView(delta){
    $scope.scrolling = false;

    $scope.photosInView = $scope.groups.reduce(function(visiblePhotos, group){
      if (isInViewPort(group.top) || isInViewPort(group.bottom) || group.top <= $scope.scrollPosition && group.bottom >= $scope.scrollPosition){
        group.photos.forEach(function(photo){
          if (photo.active) visiblePhotos.push(photo);
        });
      }
      return visiblePhotos;
    }, []).sort(function(a,b){
      return (a.vote - b.vote);
      //return $scope.photoInCenter && Math.abs($scope.photoInCenter.top - a.top) - Math.abs($scope.photoInCenter.top - b.top) || 0 - (a.vote - b.vote) * $scope.height;
    });

    // async.mapLimit($scope.photosInView, 5, function(photo, done){
    //   if (photo.visible) return done(); // we already have this one

    //   photo.visible = visible(photo);
    //   if (!photo.visible) return done();
    //   return photo.loaded = function(){
    //     photo.loaded = null;
    //     photo.class = 'done';
    //     done(); // let the image load attribute determine when the image is loaded
    //   };
    // }, function(){
    //   // page done
    // });
/*
    photosInView = photosInView.sort(function(a,b){
      // take the center ones first but also prioritize the highest voted photos since they are more likely to be cached
      return $scope.photoInCenter && Math.abs($scope.photoInCenter.top - a.top) - Math.abs($scope.photoInCenter.top - b.top) || 0 - (a.vote - b.vote) * $scope.height;
    });


    var newImages = _.filter(photosInView, function(a){return !a.visible});
    */

    //loadQueue.tasks = [];
    //loadQueue.push($scope.photosInView);
    if(!$scope.$$phase) $scope.$apply();

  }


  function recalculateSizes(){

    $scope.height = $scope.zoomLevel > 8 && 110 ||
                    $scope.zoomLevel > 6 && 120 ||
                    $scope.zoomLevel < 2 && 480 ||
                    240;

    // compensate for bigger / smaller screens
    $scope.height = Math.floor($scope.height * (window.innerWidth / 1920));
    $scope.totalHeight = $scope.groups.reduce(function(top, group){
      var left = 5; //lastGroup && lastGroup.right + 5 || 0;
      group.bind(top, left, $scope.height, $scope.zoomLevel);
      console.log('bottom', group.bottom, top, group.visible)
      return (group.bottom || top) + 5;
    }, 100);
    

    $scope.nrPhotos = $scope.groups.reduce(function(sum, group){return sum + group.visible}, 0);
  }



  document.addEventListener( 'keyup', function( e ) {
    var keyCode = e.keyCode || e.which,
        keys = {
          27: 'esc',
          32: 'space',
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
          48: 'zero',
          49: 'one',
          50: 'two',
          51: 'three',
          52: 'four',
          53: 'five',
          54: 'six',
          55: 'seven',
          56: 'eight',
          57: 'nine'
        };
    

    var current = $scope.photos.indexOf($scope.selectedPhoto);

    switch (keys[keyCode]) {
      case 'space' :
        if ($scope.selectedPhoto)
          $scope.select(null);
        else
          $scope.select($scope.photoInCenter);

        $scope.$apply();
        e.preventDefault();
      break;

      case 'esc' :
        $scope.select(null);
        $scope.$apply();
        // e.preventDefault();
      break;
      case 'left':
        $scope.select(current > 0 ? $scope.photos[current -1 ] : null);
        $scope.$apply();
        e.preventDefault();
        
      break;
      case 'up':
        //..
      break;
      case 'right':
        $scope.select($scope.photos.length > current ? $scope.photos[current +1 ] : null);
        $scope.$apply();
        e.preventDefault();
      break;
      case 'down':
        //..
      break;
      case 'zero' : $scope.vote(0); break;
      case 'one' : vote($('.selected')[0].id, 1); break;
      case 'two' : vote($('.selected')[0].id, 2); break;
      case 'three' : vote($('.selected')[0].id, 3); break;
      case 'four' : vote($('.selected')[0].id, 4); break;
      case 'five' : vote($('.selected')[0].id, 5); break;
      case 'sixe' : vote($('.selected')[0].id, 6); break;
      case 'seven' : vote($('.selected')[0].id, 7); break;
      case 'eight' : vote($('.selected')[0].id, 8); break;
      case 'nine' : vote($('.selected')[0].id, 9); break;
    }
  });
  
}