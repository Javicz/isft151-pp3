import { createGroup, deleteGroup, updateGroup } from "../repositories/groupRepository.js";

export function createGroupHandler(req, res) {
    let body = '';
   req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      const data = JSON.parse(body);
      const name = data.name;

      try {
        const result = createGroup(name);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', data: result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
}

export function deleteGroupHandler(req, res) {
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      const data = JSON.parse(body);
      const id = parseInt(data.id);

      try {
        const result = deleteGroup(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', data: result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
}

//funcion que no probe aun
export function updateGroupHandler(req, res) {
    let body = '';
    req.on('data', function(chunk){
      body += chunk;
    });

    req.on('end', function(){
      const data = JSON.parse(body);
      const id = parseInt(data.id);
      const name = data.name;

      try {
        const result = updateGroup(id, name);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', data: result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
}