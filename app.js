/*
  Workflow
  - User clicks login
  - Return to page with "code" authorization (in URL param)
  - Perform OAUTH code login (POST request)
  - Save refresh token to browser local storage
  - Redirect to page without "code" in URL param
    - Not necessary, but the code token is a one time token
  - OAUTH Reauthenticate from refresh token (POST request)
  - Create CognitoIdentityCredentials object
  - Note that there is a slight delay for the authentication to complete
  - Set 1 second timer, then display credentials (may retry 5 times)
  - Verify credentials (AWS.config.getCredentials)
  - Call AWS.STS().getCallerIdentity() in order to display the Role ARN for the session
  - Call AWS.S3().getObject() to download a text file (if access is permitted)
  - Call AWS.Lambda.invoke() to call a function (if access is permitted)

  The following values will be imported from app-ids.js
 
  var CLIENT = "xxxxxxxxxxxxxxxxxxxxxxxxxx"; //app client id
  var DOM = "https://XXXXXXXXX.auth.us-west-2.amazoncognito.com/"; // hosted ui domain id
  var REDIR = "http://localhost:8887/index.html?logged-in";
  var IDPOOL = "us-west-2:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"; // cognito id pool id
  var USERPOOL = "us-west-2_XXXXXXXX"; // user pool id
 */

/*
 * Values derived from the identifiers defined in app.js
 */
var USERIDP = "cognito-idp.us-west-2.amazonaws.com/" + USERPOOL;
var OAUTH = DOM + "oauth2/token";
// Set &response_type=token for an implict grant
var DOMSUFF = "?client_id=" + CLIENT + "&response_type=code" +
    "&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=" + 
    REDIR;
var LOGIN = DOM + "/login" + DOMSUFF;
var LOGOUT = DOM + "/logout" + DOMSUFF;

var STORE_REFRESH = false; 
const ACCT = /\d{12,12}/g;

// Local storage key fro the refresh token
var LS_REFRESH = 'colladmin-refresh';

// jQuery page load logic
$(document).ready(function(){
  checkLogin();
});
 
// Sanitize AWS account from display
function sanitizeAccount(s) {
  return s.replaceAll(ACCT, "000000000000");
}

// Display the currently active credentials for the user's session
// Display a hash code for the refresh token
function showCredentials(attempt) {
  //Set output fields to &nbsp;
  $("div.main output").val('\xa0');
  showRefresh();
  AWS.config.getCredentials(function(err){
    if (err) {
      console.log(err.message);
      console.log("Attempt: " + attempt);
      if (attempt < 5) {
        setTimeout(function(){showCredentials(attempt + 1)}, 1000);
      } else {
        $("#message").val(err);
      }
    } else {
      $("#expired").val(AWS.config.credentials.expired);
      $("#expires").val(AWS.config.credentials.expireTime.toLocaleString());
      $("#identity").val(AWS.config.credentials.data.IdentityId);
      new AWS.STS().getCallerIdentity({}, function(err2, data) {
        if (err2) {
          console.log(err2, err2.stack); // an error occurred
          $("#message").val(err2);
        } else {
          console.log(data);
          $("#account").val(sanitizeAccount(data['Account']));
          $("#role").val(sanitizeAccount(data['Arn'].replaceAll("/", "\n")));
          try_s3();
          try_lambda();
        }
      });
    }
  });
}

function try_s3() {
  var s3 = new AWS.S3();
  var params = {
    Bucket: BUCKET, 
    Key: "hi.txt"
  };
  $("#s3down,#s3-message").text("");
  s3.getObject(params, function(err, data) {
    if (err) {
      //console.log(err.stack);
      $("#s3-message").val(sanitizeAccount(err.message) + " accessing S3 content");
    } else {
      var arr = data.Body.buffer;
      var body = new TextDecoder().decode(arr);
      console.log(body);
      $("#s3down").text(body);
    }
  });
}

