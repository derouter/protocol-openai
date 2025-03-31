import * as v from "valibot";
import { StreamOptionsSchema } from "../common.js";

/**
 * @see https://platform.openai.com/docs/api-reference/completions/create.
 */
export const RequestBodySchema = v.object({
  model: v.string(),
  prompt: v.string(),
  echo: v.nullish(v.boolean()),
  frequency_penalty: v.nullish(v.number()),
  max_tokens: v.nullish(v.number()),
  n: v.nullish(v.number()),
  presence_penalty: v.nullish(v.number()),
  seed: v.nullish(v.number()),
  stop: v.nullish(v.union([v.string(), v.array(v.string())])),
  stream: v.nullish(v.boolean()),
  stream_options: v.optional(StreamOptionsSchema),
  temperature: v.nullish(v.number()),
  top_p: v.nullish(v.number()),
  user: v.optional(v.string()),
});

export type RequestBody = v.InferOutput<typeof RequestBodySchema>;
