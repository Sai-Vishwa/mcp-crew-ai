import { MCPServer } from "mcp-framework";

const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: 4009,
      cors: {
        allowOrigin: "*"
      }
    }
  }});

server.start();