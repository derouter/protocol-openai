import * as v from "valibot";
import { FinishReasonSchema, UsageSchema } from "../../../common.js";

export const ResponseSchema = v.object({
  id: v.string(),
  object: v.literal("chat.completion"),
  created: v.number(),
  model: v.string(),
  system_fingerprint: v.optional(v.string()),

  choices: v.array(
    v.object({
      index: v.number(),
      message: v.object({
        content: v.nullable(v.string()),
        refusal: v.nullish(v.string()),
        role: v.literal("assistant"),
      }),
      logprobs: v.nullish(v.any()),
      finish_reason: FinishReasonSchema,
    })
  ),

  usage: v.optional(UsageSchema),
});

export type Response = v.InferOutput<typeof ResponseSchema>;
