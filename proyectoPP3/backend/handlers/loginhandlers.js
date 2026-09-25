import { login } from "../usescause/login.js";

export function login_handler(req, res) {
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
       try {
            const data = JSON.parse(body);

            const username = data.username;
            const password = data.password;

            const result = login(username, password);
            console.log('LOGIN RESULT');
            console.log(result);

            if (result.status === true) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    exception:
                        result.description,
                        detail: []
                })
              );
            }

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(error.message);
        }
    });
}