/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login
     * @param requestBody
     * @returns any Successful login
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody?: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        data?: {
            token?: string;
            user?: {
                id?: number;
                email?: string;
                fullName?: string;
                role?: string;
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Register
     * @param requestBody
     * @returns any Registered
     * @throws ApiError
     */
    public static postAuthRegister(
        requestBody?: {
            email: string;
            password: string;
            fullName: string;
        },
    ): CancelablePromise<{
        data?: {
            token?: string;
            user?: {
                id?: number;
                email?: string;
                fullName?: string;
                role?: string;
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
