import { getGroupIdByName } from '../repositories/groupRepository.js';
import { getEndpointIdByPath, createEndpoint, deleteEndpoint } from '../repositories/endpointRepository.js';
import { addAccess } from '../repositories/accessRepository.js';

export function createEndpointHandler(req, res) {
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      try {
        const data = JSON.parse(body);
        const path = data.path;

        if (!path) {
          res.writeHead(400, {'Content-Type': 'application/json'});

          return res.end(JSON.stringify({error: 'Path requerido'}));
        }

        const result = createEndpoint(path);
        res.writeHead(200, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          success: true,
          data: result
        }));

      } catch(error) {

        res.writeHead(500, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }

    });
}

export function updatePermissionsHandler(req, res) {
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      try {
        const data = JSON.parse(body);
        const group_name = data.group_name;
        const endpoint = data.endpoint;

        const group = getGroupIdByName(group_name);

        if (!group) {

          res.writeHead(404, {'Content-Type': 'application/json'});

          return res.end(JSON.stringify({error: 'Grupo no encontrado'}));
        }

        const endpointInfo = getEndpointIdByPath(endpoint);

        if (!endpointInfo) {

          res.writeHead(404, {'Content-Type': 'application/json'});

          return res.end(JSON.stringify({error: 'Endpoint no encontrado'}));
        }

        addAccess(group.id, endpointInfo.id);

        res.writeHead(200, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          success: true,
          message: 'Permiso agregado'
        }));

      } catch(error) {

        res.writeHead(500, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          error: error.message
        }));
      }

    });
}

export function deleteEndpointHandler(req, res) {
    let body = '';

    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      try {

        const data = JSON.parse(body);

        const endpointId = parseInt(data.endpoint_id);

        if (isNaN(endpointId)) {

          res.writeHead(400, {'Content-Type': 'application/json'});

          return res.end(JSON.stringify({error: 'ID inválido'}));
        }

        const result = deleteEndpoint(endpointId);

        res.writeHead(200, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          success: true,
          data: result
        }));

      } catch(error) {

        res.writeHead(500, {'Content-Type': 'application/json'});

        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
}