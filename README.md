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

## Helpful Resources
- https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-authentication/
- https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-authentication-part-2-developer-authenticated-identities/
- https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-authentication-part-3-roles-and-policies/
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html#cognito-user-pools-create-an-app-integration
- https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album-full.html
- https://stackoverflow.com/questions/45926339/cognito-hosted-ui
- https://aws.amazon.com/blogs/networking-and-content-delivery/authorizationedge-using-cookies-protect-your-amazon-cloudfront-content-from-being-downloaded-by-unauthenticated-users/
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-scenarios.html#scenario-basic-user-pool
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html
- https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/
- https://aws.amazon.com/blogs/security/new-playground-app-to-explore-web-identity-federation-with-amazon-facebook-and-google/


Things to try
- Add permisssions to auth role to see what I can learn about the identity object
- Create 2 web identities, see if I can assume them when authenticated
- Tie web identity to user pool group
- Grant real resource access to web identity