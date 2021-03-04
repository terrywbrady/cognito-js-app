# Create JS Client to Perform a Login to a Cognito User Pool

## Setup

### Clone this repo.

### Publish the contents of this repo from a web server 

_This sample presumes localhost:8887_

Save the URL to your website as the redirect URL `REDIR` in app-ids.js.
### Prepare configuration file
Copy `app-ids.template.js` to `app-ids.js`.  As you create AWS objects, save those to app-ids.js (untracted).

### Create AWS Objects
- Create Cognito User Pool
  - Capture the `Pool Id`.  Save as `USERPOOL` in app-ids.js
  - Create Cognito App Client for the User Pool
    - Capture the `App client id`.  Save as `CLIENT` in app-ids.js
    - Modify the App Integration/App Client settings
      - Set the Callback URL(s) and Sign out URL(s) to point to your instance
      - Enable `Authorization code grant` and `Implicit grant`
    - Modify the App Integration/Domain name for a Hosted UI
      - Save the domain as `DOM` in app-ids.js
- Create Cognito Identity Pool that uses the User Pool
  - Configure the follwoing "Authentication Provider"
    - Tab: Cognito
    - User Pool Id: Use the User Pool ID created above
    - App Client id: Use the App client id created above
  - From the Federated Identities/Sample Code tab
    - Select `Platform: JavaScript`
    - Get the `IdentityPoolId` from the sample code
    - Save this value as `IDPOOL` in app-ids.js
- Create 2 Cognito User Groups
  - The use of these resources is TBD


### Open the web page and log in