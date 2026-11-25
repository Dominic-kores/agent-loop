import fs from "node:fs/promises";

// Resolve the file relative to this module.
const MEMORY_FILE = new URL(
  "./memory.json",
  import.meta.url
);

const MAX_MEMORIES = 20;

// Load previously saved conversations.
export async function loadMemory() {
  try {
    const data = await fs.readFile(
      MEMORY_FILE,
      "utf8"
    );

    // An empty file (e.g. created with `touch`) means no memories yet.
    if (!data.trim()) {
      return [];
    }

    const memories = JSON.parse(data);

    if (!Array.isArray(memories)) {
      throw new Error("Invalid memory file structure.");
    }

    return memories;
  } catch (error) {
    // First run: the memory file may not exist.
    if (error.code === "ENOENT") {
      return [];
    }

    // Do not silently overwrite corrupt memory.
    throw error;
  }
}

// Convert previous interactions into context for Claude.
export function formatMemory(memories) {
  if (!memories.length) {
    return "No previous shopping interactions.";
  }

  // Include only the most recent interactions.
  return JSON.stringify(
    memories.slice(-5),
    null,
    2
  );
}

// Create a compact summary using actual tool results.
export async function saveMemory(
  userMessage,
  agentResult
) {
  const memories = await loadMemory();

  const successfulTools =
    agentResult.observations.filter(
      (item) => !item.isError
    );

  // Collect products mentioned in tool results.
  const discussedProducts = new Map();

  for (const observation of successfulTools) {
    if (observation.name === "searchProducts") {
      for (const product of observation.result) {
        discussedProducts.set(
          product.id,
          product.name
        );
      }
    }

    if (observation.name === "checkStock") {
      const product = observation.result;

      discussedProducts.set(
        product.productId,
        product.name
      );
    }

    if (observation.name === "getAlternatives") {
      for (const product of observation.result.alternatives) {
        discussedProducts.set(
          product.id,
          product.name
        );
      }
    }
  }

  // Find the last successful purchase calculation.
  const quotation = successfulTools
    .filter(
      (item) => item.name === "calculateTotal"
    )
    .at(-1);

  const memory = {
    timestamp: new Date().toISOString(),

    userRequest: userMessage,

    productsDiscussed: Array.from(
      discussedProducts,
      ([id, name]) => ({ id, name })
    ),

    // The assignment has no actual order-creation tool.
    // Therefore, this is saved as a simulated order quotation.
    lastQuotation: quotation?.result || null,

    response: agentResult.answer.slice(0, 1500),

    status: agentResult.status,
  };

  memories.push(memory);

  // Limit file growth by keeping the latest 20 memories.
  const recentMemories =
    memories.slice(-MAX_MEMORIES);

  // Persist the conversations as readable JSON.
  await fs.writeFile(
    MEMORY_FILE,
    JSON.stringify(recentMemories, null, 2),
    "utf8"
  );

  console.log("[Memory] Interaction saved.");
}