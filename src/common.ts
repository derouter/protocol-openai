import * as v from "valibot";

export const StreamOptionsSchema = v.object({
  include_usage: v.boolean(),
});

export const FinishReasonSchema = v.union([
  v.literal("stop"),
  v.literal("length"),
  v.literal("content_filter"),
  v.literal("tool_calls"),
  v.literal("function_call"),
]);

export const UsageSchema = v.object({
  prompt_tokens: v.number(),
  completion_tokens: v.number(),
  total_tokens: v.number(),

  prompt_tokens_details: v.optional(
    v.object({
      cached_tokens: v.optional(v.number()),
    })
  ),

  completion_tokens_details: v.optional(
    v.object({
      reasoning_tokens: v.optional(v.number()),
      accepted_prediction_tokens: v.optional(v.number()),
      rejected_prediction_tokens: v.optional(v.number()),
    })
  ),
});

export type Usage = v.InferOutput<typeof UsageSchema>;
