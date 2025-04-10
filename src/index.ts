import * as bignumber from "@ethersproject/bignumber";
import * as v from "valibot";
import { RequestBodySchema as ChatCompletionsRequestBodySchema } from "./chat/completions.js";
import { type Usage } from "./common.js";
import { RequestBodySchema as CompletionsRequestBodySchema } from "./completions.js";

export { type Usage };

export const ProtocolId = "openai:0.1";

export enum ReasonClass {
  ServiceError,
  ProtocolViolation,
}

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

export const RequestBodySchema = v.union([
  CompletionsRequestBodySchema,
  ChatCompletionsRequestBodySchema,
]);

export type RequestBody = v.InferOutput<typeof RequestBodySchema>;

/**
 * Sent by the Provider immediately in a response to a request.
 */
export type ResponsePrologue =
  | { status: "Ok" }
  | { status: "ServiceError"; message?: string };

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

export type StreamingEpilogueChunk = {
  object: "derouter.epilogue";
  public_payload: string;
  balance_delta: string | null;
  completed_at_sync: number;
};

export type NonStreamingResponseEpilogue = {
  public_payload: string;
  balance_delta: string | null;
  completed_at_sync: number;
};

export * as chatCompletions from "./chat/completions.js";
export * as completions from "./completions.js";
