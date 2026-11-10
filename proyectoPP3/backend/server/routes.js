import { registerHandler } from '../handlers/registerHandler.js';
import { loginHandler } from '../handlers/loginHandler.js';
import { login } from '../usescause/login.js';
import { register } from '../usescause/register.js';
import { insertUser } from '../repositories/userRepository.js';
import { deleteUserHandler } from '../handlers/userManagementHandler.js';
import { editUserHandler } from '../handlers/editUserHandler.js';
import { createGroupHandler, deleteGroupHandler, updateGroupHandler } from '../handlers/groupHandler.js';
import { listUsersHandler, listGroupsHandler } from '../handlers/listDataHandler.js';
import { updatePermissionsHandler, createEndpointHandler, deleteEndpointHandler } from '../handlers/permissionHandler.js';
import { logHandler, sayHelloHandler } from '../handlers/endpointsHandler.js';
import { getAvailabilityHandler, applyReservationHandler, releaseReservationHandler } from '../handlers/availabilityHandler.js';
import { listResourcesHandler, createResourceHandler, deleteResourceHandler } from '../handlers/resourceHandler.js';

export function setupRoutes(router, config, db) {
  router.set('/login', loginHandler);
  router.set('/register', registerHandler);

  router.set('/log', logHandler);
  router.set('/sayHello', sayHelloHandler);

  router.set('/api/getAvailability', getAvailabilityHandler);
  router.set('/api/applyReservation', applyReservationHandler);
  router.set('/api/calendar/reservations', getAvailabilityHandler);
  router.set('/api/reservations/create', applyReservationHandler);
  router.set('/api/reservations/cancel', releaseReservationHandler);

  router.set('/api/inventory/list', listResourcesHandler);
  router.set('/api/resources/list', listResourcesHandler);
  router.set('/api/resources/create', createResourceHandler);
  router.set('/api/resources/delete', deleteResourceHandler);

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
