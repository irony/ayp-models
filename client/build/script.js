/*! IndexedDBShim - v0.1.2 - 2013-06-12 */
var idbModules={};(function(e){function t(e,t,n,o){n.target=t,"function"==typeof t[e]&&t[e].apply(t,[n]),"function"==typeof o&&o()}function n(t,n,o){var i=new DOMException.constructor(0,n);throw i.name=t,i.message=n,i.stack=arguments.callee.caller,e.DEBUG&&console.log(t,n,o,i),i}var o=function(){this.length=0,this._items=[],Object.defineProperty&&Object.defineProperty(this,"_items",{enumerable:!1})};if(o.prototype={contains:function(e){return-1!==this._items.indexOf(e)},item:function(e){return this._items[e]},indexOf:function(e){return this._items.indexOf(e)},push:function(e){this._items.push(e),this.length+=1;for(var t=0;this._items.length>t;t++)this[t]=this._items[t]},splice:function(){this._items.splice.apply(this._items,arguments),this.length=this._items.length;for(var e in this)e===parseInt(e,10)+""&&delete this[e];for(e=0;this._items.length>e;e++)this[e]=this._items[e]}},Object.defineProperty)for(var i in{indexOf:!1,push:!1,splice:!1})Object.defineProperty(o.prototype,i,{enumerable:!1});e.util={throwDOMException:n,callback:t,quote:function(e){return"'"+e+"'"},StringList:o}})(idbModules),function(e){var t=function(){return{encode:function(e){return JSON.stringify(e)},decode:function(e){return JSON.parse(e)}}}();e.Sca=t}(idbModules),function(e){var t=["","number","string","boolean","object","undefined"],n=function(){return{encode:function(e){return t.indexOf(typeof e)+"-"+JSON.stringify(e)},decode:function(e){return e===void 0?void 0:JSON.parse(e.substring(2))}}},o={number:n("number"),"boolean":n(),object:n(),string:{encode:function(e){return t.indexOf("string")+"-"+e},decode:function(e){return""+e.substring(2)}},undefined:{encode:function(){return t.indexOf("undefined")+"-undefined"},decode:function(){return void 0}}},i=function(){return{encode:function(e){return o[typeof e].encode(e)},decode:function(e){return o[t[e.substring(0,1)]].decode(e)}}}();e.Key=i}(idbModules),function(e){var t=function(e,t){return{type:e,debug:t,bubbles:!1,cancelable:!1,eventPhase:0,timeStamp:new Date}};e.Event=t}(idbModules),function(e){var t=function(){this.onsuccess=this.onerror=this.result=this.error=this.source=this.transaction=null,this.readyState="pending"},n=function(){this.onblocked=this.onupgradeneeded=null};n.prototype=t,e.IDBRequest=t,e.IDBOpenRequest=n}(idbModules),function(e,t){var n=function(e,t,n,o){this.lower=e,this.upper=t,this.lowerOpen=n,this.upperOpen=o};n.only=function(e){return new n(e,e,!0,!0)},n.lowerBound=function(e,o){return new n(e,t,o,t)},n.upperBound=function(e){return new n(t,e,t,open)},n.bound=function(e,t,o,i){return new n(e,t,o,i)},e.IDBKeyRange=n}(idbModules),function(e,t){function n(n,o,i,r,s,a){this.__range=n,this.source=this.__idbObjectStore=i,this.__req=r,this.key=t,this.direction=o,this.__keyColumnName=s,this.__valueColumnName=a,this.source.transaction.__active||e.util.throwDOMException("TransactionInactiveError - The transaction this IDBObjectStore belongs to is not active."),this.__offset=-1,this.__lastKeyContinued=t,this["continue"]()}n.prototype.__find=function(n,o,i,r){var s=this,a=["SELECT * FROM ",e.util.quote(s.__idbObjectStore.name)],u=[];a.push("WHERE ",s.__keyColumnName," NOT NULL"),s.__range&&(s.__range.lower||s.__range.upper)&&(a.push("AND"),s.__range.lower&&(a.push(s.__keyColumnName+(s.__range.lowerOpen?" >":" >= ")+" ?"),u.push(e.Key.encode(s.__range.lower))),s.__range.lower&&s.__range.upper&&a.push("AND"),s.__range.upper&&(a.push(s.__keyColumnName+(s.__range.upperOpen?" < ":" <= ")+" ?"),u.push(e.Key.encode(s.__range.upper)))),n!==t&&(s.__lastKeyContinued=n,s.__offset=0),s.__lastKeyContinued!==t&&(a.push("AND "+s.__keyColumnName+" >= ?"),u.push(e.Key.encode(s.__lastKeyContinued))),a.push("ORDER BY ",s.__keyColumnName),a.push("LIMIT 1 OFFSET "+s.__offset),e.DEBUG&&console.log(a.join(" "),u),o.executeSql(a.join(" "),u,function(n,o){if(1===o.rows.length){var r=e.Key.decode(o.rows.item(0)[s.__keyColumnName]),a="value"===s.__valueColumnName?e.Sca.decode(o.rows.item(0)[s.__valueColumnName]):e.Key.decode(o.rows.item(0)[s.__valueColumnName]);i(r,a)}else e.DEBUG&&console.log("Reached end of cursors"),i(t,t)},function(t,n){e.DEBUG&&console.log("Could not execute Cursor.continue"),r(n)})},n.prototype["continue"]=function(e){var n=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,s){n.__offset++,n.__find(e,o,function(e,o){n.key=e,n.value=o,r(n.key!==t?n:t,n.__req)},function(e){s(e)})})},n.prototype.advance=function(n){0>=n&&e.util.throwDOMException("Type Error - Count is invalid - 0 or negative",n);var o=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(e,i,r,s){o.__offset+=n,o.__find(t,e,function(e,n){o.key=e,o.value=n,r(o.key!==t?o:t,o.__req)},function(e){s(e)})})},n.prototype.update=function(n){var o=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(i,r,s,a){o.__find(t,i,function(t){var r="UPDATE "+e.util.quote(o.__idbObjectStore.name)+" SET value = ? WHERE key = ?";e.DEBUG&&console.log(r,n,t),i.executeSql(r,[e.Sca.encode(n),e.Key.encode(t)],function(e,n){1===n.rowsAffected?s(t):a("No rowns with key found"+t)},function(e,t){a(t)})},function(e){a(e)})})},n.prototype["delete"]=function(){var n=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,s){n.__find(t,o,function(i){var a="DELETE FROM  "+e.util.quote(n.__idbObjectStore.name)+" WHERE key = ?";e.DEBUG&&console.log(a,i),o.executeSql(a,[e.Key.encode(i)],function(e,n){1===n.rowsAffected?r(t):s("No rowns with key found"+i)},function(e,t){s(t)})},function(e){s(e)})})},e.IDBCursor=n}(idbModules),function(idbModules,undefined){function IDBIndex(e,t){this.indexName=this.name=e,this.__idbObjectStore=this.objectStore=this.source=t;var n=t.__storeProps&&t.__storeProps.indexList;n&&(n=JSON.parse(n)),this.keyPath=n&&n[e]&&n[e].keyPath||e,["multiEntry","unique"].forEach(function(t){this[t]=!!(n&&n[e]&&n[e].optionalParams&&n[e].optionalParams[t])},this)}IDBIndex.prototype.__createIndex=function(indexName,keyPath,optionalParameters){var me=this,transaction=me.__idbObjectStore.transaction;transaction.__addToTransactionQueue(function(tx,args,success,failure){me.__idbObjectStore.__getStoreProps(tx,function(){function error(){idbModules.util.throwDOMException(0,"Could not create new index",arguments)}2!==transaction.mode&&idbModules.util.throwDOMException(0,"Invalid State error, not a version transaction",me.transaction);var idxList=JSON.parse(me.__idbObjectStore.__storeProps.indexList);idxList[indexName]!==undefined&&idbModules.util.throwDOMException(0,"Index already exists on store",idxList);var columnName=indexName;idxList[indexName]={columnName:columnName,keyPath:keyPath,optionalParams:optionalParameters},me.__idbObjectStore.__storeProps.indexList=JSON.stringify(idxList);var sql=["ALTER TABLE",idbModules.util.quote(me.__idbObjectStore.name),"ADD",columnName,"BLOB"].join(" ");idbModules.DEBUG&&console.log(sql),tx.executeSql(sql,[],function(tx,data){tx.executeSql("SELECT * FROM "+idbModules.util.quote(me.__idbObjectStore.name),[],function(tx,data){(function initIndexForRow(i){if(data.rows.length>i)try{var value=idbModules.Sca.decode(data.rows.item(i).value),indexKey=eval("value['"+keyPath+"']");tx.executeSql("UPDATE "+idbModules.util.quote(me.__idbObjectStore.name)+" set "+columnName+" = ? where key = ?",[idbModules.Key.encode(indexKey),data.rows.item(i).key],function(){initIndexForRow(i+1)},error)}catch(e){initIndexForRow(i+1)}else idbModules.DEBUG&&console.log("Updating the indexes in table",me.__idbObjectStore.__storeProps),tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?",[me.__idbObjectStore.__storeProps.indexList,me.__idbObjectStore.name],function(){me.__idbObjectStore.__setReadyState("createIndex",!0),success(me)},error)})(0)},error)},error)},"createObjectStore")})},IDBIndex.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"value"),n},IDBIndex.prototype.openKeyCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"key"),n},IDBIndex.prototype.__fetchIndexData=function(e,t){var n=this;return n.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,s){var a=["SELECT * FROM ",idbModules.util.quote(n.__idbObjectStore.name)," WHERE",n.indexName,"NOT NULL"],u=[];e!==undefined&&(a.push("AND",n.indexName," = ?"),u.push(idbModules.Key.encode(e))),idbModules.DEBUG&&console.log("Trying to fetch data for Index",a.join(" "),u),o.executeSql(a.join(" "),u,function(e,n){var o;o="count"==typeof t?n.rows.length:0===n.rows.length?undefined:"key"===t?idbModules.Key.decode(n.rows.item(0).key):idbModules.Sca.decode(n.rows.item(0).value),r(o)},s)})},IDBIndex.prototype.get=function(e){return this.__fetchIndexData(e,"value")},IDBIndex.prototype.getKey=function(e){return this.__fetchIndexData(e,"key")},IDBIndex.prototype.count=function(e){return this.__fetchIndexData(e,"count")},idbModules.IDBIndex=IDBIndex}(idbModules),function(idbModules){var IDBObjectStore=function(e,t,n){this.name=e,this.transaction=t,this.__ready={},this.__setReadyState("createObjectStore",n===void 0?!0:n),this.indexNames=new idbModules.util.StringList};IDBObjectStore.prototype.__setReadyState=function(e,t){this.__ready[e]=t},IDBObjectStore.prototype.__waitForReady=function(e,t){var n=!0;if(t!==void 0)n=this.__ready[t]===void 0?!0:this.__ready[t];else for(var o in this.__ready)this.__ready[o]||(n=!1);if(n)e();else{idbModules.DEBUG&&console.log("Waiting for to be ready",t);var i=this;window.setTimeout(function(){i.__waitForReady(e,t)},100)}},IDBObjectStore.prototype.__getStoreProps=function(e,t,n){var o=this;this.__waitForReady(function(){o.__storeProps?(idbModules.DEBUG&&console.log("Store properties - cached",o.__storeProps),t(o.__storeProps)):e.executeSql("SELECT * FROM __sys__ where name = ?",[o.name],function(e,n){1!==n.rows.length?t():(o.__storeProps={name:n.rows.item(0).name,indexList:n.rows.item(0).indexList,autoInc:n.rows.item(0).autoInc,keyPath:n.rows.item(0).keyPath},idbModules.DEBUG&&console.log("Store properties",o.__storeProps),t(o.__storeProps))},function(){t()})},n)},IDBObjectStore.prototype.__deriveKey=function(tx,value,key,callback){function getNextAutoIncKey(){tx.executeSql("SELECT * FROM sqlite_sequence where name like ?",[me.name],function(e,t){1!==t.rows.length?callback(0):callback(t.rows.item(0).seq)},function(e,t){idbModules.util.throwDOMException(0,"Data Error - Could not get the auto increment value for key",t)})}var me=this;me.__getStoreProps(tx,function(props){if(props||idbModules.util.throwDOMException(0,"Data Error - Could not locate defination for this table",props),props.keyPath)if(key!==void 0&&idbModules.util.throwDOMException(0,"Data Error - The object store uses in-line keys and the key parameter was provided",props),value)try{var primaryKey=eval("value['"+props.keyPath+"']");primaryKey?callback(primaryKey):"true"===props.autoInc?getNextAutoIncKey():idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath")}catch(e){idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath",e)}else idbModules.util.throwDOMException(0,"Data Error - KeyPath was specified, but value was not");else key!==void 0?callback(key):"false"===props.autoInc?idbModules.util.throwDOMException(0,"Data Error - The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ",props):getNextAutoIncKey()})},IDBObjectStore.prototype.__insertData=function(tx,value,primaryKey,success,error){var paramMap={};primaryKey!==void 0&&(paramMap.key=idbModules.Key.encode(primaryKey));var indexes=JSON.parse(this.__storeProps.indexList);for(var key in indexes)try{paramMap[indexes[key].columnName]=idbModules.Key.encode(eval("value['"+indexes[key].keyPath+"']"))}catch(e){error(e)}var sqlStart=["INSERT INTO ",idbModules.util.quote(this.name),"("],sqlEnd=[" VALUES ("],sqlValues=[];for(key in paramMap)sqlStart.push(key+","),sqlEnd.push("?,"),sqlValues.push(paramMap[key]);sqlStart.push("value )"),sqlEnd.push("?)"),sqlValues.push(idbModules.Sca.encode(value));var sql=sqlStart.join(" ")+sqlEnd.join(" ");idbModules.DEBUG&&console.log("SQL for adding",sql,sqlValues),tx.executeSql(sql,sqlValues,function(){success(primaryKey)},function(e,t){error(t)})},IDBObjectStore.prototype.add=function(e,t){var n=this;return n.transaction.__addToTransactionQueue(function(o,i,r,s){n.__deriveKey(o,e,t,function(t){n.__insertData(o,e,t,r,s)})})},IDBObjectStore.prototype.put=function(e,t){var n=this;return n.transaction.__addToTransactionQueue(function(o,i,r,s){n.__deriveKey(o,e,t,function(t){var i="DELETE FROM "+idbModules.util.quote(n.name)+" where key = ?";o.executeSql(i,[idbModules.Key.encode(t)],function(o,i){idbModules.DEBUG&&console.log("Did the row with the",t,"exist? ",i.rowsAffected),n.__insertData(o,e,t,r,s)},function(e,t){s(t)})})})},IDBObjectStore.prototype.get=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("SELECT * FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Fetched data",t);try{if(0===t.rows.length)return i();i(idbModules.Sca.decode(t.rows.item(0).value))}catch(n){idbModules.DEBUG&&console.log(n),i(void 0)}},function(e,t){r(t)})})})},IDBObjectStore.prototype["delete"]=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("DELETE FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Deleted from database",t.rowsAffected),i()},function(e,t){r(t)})})})},IDBObjectStore.prototype.clear=function(){var e=this;return e.transaction.__addToTransactionQueue(function(t,n,o,i){e.__waitForReady(function(){t.executeSql("DELETE FROM "+idbModules.util.quote(e.name),[],function(e,t){idbModules.DEBUG&&console.log("Cleared all records from database",t.rowsAffected),o()},function(e,t){i(t)})})})},IDBObjectStore.prototype.count=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o="SELECT * FROM "+idbModules.util.quote(t.name)+(e!==void 0?" WHERE key = ?":""),s=[];e!==void 0&&s.push(idbModules.Key.encode(e)),n.executeSql(o,s,function(e,t){i(t.rows.length)},function(e,t){r(t)})})})},IDBObjectStore.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this,n,"key","value"),n},IDBObjectStore.prototype.index=function(e){var t=new idbModules.IDBIndex(e,this);return t},IDBObjectStore.prototype.createIndex=function(e,t,n){var o=this;n=n||{},o.__setReadyState("createIndex",!1);var i=new idbModules.IDBIndex(e,o);return o.__waitForReady(function(){i.__createIndex(e,t,n)},"createObjectStore"),o.indexNames.push(e),i},IDBObjectStore.prototype.deleteIndex=function(e){var t=new idbModules.IDBIndex(e,this,!1);return t.__deleteIndex(e),t},idbModules.IDBObjectStore=IDBObjectStore}(idbModules),function(e){var t=0,n=1,o=2,i=function(o,i,r){if("number"==typeof i)this.mode=i,2!==i&&e.DEBUG&&console.log("Mode should be a string, but was specified as ",i);else if("string"==typeof i)switch(i){case"readwrite":this.mode=n;break;case"readonly":this.mode=t;break;default:this.mode=t}this.storeNames="string"==typeof o?[o]:o;for(var s=0;this.storeNames.length>s;s++)r.objectStoreNames.contains(this.storeNames[s])||e.util.throwDOMException(0,"The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",this.storeNames[s]);this.__active=!0,this.__running=!1,this.__requests=[],this.__aborted=!1,this.db=r,this.error=null,this.onabort=this.onerror=this.oncomplete=null};i.prototype.__executeRequests=function(){if(this.__running&&this.mode!==o)return e.DEBUG&&console.log("Looks like the request set is already running",this.mode),void 0;this.__running=!0;var t=this;window.setTimeout(function(){2===t.mode||t.__active||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",t.__active),t.db.__db.transaction(function(n){function o(t,n){n&&(s.req=n),s.req.readyState="done",s.req.result=t,delete s.req.error;var o=e.Event("success");e.util.callback("onsuccess",s.req,o),a++,r()}function i(){s.req.readyState="done",s.req.error="DOMError";var t=e.Event("error",arguments);e.util.callback("onerror",s.req,t),a++,r()}function r(){return a>=t.__requests.length?(t.__active=!1,t.__requests=[],void 0):(s=t.__requests[a],s.op(n,s.args,o,i),void 0)}t.__tx=n;var s=null,a=0;try{r()}catch(u){e.DEBUG&&console.log("An exception occured in transaction",arguments),"function"==typeof t.onerror&&t.onerror()}},function(){e.DEBUG&&console.log("An error in transaction",arguments),"function"==typeof t.onerror&&t.onerror()},function(){e.DEBUG&&console.log("Transaction completed",arguments),"function"==typeof t.oncomplete&&t.oncomplete()})},1)},i.prototype.__addToTransactionQueue=function(t,n){this.__active||this.mode===o||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished.",this.__mode);var i=new e.IDBRequest;return i.source=this.db,this.__requests.push({op:t,args:n,req:i}),this.__executeRequests(),i},i.prototype.objectStore=function(t){return new e.IDBObjectStore(t,this)},i.prototype.abort=function(){!this.__active&&e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",this.__active)},i.prototype.READ_ONLY=0,i.prototype.READ_WRITE=1,i.prototype.VERSION_CHANGE=2,e.IDBTransaction=i}(idbModules),function(e){var t=function(t,n,o,i){this.__db=t,this.version=o,this.__storeProperties=i,this.objectStoreNames=new e.util.StringList;for(var r=0;i.rows.length>r;r++)this.objectStoreNames.push(i.rows.item(r).name);this.name=n,this.onabort=this.onerror=this.onversionchange=null};t.prototype.createObjectStore=function(t,n){var o=this;n=n||{},n.keyPath=n.keyPath||null;var i=new e.IDBObjectStore(t,o.__versionTransaction,!1),r=o.__versionTransaction;return r.__addToTransactionQueue(function(r,s,a){function u(){e.util.throwDOMException(0,"Could not create new object store",arguments)}o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction);var c=["CREATE TABLE",e.util.quote(t),"(key BLOB",n.autoIncrement?", inc INTEGER PRIMARY KEY AUTOINCREMENT":"PRIMARY KEY",", value BLOB)"].join(" ");e.DEBUG&&console.log(c),r.executeSql(c,[],function(e){e.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)",[t,n.keyPath,n.autoIncrement?!0:!1,"{}"],function(){i.__setReadyState("createObjectStore",!0),a(i)},u)},u)}),o.objectStoreNames.push(t),i},t.prototype.deleteObjectStore=function(t){var n=function(){e.util.throwDOMException(0,"Could not delete ObjectStore",arguments)},o=this;!o.objectStoreNames.contains(t)&&n("Object Store does not exist"),o.objectStoreNames.splice(o.objectStoreNames.indexOf(t),1);var i=o.__versionTransaction;i.__addToTransactionQueue(function(){o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction),o.__db.transaction(function(o){o.executeSql("SELECT * FROM __sys__ where name = ?",[t],function(o,i){i.rows.length>0&&o.executeSql("DROP TABLE "+e.util.quote(t),[],function(){o.executeSql("DELETE FROM __sys__ WHERE name = ?",[t],function(){},n)},n)})})})},t.prototype.close=function(){},t.prototype.transaction=function(t,n){var o=new e.IDBTransaction(t,n||1,this);return o},e.IDBDatabase=t}(idbModules),function(e){var t=4194304;if(window.openDatabase){var n=window.openDatabase("__sysdb__",1,"System Database",t);n.transaction(function(t){t.executeSql("SELECT * FROM dbVersions",[],function(){},function(){n.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);",[],function(){},function(){e.util.throwDOMException("Could not create table __sysdb__ to save DB versions")})})})},function(){e.DEBUG&&console.log("Error in sysdb transaction - when selecting from dbVersions",arguments)});var o={open:function(o,i){function r(){if(!u){var t=e.Event("error",arguments);a.readyState="done",a.error="DOMError",e.util.callback("onerror",a,t),u=!0}}function s(s){var u=window.openDatabase(o,1,o,t);a.readyState="done",i===void 0&&(i=s||1),(0>=i||s>i)&&e.util.throwDOMException(0,"An attempt was made to open a database using a lower version than the existing version.",i),u.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)",[],function(){t.executeSql("SELECT * FROM __sys__",[],function(t,c){var d=e.Event("success");a.source=a.result=new e.IDBDatabase(u,o,i,c),i>s?n.transaction(function(t){t.executeSql("UPDATE dbVersions set version = ? where name = ?",[i,o],function(){var t=e.Event("upgradeneeded");t.oldVersion=s,t.newVersion=i,a.transaction=a.result.__versionTransaction=new e.IDBTransaction([],2,a.source),e.util.callback("onupgradeneeded",a,t,function(){var t=e.Event("success");e.util.callback("onsuccess",a,t)})},r)},r):e.util.callback("onsuccess",a,d)},r)},r)},r)}var a=new e.IDBOpenRequest,u=!1;return n.transaction(function(e){e.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(e,t){0===t.rows.length?e.executeSql("INSERT INTO dbVersions VALUES (?,?)",[o,i||1],function(){s(0)},r):s(t.rows.item(0).version)},r)},r),a},deleteDatabase:function(o){function i(t){if(!a){s.readyState="done",s.error="DOMError";var n=e.Event("error");n.message=t,n.debug=arguments,e.util.callback("onerror",s,n),a=!0}}function r(){n.transaction(function(t){t.executeSql("DELETE FROM dbVersions where name = ? ",[o],function(){s.result=void 0;var t=e.Event("success");t.newVersion=null,t.oldVersion=u,e.util.callback("onsuccess",s,t)},i)},i)}var s=new e.IDBOpenRequest,a=!1,u=null;return n.transaction(function(n){n.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(n,a){if(0===a.rows.length){s.result=void 0;var c=e.Event("success");return c.newVersion=null,c.oldVersion=u,e.util.callback("onsuccess",s,c),void 0}u=a.rows.item(0).version;var d=window.openDatabase(o,1,o,t);d.transaction(function(t){t.executeSql("SELECT * FROM __sys__",[],function(t,n){var o=n.rows;(function s(n){n>=o.length?t.executeSql("DROP TABLE __sys__",[],function(){r()},i):t.executeSql("DROP TABLE "+e.util.quote(o.item(n).name),[],function(){s(n+1)},function(){s(n+1)})})(0)},function(){r()})},i)})},i),s},cmp:function(t,n){return e.Key.encode(t)>e.Key.encode(n)?1:t===n?0:-1}};e.shimIndexedDB=o}}(idbModules),function(e,t){e.openDatabase!==void 0&&(e.shimIndexedDB=t.shimIndexedDB,e.shimIndexedDB&&(e.shimIndexedDB.__useShim=function(){e.indexedDB=t.shimIndexedDB,e.IDBDatabase=t.IDBDatabase,e.IDBTransaction=t.IDBTransaction,e.IDBCursor=t.IDBCursor,e.IDBKeyRange=t.IDBKeyRange},e.shimIndexedDB.__debug=function(e){t.DEBUG=e})),e.indexedDB=e.indexedDB||e.webkitIndexedDB||e.mozIndexedDB||e.oIndexedDB||e.msIndexedDB,e.indexedDB===void 0&&e.openDatabase!==void 0?e.shimIndexedDB.__useShim():(e.IDBDatabase=e.IDBDatabase||e.webkitIDBDatabase,e.IDBTransaction=e.IDBTransaction||e.webkitIDBTransaction,e.IDBCursor=e.IDBCursor||e.webkitIDBCursor,e.IDBKeyRange=e.IDBKeyRange||e.webkitIDBKeyRange,e.IDBTransaction||(e.IDBTransaction={}),e.IDBTransaction.READ_ONLY=e.IDBTransaction.READ_ONLY||"readonly",e.IDBTransaction.READ_WRITE=e.IDBTransaction.READ_WRITE||"readwrite")}(window,idbModules);
//@ sourceMappingURL=http://nparashuram.com/IndexedDBShim/dist/IndexedDBShim.min.map

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
/*! Socket.IO.min.js build:0.9.11, production. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */
var io="undefined"==typeof module?{}:module.exports;(function(){(function(a,b){var c=a;c.version="0.9.11",c.protocol=1,c.transports=[],c.j=[],c.sockets={},c.connect=function(a,d){var e=c.util.parseUri(a),f,g;b&&b.location&&(e.protocol=e.protocol||b.location.protocol.slice(0,-1),e.host=e.host||(b.document?b.document.domain:b.location.hostname),e.port=e.port||b.location.port),f=c.util.uniqueUri(e);var h={host:e.host,secure:"https"==e.protocol,port:e.port||("https"==e.protocol?443:80),query:e.query||""};c.util.merge(h,d);if(h["force new connection"]||!c.sockets[f])g=new c.Socket(h);return!h["force new connection"]&&g&&(c.sockets[f]=g),g=g||c.sockets[f],g.of(e.path.length>1?e.path:"")}})("object"==typeof module?module.exports:this.io={},this),function(a,b){var c=a.util={},d=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,e=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];c.parseUri=function(a){var b=d.exec(a||""),c={},f=14;while(f--)c[e[f]]=b[f]||"";return c},c.uniqueUri=function(a){var c=a.protocol,d=a.host,e=a.port;return"document"in b?(d=d||document.domain,e=e||(c=="https"&&document.location.protocol!=="https:"?443:document.location.port)):(d=d||"localhost",!e&&c=="https"&&(e=443)),(c||"http")+"://"+d+":"+(e||80)},c.query=function(a,b){var d=c.chunkQuery(a||""),e=[];c.merge(d,c.chunkQuery(b||""));for(var f in d)d.hasOwnProperty(f)&&e.push(f+"="+d[f]);return e.length?"?"+e.join("&"):""},c.chunkQuery=function(a){var b={},c=a.split("&"),d=0,e=c.length,f;for(;d<e;++d)f=c[d].split("="),f[0]&&(b[f[0]]=f[1]);return b};var f=!1;c.load=function(a){if("document"in b&&document.readyState==="complete"||f)return a();c.on(b,"load",a,!1)},c.on=function(a,b,c,d){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener&&a.addEventListener(b,c,d)},c.request=function(a){if(a&&"undefined"!=typeof XDomainRequest&&!c.ua.hasCORS)return new XDomainRequest;if("undefined"!=typeof XMLHttpRequest&&(!a||c.ua.hasCORS))return new XMLHttpRequest;if(!a)try{return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")}catch(b){}return null},"undefined"!=typeof window&&c.load(function(){f=!0}),c.defer=function(a){if(!c.ua.webkit||"undefined"!=typeof importScripts)return a();c.load(function(){setTimeout(a,100)})},c.merge=function(b,d,e,f){var g=f||[],h=typeof e=="undefined"?2:e,i;for(i in d)d.hasOwnProperty(i)&&c.indexOf(g,i)<0&&(typeof b[i]!="object"||!h?(b[i]=d[i],g.push(d[i])):c.merge(b[i],d[i],h-1,g));return b},c.mixin=function(a,b){c.merge(a.prototype,b.prototype)},c.inherit=function(a,b){function c(){}c.prototype=b.prototype,a.prototype=new c},c.isArray=Array.isArray||function(a){return Object.prototype.toString.call(a)==="[object Array]"},c.intersect=function(a,b){var d=[],e=a.length>b.length?a:b,f=a.length>b.length?b:a;for(var g=0,h=f.length;g<h;g++)~c.indexOf(e,f[g])&&d.push(f[g]);return d},c.indexOf=function(a,b,c){for(var d=a.length,c=c<0?c+d<0?0:c+d:c||0;c<d&&a[c]!==b;c++);return d<=c?-1:c},c.toArray=function(a){var b=[];for(var c=0,d=a.length;c<d;c++)b.push(a[c]);return b},c.ua={},c.ua.hasCORS="undefined"!=typeof XMLHttpRequest&&function(){try{var a=new XMLHttpRequest}catch(b){return!1}return a.withCredentials!=undefined}(),c.ua.webkit="undefined"!=typeof navigator&&/webkit/i.test(navigator.userAgent),c.ua.iDevice="undefined"!=typeof navigator&&/iPad|iPhone|iPod/i.test(navigator.userAgent)}("undefined"!=typeof io?io:module.exports,this),function(a,b){function c(){}a.EventEmitter=c,c.prototype.on=function(a,c){return this.$events||(this.$events={}),this.$events[a]?b.util.isArray(this.$events[a])?this.$events[a].push(c):this.$events[a]=[this.$events[a],c]:this.$events[a]=c,this},c.prototype.addListener=c.prototype.on,c.prototype.once=function(a,b){function d(){c.removeListener(a,d),b.apply(this,arguments)}var c=this;return d.listener=b,this.on(a,d),this},c.prototype.removeListener=function(a,c){if(this.$events&&this.$events[a]){var d=this.$events[a];if(b.util.isArray(d)){var e=-1;for(var f=0,g=d.length;f<g;f++)if(d[f]===c||d[f].listener&&d[f].listener===c){e=f;break}if(e<0)return this;d.splice(e,1),d.length||delete this.$events[a]}else(d===c||d.listener&&d.listener===c)&&delete this.$events[a]}return this},c.prototype.removeAllListeners=function(a){return a===undefined?(this.$events={},this):(this.$events&&this.$events[a]&&(this.$events[a]=null),this)},c.prototype.listeners=function(a){return this.$events||(this.$events={}),this.$events[a]||(this.$events[a]=[]),b.util.isArray(this.$events[a])||(this.$events[a]=[this.$events[a]]),this.$events[a]},c.prototype.emit=function(a){if(!this.$events)return!1;var c=this.$events[a];if(!c)return!1;var d=Array.prototype.slice.call(arguments,1);if("function"==typeof c)c.apply(this,d);else{if(!b.util.isArray(c))return!1;var e=c.slice();for(var f=0,g=e.length;f<g;f++)e[f].apply(this,d)}return!0}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(exports,nativeJSON){function f(a){return a<10?"0"+a:a}function date(a,b){return isFinite(a.valueOf())?a.getUTCFullYear()+"-"+f(a.getUTCMonth()+1)+"-"+f(a.getUTCDate())+"T"+f(a.getUTCHours())+":"+f(a.getUTCMinutes())+":"+f(a.getUTCSeconds())+"Z":null}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i instanceof Date&&(i=date(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";return e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}"use strict";if(nativeJSON&&nativeJSON.parse)return exports.JSON={parse:nativeJSON.parse,stringify:nativeJSON.stringify};var JSON=exports.JSON={},cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")},JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")}}("undefined"!=typeof io?io:module.exports,typeof JSON!="undefined"?JSON:undefined),function(a,b){var c=a.parser={},d=c.packets=["disconnect","connect","heartbeat","message","json","event","ack","error","noop"],e=c.reasons=["transport not supported","client not handshaken","unauthorized"],f=c.advice=["reconnect"],g=b.JSON,h=b.util.indexOf;c.encodePacket=function(a){var b=h(d,a.type),c=a.id||"",i=a.endpoint||"",j=a.ack,k=null;switch(a.type){case"error":var l=a.reason?h(e,a.reason):"",m=a.advice?h(f,a.advice):"";if(l!==""||m!=="")k=l+(m!==""?"+"+m:"");break;case"message":a.data!==""&&(k=a.data);break;case"event":var n={name:a.name};a.args&&a.args.length&&(n.args=a.args),k=g.stringify(n);break;case"json":k=g.stringify(a.data);break;case"connect":a.qs&&(k=a.qs);break;case"ack":k=a.ackId+(a.args&&a.args.length?"+"+g.stringify(a.args):"")}var o=[b,c+(j=="data"?"+":""),i];return k!==null&&k!==undefined&&o.push(k),o.join(":")},c.encodePayload=function(a){var b="";if(a.length==1)return a[0];for(var c=0,d=a.length;c<d;c++){var e=a[c];b+="\ufffd"+e.length+"\ufffd"+a[c]}return b};var i=/([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;c.decodePacket=function(a){var b=a.match(i);if(!b)return{};var c=b[2]||"",a=b[5]||"",h={type:d[b[1]],endpoint:b[4]||""};c&&(h.id=c,b[3]?h.ack="data":h.ack=!0);switch(h.type){case"error":var b=a.split("+");h.reason=e[b[0]]||"",h.advice=f[b[1]]||"";break;case"message":h.data=a||"";break;case"event":try{var j=g.parse(a);h.name=j.name,h.args=j.args}catch(k){}h.args=h.args||[];break;case"json":try{h.data=g.parse(a)}catch(k){}break;case"connect":h.qs=a||"";break;case"ack":var b=a.match(/^([0-9]+)(\+)?(.*)/);if(b){h.ackId=b[1],h.args=[];if(b[3])try{h.args=b[3]?g.parse(b[3]):[]}catch(k){}}break;case"disconnect":case"heartbeat":}return h},c.decodePayload=function(a){if(a.charAt(0)=="\ufffd"){var b=[];for(var d=1,e="";d<a.length;d++)a.charAt(d)=="\ufffd"?(b.push(c.decodePacket(a.substr(d+1).substr(0,e))),d+=Number(e)+1,e=""):e+=a.charAt(d);return b}return[c.decodePacket(a)]}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b){function c(a,b){this.socket=a,this.sessid=b}a.Transport=c,b.util.mixin(c,b.EventEmitter),c.prototype.heartbeats=function(){return!0},c.prototype.onData=function(a){this.clearCloseTimeout(),(this.socket.connected||this.socket.connecting||this.socket.reconnecting)&&this.setCloseTimeout();if(a!==""){var c=b.parser.decodePayload(a);if(c&&c.length)for(var d=0,e=c.length;d<e;d++)this.onPacket(c[d])}return this},c.prototype.onPacket=function(a){return this.socket.setHeartbeatTimeout(),a.type=="heartbeat"?this.onHeartbeat():(a.type=="connect"&&a.endpoint==""&&this.onConnect(),a.type=="error"&&a.advice=="reconnect"&&(this.isOpen=!1),this.socket.onPacket(a),this)},c.prototype.setCloseTimeout=function(){if(!this.closeTimeout){var a=this;this.closeTimeout=setTimeout(function(){a.onDisconnect()},this.socket.closeTimeout)}},c.prototype.onDisconnect=function(){return this.isOpen&&this.close(),this.clearTimeouts(),this.socket.onDisconnect(),this},c.prototype.onConnect=function(){return this.socket.onConnect(),this},c.prototype.clearCloseTimeout=function(){this.closeTimeout&&(clearTimeout(this.closeTimeout),this.closeTimeout=null)},c.prototype.clearTimeouts=function(){this.clearCloseTimeout(),this.reopenTimeout&&clearTimeout(this.reopenTimeout)},c.prototype.packet=function(a){this.send(b.parser.encodePacket(a))},c.prototype.onHeartbeat=function(a){this.packet({type:"heartbeat"})},c.prototype.onOpen=function(){this.isOpen=!0,this.clearCloseTimeout(),this.socket.onOpen()},c.prototype.onClose=function(){var a=this;this.isOpen=!1,this.socket.onClose(),this.onDisconnect()},c.prototype.prepareUrl=function(){var a=this.socket.options;return this.scheme()+"://"+a.host+":"+a.port+"/"+a.resource+"/"+b.protocol+"/"+this.name+"/"+this.sessid},c.prototype.ready=function(a,b){b.call(this)}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b,c){function d(a){this.options={port:80,secure:!1,document:"document"in c?document:!1,resource:"socket.io",transports:b.transports,"connect timeout":1e4,"try multiple transports":!0,reconnect:!0,"reconnection delay":500,"reconnection limit":Infinity,"reopen delay":3e3,"max reconnection attempts":10,"sync disconnect on unload":!1,"auto connect":!0,"flash policy port":10843,manualFlush:!1},b.util.merge(this.options,a),this.connected=!1,this.open=!1,this.connecting=!1,this.reconnecting=!1,this.namespaces={},this.buffer=[],this.doBuffer=!1;if(this.options["sync disconnect on unload"]&&(!this.isXDomain()||b.util.ua.hasCORS)){var d=this;b.util.on(c,"beforeunload",function(){d.disconnectSync()},!1)}this.options["auto connect"]&&this.connect()}function e(){}a.Socket=d,b.util.mixin(d,b.EventEmitter),d.prototype.of=function(a){return this.namespaces[a]||(this.namespaces[a]=new b.SocketNamespace(this,a),a!==""&&this.namespaces[a].packet({type:"connect"})),this.namespaces[a]},d.prototype.publish=function(){this.emit.apply(this,arguments);var a;for(var b in this.namespaces)this.namespaces.hasOwnProperty(b)&&(a=this.of(b),a.$emit.apply(a,arguments))},d.prototype.handshake=function(a){function f(b){b instanceof Error?(c.connecting=!1,c.onError(b.message)):a.apply(null,b.split(":"))}var c=this,d=this.options,g=["http"+(d.secure?"s":"")+":/",d.host+":"+d.port,d.resource,b.protocol,b.util.query(this.options.query,"t="+ +(new Date))].join("/");if(this.isXDomain()&&!b.util.ua.hasCORS){var h=document.getElementsByTagName("script")[0],i=document.createElement("script");i.src=g+"&jsonp="+b.j.length,h.parentNode.insertBefore(i,h),b.j.push(function(a){f(a),i.parentNode.removeChild(i)})}else{var j=b.util.request();j.open("GET",g,!0),this.isXDomain()&&(j.withCredentials=!0),j.onreadystatechange=function(){j.readyState==4&&(j.onreadystatechange=e,j.status==200?f(j.responseText):j.status==403?c.onError(j.responseText):(c.connecting=!1,!c.reconnecting&&c.onError(j.responseText)))},j.send(null)}},d.prototype.getTransport=function(a){var c=a||this.transports,d;for(var e=0,f;f=c[e];e++)if(b.Transport[f]&&b.Transport[f].check(this)&&(!this.isXDomain()||b.Transport[f].xdomainCheck(this)))return new b.Transport[f](this,this.sessionid);return null},d.prototype.connect=function(a){if(this.connecting)return this;var c=this;return c.connecting=!0,this.handshake(function(d,e,f,g){function h(a){c.transport&&c.transport.clearTimeouts(),c.transport=c.getTransport(a);if(!c.transport)return c.publish("connect_failed");c.transport.ready(c,function(){c.connecting=!0,c.publish("connecting",c.transport.name),c.transport.open(),c.options["connect timeout"]&&(c.connectTimeoutTimer=setTimeout(function(){if(!c.connected){c.connecting=!1;if(c.options["try multiple transports"]){var a=c.transports;while(a.length>0&&a.splice(0,1)[0]!=c.transport.name);a.length?h(a):c.publish("connect_failed")}}},c.options["connect timeout"]))})}c.sessionid=d,c.closeTimeout=f*1e3,c.heartbeatTimeout=e*1e3,c.transports||(c.transports=c.origTransports=g?b.util.intersect(g.split(","),c.options.transports):c.options.transports),c.setHeartbeatTimeout(),h(c.transports),c.once("connect",function(){clearTimeout(c.connectTimeoutTimer),a&&typeof a=="function"&&a()})}),this},d.prototype.setHeartbeatTimeout=function(){clearTimeout(this.heartbeatTimeoutTimer);if(this.transport&&!this.transport.heartbeats())return;var a=this;this.heartbeatTimeoutTimer=setTimeout(function(){a.transport.onClose()},this.heartbeatTimeout)},d.prototype.packet=function(a){return this.connected&&!this.doBuffer?this.transport.packet(a):this.buffer.push(a),this},d.prototype.setBuffer=function(a){this.doBuffer=a,!a&&this.connected&&this.buffer.length&&(this.options.manualFlush||this.flushBuffer())},d.prototype.flushBuffer=function(){this.transport.payload(this.buffer),this.buffer=[]},d.prototype.disconnect=function(){if(this.connected||this.connecting)this.open&&this.of("").packet({type:"disconnect"}),this.onDisconnect("booted");return this},d.prototype.disconnectSync=function(){var a=b.util.request(),c=["http"+(this.options.secure?"s":"")+":/",this.options.host+":"+this.options.port,this.options.resource,b.protocol,"",this.sessionid].join("/")+"/?disconnect=1";a.open("GET",c,!1),a.send(null),this.onDisconnect("booted")},d.prototype.isXDomain=function(){var a=c.location.port||("https:"==c.location.protocol?443:80);return this.options.host!==c.location.hostname||this.options.port!=a},d.prototype.onConnect=function(){this.connected||(this.connected=!0,this.connecting=!1,this.doBuffer||this.setBuffer(!1),this.emit("connect"))},d.prototype.onOpen=function(){this.open=!0},d.prototype.onClose=function(){this.open=!1,clearTimeout(this.heartbeatTimeoutTimer)},d.prototype.onPacket=function(a){this.of(a.endpoint).onPacket(a)},d.prototype.onError=function(a){a&&a.advice&&a.advice==="reconnect"&&(this.connected||this.connecting)&&(this.disconnect(),this.options.reconnect&&this.reconnect()),this.publish("error",a&&a.reason?a.reason:a)},d.prototype.onDisconnect=function(a){var b=this.connected,c=this.connecting;this.connected=!1,this.connecting=!1,this.open=!1;if(b||c)this.transport.close(),this.transport.clearTimeouts(),b&&(this.publish("disconnect",a),"booted"!=a&&this.options.reconnect&&!this.reconnecting&&this.reconnect())},d.prototype.reconnect=function(){function e(){if(a.connected){for(var b in a.namespaces)a.namespaces.hasOwnProperty(b)&&""!==b&&a.namespaces[b].packet({type:"connect"});a.publish("reconnect",a.transport.name,a.reconnectionAttempts)}clearTimeout(a.reconnectionTimer),a.removeListener("connect_failed",f),a.removeListener("connect",f),a.reconnecting=!1,delete a.reconnectionAttempts,delete a.reconnectionDelay,delete a.reconnectionTimer,delete a.redoTransports,a.options["try multiple transports"]=c}function f(){if(!a.reconnecting)return;if(a.connected)return e();if(a.connecting&&a.reconnecting)return a.reconnectionTimer=setTimeout(f,1e3);a.reconnectionAttempts++>=b?a.redoTransports?(a.publish("reconnect_failed"),e()):(a.on("connect_failed",f),a.options["try multiple transports"]=!0,a.transports=a.origTransports,a.transport=a.getTransport(),a.redoTransports=!0,a.connect()):(a.reconnectionDelay<d&&(a.reconnectionDelay*=2),a.connect(),a.publish("reconnecting",a.reconnectionDelay,a.reconnectionAttempts),a.reconnectionTimer=setTimeout(f,a.reconnectionDelay))}this.reconnecting=!0,this.reconnectionAttempts=0,this.reconnectionDelay=this.options["reconnection delay"];var a=this,b=this.options["max reconnection attempts"],c=this.options["try multiple transports"],d=this.options["reconnection limit"];this.options["try multiple transports"]=!1,this.reconnectionTimer=setTimeout(f,this.reconnectionDelay),this.on("connect",f)}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b){function c(a,b){this.socket=a,this.name=b||"",this.flags={},this.json=new d(this,"json"),this.ackPackets=0,this.acks={}}function d(a,b){this.namespace=a,this.name=b}a.SocketNamespace=c,b.util.mixin(c,b.EventEmitter),c.prototype.$emit=b.EventEmitter.prototype.emit,c.prototype.of=function(){return this.socket.of.apply(this.socket,arguments)},c.prototype.packet=function(a){return a.endpoint=this.name,this.socket.packet(a),this.flags={},this},c.prototype.send=function(a,b){var c={type:this.flags.json?"json":"message",data:a};return"function"==typeof b&&(c.id=++this.ackPackets,c.ack=!0,this.acks[c.id]=b),this.packet(c)},c.prototype.emit=function(a){var b=Array.prototype.slice.call(arguments,1),c=b[b.length-1],d={type:"event",name:a};return"function"==typeof c&&(d.id=++this.ackPackets,d.ack="data",this.acks[d.id]=c,b=b.slice(0,b.length-1)),d.args=b,this.packet(d)},c.prototype.disconnect=function(){return this.name===""?this.socket.disconnect():(this.packet({type:"disconnect"}),this.$emit("disconnect")),this},c.prototype.onPacket=function(a){function d(){c.packet({type:"ack",args:b.util.toArray(arguments),ackId:a.id})}var c=this;switch(a.type){case"connect":this.$emit("connect");break;case"disconnect":this.name===""?this.socket.onDisconnect(a.reason||"booted"):this.$emit("disconnect",a.reason);break;case"message":case"json":var e=["message",a.data];a.ack=="data"?e.push(d):a.ack&&this.packet({type:"ack",ackId:a.id}),this.$emit.apply(this,e);break;case"event":var e=[a.name].concat(a.args);a.ack=="data"&&e.push(d),this.$emit.apply(this,e);break;case"ack":this.acks[a.ackId]&&(this.acks[a.ackId].apply(this,a.args),delete this.acks[a.ackId]);break;case"error":a.advice?this.socket.onError(a):a.reason=="unauthorized"?this.$emit("connect_failed",a.reason):this.$emit("error",a.reason)}},d.prototype.send=function(){this.namespace.flags[this.name]=!0,this.namespace.send.apply(this.namespace,arguments)},d.prototype.emit=function(){this.namespace.flags[this.name]=!0,this.namespace.emit.apply(this.namespace,arguments)}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b,c){function d(a){b.Transport.apply(this,arguments)}a.websocket=d,b.util.inherit(d,b.Transport),d.prototype.name="websocket",d.prototype.open=function(){var a=b.util.query(this.socket.options.query),d=this,e;return e||(e=c.MozWebSocket||c.WebSocket),this.websocket=new e(this.prepareUrl()+a),this.websocket.onopen=function(){d.onOpen(),d.socket.setBuffer(!1)},this.websocket.onmessage=function(a){d.onData(a.data)},this.websocket.onclose=function(){d.onClose(),d.socket.setBuffer(!0)},this.websocket.onerror=function(a){d.onError(a)},this},b.util.ua.iDevice?d.prototype.send=function(a){var b=this;return setTimeout(function(){b.websocket.send(a)},0),this}:d.prototype.send=function(a){return this.websocket.send(a),this},d.prototype.payload=function(a){for(var b=0,c=a.length;b<c;b++)this.packet(a[b]);return this},d.prototype.close=function(){return this.websocket.close(),this},d.prototype.onError=function(a){this.socket.onError(a)},d.prototype.scheme=function(){return this.socket.options.secure?"wss":"ws"},d.check=function(){return"WebSocket"in c&&!("__addTask"in WebSocket)||"MozWebSocket"in c},d.xdomainCheck=function(){return!0},b.transports.push("websocket")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b){function c(){b.Transport.websocket.apply(this,arguments)}a.flashsocket=c,b.util.inherit(c,b.Transport.websocket),c.prototype.name="flashsocket",c.prototype.open=function(){var a=this,c=arguments;return WebSocket.__addTask(function(){b.Transport.websocket.prototype.open.apply(a,c)}),this},c.prototype.send=function(){var a=this,c=arguments;return WebSocket.__addTask(function(){b.Transport.websocket.prototype.send.apply(a,c)}),this},c.prototype.close=function(){return WebSocket.__tasks.length=0,b.Transport.websocket.prototype.close.call(this),this},c.prototype.ready=function(a,d){function e(){var b=a.options,e=b["flash policy port"],g=["http"+(b.secure?"s":"")+":/",b.host+":"+b.port,b.resource,"static/flashsocket","WebSocketMain"+(a.isXDomain()?"Insecure":"")+".swf"];c.loaded||(typeof WEB_SOCKET_SWF_LOCATION=="undefined"&&(WEB_SOCKET_SWF_LOCATION=g.join("/")),e!==843&&WebSocket.loadFlashPolicyFile("xmlsocket://"+b.host+":"+e),WebSocket.__initialize(),c.loaded=!0),d.call(f)}var f=this;if(document.body)return e();b.util.load(e)},c.check=function(){return typeof WebSocket!="undefined"&&"__initialize"in WebSocket&&!!swfobject?swfobject.getFlashPlayerVersion().major>=10:!1},c.xdomainCheck=function(){return!0},typeof window!="undefined"&&(WEB_SOCKET_DISABLE_AUTO_INITIALIZATION=!0),b.transports.push("flashsocket")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports);if("undefined"!=typeof window)var swfobject=function(){function A(){if(t)return;try{var a=i.getElementsByTagName("body")[0].appendChild(Q("span"));a.parentNode.removeChild(a)}catch(b){return}t=!0;var c=l.length;for(var d=0;d<c;d++)l[d]()}function B(a){t?a():l[l.length]=a}function C(b){if(typeof h.addEventListener!=a)h.addEventListener("load",b,!1);else if(typeof i.addEventListener!=a)i.addEventListener("load",b,!1);else if(typeof h.attachEvent!=a)R(h,"onload",b);else if(typeof h.onload=="function"){var c=h.onload;h.onload=function(){c(),b()}}else h.onload=b}function D(){k?E():F()}function E(){var c=i.getElementsByTagName("body")[0],d=Q(b);d.setAttribute("type",e);var f=c.appendChild(d);if(f){var g=0;(function(){if(typeof f.GetVariable!=a){var b=f.GetVariable("$version");b&&(b=b.split(" ")[1].split(","),y.pv=[parseInt(b[0],10),parseInt(b[1],10),parseInt(b[2],10)])}else if(g<10){g++,setTimeout(arguments.callee,10);return}c.removeChild(d),f=null,F()})()}else F()}function F(){var b=m.length;if(b>0)for(var c=0;c<b;c++){var d=m[c].id,e=m[c].callbackFn,f={success:!1,id:d};if(y.pv[0]>0){var g=P(d);if(g)if(S(m[c].swfVersion)&&!(y.wk&&y.wk<312))U(d,!0),e&&(f.success=!0,f.ref=G(d),e(f));else if(m[c].expressInstall&&H()){var h={};h.data=m[c].expressInstall,h.width=g.getAttribute("width")||"0",h.height=g.getAttribute("height")||"0",g.getAttribute("class")&&(h.styleclass=g.getAttribute("class")),g.getAttribute("align")&&(h.align=g.getAttribute("align"));var i={},j=g.getElementsByTagName("param"),k=j.length;for(var l=0;l<k;l++)j[l].getAttribute("name").toLowerCase()!="movie"&&(i[j[l].getAttribute("name")]=j[l].getAttribute("value"));I(h,i,d,e)}else J(g),e&&e(f)}else{U(d,!0);if(e){var n=G(d);n&&typeof n.SetVariable!=a&&(f.success=!0,f.ref=n),e(f)}}}}function G(c){var d=null,e=P(c);if(e&&e.nodeName=="OBJECT")if(typeof e.SetVariable!=a)d=e;else{var f=e.getElementsByTagName(b)[0];f&&(d=f)}return d}function H(){return!u&&S("6.0.65")&&(y.win||y.mac)&&!(y.wk&&y.wk<312)}function I(b,c,d,e){u=!0,r=e||null,s={success:!1,id:d};var g=P(d);if(g){g.nodeName=="OBJECT"?(p=K(g),q=null):(p=g,q=d),b.id=f;if(typeof b.width==a||!/%$/.test(b.width)&&parseInt(b.width,10)<310)b.width="310";if(typeof b.height==a||!/%$/.test(b.height)&&parseInt(b.height,10)<137)b.height="137";i.title=i.title.slice(0,47)+" - Flash Player Installation";var j=y.ie&&y.win?["Active"].concat("").join("X"):"PlugIn",k="MMredirectURL="+h.location.toString().replace(/&/g,"%26")+"&MMplayerType="+j+"&MMdoctitle="+i.title;typeof c.flashvars!=a?c.flashvars+="&"+k:c.flashvars=k;if(y.ie&&y.win&&g.readyState!=4){var l=Q("div");d+="SWFObjectNew",l.setAttribute("id",d),g.parentNode.insertBefore(l,g),g.style.display="none",function(){g.readyState==4?g.parentNode.removeChild(g):setTimeout(arguments.callee,10)}()}L(b,c,d)}}function J(a){if(y.ie&&y.win&&a.readyState!=4){var b=Q("div");a.parentNode.insertBefore(b,a),b.parentNode.replaceChild(K(a),b),a.style.display="none",function(){a.readyState==4?a.parentNode.removeChild(a):setTimeout(arguments.callee,10)}()}else a.parentNode.replaceChild(K(a),a)}function K(a){var c=Q("div");if(y.win&&y.ie)c.innerHTML=a.innerHTML;else{var d=a.getElementsByTagName(b)[0];if(d){var e=d.childNodes;if(e){var f=e.length;for(var g=0;g<f;g++)(e[g].nodeType!=1||e[g].nodeName!="PARAM")&&e[g].nodeType!=8&&c.appendChild(e[g].cloneNode(!0))}}}return c}function L(c,d,f){var g,h=P(f);if(y.wk&&y.wk<312)return g;if(h){typeof c.id==a&&(c.id=f);if(y.ie&&y.win){var i="";for(var j in c)c[j]!=Object.prototype[j]&&(j.toLowerCase()=="data"?d.movie=c[j]:j.toLowerCase()=="styleclass"?i+=' class="'+c[j]+'"':j.toLowerCase()!="classid"&&(i+=" "+j+'="'+c[j]+'"'));var k="";for(var l in d)d[l]!=Object.prototype[l]&&(k+='<param name="'+l+'" value="'+d[l]+'" />');h.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+i+">"+k+"</object>",n[n.length]=c.id,g=P(c.id)}else{var m=Q(b);m.setAttribute("type",e);for(var o in c)c[o]!=Object.prototype[o]&&(o.toLowerCase()=="styleclass"?m.setAttribute("class",c[o]):o.toLowerCase()!="classid"&&m.setAttribute(o,c[o]));for(var p in d)d[p]!=Object.prototype[p]&&p.toLowerCase()!="movie"&&M(m,p,d[p]);h.parentNode.replaceChild(m,h),g=m}}return g}function M(a,b,c){var d=Q("param");d.setAttribute("name",b),d.setAttribute("value",c),a.appendChild(d)}function N(a){var b=P(a);b&&b.nodeName=="OBJECT"&&(y.ie&&y.win?(b.style.display="none",function(){b.readyState==4?O(a):setTimeout(arguments.callee,10)}()):b.parentNode.removeChild(b))}function O(a){var b=P(a);if(b){for(var c in b)typeof b[c]=="function"&&(b[c]=null);b.parentNode.removeChild(b)}}function P(a){var b=null;try{b=i.getElementById(a)}catch(c){}return b}function Q(a){return i.createElement(a)}function R(a,b,c){a.attachEvent(b,c),o[o.length]=[a,b,c]}function S(a){var b=y.pv,c=a.split(".");return c[0]=parseInt(c[0],10),c[1]=parseInt(c[1],10)||0,c[2]=parseInt(c[2],10)||0,b[0]>c[0]||b[0]==c[0]&&b[1]>c[1]||b[0]==c[0]&&b[1]==c[1]&&b[2]>=c[2]?!0:!1}function T(c,d,e,f){if(y.ie&&y.mac)return;var g=i.getElementsByTagName("head")[0];if(!g)return;var h=e&&typeof e=="string"?e:"screen";f&&(v=null,w=null);if(!v||w!=h){var j=Q("style");j.setAttribute("type","text/css"),j.setAttribute("media",h),v=g.appendChild(j),y.ie&&y.win&&typeof i.styleSheets!=a&&i.styleSheets.length>0&&(v=i.styleSheets[i.styleSheets.length-1]),w=h}y.ie&&y.win?v&&typeof v.addRule==b&&v.addRule(c,d):v&&typeof i.createTextNode!=a&&v.appendChild(i.createTextNode(c+" {"+d+"}"))}function U(a,b){if(!x)return;var c=b?"visible":"hidden";t&&P(a)?P(a).style.visibility=c:T("#"+a,"visibility:"+c)}function V(b){var c=/[\\\"<>\.;]/,d=c.exec(b)!=null;return d&&typeof encodeURIComponent!=a?encodeURIComponent(b):b}var a="undefined",b="object",c="Shockwave Flash",d="ShockwaveFlash.ShockwaveFlash",e="application/x-shockwave-flash",f="SWFObjectExprInst",g="onreadystatechange",h=window,i=document,j=navigator,k=!1,l=[D],m=[],n=[],o=[],p,q,r,s,t=!1,u=!1,v,w,x=!0,y=function(){var f=typeof i.getElementById!=a&&typeof i.getElementsByTagName!=a&&typeof i.createElement!=a,g=j.userAgent.toLowerCase(),l=j.platform.toLowerCase(),m=l?/win/.test(l):/win/.test(g),n=l?/mac/.test(l):/mac/.test(g),o=/webkit/.test(g)?parseFloat(g.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):!1,p=!1,q=[0,0,0],r=null;if(typeof j.plugins!=a&&typeof j.plugins[c]==b)r=j.plugins[c].description,r&&(typeof j.mimeTypes==a||!j.mimeTypes[e]||!!j.mimeTypes[e].enabledPlugin)&&(k=!0,p=!1,r=r.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),q[0]=parseInt(r.replace(/^(.*)\..*$/,"$1"),10),q[1]=parseInt(r.replace(/^.*\.(.*)\s.*$/,"$1"),10),q[2]=/[a-zA-Z]/.test(r)?parseInt(r.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0);else if(typeof h[["Active"].concat("Object").join("X")]!=a)try{var s=new(window[["Active"].concat("Object").join("X")])(d);s&&(r=s.GetVariable("$version"),r&&(p=!0,r=r.split(" ")[1].split(","),q=[parseInt(r[0],10),parseInt(r[1],10),parseInt(r[2],10)]))}catch(t){}return{w3:f,pv:q,wk:o,ie:p,win:m,mac:n}}(),z=function(){if(!y.w3)return;(typeof i.readyState!=a&&i.readyState=="complete"||typeof i.readyState==a&&(i.getElementsByTagName("body")[0]||i.body))&&A(),t||(typeof i.addEventListener!=a&&i.addEventListener("DOMContentLoaded",A,!1),y.ie&&y.win&&(i.attachEvent(g,function(){i.readyState=="complete"&&(i.detachEvent(g,arguments.callee),A())}),h==top&&function(){if(t)return;try{i.documentElement.doScroll("left")}catch(a){setTimeout(arguments.callee,0);return}A()}()),y.wk&&function(){if(t)return;if(!/loaded|complete/.test(i.readyState)){setTimeout(arguments.callee,0);return}A()}(),C(A))}(),W=function(){y.ie&&y.win&&window.attachEvent("onunload",function(){var a=o.length;for(var b=0;b<a;b++)o[b][0].detachEvent(o[b][1],o[b][2]);var c=n.length;for(var d=0;d<c;d++)N(n[d]);for(var e in y)y[e]=null;y=null;for(var f in swfobject)swfobject[f]=null;swfobject=null})}();return{registerObject:function(a,b,c,d){if(y.w3&&a&&b){var e={};e.id=a,e.swfVersion=b,e.expressInstall=c,e.callbackFn=d,m[m.length]=e,U(a,!1)}else d&&d({success:!1,id:a})},getObjectById:function(a){if(y.w3)return G(a)},embedSWF:function(c,d,e,f,g,h,i,j,k,l){var m={success:!1,id:d};y.w3&&!(y.wk&&y.wk<312)&&c&&d&&e&&f&&g?(U(d,!1),B(function(){e+="",f+="";var n={};if(k&&typeof k===b)for(var o in k)n[o]=k[o];n.data=c,n.width=e,n.height=f;var p={};if(j&&typeof j===b)for(var q in j)p[q]=j[q];if(i&&typeof i===b)for(var r in i)typeof p.flashvars!=a?p.flashvars+="&"+r+"="+i[r]:p.flashvars=r+"="+i[r];if(S(g)){var s=L(n,p,d);n.id==d&&U(d,!0),m.success=!0,m.ref=s}else{if(h&&H()){n.data=h,I(n,p,d,l);return}U(d,!0)}l&&l(m)})):l&&l(m)},switchOffAutoHideShow:function(){x=!1},ua:y,getFlashPlayerVersion:function(){return{major:y.pv[0],minor:y.pv[1],release:y.pv[2]}},hasFlashPlayerVersion:S,createSWF:function(a,b,c){return y.w3?L(a,b,c):undefined},showExpressInstall:function(a,b,c,d){y.w3&&H()&&I(a,b,c,d)},removeSWF:function(a){y.w3&&N(a)},createCSS:function(a,b,c,d){y.w3&&T(a,b,c,d)},addDomLoadEvent:B,addLoadEvent:C,getQueryParamValue:function(a){var b=i.location.search||i.location.hash;if(b){/\?/.test(b)&&(b=b.split("?")[1]);if(a==null)return V(b);var c=b.split("&");for(var d=0;d<c.length;d++)if(c[d].substring(0,c[d].indexOf("="))==a)return V(c[d].substring(c[d].indexOf("=")+1))}return""},expressInstallCallback:function(){if(u){var a=P(f);a&&p&&(a.parentNode.replaceChild(p,a),q&&(U(q,!0),y.ie&&y.win&&(p.style.display="block")),r&&r(s)),u=!1}}}}();(function(){if("undefined"==typeof window||window.WebSocket)return;var a=window.console;if(!a||!a.log||!a.error)a={log:function(){},error:function(){}};if(!swfobject.hasFlashPlayerVersion("10.0.0")){a.error("Flash Player >= 10.0.0 is required.");return}location.protocol=="file:"&&a.error("WARNING: web-socket-js doesn't work in file:///... URL unless you set Flash Security Settings properly. Open the page via Web server i.e. http://..."),WebSocket=function(a,b,c,d,e){var f=this;f.__id=WebSocket.__nextId++,WebSocket.__instances[f.__id]=f,f.readyState=WebSocket.CONNECTING,f.bufferedAmount=0,f.__events={},b?typeof b=="string"&&(b=[b]):b=[],setTimeout(function(){WebSocket.__addTask(function(){WebSocket.__flash.create(f.__id,a,b,c||null,d||0,e||null)})},0)},WebSocket.prototype.send=function(a){if(this.readyState==WebSocket.CONNECTING)throw"INVALID_STATE_ERR: Web Socket connection has not been established";var b=WebSocket.__flash.send(this.__id,encodeURIComponent(a));return b<0?!0:(this.bufferedAmount+=b,!1)},WebSocket.prototype.close=function(){if(this.readyState==WebSocket.CLOSED||this.readyState==WebSocket.CLOSING)return;this.readyState=WebSocket.CLOSING,WebSocket.__flash.close(this.__id)},WebSocket.prototype.addEventListener=function(a,b,c){a in this.__events||(this.__events[a]=[]),this.__events[a].push(b)},WebSocket.prototype.removeEventListener=function(a,b,c){if(!(a in this.__events))return;var d=this.__events[a];for(var e=d.length-1;e>=0;--e)if(d[e]===b){d.splice(e,1);break}},WebSocket.prototype.dispatchEvent=function(a){var b=this.__events[a.type]||[];for(var c=0;c<b.length;++c)b[c](a);var d=this["on"+a.type];d&&d(a)},WebSocket.prototype.__handleEvent=function(a){"readyState"in a&&(this.readyState=a.readyState),"protocol"in a&&(this.protocol=a.protocol);var b;if(a.type=="open"||a.type=="error")b=this.__createSimpleEvent(a.type);else if(a.type=="close")b=this.__createSimpleEvent("close");else{if(a.type!="message")throw"unknown event type: "+a.type;var c=decodeURIComponent(a.message);b=this.__createMessageEvent("message",c)}this.dispatchEvent(b)},WebSocket.prototype.__createSimpleEvent=function(a){if(document.createEvent&&window.Event){var b=document.createEvent("Event");return b.initEvent(a,!1,!1),b}return{type:a,bubbles:!1,cancelable:!1}},WebSocket.prototype.__createMessageEvent=function(a,b){if(document.createEvent&&window.MessageEvent&&!window.opera){var c=document.createEvent("MessageEvent");return c.initMessageEvent("message",!1,!1,b,null,null,window,null),c}return{type:a,data:b,bubbles:!1,cancelable:!1}},WebSocket.CONNECTING=0,WebSocket.OPEN=1,WebSocket.CLOSING=2,WebSocket.CLOSED=3,WebSocket.__flash=null,WebSocket.__instances={},WebSocket.__tasks=[],WebSocket.__nextId=0,WebSocket.loadFlashPolicyFile=function(a){WebSocket.__addTask(function(){WebSocket.__flash.loadManualPolicyFile(a)})},WebSocket.__initialize=function(){if(WebSocket.__flash)return;WebSocket.__swfLocation&&(window.WEB_SOCKET_SWF_LOCATION=WebSocket.__swfLocation);if(!window.WEB_SOCKET_SWF_LOCATION){a.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");return}var b=document.createElement("div");b.id="webSocketContainer",b.style.position="absolute",WebSocket.__isFlashLite()?(b.style.left="0px",b.style.top="0px"):(b.style.left="-100px",b.style.top="-100px");var c=document.createElement("div");c.id="webSocketFlash",b.appendChild(c),document.body.appendChild(b),swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION,"webSocketFlash","1","1","10.0.0",null,null,{hasPriority:!0,swliveconnect:!0,allowScriptAccess:"always"},null,function(b){b.success||a.error("[WebSocket] swfobject.embedSWF failed")})},WebSocket.__onFlashInitialized=function(){setTimeout(function(){WebSocket.__flash=document.getElementById("webSocketFlash"),WebSocket.__flash.setCallerUrl(location.href),WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);for(var a=0;a<WebSocket.__tasks.length;++a)WebSocket.__tasks[a]();WebSocket.__tasks=[]},0)},WebSocket.__onFlashEvent=function(){return setTimeout(function(){try{var b=WebSocket.__flash.receiveEvents();for(var c=0;c<b.length;++c)WebSocket.__instances[b[c].webSocketId].__handleEvent(b[c])}catch(d){a.error(d)}},0),!0},WebSocket.__log=function(b){a.log(decodeURIComponent(b))},WebSocket.__error=function(b){a.error(decodeURIComponent(b))},WebSocket.__addTask=function(a){WebSocket.__flash?a():WebSocket.__tasks.push(a)},WebSocket.__isFlashLite=function(){if(!window.navigator||!window.navigator.mimeTypes)return!1;var a=window.navigator.mimeTypes["application/x-shockwave-flash"];return!a||!a.enabledPlugin||!a.enabledPlugin.filename?!1:a.enabledPlugin.filename.match(/flashlite/i)?!0:!1},window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION||(window.addEventListener?window.addEventListener("load",function(){WebSocket.__initialize()},!1):window.attachEvent("onload",function(){WebSocket.__initialize()}))})(),function(a,b,c){function d(a){if(!a)return;b.Transport.apply(this,arguments),this.sendBuffer=[]}function e(){}a.XHR=d,b.util.inherit(d,b.Transport),d.prototype.open=function(){return this.socket.setBuffer(!1),this.onOpen(),this.get(),this.setCloseTimeout(),this},d.prototype.payload=function(a){var c=[];for(var d=0,e=a.length;d<e;d++)c.push(b.parser.encodePacket(a[d]));this.send(b.parser.encodePayload(c))},d.prototype.send=function(a){return this.post(a),this},d.prototype.post=function(a){function d(){this.readyState==4&&(this.onreadystatechange=e,b.posting=!1,this.status==200?b.socket.setBuffer(!1):b.onClose())}function f(){this.onload=e,b.socket.setBuffer(!1)}var b=this;this.socket.setBuffer(!0),this.sendXHR=this.request("POST"),c.XDomainRequest&&this.sendXHR instanceof XDomainRequest?this.sendXHR.onload=this.sendXHR.onerror=f:this.sendXHR.onreadystatechange=d,this.sendXHR.send(a)},d.prototype.close=function(){return this.onClose(),this},d.prototype.request=function(a){var c=b.util.request(this.socket.isXDomain()),d=b.util.query(this.socket.options.query,"t="+ +(new Date));c.open(a||"GET",this.prepareUrl()+d,!0);if(a=="POST")try{c.setRequestHeader?c.setRequestHeader("Content-type","text/plain;charset=UTF-8"):c.contentType="text/plain"}catch(e){}return c},d.prototype.scheme=function(){return this.socket.options.secure?"https":"http"},d.check=function(a,d){try{var e=b.util.request(d),f=c.XDomainRequest&&e instanceof XDomainRequest,g=a&&a.options&&a.options.secure?"https:":"http:",h=c.location&&g!=c.location.protocol;if(e&&(!f||!h))return!0}catch(i){}return!1},d.xdomainCheck=function(a){return d.check(a,!0)}}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b){function c(a){b.Transport.XHR.apply(this,arguments)}a.htmlfile=c,b.util.inherit(c,b.Transport.XHR),c.prototype.name="htmlfile",c.prototype.get=function(){this.doc=new(window[["Active"].concat("Object").join("X")])("htmlfile"),this.doc.open(),this.doc.write("<html></html>"),this.doc.close(),this.doc.parentWindow.s=this;var a=this.doc.createElement("div");a.className="socketio",this.doc.body.appendChild(a),this.iframe=this.doc.createElement("iframe"),a.appendChild(this.iframe);var c=this,d=b.util.query(this.socket.options.query,"t="+ +(new Date));this.iframe.src=this.prepareUrl()+d,b.util.on(window,"unload",function(){c.destroy()})},c.prototype._=function(a,b){this.onData(a);try{var c=b.getElementsByTagName("script")[0];c.parentNode.removeChild(c)}catch(d){}},c.prototype.destroy=function(){if(this.iframe){try{this.iframe.src="about:blank"}catch(a){}this.doc=null,this.iframe.parentNode.removeChild(this.iframe),this.iframe=null,CollectGarbage()}},c.prototype.close=function(){return this.destroy(),b.Transport.XHR.prototype.close.call(this)},c.check=function(a){if(typeof window!="undefined"&&["Active"].concat("Object").join("X")in window)try{var c=new(window[["Active"].concat("Object").join("X")])("htmlfile");return c&&b.Transport.XHR.check(a)}catch(d){}return!1},c.xdomainCheck=function(){return!1},b.transports.push("htmlfile")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b,c){function d(){b.Transport.XHR.apply(this,arguments)}function e(){}a["xhr-polling"]=d,b.util.inherit(d,b.Transport.XHR),b.util.merge(d,b.Transport.XHR),d.prototype.name="xhr-polling",d.prototype.heartbeats=function(){return!1},d.prototype.open=function(){var a=this;return b.Transport.XHR.prototype.open.call(a),!1},d.prototype.get=function(){function b(){this.readyState==4&&(this.onreadystatechange=e,this.status==200?(a.onData(this.responseText),a.get()):a.onClose())}function d(){this.onload=e,this.onerror=e,a.retryCounter=1,a.onData(this.responseText),a.get()}function f(){a.retryCounter++,!a.retryCounter||a.retryCounter>3?a.onClose():a.get()}if(!this.isOpen)return;var a=this;this.xhr=this.request(),c.XDomainRequest&&this.xhr instanceof XDomainRequest?(this.xhr.onload=d,this.xhr.onerror=f):this.xhr.onreadystatechange=b,this.xhr.send(null)},d.prototype.onClose=function(){b.Transport.XHR.prototype.onClose.call(this);if(this.xhr){this.xhr.onreadystatechange=this.xhr.onload=this.xhr.onerror=e;try{this.xhr.abort()}catch(a){}this.xhr=null}},d.prototype.ready=function(a,c){var d=this;b.util.defer(function(){c.call(d)})},b.transports.push("xhr-polling")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b,c){function e(a){b.Transport["xhr-polling"].apply(this,arguments),this.index=b.j.length;var c=this;b.j.push(function(a){c._(a)})}var d=c.document&&"MozAppearance"in c.document.documentElement.style;a["jsonp-polling"]=e,b.util.inherit(e,b.Transport["xhr-polling"]),e.prototype.name="jsonp-polling",e.prototype.post=function(a){function i(){j(),c.socket.setBuffer(!1)}function j(){c.iframe&&c.form.removeChild(c.iframe);try{h=document.createElement('<iframe name="'+c.iframeId+'">')}catch(a){h=document.createElement("iframe"),h.name=c.iframeId}h.id=c.iframeId,c.form.appendChild(h),c.iframe=h}var c=this,d=b.util.query(this.socket.options.query,"t="+ +(new Date)+"&i="+this.index);if(!this.form){var e=document.createElement("form"),f=document.createElement("textarea"),g=this.iframeId="socketio_iframe_"+this.index,h;e.className="socketio",e.style.position="absolute",e.style.top="0px",e.style.left="0px",e.style.display="none",e.target=g,e.method="POST",e.setAttribute("accept-charset","utf-8"),f.name="d",e.appendChild(f),document.body.appendChild(e),this.form=e,this.area=f}this.form.action=this.prepareUrl()+d,j(),this.area.value=b.JSON.stringify(a);try{this.form.submit()}catch(k){}this.iframe.attachEvent?h.onreadystatechange=function(){c.iframe.readyState=="complete"&&i()}:this.iframe.onload=i,this.socket.setBuffer(!0)},e.prototype.get=function(){var a=this,c=document.createElement("script"),e=b.util.query(this.socket.options.query,"t="+ +(new Date)+"&i="+this.index);this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),c.async=!0,c.src=this.prepareUrl()+e,c.onerror=function(){a.onClose()};var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(c,f),this.script=c,d&&setTimeout(function(){var a=document.createElement("iframe");document.body.appendChild(a),document.body.removeChild(a)},100)},e.prototype._=function(a){return this.onData(a),this.isOpen&&this.get(),this},e.prototype.ready=function(a,c){var e=this;if(!d)return c.call(this);b.util.load(function(){c.call(e)})},e.check=function(){return"document"in c},e.xdomainCheck=function(){return!0},b.transports.push("jsonp-polling")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),typeof define=="function"&&define.amd&&define([],function(){return io})})()

function Utils(_){
  if(!_) throw "underscore or lo-dash is required";


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
   * Take two array and weave them together into one array so that [1,2,3,4] + [1,2,3,4] => [1,1,2,2,3,3,4,4]
   * @param  {[type]} a [description]
   * @param  {[type]} b [description]
   * @return {[type]}   [description]
   */
  this.weave = function(a,b){
    var arrays = Array.prototype.slice.call(arguments.length === 1 ? arguments[0] : arguments);
    var maxLength = Math.max.apply(Math, arrays.map(function (el) { return el.length }));

    var result = [];
    for(var i=0; i<maxLength; i++){
      _.each(arrays, function(array){
          if(array[i]) result.push(array[i]);
      });
    }
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
var appScope;

function AppController($scope, $http)
{
  var socket = io.connect();

  $scope.loadMore = null;
  $scope.loading = false;
  $scope.loadingReverse = false;
  $scope.scrollPercentage = 0;
  $scope.scrollPosition = 0;

  appScope = $scope;
  $scope.stats = localStorage && localStorage.getObject('stats');

  setInterval(function(){
    $scope.stats = null; // reset and load new every 30 seconds
  }, 30000);


  socket.on('connect', function(data){
    console.log('connect');
    socket.on('trigger', function(trigger){
      console.log('trigger', trigger);

      var photo = $scope.library.photos.filter(function (item) {
        return item.taken === new Date(trigger.item.taken).getTime();
      }).pop();

      if (photo){
        angular.extend(photo, trigger.item); // update existing
      }
      else{
        $scope.library.photos.push(trigger.item); // add
      }


    });
  });

  $scope.$watch('scrollPosition', function(value){

    // force reload check when scrolling to top.
    // if (value < 0 && !$scope.stats) $scope.stats = null;

  });

  $scope.$watch('stats', function(value){
    if (!value){
      console.log('loading stats');
      
      $http.get('/api/stats', {params: null}).success(function(stats){
        $scope.stats = stats;

        if ($scope.library && $scope.library.modified && $scope.stats.modified > $scope.library.modified)
        {
          loadLatest($scope.library.modified);
        }
      }).error(function(err){
        console.log('stats error');
      });
    }
  });


  // load all photos based on modify date. It means we can fill up the library on newly changed
  // photos or recently added photos without loading the whole library again.
  function loadLatest(modified, done){

    $http.get('/api/library', {params: {modified:modified}, cache: true})
    .success(function(page){

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
      }, $scope.library.photos || []);

      // next is a cursor to the next date in the library
      if (page.next){
        console.log('next latest', page.next);
        return loadLatest(page.next, done);
      } else{
        // THE END
        console.log('done latest', page.modified);
        $scope.library.modified = page.modified;
        return done && done(null, $scope.library.photos);
      }

    })
    .error(function(err){
      console.log('library error', err);
      return done(err);
    });

  }

  // Load library based on photo taken, this will recurse until it reaches the end of the library
  function loadMore(taken, done){
    $http.get('/api/library', {params: {taken:taken || new Date().getTime() }, cache: true})
    .success(function(page){

      if (!page || !page.photos || !page.photos.length) return done && done();

      if ($scope.library.userId !== page.userId || !$scope.library.photos)
        $scope.library = {photos:[], userId : page.userId }; // reset if we are logged in as new user


      // if (_.find($scope.library.photos, {taken:page.photos[0].taken})) return done && done();

      _.each(page.photos, function(photo){
        photo.src=photo.src && photo.src.replace('$', page.baseUrl) || null;
        $scope.library.photos.push(photo);
      });

      // next is a cursor to the next date in the library
      if (page.next){
        if (_.any($scope.library.photos, {taken:page.next})) return done && done();
        console.log('next more', page.next);
        loadMore(page.next, done);
      } else{
        console.log('done more', page.modified);
        $scope.library.modified = page.modified;

        return done && done(null, $scope.library.photos);
      }

    })
    .error(function(err){
      console.log('library error', err);
      return done(err);
    });
  }

  function sortAndRemoveDuplicates(){
    $scope.library.photos.sort(function(a,b){
        return b.taken - a.taken;
    });

    var i = $scope.library.photos.length;
    while (i--) {
      if (i && $scope.library.photos[i-1].taken === $scope.library.photos[i].taken) {
        $scope.library.photos.splice(i,1);
      }
    }
  }
  
  var server;

  function initialize(){

    $scope.library = localStorage && localStorage.getObject('library') || {modified:null, photos:[],userId:null};
    $scope.library.photos = $scope.library.photos || [];


    if (window.shimIndexedDB) window.shimIndexedDB.__useShim();

    async.series({
      /*db : function(done){
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
            // descending order
            $scope.library.photos.concat(photos.reverse());
            $scope.$apply();
            done(null, photos);
          });
        });
      },*/
      beginning : function(done){
        loadMore(null, done);
      },
      changes : function(done){
        var lastModifyDate = $scope.library.modified && new Date($scope.library.modified).getTime() || null;
        if (lastModifyDate) loadLatest(lastModifyDate, done);
      },
      end : function(done){
        var lastPhoto = ($scope.library.photos || []).slice(-1)[0];
        loadMore(lastPhoto && lastPhoto.taken, done);
      }
    }, function(result){

      console.log('done async load', $scope.library);
      sortAndRemoveDuplicates();

      if (localStorage) localStorage.setObject('library', {modified: $scope.library.modified, userId: $scope.library.userId});
      if (server) {
        server.photos.update.call($scope.library.photos); // update means put == insert or update
      } else {
        // load every time as fallback
      }
    });



  }

  initialize();

}

angular.module('app', [])
.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = document.body;
    window.onscroll = function(event) {
      appScope.loadingReverse = $(window).scrollTop() < 0;
      appScope.scrollPosition = $(window).scrollTop();
      appScope.apply(attr.whenScrolled);
    };
  }})
.directive('slideshow', function() {
  var openDialog = {
   link :   function(scope, element, attrs) {
    function openDialog() {
      var element = angular.element('#slideshow');
      var ctrl = element.controller();
      ctrl.setModel(scope);
      element.modal('show');
    }
    element.bind('click', openDialog);
  }
};
return openDialog;})
.directive('rightClick', function($parse) {
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
})
/*.directive('dragstart', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['dragstart']);
    element.bind('dragstart', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
})*/
.directive('fullscreen', function(){

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
})
.directive('lazy', function($parse){
  
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
})
.directive('dropzone', function($parse){
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
})
.directive('dateFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$formatters.unshift(function(valueFromModel) {
        return valueFromModel && moment(valueFromModel).format('YYYY MMM DD');
        // return how data will be shown in input
      });

      ngModelCtrl.$parsers.push(function(valueFromInput) {
        var date = moment(valueFromInput);
        console.log('date', date)
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
})
.directive('datepicker', function() {
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


Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}
function GroupCtrl($scope){
  $scope.group = null;

  
  $scope.$watch('group', function(state){
    $scope.group.active = state;
    console.log($scope.group);

    if (state){
      $scope.photos.concat(group.photos);
    }

  }, true);
}
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
function MetadataCtrl($scope){
  
  $scope.star = function(photo){
    photo.vote = 0;
    socket.emit('vote', photo._id, 0);
    photo.starred = !photo.starred;
    console.log('star', photo);
  };


  $scope.hide = function(photo){
    photo.vote = 10;
    socket.emit('vote', photo._id, 10);
    photo.hidden = true;
    console.log('hide', photo);
  };

  $scope.rightClick = function(){
    $scope.$parentScope.selectedPhoto = null;

  };
  

}
var socket = io.connect();

function PhotoController ($scope, $http){
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
    if ($scope.selectedPhoto === photo)
      return $scope.selected(null);
    
    var meta = $('#meta')[0];
    $scope.selectedPhoto = photo;
    angular.copy(event.target.style, meta.style);
    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
    });
    
    return true;
  };

  $scope.click = function(photo){

    if ($scope.selectedPhoto === photo)
      $scope.select(null);
    else
      $scope.select(photo);


    // if someone views this image more than a few moments - it will be counted as a click - otherwise it will be reverted
    if (photo.updateClick) {
      clearTimeout(photo.updateClick);
      socket.emit('click', photo._id, -1);
    } else {
      photo.updateClick = setTimeout(function(){
        socket.emit('click', photo._id, 1);
      }, 300);
    }

  };

  $scope.hide = function(photo, group){
    console.log('hide', photo);
    socket.emit('hide', photo._id);
    photo.vote = 10;
  };

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

  function uploadFile(file, done){
    var fd = new FormData();
    var thumbnail = dataURItoBlob(file.thumbnail);
    
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
function WallController($scope, $http, $window){
  
  var zoomTimeout = null;
  var scrollTimeout = null;
  var utils = new Utils(_);
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


  console.log('wall', $scope);

  var lastPosition = null;
  var waiting = false;
   
  $window.onscroll = function(event) {

    $scope.loadingReverse = $(window).scrollTop() < 0;
    $scope.scrollPosition = $(window).scrollTop();

    var delta = $scope.scrollPosition - lastPosition;
    // $scope.scrolling = (Math.abs(delta) > 10);

    if (isInViewPort($scope.scrollPosition + delta * 2)) return;

    filterView(delta);
    if (!waiting && $scope.photosInView) $scope.photoInCenter = _.filter($scope.photosInView, function(a){return a.top >= $scope.scrollPosition + window.outerHeight / 2 - $scope.height / 2}).sort(function(a,b){ return b.taken-a.taken })[0];

    lastPosition = $scope.scrollPosition;

  };

  $scope.dblclick = function(photo){
    $scope.select(null);
    $scope.zoomLevel += 3;
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

  $scope.$watch('photoInCenter', function(value){
    $scope.q = value && value.taken;
  });
/*
  $scope.$watch('q', function(value){
    //$scope.q = value.taken;
    if (value) findCenter(value && value.toDate().getTime());
  });
*/
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

    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
      console.log('full', fullPhoto);
      photo.src = fullPhoto.store.original.url;
      $scope.loading = true;
      photo.loaded = function(){
        $scope.loading = false;
      };
    });

    photo.class="selected";
    photo.top = $(document).scrollTop() - 20; // zoom in a little bit more - gives the wide screen a little more space to fill the screen
    photo.height = window.innerHeight + 40;
    photo.width = Math.round(photo.height * photo.ratio);
    photo.left = Math.max(0,(window.innerWidth/2 - photo.width/2));

  });

  $scope.$watch('zoomLevel + (library && library.photos.length) + fullscreen', function(value, oldValue){
    
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
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


  function isInViewPort(top){
    return top > $scope.scrollPosition - (windowHeight * 2) && top < $scope.scrollPosition + windowHeight * 2;
  }
  function visible(photo, delta){
    return photo && isInViewPort(photo.top) || isInViewPort(photo.top + photo.height);
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
    console.log('filter');

    // optimized filter instead of array.filter.
    var photosInView = [];
    var i = 0;
   
    while(i++ <  $scope.photos.length){
      var photo = $scope.photos[i];
      
      if (visible(photo, delta)) {
        photosInView.push(photo);
      } else{
        if (photosInView.length) break;
      }
    }

    photosInView.sort(function(a,b){
      // take the center ones first but also prioritize the highest voted photos since they are more likely to be cached
      return (a.vote - b.vote);
      //return $scope.photoInCenter && Math.abs($scope.photoInCenter.top - a.top) - Math.abs($scope.photoInCenter.top - b.top) || 0 - (a.vote - b.vote) * $scope.height;
    });
    $scope.photosInView = photosInView; // utils.filterMerge($scope.photosInView, photosInView);

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

  function Group(photos){
    var visible = photos.filter(function(a){return a.active });
    var top = (visible.length && visible[0].top || 0); //+ 20;
    var last = visible.length && visible[visible.length-1] || null;

    //photos.forEach(function(photo){photo.top += 20});
    var group = {
      id : $scope.groups.length,
      photos: photos,
      top: top,
      height : last && (last.top + last.height - top) || 0,
      bottom : last && (last.top + last.height) || 0,
      from : photos[0].taken,
      to: top.taken,
      name : moment(photos[0].taken).format("dddd D MMM") //+ "(" + moment(photos.slice(-1).pop().taken).from(photos[0].taken, true) + ")"
    };

    $scope.groups.push(group);

    return group;
  }

  function closeRow(row, maxWidth){
    var last = row[row.length-1];
    var rowWidth = last.left + last.width;

    var percentageAdjustment = maxWidth / (rowWidth);

    // adjust height
    row.forEach(function(photo, i){
      photo.left *= percentageAdjustment;
      photo.width *= percentageAdjustment;
      photo.height *= percentageAdjustment;
    });
  }

  function recalculateSizes(){

    $scope.height = $scope.zoomLevel > 8 && 110 ||
                    $scope.zoomLevel > 6 && 120 ||
                    $scope.zoomLevel < 2 && 480 ||
                    240;

    $scope.groups = [];

    // compensate for bigger / smaller screens
    $scope.height = $scope.height * (window.innerWidth / 1920);

    var row = [];
    var group = [];
    var height = $scope.height;
    var padding = 1;
    var maxWidth = window.innerWidth;
    var found = false;
    var lastRow = null;
    var lastPhoto = null;
    var top = 0;
    var left = 0;

    // go through all photos
    // add all to groups
    // add visible to rows
    // only keep groups with enough photos in them
    // compensate width on each row

    // we want to go through all photos even if they are invisible
    $scope.photos = ($scope.library.photos).filter(function(photo, i, photos){

      // Is this the last in its group?
      var nextPhoto = photos[i+1];
      var gap = !nextPhoto && 1 || (photo.taken - nextPhoto.taken) / (6 * 60 * 60 * 1000);

      group.push(photo);
      
      // Only show visible photos
      if (photo && photo.src && photo.vote <= $scope.zoomLevel ) {

        photo.active = true;

        photo.height = height;
        photo.width = photo.height * (photo.ratio || 1);
        photo.top = top;
        photo.left = left + padding;
        row.push(lastPhoto = photo);

        // should we start a new row after this photo?
        if (photo.left + photo.width > maxWidth){
          closeRow(lastRow = row, maxWidth);
          row = [];
          top += photo.height + padding;
          left = padding;
        } else {
          left = photo.left + photo.width + padding;
        }

        // optimize - when we find the current row directly, just scroll to it directly
        if (!found && $scope.photoInCenter && photo.taken <= $scope.photoInCenter.taken && photo.top) {
          $('body,html').animate({scrollTop: photo.top - window.outerHeight / 2 - $scope.height}, 100);
          found = true;
        }
      } else{
        photo.active = false;
      }

      if (gap >= 1 ) {

        if (group.length >= 20){
          if (row.length > 2) {
            closeRow(row, maxWidth);
          }
          //else{
          //  lastRow.concat(row);
          //  closeRow(lastRow);
          //}

          var savedGroup = new Group(group);

          top = savedGroup.bottom + 15;
          left = 5;
        }
        group = [];
      }

      return photo.active;

    }, []);

    $scope.nrPhotos = $scope.photos.length || Math.round(($scope.stats && $scope.stats.all * $scope.zoomLevel / 10));

    // cancel all previous image requests
    // if (window.stop) window.stop();
    
    //$scope.photosInView = $scope.photos.slice(0,100);
    $scope.totalHeight = top + $scope.height;
  }
  
  function findCenter(taken){


    var found = _.find($scope.photos, function(a){
      if (a.taken >= taken){
        taken = a;
        return a;
      }
      else return false;
    });

    if (taken) location.hash = found.taken || "";
  }

  filterView(); // initial view


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
        e.preventDefault();
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