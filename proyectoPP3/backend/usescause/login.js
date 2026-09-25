import { getUserByUsername, getGroupsByUserId } from '../repositories/authRepository.js';
import { userSessions } from '../usescause/sessions.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export function login(username, password){
        const user = getUserByUsername(username);
        if (!user)
        {
            return {
                status: false,
                result: null,
                description: 'INVALID_USER_PASS'
            };
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);

        if (!isValidPassword)
        {
            return {
                status: false,
                result: null,
                description: 'INVALID_USER_PASS'
            };
        }

        const groups = getGroupsByUserId(user.id);

        let session = userSessions.get(user.id);

        if (!session)
        {
            session = {
                userId: user.id,
                username: user.username,
                groups: groups,
                apiKey: crypto.randomUUID(),
                status: 'enabled',
                createdAt: Date.now()
            };

            userSessions.set(user.id, session);
        }
        else
        {
            session.status = 'enabled';
        }

        console.log(`Login correcto: ${user.username}`);

        return {
            status: true,
            result:
            {
                id: user.id,
                username: user.username,
                apiKey: session.apiKey,
                groups: groups
            },
            description: 'LOGIN_OK'
        };
}
