var userReporter = {
   jasmineStarted: function(suiteInfo) {
       kony.print('Running suite with total specs ' + suiteInfo.totalSpecsDefined);
   },
   
   suiteStarted: function(result) {
       kony.print('Test Suite: ' + result.description);
   },
   
   specStarted:function (result) {
       kony.print('Spec started: ' + result.description + ' whose full description is: ' + result.fullName);
   },
   
   specDone: function(result) {
       kony.print('Spec: ' + result.description + ' Execution status: ' + result.status);
       for(var i = 0; i < result.failedExpectations.length; i++) {
           kony.print('Failure: ' + result.failedExpectations[i].message + ' at ' + result.failedExpectations[i].stack);
       }
       kony.print('Spec: ' + result.description + 'Total passed expectations: ' + result.passedExpectations.length);
   },

   suiteDone: function(result) {
       kony.print('Suite: ' + result.description + ' was ' + result.status);
       for(var i = 0; i < result.failedExpectations.length; i++) {
            kony.print('Failure: ' + result.failedExpectations[i].message + ' at ' + result.failedExpectations[i].stack);
       }
   },

   jasmineDone: function() {
       kony.print('Finished suite');
   }
};