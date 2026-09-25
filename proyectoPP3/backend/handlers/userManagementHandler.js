import { getGroupsByUserId } from '../repositories/authRepository.js';
import { deleteUser } from '../repositories/userRepository.js';
// puede elimiar cualquier usuario 
export function deleteUserHandler(req, res) {
    let body = '';

    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      try {
        const data = JSON.parse(body);
        const userId = parseInt(data.user_id);
        const result = deleteUser(userId);

        res.writeHead(200, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          status: 'success',
          data: result
        }));

      } catch(err) {

        res.writeHead(500, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          status: 'error',
          message: err.message
        }));
      }

    });
}

