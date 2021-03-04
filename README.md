# Create JS Client to Perform a Login to a Cognito User Pool

## Setup

Clone this repo.

### Prepare configuration file
Copy `app-ids.template.js` to `app-ids.js`.  As you create AWS objects, save those to app-ids.js (untracted).

### Create AWS Objects
- Create Cognito User Pool
- Create Cognito User Groups
- Create Cognito Identity Pool that uses the User Pool
- Create Cognito Application
- Create Cognito Hosted UI to present login pages that connect to the User Pool

### Publish the contents of this repo from a web server 

_This sample presumes localhost:8887_

### Open the web page and log in