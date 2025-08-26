import { MCPServer } from "mcp-framework";

const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: 4008,
      cors: {
        allowOrigin: "*"
      }
    }
  }});

server.start();

// this is mcp server 2 - exam cell