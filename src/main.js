var app = angular.module('taskTracker', []);

app.directive('showFocus', function($timeout) {
    return function(scope, element, attrs) {
      scope.$watch(attrs.showFocus, 
        function (newValue) { 
          $timeout(function() {
              newValue && element[0].focus();
          });
        },true);
    };    
  });

app.controller('emailShow', function($scope, $http, $sce) {
    // Init variables
    // Reset display function
    // Get emails
    // Show next email
    // Send action
    // if emails run out, send another

    $scope.initVariables = function() {
        $scope.mailcount=0;
        $scope.mailarray=new Array();
        $scope.processedmails=new Array();
    }

    $scope.resetDisplay = function() {
        $scope.from="";$scope.to="";$scope.cc="";
        $scope.DateTimeReceived="";$scope.daysAgo="";
        $scope.body="";$scope.subject="";$scope.Id="";
        $scope.ConversationId="";$scope.bodytext="";
        $scope.textprocess=false;
        // unaware of a way to multi-assign as this is an object
    }

    $scope.refreshButton = function() {
        $scope.resetDisplay();
        $scope.mailarray=new Array();
        $scope.showNextEmail();
    }

    $scope.getEmails = function(showEmail=true) {
        $http.get(url_emails).then(function(response) {
            console.log("downloaded next set of emails.");
            $scope.mailarray=$scope.mailarray.concat(response.data);
            if ($scope.mailarray.length > 0) {
                if (showEmail) {
                    $scope.showNextEmail();
                }
            } else {
                console.log("out of emails.");
                $scope.resetDisplay();
                $scope.subject="out of emails";
            }
        });
    }

    $scope.showNextEmail = function() {
        $scope.resetDisplay();
        if ($scope.mailarray.length==0) {
            console.log("array empty, refreshing array.");
            $scope.getEmails();
        } else {
            let email=$scope.mailarray.shift();
            $scope.MessageId=email.Id;
            if ($scope.processedmails.indexOf($scope.MessageId) !=  -1) {
                console.log("skipping previously actioned email");
                $scope.showNextEmail();
            } else {
                console.log(email);
                console.log("shifted email with ID %s,",email.Id);  
                $scope.body=$sce.trustAsHtml(email.Body);
                $scope.from=email.From;
                $scope.cc=email.Cc;
                $scope.to=email.To;
                $scope.DateTimeReceived=email.DateTimeReceived;
                $scope.ConversationId=email.ConversationId;
                $scope.subject=email.Subject;
                $scope.mailcount=$scope.mailarray.length + 1;
            }
            if ($scope.mailarray.length<2) {
                console.log("email buffer is low, triggering download");
                $scope.getEmails(false);
            }
        }
    }

    $scope.pushDown = function(myEvent) {
        if (!$scope.textprocess) {
            console.log("Pressed %s",myEvent.key);
            if ($scope.processedmails.indexOf($scope.MessageId) ==  -1) {
                $scope.sendAction(myEvent.key,
                    $scope.ConversationId,
                    $scope.MessageId);
            } else {
                console.log("Duplicate request for %s",$scope.MessageId);
            }
        } else if (myEvent.keyCode === 13 && myEvent.ctrlKey) {
            $scope.continueForm();
        } else if (myEvent.key=='`') {
            console.log("Cancelling form, with logged '%s.'",$scope.bodytext);
            $scope.cancelForm();
        }
    }

    $scope.sendAction = function(key,cid,mid) {
        let keyLowercase = key.toLowerCase();
        if (!isNaN(key)) {
            keyLowercase+='.';
            console.log("appended . to %s",key);
        }
        switch (keyLowercase) {
            case "r":
                $scope.refreshButton();
            break;
            case "z":
            case "x":
            case "b":
                $scope.textprocess=true;
                $scope.continuekey=keyLowercase;
                $("#bodytext").focus();
                setTimeout(function() {
                    //å$el.find('textarea').focus();
                    $("#bodytext").focus();
                   }, 0);
            break;
            default:
                $scope.processedmails.push($scope.MessageId);
                let dataObj = {
                    "action":keyLowercase,
                    "ConversationId":cid,
                    "MessageId":mid,
                    "body:":""
                };
                $scope.postForm(dataObj);
                $scope.showNextEmail();
                console.log("sending %s to be actioned",mid);
            break;
        }
    }

    $scope.postForm = function(dataObj) {
        $http.post(url_actions,dataObj).then(function(response) {
            console.log("email %s actioned",dataObj.MessageId);
        });
    }

    $scope.cancelForm=function() {
        $scope.textprocess=false;
        $scope.body=$sce.trustAsHtml("<div class='alert alert-info'><strong>Cancelled!</strong> Email not sent! '"+$scope.bodytext+"'</div>"+$scope.body);
        $scope.bodytext="";
    }

    $scope.continueForm = function() {
        $scope.textprocess=false;
        let dataObj = {
            "action":$scope.continuekey,
            "ConversationId":$scope.ConversationId,
            "MessageId":$scope.MessageId,
            "body:":$scope.bodytext
        };
        $scope.postForm(dataObj);
        $scope.subject="(processed) "+$scope.subject;
        $scope.body=$sce.trustAsHtml("<div class='alert alert-success'><strong>Success!</strong> Email sent!</div>"+$scope.body);
        console.log("sending %s to be actioned with bodytext %s",$scope.MessageId,$scope.bodytext);
        $scope.bodytext="";
    }

    $scope.initVariables();
    $scope.showNextEmail();
});