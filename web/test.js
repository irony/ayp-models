 
var numbers = [15, 16, 23, 8, 15, 8, 42, 4, 16, 4, 23, 42];

lost = numbers.slice() // slice means you create a copy of the array to prevent sort 
  .sort(function(a,b){
    return a - b; // sort b - a if you rather use descending order
  })
  .reduce(function(a,b){
    if (a.slice(-1) != b) a.push(b); // slice(-1) means last item in array without removing it (like .pop())
    return a;
  },[]); // this empty array becomes the starting value for a

console.log(lost)
console.log(numbers)

// one liner
//return array.slice().sort(function(a,b){return a - b}).reduce(function(a,b){if (a.slice(-1) != b) a.push(b);return a;},[]);

Uniq reduce while keeping existing order
========================================

    var names = ["Mike","Matt","Nancy","Adam","Jenny","Nancy","Carl"];

    var uniq = names.reduce(function(a,b){
        if (a.indexOf(b) < 0 ) a.push(b);
        return a;
      },[]);

    console.log(uniq, names) // [ 'Mike', 'Matt', 'Nancy', 'Adam', 'Jenny', 'Carl' ]

    // one liner
    return names.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);


Faster uniq with sorting
========================
    var uniq = names.slice() // slice makes copy of array before sorting it
      .sort(function(a,b){
        return a - b;
      })
      .reduce(function(a,b){
        if (a.slice(-1) != b) a.push(b); // slice(-1) means last item in array without removing it (like .pop())
        return a;
      },[]); // this empty array becomes the starting value for a

    // one liner
    return names.slice().sort(function(a,b){return a - b}).reduce(function(a,b){if (a.slice(-1) != b) a.push(b);return a;},[]);

