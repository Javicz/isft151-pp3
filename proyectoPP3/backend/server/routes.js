import { register_handler } from '../handlers/registerhandlers.js';
import { login_handler } from '../handlers/loginhandlers.js';
import { login } from '../usescause/login.js';
import { register } from '../usescause/register.js';
import { insertarUsuario } from '../repositories/userRepository.js';
import { deleteUserHandler } from '../handlers/userManagementHandler.js';
import { editUserHandler } from '../handlers/editUserHandler.js';
import { createGroupHandler, deleteGroupHandler, updateGroupHandler } from '../handlers/grouphandler.js';
import { listUsersHandler, listGroupsHandler } from '../handlers/listdatahandler.js';
import { updatePermissionsHandler, createEndpointHandler, deleteEndpointHandler } from '../handlers/permissionHandler.js';
import { say_hello_handler, log_handler } from '../handlers/endpoints.handler.js';

export function setupRoutes(router, config, db) {
  //Publicas
  router.set('/login', login_handler);
  router.set('/register', register_handler);

  //endpoints
  router.set('/log', log_handler);
  router.set('/sayHello', say_hello_handler);

  // Privadas
  router.set('/api/admin/user/delete', deleteUserHandler);
  router.set('/api/user/edit', editUserHandler);
  router.set('/api/admin/group/create', createGroupHandler);
  router.set('/api/admin/group/delete', deleteGroupHandler);
  router.set('/api/admin/group/update', updateGroupHandler);
  router.set('/api/users', listUsersHandler);
  router.set('/api/groups', listGroupsHandler);
  router.set('/api/admin/permissions', updatePermissionsHandler);
  router.set('/api/admin/endpoint/create', createEndpointHandler);
  router.set('/api/admin/endpoint/delete', deleteEndpointHandler);
}