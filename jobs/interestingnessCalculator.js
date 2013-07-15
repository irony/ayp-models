module.exports = function(photoCopy){
  var mine = photoCopy;
  var count = 0;
  var total = 0;
  var group = {}; // dummy
  
  // to be compatible with mapReduce jobs we use the same syntax here
  var emit = function(dummy, value){
    count++;
    total += value;
  };

  if(mine.views) emit(group, 100 + mine.views * 5);
  // if(mine.clusterOrder) emit(group, Math.min(0, 100-mine.clusterOrder));

  if(mine.clicks) emit(group, 100 + mine.clicks * 10);
  if(mine.hidden) emit(group, 0);
  // if(mine.vote) emit(group, 1000 - vote * 100);

  if (count === 0)
    return mine.interestingness;

  return total / count;

};