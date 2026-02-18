import { createContext } from "react";

/**
 * @typedef {object} AuthContextValue
 * @property {unknown} user
 * @property {boolean} ready
 * @property {boolean} isAuthenticated
 * @property {boolean} loading
 * @property {(email: string, password: string) => Promise<unknown>} login
 * @property {(name: string, email: string, password: string) => Promise<unknown>} register
 * @property {() => Promise<void>} logout
 */

export const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null));