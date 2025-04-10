import * as v from "valibot";
import { UsageSchema } from "../common.js";
import { type RequestBody, RequestBodySchema } from "./completions/request.js";
import {
  type Response,
  ResponseSchema,
} from "./completions/response/non_streaming.js";
import {
  type CompletionChunk,
  CompletionChunkSchema,
} from "./completions/response/streaming.js";

export {
  CompletionChunkSchema,
  RequestBodySchema,
  ResponseSchema,
  type CompletionChunk,
  type RequestBody,
  type Response,
};

export const PublicJobPayloadSchema = v.strictObject({
  request: v.pick(RequestBodySchema, [
    "model",
    "store",
    "reasoning_effort",
    "frequency_penalty",
    "max_tokens",
    "max_completion_tokens",
    "n",
    "presence_penalty",
    "response_format",
    "stream",
    "temperature",
    "top_p",
  ]),

  response: v.object({
    usage: UsageSchema,
  }),
});

export type PublicJobPayload = v.InferOutput<typeof PublicJobPayloadSchema>;
