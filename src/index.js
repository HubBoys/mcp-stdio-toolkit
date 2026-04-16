#!/usr/bin/env node

const CryptoJS = require("crypto-js");
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

function getSign(appKey, appSecret) {
  const timestamp = Date.now();
  const data = `${timestamp}\n${appSecret}\n${appKey}`;
  const hash = CryptoJS.HmacSHA256(data, appSecret);
  const signatureBase64 = hash.toString(CryptoJS.enc.Base64);

  return {
    timestamp,
    signatureBase64,
    sign: `${timestamp}${signatureBase64}`,
  };
}

const server = new Server(
  {
    name: "mcp-stdio-toolkit",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_sign",
        description:
          "Calculate sign from appKey and appSecret using timestamp + HMAC-SHA256 + Base64.",
        inputSchema: {
          type: "object",
          properties: {
            appKey: {
              type: "string",
              description: "Application key",
            },
            appSecret: {
              type: "string",
              description: "Application secret",
            },
          },
          required: ["appKey", "appSecret"],
          additionalProperties: false,
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "get_sign") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Unknown tool: ${name}`,
        },
      ],
    };
  }

  const appKey = args?.appKey;
  const appSecret = args?.appSecret;

  if (!appKey || !appSecret) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Both appKey and appSecret are required.",
        },
      ],
    };
  }

  const result = getSign(appKey, appSecret);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Server failed: ${message}`);
  process.exit(1);
});
