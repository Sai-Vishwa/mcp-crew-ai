import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ReadexamInput {
  session : string
}

class ReadexamTool extends MCPTool<ReadexamInput> {
  name = "ReadExam";
  description = "This tool is used to read all exam schedule entries";

  schema = {
    session: {
      type: z.string(),
      description: "Session identifier",
    },
  };

  async execute(input: ReadexamInput) {
    try {

      const res = await fetch(`http://localhost:4004/read-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session}),    
        });
        const data = await res.json() ;
        return data
    } catch (error) {
        return { status: "error", message: "Failed to fetch exam schedule entries" };
    } 
  }
}

export default ReadexamTool;