import * as v from "valibot";
import { FinishReasonSchema, UsageSchema } from "../../../common.js";
import { MessageSchema } from "../request.js";

export const CompletionChunkSchema = v.object({
  id: v.string(),
  object: v.literal("chat.completion.chunk"),
  created: v.number(),
  model: v.string(),
  system_fingerprint: v.optional(v.string()),

  choices: v.array(
    v.object({
      index: v.number(),
      delta: v.union([MessageSchema, v.object({})]),
      logprobs: v.nullish(v.any()),
      finish_reason: v.nullable(FinishReasonSchema),
    })
  ),

  usage: v.nullish(UsageSchema),
});

export type CompletionChunk = v.InferOutput<typeof CompletionChunkSchema>;
