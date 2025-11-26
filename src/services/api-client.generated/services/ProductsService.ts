/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * List products
     * @param q
     * @param category
     * @returns any A list of products
     * @throws ApiError
     */
    public static getProducts(
        q?: string,
        category?: string,
    ): CancelablePromise<{
        data?: Array<{
            id?: number;
            name?: string;
            price?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products',
            query: {
                'q': q,
                'category': category,
            },
        });
    }
    /**
     * Get product
     * @param id
     * @returns any Product detail
     * @throws ApiError
     */
    public static getProducts1(
        id: number,
    ): CancelablePromise<{
        data?: {
            id?: number;
            name?: string;
            price?: number;
            description?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/products/{id}',
            path: {
                'id': id,
            },
        });
    }
}
