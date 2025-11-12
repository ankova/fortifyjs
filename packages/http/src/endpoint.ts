import { z } from 'zod';
import type { ZodTypeAny } from 'zod';

import type { HttpMethod, ParsedResponse, RequestOptions } from './types';
import { HttpClient } from './client';
import { buildQuery } from './query';

/**
 * Branded path template with named params.
 * Example:
 *   '/users/:id' as PathTemplate<{ id: string }>
 */
export type PathTemplate<TParams extends Record<string, string>> = string & { __params?: TParams };

function buildPath<TParams extends Record<string, string>>(
  tpl: PathTemplate<TParams>,
  params: TParams,
): string {
  return tpl.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const k = key as keyof TParams;
    const value = params[k];
    if (value == null) {
      throw new Error(`Missing param :${String(key)}`);
    }
    return encodeURIComponent(String(value));
  });
}

/**
 * Endpoint configuration:
 * - TPathParams: route params from the path template
 * - TQuerySchema: zod schema for query (optional)
 * - TBodySchema: zod schema for body (optional)
 * - TResponseSchema: zod schema for response (required)
 */
export type EndpointConfig<
  TPathParams extends Record<string, string>,
  TQuerySchema extends ZodTypeAny | undefined,
  TBodySchema extends ZodTypeAny | undefined,
  TResponseSchema extends ZodTypeAny,
> = {
  method: HttpMethod;
  path: PathTemplate<TPathParams>;
  query?: TQuerySchema;
  body?: TBodySchema;
  response: TResponseSchema;
};

type InferOrUndefined<T extends ZodTypeAny | undefined> = T extends ZodTypeAny
  ? z.infer<T>
  : undefined;

/**
 * createEndpoint:
 * Strongly typed wrapper over HttpClient.request for a specific REST endpoint.
 *
 * Example:
 * const getUser = createEndpoint({
 *   method: 'GET',
 *   path: '/users/:id' as PathTemplate<{ id: string }>,
 *   query: z.object({ verbose: z.boolean().optional() }),
 *   response: z.object({ id: z.string(), name: z.string() }),
 * });
 *
 * const res = await getUser.call(client, {
 *   params: { id: '123' },
 *   query: { verbose: true },
 * });
 */
export function createEndpoint<
  TPathParams extends Record<string, string>,
  TQuerySchema extends ZodTypeAny | undefined,
  TBodySchema extends ZodTypeAny | undefined,
  TResponseSchema extends ZodTypeAny,
>(config: EndpointConfig<TPathParams, TQuerySchema, TBodySchema, TResponseSchema>) {
  type TQuery = InferOrUndefined<TQuerySchema>;
  type TBody = InferOrUndefined<TBodySchema>;
  type TResponse = z.infer<TResponseSchema>;

  return {
    method: config.method,
    path: config.path,

    async call(
      client: HttpClient,
      input: {
        params: TPathParams;
        query?: TQuery;
        body?: TBody;
        headers?: Record<string, string>;
      },
    ): Promise<ParsedResponse<TResponse>> {
      const base = client.baseUrl ?? '';
      const fullPath = buildPath(config.path, input.params);
      const url = new URL(fullPath, base);

      // Apply typed query schema if present
      if (config.query && input.query) {
        const searchParams = buildQuery(config.query, input.query as unknown);
        for (const [k, v] of searchParams.entries()) {
          url.searchParams.append(k, v);
        }
      }

      const schema = config.response;

      // Build RequestOptions<TBody> compatibly with exactOptionalPropertyTypes
      const options: RequestOptions<TBody> = {
        method: config.method,
        idempotent: config.method === 'GET' || config.method === 'DELETE',
      };

      if (input.headers !== undefined) {
        options.headers = input.headers;
      }

      if (input.body !== undefined) {
        options.body = input.body as TBody;
      }

      const result = await client.request<TResponseSchema, TBody>(
        url.pathname + url.search,
        schema,
        options,
      );

      // HttpClient already returns ParsedResponse<z.infer<TResponseSchema>>
      return result as ParsedResponse<TResponse>;
    },
  } as const;
}
