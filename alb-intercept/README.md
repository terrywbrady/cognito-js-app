## ALB is triggering lambda validation

```
bundle install
zip -r lambda.zip *
```

## Lambda

- Parses JWT token to confirm access
- Serves web pages if path is /web/...
- Invokes function calls if not

## Sequence Diagram

[Sequence Diagram](https://raw.githubusercontent.com/terrywbrady/cognito-js-app/main/alb-intercept/app.mmd.svg)
