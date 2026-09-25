import { insertarUsuario } from "../repositories/userRepository.js";

export function register(username, password)
{
    return insertarUsuario(username, password);
}