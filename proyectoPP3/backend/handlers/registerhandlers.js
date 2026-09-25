import { register } from "../usescause/register.js";

export function register_handler(req, res){
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

            const resultado = register(username, password);

            res.writeHead(200,{'Content-Type': 'application/json'});

            res.end(JSON.stringify({
                status: 'ok',
                data: resultado
            }));
        }
        catch(error){
            res.writeHead(500,{'Content-Type': 'application/json'});

            res.end(JSON.stringify({
                status: 'error',
                message: error.message
            }));
        }
    });
}