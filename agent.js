import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

// Prevent the agent from running indefinitely.
export const MAX_ITERATIONS = 5;

// Main reusable function for both AI agents.
export async function runAgent({
  userMessage,
  systemPrompt,
  toolDefinitions,
  toolImplementations,
  maxIterations = MAX_ITERATIONS,
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  if (!process.env.ANTHROPIC_MODEL) {
    throw new Error("ANTHROPIC_MODEL is missing.");
  }

  if (
    !Number.isInteger(maxIterations) ||
    maxIterations < 1 ||
    maxIterations > MAX_ITERATIONS
  ) {
    throw new Error("Maximum iterations must be between 1 and 5.");
  }

  if (typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("A user message is required.");
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 30000,
    maxRetries: 1,
  });

  // Conversation history starts with the user's request.
  const messages = [
    {
      role: "user",
      content: userMessage,
    },
  ];

  let iterations = 0;
  let toolCalls = 0;

  // Store successful and failed tool observations.
  const observations = [];

  console.log("\n--- Agent started ---");
  console.log(`Task: ${userMessage}`);

  // Prepare a consistent return object.
  function buildResult(answer, status) {
    return {
      answer,
      status,
      iterations,
      toolCalls,
      observations,
      messages,
    };
  }

  // Fallback when the agent cannot complete the task.
  function buildPartialResult(reason) {
    const findings = observations
      .filter((item) => !item.isError)
      .map(
        (item) =>
          `${item.name}: ${JSON.stringify(item.result)}`
      );

    const errors = observations
      .filter((item) => item.isError)
      .map(
        (item) =>
          `${item.name}: ${item.result.error}`
      );

    const answer = [
      `The agent stopped: ${reason}`,
      "",
      "Information gathered so far:",
      findings.length
        ? findings.join("\n")
        : "No successful tool results.",
      "",
      "Unresolved issues:",
      errors.length
        ? errors.join("\n")
        : "The final response has not been completed.",
      "",
      "Any missing lookups or calculations remain unconfirmed.",
      "No purchase or booking has been placed.",
    ].join("\n");

    return buildResult(answer, "incomplete");
  }

  // CORE AGENT LOOP: Observe -> Think -> Act -> Observe
  while (iterations < maxIterations) {
    iterations++;

    console.log(`\n--- Iteration ${iterations} ---`);

    // THINK: Log the current execution state.
    console.log(
      `[Think] Iteration ${iterations}, ` +
      `tools used: ${toolCalls}, ` +
      `messages: ${messages.length}`
    );

    let response;

    try {
      // Send the entire conversation history to Claude.
      response = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        tools: toolDefinitions,
        messages,
      });
    } catch (error) {
      console.error("[API Error]", error.message);

      return buildPartialResult(
        `Claude API request failed: ${error.message}`
      );
    }

    // Extract all tool requests returned by Claude.
    const requestedTools = response.content.filter(
      (block) => block.type === "tool_use"
    );

    const toolNames = requestedTools
      .map((tool) => tool.name)
      .join(", ");

    // DECIDE: Observe the model's selected next action.
    console.log(
      `[Decide] stop_reason: ${response.stop_reason}, ` +
      `tools: ${toolNames || "none"}`
    );

    // Preserve the full assistant response, including
    // text blocks and tool_use IDs.
    messages.push({
      role: "assistant",
      content: response.content,
    });

    // CASE 1: Claude has completed the request.
    if (response.stop_reason === "end_turn") {
      const answer = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      if (!answer.trim()) {
        return buildPartialResult(
          "The model ended its turn without a text response."
        );
      }

      console.log(
        `\n--- Agent completed in ${iterations} iteration(s) ---`
      );

      return buildResult(answer, "completed");
    }

    // CASE 2: Claude wants to execute tools.
    if (response.stop_reason === "tool_use") {
      if (requestedTools.length === 0) {
        return buildPartialResult(
          "The model requested tools without valid tool blocks."
        );
      }

      // Execute multiple independent tool calls concurrently.
      // Promise.all preserves the order of the results.
      const toolResults = await Promise.all(
        requestedTools.map(async (tool) => {
          toolCalls++;

          console.log(
            `[Act] Tool call: ${tool.name}` +
            `(${JSON.stringify(tool.input)})`
          );

          let result;
          let isError = false;

          try {
            // Only execute functions explicitly registered
            // in this agent's tool implementation map.
            if (
              !Object.hasOwn(
                toolImplementations,
                tool.name
              )
            ) {
              throw new Error(
                `Unknown tool: ${tool.name}`
              );
            }

            const executeTool =
              toolImplementations[tool.name];

            // await supports both synchronous and
            // asynchronous tool implementations.
            result = await executeTool(tool.input);
          } catch (error) {
            isError = true;

            result = {
              error: error.message,
            };
          }

          console.log(
            `[Observe] Result: ${JSON.stringify(result)}`
          );

          // Save observations for memory and fallback responses.
          observations.push({
            name: tool.name,
            input: tool.input,
            result,
            isError,
          });

          // Match the result to Claude's original tool_use ID.
          return {
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify(result),
            is_error: isError,
          };
        })
      );

      // Anthropic expects tool_result blocks inside
      // a user message immediately after the assistant's
      // tool_use message.
      messages.push({
        role: "user",
        content: toolResults,
      });

      // Return to the beginning of the loop.
      // Claude will now observe the tool results.
      continue;
    }

    // CASE 3: Unexpected termination, including max_tokens.
    return buildPartialResult(
      `Unexpected stop reason: ${response.stop_reason}`
    );
  }

  // CASE 4: Maximum iteration limit reached.
  console.log(
    `\n[Warning] Maximum ${maxIterations} iterations reached.`
  );

  return buildPartialResult(
    "Maximum iteration limit reached."
  );
}