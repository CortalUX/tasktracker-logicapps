const url_actions="https://prod-04.uksouth.logic.azure.com:443/workflows/56254cab7b6c407f91aa7a94a9ef549d/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d33x49ZsEIF7xa-u5Q9BKU2Adf6jlnCJRtwwDd2hvoM";
// const for sending actions
const url_emails="https://prod-29.uksouth.logic.azure.com:443/workflows/b136a37912e6424590967522192b3b35/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=askQTpkRwhuZH70FPRiqCXgCyhrbMfiI6GxwtLOFuI4";
// const for getting emails
const email_sig=`<div class="WordSection1"><p class="MsoNormal"><span style="font-size:11.0pt">&nbsp;</span></p><p class="MsoNormal"><span style="font-size:11.0pt">&nbsp;</span></p><p class="MsoNormal"><span lang="EN-US" style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif; color:#FF5800">Chris Lloyd-Jones</span><span lang="EN-US" style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif; color:gray">| Intelligent Automation Enablement Lead</span></p><p class="MsoNormal"><span lang="EN-US" style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif; color:gray">Intelligent Automation CoE<br></span><span lang="EN-US" style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif; color:#FF5800">Avanade</span><span lang="EN-US" style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif"> |<span style="color:gray">Direct: &#43;44 (0)20 81969867</span></span></p><p class="MsoNormal"><span style="font-size:11.0pt"><a href="http://www.avanade.com/"><span style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif; color:#FF5800">www.avanade.com</span></a></span><span style="font-size:8.0pt; font-family:&quot;Segoe UI&quot;,sans-serif; color:#FF5800"></span></p>`


var app = angular.module('taskTracker', []);

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
        $scope.ConversationId="";
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
        }
    }

    $scope.sendAction = function(key,cid,mid) {
        let keyLowercase = key.toLowerCase();
        if (keyLowercase=="z"||keyLowercase=="x"||keyLowercase=="b") {
            $scope.textprocess=true;
            $scope.continuekey=keyLowercase;
        } else {
            $scope.processedmails.push($scope.MessageId);
            if (!isNaN(key)) {
                keyLowercase+='.';
                console.log("appended . to %s",key);
            }
            let dataObj = {
                "action":keyLowercase,
                "ConversationId":cid,
                "MessageId":mid,
                "body:":""
            };
            $scope.postForm(dataObj);
            $scope.showNextEmail();
            console.log("sending %s to be actioned",mid);
        }
    }

    $scope.postForm = function(dataObj) {
        $http.post(url_actions,dataObj).then(function(response) {
            console.log("email %s actioned",dataObj.MessageId);
        });
    }

    $scope.cancelForm=function() {
        $scope.textprocess=false;
        $scope.showNextEmail();
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