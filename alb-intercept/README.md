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

_To update the SVG_
```
docker run --rm -v "$(pwd):/data" -w /data minlag/mermaid-cli:8.9.3-1 mmdc -i app.mmd
```
