/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievementMutations from "../achievementMutations.js";
import type * as achievementQueries from "../achievementQueries.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as buddyMutations from "../buddyMutations.js";
import type * as buddyQueries from "../buddyQueries.js";
import type * as mutations from "../mutations.js";
import type * as photoMutations from "../photoMutations.js";
import type * as photoQueries from "../photoQueries.js";
import type * as queries from "../queries.js";
import type * as sportBucketMutations from "../sportBucketMutations.js";
import type * as sportBucketQueries from "../sportBucketQueries.js";
import type * as userCodeMutations from "../userCodeMutations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievementMutations: typeof achievementMutations;
  achievementQueries: typeof achievementQueries;
  ai: typeof ai;
  auth: typeof auth;
  buddyMutations: typeof buddyMutations;
  buddyQueries: typeof buddyQueries;
  mutations: typeof mutations;
  photoMutations: typeof photoMutations;
  photoQueries: typeof photoQueries;
  queries: typeof queries;
  sportBucketMutations: typeof sportBucketMutations;
  sportBucketQueries: typeof sportBucketQueries;
  userCodeMutations: typeof userCodeMutations;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
