import * as v from "valibot";
import { UsageSchema } from "./common.js";
import { type RequestBody, RequestBodySchema } from "./completions/request.js";
import {
  type Epilogue,
  type Response,
  ResponseSchema,
} from "./completions/response/non_streaming.js";
import {
  type Chunk,
  type CompletionChunk,
  CompletionChunkSchema,
  type EpilogueChunk,
} from "./completions/response/streaming.js";

export {
  CompletionChunkSchema,
  RequestBodySchema,
  ResponseSchema,
  type Chunk,
  type CompletionChunk,
  type Epilogue,
  type EpilogueChunk,
  type RequestBody,
  type Response,
};

export const PublicJobPayloadSchema = v.strictObject({
  request: v.pick(RequestBodySchema, [
    "model",
    "frequency_penalty",
    "max_tokens",
    "n",
    "presence_penalty",
    "stream",
    "temperature",
    "top_p",
  ]),

  response: v.object({
    usage: UsageSchema,
  }),
});

export type PublicJobPayload = v.InferOutput<typeof PublicJobPayloadSchema>;
