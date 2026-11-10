import { getUserByUsername } from '../repositories/authRepository.js';
import bcrypt from 'bcryptjs';

export function authenticate(username, password)
{
    const user = getUserByUsername(username);

    if (!user)
    {
        return false;
    }

    return bcrypt.compareSync(
        password,
        user.password
    );
}