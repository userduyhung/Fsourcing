/*
  GENERATED CLIENT STUB

  This file is a small helper that explains how to wire generated types
  (`src/services/api-types.ts`) with the runtime `apiClient` (axios wrapper)
  already present in this project.

  After you run:
    npm run gen:api

  you'll get `src/services/api-types.ts`. You can then import those types and
  create typed wrappers like the examples below.

  Example usage (manual):

  import apiClient from './apiClient';
  import { paths } from './api-types';

  type LoginRequest = paths['/Auth/login']['post']['requestBody']['content']['application/json'];
  type LoginResponse = paths['/Auth/login']['post']['responses']['200']['content']['application/json'];

  export const authTyped = {
    login: (payload: LoginRequest) => apiClient.request('post', '/Auth/login', payload) as Promise<LoginResponse>,
  };

  If you want, I can automatically generate these thin wrappers for every path
  in the OpenAPI file (this is a one-time code generation step). Ask me to
  proceed and I'll produce `src/services/api-client.generated.ts` with fully
  typed helper functions.
*/

export {};
