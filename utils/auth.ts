import { FieldUser } from '../types';

/**
 * Checks if a user has a managerial role (Admin User or Super User).
 * @param user The user object to check.
 * @returns True if the user has a managerial role, false otherwise.
 */
export const hasManagerialRole = (user: FieldUser | null): boolean => {
    if (!user) {
        return false;
    }
    return user.role === 'Admin User' || user.role === 'Super User';
};
