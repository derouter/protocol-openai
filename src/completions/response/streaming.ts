import * as v from "valibot";
import { FinishReasonSchema, UsageSchema } from "../../common.js";

export const CompletionChunkSchema = v.object({
  id: v.string(),
  object: v.literal("text_completion"),
  created: v.number(),
  model: v.string(),

  choices: v.array(
    v.object({
      index: v.number(),
      text: v.string(),
      finish_reason: v.nullable(FinishReasonSchema),
      logprobs: v.nullish(v.any()),
    })
  ),

  system_fingerprint: v.optional(v.string()),
  usage: v.nullish(UsageSchema),
});

export type CompletionChunk = v.InferOutput<typeof CompletionChunkSchema>;

export type EpilogueChunk = {
  object: "derouter.epilogue";

  /**
   * Potentially-publicly-accessible job payload for signing.
   */
  public_payload: string;

  /**
   * Balance delta, in connection's currency.
   */
  balance_delta: string | null;

  completed_at_sync: number;
};

export type Chunk = CompletionChunk | EpilogueChunk;
