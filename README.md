
# AI Agent Loop — SokoSmart AI & SafariPlan AI

## Project Overview

This project demonstrates the implementation of autonomous AI agents
using Node.js, JavaScript and the Anthropic Claude SDK.

It consists of two intelligent agents:

- **SokoSmart AI:** A Kenyan shopping assistant that searches products,
  checks stock, calculates VAT-inclusive quotations and recommends
  alternatives.

- **SafariPlan AI:** A travel planning assistant that orchestrates
  flight searches, hotel searches, simulated weather forecasts and
  trip cost calculations.

Both agents use a reusable ReAct-inspired agent loop that follows
the observe, think, act and observe pattern.

## Project Objectives

- Understand AI agents and autonomous decision-making.
- Implement a reusable agent execution loop.
- Define tools using JSON Schema.
- Execute sequential and parallel tool calls.
- Manage conversation history and persistent agent memory.
- Prevent infinite loops using maximum iteration limits.
- Handle tool errors and incomplete results.
- Test business logic independently of the AI model.

## Features

### Shopping Assistant

- Catalogue of 20 Kenyan products.
- Product discovery and category searches.
- Warehouse stock verification.
- Nairobi, Mombasa and Kisumu warehouse locations.
- Purchase calculations with 16% VAT.
- Automatic alternative product recommendations.
- Receipt-style purchase quotations.
- Persistent memory for previous shopping interactions.

### Travel Planning Agent

- Mock flight searches.
- Mock hotel searches.
- Simulated weather forecasts and travel advice.
- Automated travel planning.
- Itemized travel cost calculations in KES.
- Support for multiple travelers.

### Agent Architecture

- Reusable agent loop.
- Anthropic Claude tool calling.
- JSON Schema tool definitions.
- Sequential and parallel tool execution.
- Conversation history management.
- Maximum five iterations.
- Tool execution logs.
- Graceful error handling.
- Partial results when a task cannot be completed.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| JavaScript ES6+ | Application logic |
| Anthropic SDK | Claude AI integration |
| JSON Schema | Tool definitions |
| dotenv | Environment variables |
| Node.js File System | Persistent agent memory |
| Node.js Test Runner | Unit testing |
| Git and GitHub | Version control |

## Project Structure

```text
week-15-day-1-assignment/
├── agent.js
├── index.js
├── products.js
├── tools.js
├── tool-implementations.js
├── travel-agent.js
├── travel-tools.js
├── travel-implementations.js
├── memory.js
├── memory.json
├── tools.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Dominic-kores/agent-loop

cd week-15-day-1-assignment
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Configure the environment variables:

```env
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-haiku-5-5
```



## Running the Shopping Agent

```bash
node index.js "I want to buy 2 bags of Kenyan Coffee and 1 Maasai Beaded Necklace"
```

Expected quotation:

| Description | Amount (KES) |
|-------------|-------------:|
| Kenyan Coffee x 2 | 2,400 |
| Maasai Beaded Necklace x 1 | 2,500 |
| Subtotal | 4,900 |
| VAT (16%) | 784 |
| Grand Total | 5,684 |

## Out-of-Stock Scenario

```bash
node index.js "I want to buy 3 Sisal Basket Bags"
```

The agent checks availability and automatically recommends
alternative products within the same category.

## Running the Travel Agent

```bash
node travel-agent.js "Plan a 3-day trip to Mombasa for 2 people, departing from Nairobi"
```

Example estimated trip budget:

| Expense | Amount (KES) |
|---------|-------------:|
| Outbound flights | 17,000 |
| Accommodation | 36,000 |
| Daily expenses | 15,000 |
| Total trip cost | 68,000 |

The demonstration assumes three hotel nights and three budgeted
days. Return flights are excluded unless explicitly requested.

## Agent Memory

The memory module stores interaction summaries in a local JSON file.

First session:

```bash
node index.js "I want to buy 2 Kenyan Coffee bags"
```

Second session:

```bash
node index.js "I want to reorder what I got last time"
```

The agent retrieves previous shopping information and verifies
current stock before generating a new quotation.

## Running Tests

```bash
npm test
```

Tests cover product searches, stock availability, VAT calculations,
alternative recommendations, flight searches, hotel searches,
simulated weather and travel cost calculations.

## Agent Execution Flow

1. Receive a user request.
2. Send the request, available tools and history to Claude.
3. Observe the model's selected action.
4. Execute requested tools.
5. Return tool results to Claude.
6. Repeat until a final answer is generated.
7. Stop when the maximum iteration limit is reached.
8. Save shopping interaction memory.

## Security and Reliability

- Environment variables protect API credentials.
- Tool execution is limited to registered functions.
- Business logic validates tool inputs.
- A five-iteration safeguard prevents infinite agent loops.
- API and tool errors are handled gracefully.
- Private conversation memory is excluded from Git.


## Key Learning Outcomes

This project strengthened my understanding of autonomous AI agents,
tool orchestration, ReAct-inspired execution, decision-making,
conversation management, persistent memory and reliable AI
application development.






## Author

Dominic Kores Kisioya

Full-Stack Software & AI Engineer
