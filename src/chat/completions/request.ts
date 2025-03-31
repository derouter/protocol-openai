import * as v from "valibot";
import { StreamOptionsSchema } from "../../common.js";

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

export const MessageSchema = v.variant("role", [
  DeveloperMessageSchema,
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessage,
  ToolMessage,
  FunctionMessage,
]);

export type Message = v.InferOutput<typeof MessageSchema>;

/**
 * @see https://platform.openai.com/docs/api-reference/chat/create.
 */
export const RequestBodySchema = v.object({
  messages: v.array(MessageSchema),
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

export type RequestBody = v.InferOutput<typeof RequestBodySchema>;
