angular.
module("setupProject").
component("setupProject", {
  templateUrl: "views/setupProject/setup-project.template.html"
}).
controller("setupProjectController", function($location, $scope, $rootScope, $firebaseArray,$firebaseAuth, $mdDialog, $mdMedia, $mdToast, $timeout, $mdSidenav, $log, Auth) {
  $scope.authObj = $firebaseAuth();
  $scope.auth = Auth;
  $scope.selected = [];
  $scope.proponentWithDue = new Array();
  $scope.projectYear = "";
  var THIS = this;
  var ref = firebase.database().ref().child("setupProject");
  $scope.setupProjects = $firebaseArray(ref);

  $scope.setupProjects.$watch(function(e) {
    // displays total number of items from firebase database
    $scope.setupProjectsLength = $scope.setupProjects.length;
  });

  $scope.promise = $scope.setupProjects.$loaded(function(item) {
    item === $scope.setupProjects; // true
    angular.forEach($scope.setupProjects, function(value, key) {
      // console.log(`${value.$id} - ${value.proponent}: ${key}`);
      // if (false) {
      //   var record = $scope.setupProjects.$getRecord(value.$id);
      //   record.remindRefund = "false";
      //   $scope.setupProjects.$save(record);
      // }
    });
  });

  $scope.limitOptions = limitOptions;

  $scope.filterOptions = years;

  $scope.options = options;

  $scope.query = query;

  $scope.tooltip = tooltip;

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

  $scope.logPagination = function (page, limit) {
    console.log("page: ", page);
    console.log("limit: ", limit);
  };

  $scope.remindRefundIcon = function(param) {
    var nowDate = new Date().getTime();
    var currentDay = new Date().getDate();
    var startDate = (param.refundScheduleStart == "" ? null : new Date(param.refundScheduleStart).getTime());
    var endDate = (param.refundScheduleEnd == "" ? null : new Date(param.refundScheduleEnd).getTime());

    // if (startDate <= nowDate && nowDate <= endDate && dueDateStart <= currentDay && currentDay <= dueDateEnd) {
    if (startDate <= nowDate <= endDate && dueDateStart <= currentDay <= dueDateEnd) {
      var proponent = param.proponent;
      return param.remindRefund;
    }
  };

  $scope.filterRemindRefund = function(param) {
    var nowDate = new Date().getTime();
    var currentDay = new Date().getDate();
    var startDate = (param.refundScheduleStart == "" ? null : new Date(param.refundScheduleStart).getTime());
    var endDate = (param.refundScheduleEnd == "" ? null : new Date(param.refundScheduleEnd).getTime());

    if (startDate <= nowDate && nowDate <= endDate && dueDateStart <= currentDay && currentDay <= dueDateEnd) {
    // if (startDate <= nowDate <= endDate && dueDateStart <= currentDay <= dueDateEnd) {
      $scope.proponentWithDue.push(param.proponent);

      return param;
    }
  };

  $scope.sendEmail = function() {
    $scope.filteredItems = new Array();
    $scope.filteredItems = $scope.proponentWithDue.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    });

    var temp = "";
    for(var i = 0; i < $scope.filteredItems.length; i++) {
      temp += i+1 + ". " + $scope.filteredItems[i] + '<br>';
    }

    emailjs.send("gmail","template_4nILbpzO", {
      email_to: "janfrancistagadiad@gmail.com",
      from_name: "jan weak",
      to_name: "Maam Leslie",
      message_body: "Proponents :<br><br>" + temp
    }).
    then(function(response) {
      console.log("SUCCESS", response);
      var pinTo = $scope.getToastPosition();

      $mdToast.show(
        $mdToast.simple()
        .textContent("Email sent...")
        .position(pinTo)
        .hideDelay(3000)
      );
    },
    function(error) {
      console.log("FAILED", error);
    });
  }

  $scope.myCustomFilter = function(setupProject) {
    console.log(setupProject.proponent);
    return setupProject;
  }

  $scope.rightClick = function(param) {
    console.log(param.proponent);
  };

  $scope.selectRow = function(param) {
    THIS.SETUPPROJECT = param;
    console.log(THIS.SETUPPROJECT.proponent);
  };

  $scope.formatThousand = function(param) {
    return param.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  $scope.formatDate = function(param) {
    return param == "" ? "" : moment(param).format("MMM DD YYYY");
  };

  $scope.toggleLeft = buildToggler('left');

  function buildToggler(navID) {
    return function() {
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug("toggle " + navID + " is done");
      });
    }
  }

  $scope.closeSideNav = function () {
    $mdSidenav('left').close()
    .then(function () {
      $log.debug("close RIGHT is done");
    });
  };

  $scope.delete = function(ev) {
    console.log(THIS.SETUPPROJECT.proponent);

    var confirm = $mdDialog.confirm()
    .title("Would you like to delete " + THIS.SETUPPROJECT.proponent + " SETUP project?")
    .ariaLabel("DELETE SETUP project")
    .targetEvent(ev)
    .ok("Delete")
    .cancel("Cancel");

    $mdDialog.show(confirm).then(function() {
      $scope.setupProjects.$remove(THIS.SETUPPROJECT);
      $scope.selected = [];
      $scope.showOption = true;
      var pinTo = $scope.getToastPosition();

      $mdToast.show(
        $mdToast.simple()
        .textContent(THIS.SETUPPROJECT.proponent + " project successfully deleted...")
        .position(pinTo)
        .hideDelay(5000)
      );
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
          emailAddress: THIS.SETUPPROJECT.emailAddress,
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
      targetEvent: ev
    });

    $scope.closeDialog = function() {
      $mdDialog.hide();
    }
  };

  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      $location.path("/setupProject");
      console.log("Signed in as:", firebaseUser.uid);
    } else {
      console.log("Signed out");
      $location.path("/userAuth");
    }
  });

});