function try_lambda() {
  $("#lambda,#lambda-message").text("");
  var params = {
    FunctionName: LAMBDA, 
    Payload: "{}",
    Qualifier: "$LATEST"
   };
   var lambda = new AWS.Lambda();
   lambda.invoke(params, function(err, data) {
     if (err) {
      $("#lambda-message").val(sanitizeAccount(err.message) + " accessing lambda");
     } else {
       var d = JSON.parse(data.Payload);
      $("#lambda").val(d['body']);
     } 
   });
}

/*
 * Refresh the AWS.config.credentials object using the id_token
 * Save the refresh token
 */
function updateCredentials(data) {
  AWS.config.region = 'us-west-2'; 
  var logins = {};
  logins[USERIDP] = data['id_token'];

  var params = {
    IdentityPoolId: IDPOOL,
    Logins: logins,
  };

  // Get the credentials from the identity pool
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);  
} 

/*
 * Get a named parameter from a URL hash string (used in implicit grant)
 */
function hashParam(key, defval) {
  if (!window.location.hash) return defval;
  if (window.location.hash.length < 1) return defval;
  var sp = new URLSearchParams(window.location.hash.substr(1));
  var v = sp.get(key);
  if (v) return v;
  return defval;
}

/*
 * Get a named parameter from a URL query string (used in implicit grant)
 */
function queryParam(key, defval) {
  if (!window.location.search) return defval;
  var sp = new URLSearchParams(window.location.search);
  var v = sp.get(key);
  if (v) return v;
  return defval;
}


/*
 * Check log in state on page refresh
 * - If a refresh token is available, use it (refresh_token grant)
 * - If a code parameter has been passed to the page, use that (authorization_code grant) 
 */
function checkLogin() {
  // if the implicit grant is enabled
  var id_token = hashParam("id_token", "na");
  if (id_token != "na") {
    doImplicitLogin(id_token);
    return;
  }

  var code = queryParam('code', '')
  if (code == "") {
    if ("colladmin-refresh" in localStorage && STORE_REFRESH) {
      console.log("try refresh token");
      doRefreshLogin();
    } else {
      console.log("no refresh token found");
    }
    return;
  }
  if (STORE_REFRESH) {
    console.log("code present... clear refresh token");
    localStorage.removeItem(LS_REFRESH);
  }
  doCodeLogin(code);
}

/*
 * Perform OAUTH login using authorization_code
 */
function doCodeLogin(code) {
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
      if (STORE_REFRESH) {
        localStorage[LS_REFRESH] = data['refresh_token'];
        document.location = document.location.pathname;
      } else {
        setTimeout(function(){showCredentials(0)}, 1000);
      }
    },
    error: function( xhr, status ) {
      console.log("code fail");
      $("#message").val(xhr.responseText);
    }
  });

}

/*
 * Perform OAUTH login using authorization_code
 */
function doImplicitLogin(token) {
  AWS.config.region = 'us-west-2'; 
  var logins = {};
  logins[USERIDP] = token;

  var params = {
    IdentityPoolId: IDPOOL,
    Logins: logins,
  };

  // Get the credentials from the identity pool

  AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
  setTimeout(function(){showCredentials(0)}, 1000);

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
      console.log("sleep then update credentials")
      setTimeout(function(){showCredentials(0)}, 1000);
    },
    error: function( xhr, status ) {
      console.log("refresh fail");
      $("#message").val(xhr.responseText);
      localStorage.removeItem(LS_REFRESH);
      showCredentials(0);
    }
  });

}


// Redirect to login page
function goToLogin() {
  document.location = LOGIN;
}

// Clear refresh token and redirect to logout page
function doLogout() {
  if (STORE_REFRESH) {
    localStorage.removeItem(LS_REFRESH);
  }
  goToLogout();
}

// Redirect to logout page
function goToLogout() {
  document.location = LOGOUT;
}

function details() {
  $("p.detail").toggle();
}


// Display a hash code of the refresh_token
function showRefresh() {
  if (LS_REFRESH in localStorage && STORE_REFRESH) {
    var token = localStorage[LS_REFRESH];
    //https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    var hash = 0, i = 0, len = token.length;
    while ( i < len ) {
      hash  = ((hash << 5) - hash + token.charCodeAt(i++)) << 0;
    }
    $("#refresh").val(hash);
  }
}
