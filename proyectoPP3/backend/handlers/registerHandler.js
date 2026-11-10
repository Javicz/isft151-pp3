import { register } from "../usescause/register.js";

export function registerHandler(req, res){
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

     req.on('end', function(){
        try
        {
            const data = JSON.parse(body);

            const username = data.username;
            const password = data.password;

            const result = register(username, password);

            res.writeHead(200,{'Content-Type': 'application/json'});

            res.end(JSON.stringify({
                status: 'ok',
                data: result
            }));
        }
        catch(error){
            res.writeHead(error.status || 500,{'Content-Type': 'application/json'});

            res.end(JSON.stringify({
                status: 'error',
                message: error.message
            }));
        }
    });
}
