import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ReadtransportInput {
  session :  string;
}

class ReadtransportTool extends MCPTool<ReadtransportInput> {
  name = "ReadTransport";
  description = "This tool is used to read all transport entries";

  schema = {
    session: {
      type: z.string(),
      description: "session indentifier",
    },
  };

  async execute(input: ReadtransportInput) {
      try {
      const res = await fetch(`http://localhost:4004/read-transport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session}),    
        });
        const data = await res.json() ;
        return data
    } catch (error) {
        return { status: "error", message: "Failed to read transport entries" };
    } 
  }
}

export default ReadtransportTool;