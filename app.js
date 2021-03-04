/*
 *The following values will be imported from app-ids.js
 */

 // var CLIENT = "xxxxxxxxxxxxxxxxxxxxxxxxxx"; //app client id
// var DOM = "https://XXXXXXXXX.auth.us-west-2.amazoncognito.com/"; // hosted ui domain id
// var REDIR = "http://localhost:8887/index.html?logged-in";
// var IDPOOL = "us-west-2:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"; // cognito id pool id
// var USERPOOL = "us-west-2_XXXXXXXX"; // user pool id

/*
 * Values derived from the identifiers defined in app.js
 */
var USERIDP = "cognito-idp.us-west-2.amazonaws.com/" + USERPOOL;
var OAUTH = DOM + "oauth2/token";
var DOMSUFF = "?client_id=" + CLIENT + 
    "&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=" + 
    REDIR;
var LOGIN = DOM + "/login" + DOMSUFF;
var LOGOUT = DOM + "/logout" + DOMSUFF;

// Local storage key fro the refresh token
var LS_REFRESH = 'colladmin-refresh';

// Simple parser to pull GET parameters
function getParams(){
  var queries = {};
  if (document.location.search == "") {
    return queries;
  }
  $.each(document.location.search.substr(1).split('&'),function(c,q){
    var i = q.split('=');
    queries[i[0]] = i[1];
  });
  return queries;
}

// Retrieve a GET parameter or return a default value
function getParam(name, def) {
  var p = getParams();
  return (name in p) ? p[name] : def;
}

// Display the currently active credentials for the user's session
// Display a hash code for the refresh token
function showCredentials() {
  //Set output fields to &nbsp;
  $("div.main output").val('\xa0');
  showRefresh();
  AWS.config.getCredentials(function(err){
    if (err) {
      //console.log(err.stack);
      $("#message").val(err);
    } else {
      $("#expired").val(AWS.config.credentials.expired);
      $("#expires").val(AWS.config.credentials.expireTime.toLocaleString());
      new AWS.STS().getCallerIdentity({}, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          $("#message").val(err);
        } else {
          $("#account").val(data['Account']);
          $("#role").val(data['Arn'].replace(/^.*assumed-role./, ''));
          return true;
        }
      });
    }
  });
  return false;
}

/*
 * Refresh the AWS.config.credentials object using the id_token
 * Save the refresh token
 */
function updateCredentials(data) {
  AWS.config.region = 'us-west-2'; 
  var logins = {};
  logins[USERIDP] = data['id_token'];
  if ('refresh_token' in data) {
    localStorage[LS_REFRESH] = data['refresh_token'];
  }
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDPOOL,
    Logins: logins,
  });
  showCredentials();
}

/*
 * Check log in state on page refresh
 * - If a refresh token is available, use it (refresh_token grant)
 * - If a code parameter has been passed to the page, use that (authorization_code grant) 
 */
function checkLogin() {
  if (!showCredentials()) {
    if ("colladmin-refresh" in localStorage) {
      doRefreshLogin();
    } else {
      doCodeLogin();
    }
  }
}

/*
 * Perform OAUTH login using authorization_code
 */
function doCodeLogin() {
  var code = getParam('code', '')
  if (code == "") {
    return;
  }
  $.ajax({
    dataType: "json",
    method: "POST",
    url: OAUTH,
    data: {
      grant_type: "authorization_code",
      redirect_uri: REDIR,
      client_id: CLIENT, 
      code: code
    },
    success: function(data) {
      console.log("code success");
      updateCredentials(data);
    },
    error: function( xhr, status ) {
      console.log("code fail");
      $("#message").val(xhr.responseText);
    }
  });

}

/*
 * Perform OAUTH login using refresh_token.  If this fails, check for an authorization_code.
 */
function doRefreshLogin() {
  $.ajax({
    dataType: "json",
    method: "POST",
    url: OAUTH,
    data: {
      grant_type: "refresh_token",
      redirect_uri: REDIR,
      client_id: CLIENT, 
      refresh_token: localStorage[LS_REFRESH]
    },
    success: function(data) {
      console.log("refresh success");
      updateCredentials(data);
    },
    error: function( xhr, status ) {
      console.log("refresh fail");
      $("#message").val(xhr.responseText);
      localStorage.removeItem(LS_REFRESH);
      doCodeLogin();
    }
  });

}

// jQuery page load logic
$(document).ready(function(){
 checkLogin();
});

// Redirect to login page
function goToLogin() {
  document.location = LOGIN;
}

// Clear refresh token and redirect to logout page
function doLogout() {
  localStorage.removeItem(LS_REFRESH);
  goToLogout();
}

// Redirect to logout page
function goToLogout() {
  document.location = LOGOUT;
}

// Display a hash code of the refresh_token
function showRefresh() {
  if (LS_REFRESH in localStorage) {
    var token = localStorage[LS_REFRESH];
    //https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    var hash = 0, i = 0, len = token.length;
    while ( i < len ) {
      hash  = ((hash << 5) - hash + token.charCodeAt(i++)) << 0;
    }
    $("#refresh").val(hash);
  }
}
