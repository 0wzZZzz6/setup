angular.
module("setupProject").
component("setupProject", {
  templateUrl: "views/setupProject/setup-project.template.html"
}).
controller("setupProjectController", function($location, $scope, $rootScope, $firebaseArray, $firebaseAuth, $mdDialog, $mdMedia, $mdToast, $timeout, $mdSidenav, $log, Auth) {
  var THIS = this;
  var ref = firebase.database().ref();
  var firebaseUser = firebase.auth().currentUser;
  var settingsRef = firebase.database().ref("settings");
  var usersRef = firebase.database().ref("users");
  $scope.setupProjects = $firebaseArray(ref.child("setupProject"));
  $scope.history = $firebaseArray(ref.child("history"));
  $scope.authObj = $firebaseAuth();
  $scope.auth = Auth;
  $scope.selected = [];
  $scope.proponentWithDue = new Array();
  $scope.filteredItems = new Array();
  $scope.projectYear = "";
  $scope.limitOptions = limitOptions;
  $scope.filterOptions = years;
  $scope.options = options;
  $scope.query = query;
  $scope.tooltip = tooltip;

  console.log(`${window.screen.availWidth} x ${window.screen.availHeight}`);

  if(window.screen.availWidth == 1366 && window.screen.availHeight == 738) {
    document.getElementById('table-container').style.height = '80.5vh';
  } else if (window.screen.availWidth == 1920 && window.screen.availHeight == 1080) {
    document.getElementById('table-container').style.height = '88.5vh';
    $scope.query.limit = 25;
  }

  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      $location.path("/setupProject");
      console.log(`Signed in as ${firebaseUser.uid} - email: ${firebaseUser.email} displayName: ${firebaseUser.displayName}`);

      usersRef.child(firebaseUser.uid).on('value', function(snapshot) {
        $scope.userDisplayName = snapshot.val().displayName;
        $scope.userEmailAddress = snapshot.val().email;
      });

      $scope.setupProjects.$loaded(function(item) {
        $scope.hidenow = true;
        if(window.screen.availWidth == 1366 && window.screen.availHeight == 738) {
          document.getElementById('table-container').style.height = '81.5vh';
        } else if (window.screen.availWidth == 1920 && window.screen.availHeight == 1080) {
          document.getElementById('table-container').style.height = '88.5vh';
          $scope.query.limit = 25;
        }
        if(currentDay > 1) {
          angular.forEach($scope.setupProjects, function(value, key) {
            console.log(`a`);
            // if(currentDay == 1) {
              // console.log(`its currentDay: ${currentDay}`);
              // console.log(`${key}   ${value.$id} - ${value.proponent}`);
              // var record = $scope.setupProjects.$getRecord(value.$id);
              // record.remindRefund = false;
              // $scope.setupProjects.$save(record);
            // }
          });
        }
      });
    } else {
      console.log("Signed out");
      $location.path("/userAuth");
    }
  });

  $scope.toast = function(param) {
    $scope.toastPosition = angular.extend({}, last);
    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
      .filter(function(pos) {
        return $scope.toastPosition[pos];
      })
      .join(" ");
    };

    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }

    var pinTo = $scope.getToastPosition();
    $mdToast.show(
      $mdToast.simple()
      .textContent(param)
      .position(pinTo)
      .hideDelay(3000)
    );
  }

  $scope.clearFilter = function() {
    $scope.filterProponent = "";
  }

  $scope.remindRefundIcon = function(param) {
    // var startDate = (param.refundScheduleStart == "" ? null : new Date(param.refundScheduleStart).getTime());
    var startDate = (param.refundScheduleStart == "" ? null : new Date(moment(param.refundScheduleStart, "MM DD YYYY").subtract(14, 'day').format("MMM DD YYYY")).getTime());
    var endDate = (param.refundScheduleEnd == "" ? null : new Date(param.refundScheduleEnd).getTime());
    if (startDate <= currentDate && currentDate <= endDate && dueDateStart <= currentDay && currentDay <= dueDateEnd) {
      var proponent = param.proponent;
      return param.remindRefund;
    }
  };

  $scope.filterRemindRefund = function(param) {
    // var startDate = (param.refundScheduleStart == "" ? null : new Date(param.refundScheduleStart).getTime());
    var startDate = (param.refundScheduleStart == "" ? null : new Date(moment(param.refundScheduleStart, "MM DD YYYY").subtract(14, 'day').format("MMM DD YYYY")).getTime());
    var endDate = (param.refundScheduleEnd == "" ? null : new Date(param.refundScheduleEnd).getTime());
    if (startDate <= currentDate && currentDate <= endDate && dueDateStart <= currentDay && currentDay <= dueDateEnd) {
      $scope.proponentWithDue.push(param.proponent);
      return param;
    }
  };

  $scope.selectRow = function(param) {
    THIS.SETUPPROJECT = param;
    console.log(THIS.SETUPPROJECT.proponent);
  };

  $scope.sendEmail = function() {
    $scope.filteredItems = $scope.proponentWithDue.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    });
    console.log(`${$scope.filteredItems.length}`);
    var temp = "";
    for(var i = 0; i < $scope.filteredItems.length; i++) {
      temp += i+1 + ". " + $scope.filteredItems[i] + '<br>';
    }
    console.log(`sendEmail - ${$scope.filteredItems.length}  -  ${temp}`);
    emailjs.send("gmail","template_4nILbpzO", {
      email_to: $scope.userEmailAddress,
      from_name: "jan weak",
      to_name: `${$scope.userDisplayName} - ${$scope.userEmailAddress}`,
      message_body: "Proponents :<br><br>" + temp
    }).
    then(function(response) {
      console.log("SUCCESS", response);
      console.log(`${temp}`);
      $scope.toast(`Email Sent.`);
    },
    function(error) {
      console.log("FAILED", error);
    });
  }

  $scope.formatThousand = function(param) {
    return param.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  $scope.formatDate = function(param) {
    return param == "" ? "" : moment(param, "MM-DD-YYYY").format("MMM DD YYYY");
  };

  $scope.toggleSideNav = function() {
    $mdSidenav('left').
    toggle();
  }

  $scope.closeSideNav = function() {
    $mdSidenav('left').
    close();
  };

  $scope.profile = function(ev) {
    $mdDialog.show({
      controller: "profileController",
      templateUrl: "views/dialog/profileDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  }

  $scope.showHistory = function(ev) {
    $mdDialog.show({
      controller: "historyController",
      templateUrl: "views/dialog/historyDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  };

  $scope.showSettings = function(ev) {
    $mdDialog.show({
      controller: "settingsController",
      templateUrl: "views/dialog/settingsDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  }

  $scope.signOut = function(ev) {
    var confirm = $mdDialog.confirm()
    .title('Are you sure to Sign Out?')
    .ariaLabel('Lucky day')
    .targetEvent(ev)
    .ok('Sign Out')
    .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      $scope.auth.$signOut();
    });
  }

  $scope.delete = function(ev) {
    console.log(THIS.SETUPPROJECT.proponent);
    var confirm = $mdDialog.confirm()
    .title("Would you like to delete " + THIS.SETUPPROJECT.proponent + " SETUP project?")
    .ariaLabel("DELETE SETUP project")
    .targetEvent(ev)
    .ok("Delete")
    .cancel("Cancel");
    $mdDialog.show(confirm).then(function() {
      $scope.history.$add({
        action: "delete",
        proponent: THIS.SETUPPROJECT.proponent,
        date: new Date().getTime(),
        email: $scope.userEmailAddress
      });
      $scope.setupProjects.$remove(THIS.SETUPPROJECT);
      $scope.selected = [];
      $scope.showOption = true;
      $scope.toast(`${THIS.SETUPPROJECT.proponent} project successfully deleted.`);
    }, function() {
      $mdDialog.hide();
    });
  };

  $scope.edit = function(ev) {
    $mdDialog.show({
      controller: "editProponentController",
      templateUrl: "views/dialog/proponentDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false,
      locals: {
        setupProject: {
          id: THIS.SETUPPROJECT.$id,
          projectYear: THIS.SETUPPROJECT.projectYear,
          proponent: THIS.SETUPPROJECT.proponent,
          dateReleased: THIS.SETUPPROJECT.dateReleased,
          dateApproved: THIS.SETUPPROJECT.dateApproved,
          actualFundRelease: THIS.SETUPPROJECT.actualFundRelease,
          projectDurationStart: THIS.SETUPPROJECT.projectDurationStart,
          projectDurationEnd: THIS.SETUPPROJECT.projectDurationEnd,
          refundScheduleStart: THIS.SETUPPROJECT.refundScheduleStart,
          refundScheduleEnd: THIS.SETUPPROJECT.refundScheduleEnd,
          latestProjectExtension: THIS.SETUPPROJECT.latestProjectExtension,
          refundMade: THIS.SETUPPROJECT.refundMade,
          balance: THIS.SETUPPROJECT.balance,
          status: THIS.SETUPPROJECT.status,
          remindRefund: THIS.SETUPPROJECT.remindRefund,
          email: THIS.SETUPPROJECT.email,
          contactNumber: THIS.SETUPPROJECT.contactNumber
        }
      }
    });
  };

  $scope.create = function(ev, setupProject) {
    $mdDialog.show({
      controller: "addProponentDialogController",
      templateUrl: "views/dialog/proponentDialog.template.html",
      parent: angular.element(document.body),
      targetEvent: ev,
      escapeToClose: false
    });
  };

});
