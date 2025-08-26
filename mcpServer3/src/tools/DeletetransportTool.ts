import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface DeletetransportInput {
  session : string;
  bus_date : string;
}

class DeletetransportTool extends MCPTool<DeletetransportInput> {
  name = "DeleteTransport";
  description = "This tool is used to delete a transport entry for a corresponding date provided";

  schema = {
    session: {
      type: z.string(),
      description: "Session Identifier",
    },
      bus_date: {
          type: z.string(),
          description: "Date for which the bus details is to be deleted",
        },
  };

  async execute(input: DeletetransportInput) {
    try {
      const res = await fetch(`http://localhost:4004/delete-transport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session, bus_date : input.bus_date}),    
        });
        const data = await res.json() ;
        return data
    } catch (error) {
        return { status: "error", message: "Failed to delete transport entry" };
    } 
  }
}

export default DeletetransportTool;