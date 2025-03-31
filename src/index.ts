import * as bignumber from "@ethersproject/bignumber";
import * as v from "valibot";
import { type Usage } from "./common.js";

export { type Usage };

export const ProtocolId = "openai:0.1";

export const PriceSchema = v.object({
  /**
   * Price in Polygon wei (e.g. `"1000000000000000000"` for $POL 1.0).
   */
  $pol: v.string(),
});

export const OfferPayloadSchema = v.object({
  /**
   * Model ID for an OpenAI request's `"model"` field.
   */
  model_id: v.string(),

  /**
   * Maximum model context size.
   */
  context_size: v.number(),

  /**
   * Price per 1M input tokens.
   */
  input_token_price: PriceSchema,

  /**
   * Price per 1M output tokens.
   */
  output_token_price: PriceSchema,

  /**
   * An optional offer trial allowance.
   */
  trial: v.optional(PriceSchema),
});

export type OfferPayload = v.InferOutput<typeof OfferPayloadSchema>;

/**
 * Sent by the Provider immediately in a response to a request.
 */
export type ResponsePrologue =
  | {
      status: "Ok";
      provider_job_id: string;
      created_at_sync: number;
    }
  | {
      status: "ProtocolViolation";
      message: string;
    }
  | {
      status: "ServiceError";
      message?: string;
    };

export function calcCost(offer: OfferPayload, usage: Usage): string {
  return bignumber.BigNumber.from(offer.input_token_price.$pol)
    .mul(usage.prompt_tokens)
    .div(1_000_000)
    .add(
      bignumber.BigNumber.from(offer.output_token_price.$pol)
        .mul(usage.completion_tokens)
        .div(1_000_000)
    )
    .toString();
}

export * as chatCompletions from "./chat/completions.js";
export * as completions from "./completions.js";
