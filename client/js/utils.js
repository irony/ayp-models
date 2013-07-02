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
