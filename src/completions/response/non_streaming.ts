import * as v from "valibot";
import { FinishReasonSchema, UsageSchema } from "../../common.js";

export const ResponseSchema = v.object({
  id: v.string(),
  object: v.literal("text_completion"),
  created: v.number(),
  model: v.string(),

  choices: v.array(
    v.object({
      index: v.number(),
      text: v.string(),
      finish_reason: FinishReasonSchema,
      logprobs: v.nullish(v.any()),
    })
  ),

  system_fingerprint: v.optional(v.string()),
  usage: v.optional(UsageSchema),
});

export type Response = v.InferOutput<typeof ResponseSchema>;
