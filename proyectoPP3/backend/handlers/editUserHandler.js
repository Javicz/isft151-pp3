import { group } from "node:console";
import { assignUsertoGroup } from "../repositories/userRepository.js";

export function editUserHandler(req, res) {
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      const data = JSON.parse(body);
      const userId = parseInt(data.id_user);
      const groupId = parseInt(data.id_group); 
      

          if (isNaN(userId) || isNaN(groupId)) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            return res.end(JSON.stringify({
                status: 'error',
                message: 'No se pudo actualizar el grupo'
            }));
          }

    const result = assignUsertoGroup(userId, groupId);
    
        res.writeHead(200, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
            status: 'success',
            data: result
        }));
    });
}