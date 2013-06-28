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
