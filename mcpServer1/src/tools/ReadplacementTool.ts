import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ReadplacementInput {
  session : string;
}

class ReadplacementTool extends MCPTool<ReadplacementInput> {
  name = "ReadPlacement";
  description = "This tool is used to read all placement entries";

  schema = {
    session: {
      type: z.string(),
      description: "Session identifier",
    },
  };

  async execute(input: ReadplacementInput) {
     try {

      const res = await fetch(`http://localhost:4004/read-placement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session}),    
        });
        const data = await res.json() ;
        return data
    } catch (error) {
        return { status: "error", message: "Failed to fetch placement entries" };
    } 
  }
}

export default ReadplacementTool;