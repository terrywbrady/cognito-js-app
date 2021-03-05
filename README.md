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


## Goals
- Current State
  - Users are authenticated and authorized based on an application specific LDAP instance through 2 microservices
- Phase 1
  - Authenticate a limited number of users (CDL Staff) in a Cognito User Pool
  - Authorize application access based on Cognito User Groups
- Phase 2
  - Authenticate a limited number of users (UC Staff) against UC SAML instances
  - Authorize application access on a user by user basis using ????
  - In the interim, an API key may be associated with LDAP permissions
  - New web based services can be introduced (campus dashboards) that are not tied to legacy microservices
- Phase 3
  - Introduce a proper API (using API Gateway)
  - Campus teams are granted API keys
  - How does Cognito interact with this process??
- Phase 4
  - Migrate Merritt authentication from LDAP to Cogntio
  - Users authenticate against UC SAML
  - Non-UC users could use a Cognito Pool
  - Individual users are authorized
  - Granular LDAP permissions (collection level) could be migrated into the application
- Questions
  - Does this seem like a suitable Cognito use case?
  - Does this make sense: I envision a Cognito Identity Pool that uses the following authentication providers
    - Cognito User Pool
    - One or more UC SAML
  - Once authenticated via the identity pool, how do I assume an identity that can do real things in AWS?
    - How is this mapping performed?
