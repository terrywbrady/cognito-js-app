require 'json'
require 'jwt'

def lambda_handler(event:, context:)
  token = event.fetch('headers',{}).fetch('x-amzn-oidc-accesstoken','')
  rxpath = %r[.*/(web/.*\.([^\.]*))$]
  path = event.fetch('path', '')
  mpath = rxpath.match(path)
  reqresp = { 
      statusCode: 200, 
      headers: {'Content-Type' => 'text'},
      body: 'No action' 
  }
  if token.empty?
    reqresp = error(401, "Unauthorized: No user token in header ")
  else
    begin
      jtoken = JWT.decode(token, nil, false, { :algorithm => 'RS256' })
      #resp = jtoken
      username = "User token found for #{jtoken[0].fetch('username', '')}"
      groups = jtoken[0].fetch("cognito:groups", [])
      if groups.length == 0
        reqresp = error(401, "Unauthorized: No groups for user: #{username}")
      elsif path == '/account/logout' 
        reqresp = { 
          statusCode: 303, 
          headers: {
            'Location': ENV.fetch('LOGOUT_URI', '.'),
            'Set-Cookie': "AWSELBAuthSessionCookie-0=; path=/; HttpOnly"
          }
        }
      elsif path == '/account/login' 
        reqresp = { 
          statusCode: 303, 
          headers: {'Location' => ENV.fetch('LOGIN_URI', '.')}
        }
      elsif mpath 
        reqresp = web_assets(mpath[1], mpath[2])
      else
        reqresp = { 
          statusCode: 200, 
          headers: {'Content-Type' => 'application/json'},
          body: {
            message: "User #{username} in groups #{groups.join(',')}",
            path: path,
            event: event
          }.to_json
        }
      end
    rescue => e
      reqresp = error(500, "ERROR: #{e.message}")
    end
  end
  reqresp
end

def content_type(ext)
  return "text/html" if ext == "html" || ext == "htm"
  return "text/javascript" if ext == "js"
  return "text/css" if ext == "css"
  nil
end

def web_assets(path, ext)
  return error(404, "File not found #{path}") unless File.file?(path)
  ctype = content_type(ext)
  return error(404, "Unsupported content type #{ext}") unless ctype
  { 
    statusCode: 200, 
    headers: {'Content-Type' => ctype},
    body: File.open(path).read
  }
end

def error(status, message)
  { 
    statusCode: status, 
    headers: {'Content-Type' => 'text'},
    body: message 
  }
end