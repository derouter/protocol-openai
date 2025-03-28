import * as bignumber from "@ethersproject/bignumber";
import * as v from "valibot";

export const ProtocolId = "openai:0.1";

export const PriceSchema = v.object({
  /**
   * Price in Polygon eth (e.g. `"1000000000000000000"` for $POL 1.0).
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

export function calcCost(
  offer: OfferPayload,
  usage: NonNullable<CompletionsChunk["usage"]>
): string {
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

/**
 * Sent by the provider immediately in a response to a request.
 */
export type ResponsePrologue =
  | {
      status: "Ok";
      jobId: string;
    }
  | {
      status: "ProtocolViolation";
      message: string;
    }
  | {
      status: "ServiceError";
      message?: string;
    };

export type NonStreamingResponseEpilogue = {
  jobId: string;
  balanceDelta: string | null;
};

const StreamOptionsSchema = v.object({
  include_usage: v.boolean(),
});

const FinishReasonSchema = v.union([
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

//#region Text completions
//

/**
 * @see https://platform.openai.com/docs/api-reference/completions/create.
 */
export const CompletionsRequestBodySchema = v.object({
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

export type CompletionsRequestBody = v.InferOutput<
  typeof CompletionsRequestBodySchema
>;

export const CompletionsResponseSchema = v.object({
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

export type CompletionsResponse = v.InferOutput<
  typeof CompletionsResponseSchema
>;

export const CompletionsChunkSchema = v.object({
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

export type CompletionsChunk = v.InferOutput<typeof CompletionsChunkSchema>;

export type CompletionsStreamChunk =
  | CompletionsChunk
  | {
      object: "derouter.epilogue";
      jobId: string;
      balanceDelta: string | null;
    };

export const completions = {
  RequestBodySchema: CompletionsRequestBodySchema,
  ResponseSchema: CompletionsResponseSchema,
  ChunkSchema: CompletionsChunkSchema,
};

//
//#endregion

//#region Chat completions
//

export const ContentPartTextSchema = v.object({
  text: v.string(),
  type: v.literal("text"),
});

export const ContentPartRefusalSchema = v.object({
  refusal: v.string(),
  type: v.literal("refusal"),
});

export const DeveloperMessageSchema = v.object({
  content: v.union([v.string(), v.array(ContentPartTextSchema)]),
  role: v.literal("developer"),
  name: v.optional(v.string()),
});

export const SystemMessageSchema = v.object({
  content: v.union([v.string(), v.array(ContentPartTextSchema)]),
  role: v.literal("system"),
  name: v.optional(v.string()),
});

export const UserMessageSchema = v.object({
  content: v.union([v.string(), v.array(ContentPartTextSchema)]),
  role: v.literal("user"),
  name: v.optional(v.string()),
});

export const AssistantMessage = v.object({
  content: v.union([
    v.string(),
    v.array(ContentPartTextSchema),
    v.array(ContentPartRefusalSchema),
  ]),

  refusal: v.nullish(v.string()),
  role: v.literal("assistant"),
  name: v.optional(v.string()),

  tool_calls: v.optional(
    v.array(
      v.object({
        id: v.string(),
        type: v.literal("function"),
        function: v.object({
          name: v.string(),
          arguments: v.string(),
        }),
      })
    )
  ),

  function_call: v.optional(
    v.object({
      name: v.string(),
      arguments: v.string(),
    })
  ),
});

export const ToolMessage = v.object({
  role: v.literal("tool"),
  content: v.union([v.string(), v.array(ContentPartTextSchema)]),
  tool_call_id: v.string(),
});

export const FunctionMessage = v.object({
  role: v.literal("function"),
  content: v.string(),
  name: v.string(),
});

export const ChatMessageSchema = v.variant("role", [
  DeveloperMessageSchema,
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessage,
  ToolMessage,
  FunctionMessage,
]);

export type ChatMessage = v.InferOutput<typeof ChatMessageSchema>;

/**
 * @see https://platform.openai.com/docs/api-reference/chat/create.
 */
export const ChatCompletionRequestBodySchema = v.object({
  messages: v.array(ChatMessageSchema),
  model: v.string(),
  store: v.nullish(v.boolean()),
  reasoning_effort: v.optional(
    v.union([v.literal("low"), v.literal("medium"), v.literal("high")])
  ),
  metadata: v.optional(v.record(v.string(), v.string())),
  frequency_penalty: v.nullish(v.number()),
  max_tokens: v.nullish(v.number()),
  max_completion_tokens: v.nullish(v.number()),
  n: v.nullish(v.number()),
  presence_penalty: v.nullish(v.number()),

  response_format: v.optional(
    v.variant("type", [
      v.object({
        type: v.literal("text"),
      }),
      v.object({
        type: v.literal("json_schema"),
        json_schema: v.any(),
      }),
    ])
  ),

  seed: v.nullish(v.number()),
  stop: v.nullish(v.union([v.string(), v.array(v.string())])),
  stream: v.optional(v.boolean()),
  stream_options: v.nullish(StreamOptionsSchema),
  temperature: v.nullish(v.number()),
  top_p: v.nullish(v.number()),

  tools: v.optional(
    v.array(
      v.object({
        type: v.literal("function"),
        function: v.object({
          description: v.optional(v.string()),
          name: v.string(),
          parameters: v.optional(v.record(v.string(), v.any())),
          strict: v.nullish(v.boolean()),
        }),
      })
    )
  ),

  tool_choice: v.optional(
    v.union([
      v.literal("none"),
      v.literal("auto"),
      v.literal("required"),
      v.object({
        type: v.literal("function"),
        function: v.object({
          name: v.string(),
        }),
      }),
    ])
  ),

  parallel_tool_calls: v.optional(v.boolean()),
  user: v.optional(v.string()),

  function_call: v.optional(
    v.union([
      v.literal("none"),
      v.literal("auto"),
      v.object({
        name: v.string(),
      }),
    ])
  ),

  functions: v.optional(
    v.array(
      v.object({
        description: v.optional(v.string()),
        name: v.string(),
        parameters: v.any(),
      })
    )
  ),

  // extra: v.optional(
  //   v.object({
  //     session: v.optional(
  //       v.object({
  //         id: v.string(),
  //         timeout: v.number(),
  //       })
  //     ),
  //   })
  // ),
});

export type ChatCompletionRequestBody = v.InferOutput<
  typeof ChatCompletionRequestBodySchema
>;

export const ChatCompletionsResponseSchema = v.object({
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

export type ChatCompletionsResponse = v.InferOutput<
  typeof ChatCompletionsResponseSchema
>;

export const ChatCompletionsChunkSchema = v.object({
  id: v.string(),
  object: v.literal("chat.completion.chunk"),
  created: v.number(),
  model: v.string(),
  system_fingerprint: v.optional(v.string()),

  choices: v.array(
    v.object({
      index: v.number(),
      delta: v.union([ChatMessageSchema, v.object({})]),
      logprobs: v.nullish(v.any()),
      finish_reason: v.nullable(FinishReasonSchema),
    })
  ),

  usage: v.nullish(UsageSchema),
});

export type ChatCompletionsChunk = v.InferOutput<
  typeof ChatCompletionsChunkSchema
>;

export type ChatCompletionsStreamChunk =
  | ChatCompletionsChunk
  | {
      object: "derouter.epilogue";
      jobId: string;
      balanceDelta: string | null;
    };

export const chatCompletions = {
  MessageSchema: ChatMessageSchema,
  RequestBodySchema: ChatCompletionRequestBodySchema,
  ResponseSchema: ChatCompletionsResponseSchema,
  ChunkSchema: ChatCompletionsChunkSchema,
};

//
//#endregion
