/**
 * HireFlow v4: useUrlState Hook (X1.9, C10)
 * Typed, Zod-validated URL search parameter synchronization.
 * Invalid or unknown params are ignored and fall back safely to defaults.
 * Supports replace (filters) and push (wizard steps).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

export interface UseUrlStateOptions {
  navigateMode?: 'replace' | 'push';
}

/**
 * Pure parser helper for URL search parameters against a Zod schema with defaults.
 * Evaluates field-by-field so an invalid parameter does not corrupt valid peers.
 */
export function parseUrlParams<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>,
  defaultValues: T
): T {
  const rawObj: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Auto-cast booleans, numbers, and comma-delimited arrays
    if (value === 'true') rawObj[key] = true;
    else if (value === 'false') rawObj[key] = false;
    else if (!isNaN(Number(value)) && value.trim() !== '') rawObj[key] = Number(value);
    else if (value.includes(',')) rawObj[key] = value.split(',');
    else rawObj[key] = value;
  });

  const result: Record<string, any> = { ...defaultValues };

  // If ZodObject, validate field-by-field for fine-grained fault tolerance
  if (schema instanceof z.ZodObject) {
    const shape = (schema as z.ZodObject<any>).shape;
    for (const key of Object.keys(defaultValues)) {
      if (key in rawObj && shape[key]) {
        const fieldCheck = shape[key].safeParse(rawObj[key]);
        if (fieldCheck.success) {
          result[key] = fieldCheck.data;
        } else {
          result[key] = defaultValues[key];
        }
      }
    }
    return result as T;
  }

  // Fallback for non-object schemas
  const fullParsed = schema.safeParse({ ...defaultValues, ...rawObj });
  return fullParsed.success ? fullParsed.data : defaultValues;
}

/**
 * Pure serializer helper that converts state object to URLSearchParams omitting defaults.
 */
export function serializeUrlParams<T extends Record<string, any>>(
  state: T,
  defaultValues: T
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, val]) => {
    const defaultVal = defaultValues[key];
    if (val === undefined || val === null || val === defaultVal) {
      params.delete(key);
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        params.delete(key);
      } else {
        params.set(key, val.join(','));
      }
    } else {
      params.set(key, String(val));
    }
  });
  return params;
}

/**
 * Synchronizes component state with URL search parameters.
 */
export function useUrlState<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  defaultValues: T
): [T, (updates: Partial<T>, options?: UseUrlStateOptions) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(
    () => parseUrlParams(searchParams, schema, defaultValues),
    [searchParams, schema, defaultValues]
  );

  const setUrlState = useCallback(
    (updates: Partial<T>, options?: UseUrlStateOptions) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          const merged = { ...state, ...updates };

          Object.entries(merged).forEach(([key, val]) => {
            const defaultVal = defaultValues[key];

            if (val === undefined || val === null || val === defaultVal) {
              nextParams.delete(key);
            } else if (Array.isArray(val)) {
              if (val.length === 0) {
                nextParams.delete(key);
              } else {
                nextParams.set(key, val.join(','));
              }
            } else {
              nextParams.set(key, String(val));
            }
          });

          return nextParams;
        },
        { replace: options?.navigateMode !== 'push' }
      );
    },
    [state, defaultValues, setSearchParams]
  );

  return [state, setUrlState];
}
