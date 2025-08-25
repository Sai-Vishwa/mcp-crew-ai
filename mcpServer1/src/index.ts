import { MCPServer } from "mcp-framework";

const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: 4007,
      cors: {
        allowOrigin: "http://localhost:4005",
      }
    }
  }});

server.start();

// this is mcp server 1 - placement
