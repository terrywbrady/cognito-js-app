require 'json'
require 'jwt'

def HashToHTML(hash, opts = {})
  return if !hash.is_a?(Hash)

  indent_level = opts.fetch(:indent_level) { 0 }

  out = " " * indent_level + "<ul>\n"

  hash.each do |key, value|
    out += " " * (indent_level + 2) + "<li><strong>#{key}:</strong>"

    if value.is_a?(Hash)
      out += "\n" + HashToHTML(value, :indent_level => indent_level + 2) + " " * (indent_level + 2) + "</li>\n"
    else
      out += " <span>#{value}</span></li>\n"
    end
  end

  out += " " * indent_level + "</ul>\n"
end

def lambda_handler(event:, context:)
    token = event.fetch('headers',{}).fetch('x-amzn-oidc-accesstoken','')
    resp = {message: 'hello'}
    if !token.empty?
      begin
        jtoken = JWT.decode(token, nil, false, { :algorithm => 'RS256' })
        #resp = jtoken
        resp['group'] = jtoken[0].fetch("cognito:groups", [])
      rescue => e
        resp['message'] = e.message
      end
    end
    { statusCode: 200, 
      headers: {'Content-Type' => 'application/json'},
      body: resp.to_json 
    }
end

def lambda_handler2(event:, context:)
    { statusCode: 200, 
      headers: {'Content-Type' => 'text/html'},
      body: "<html><body><h1>hello from lambda</h1><br/>#{HashToHTML(event)}</body><?html>" 
    }
end
