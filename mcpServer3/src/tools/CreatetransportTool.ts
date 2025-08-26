import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface CreatetransportInput {
  session : string;
  bus_date : string;
  start_time : string;
  leave_time : string;
}

class CreatetransportTool extends MCPTool<CreatetransportInput> {
  name = "CreateTransport";
  description = "This tool is used to create a new transport entry or update an existing one in the database";

  schema = {
        session: {
          type: z.string(),
          description: "Session identifier",
        },
        bus_date: {
          type: z.string(),
          description: "Date for which the bus details is to be entered",
        },
        start_time: {
          type: z.string(),
          description: "time when busses start (HH:MM:SS)",
        },
        leave_time: {
          type: z.string(),
          description: "time when busses leave (HH:MM:SS)",
        },
  };

  async execute(input: CreatetransportInput) {
     try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/create-transport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session, bus_date : input.bus_date, start_time : input.start_time, leave_time : input.leave_time}),    
        });
        const data = await res.json() ;


        console.log(JSON.stringify(data))
        console.log("Hey i am returning data");
        console.log(data);
        return data
    } catch (error) {
        return { status: "error", message: "Failed to create placement entry" };
    } 
  }
}

export default CreatetransportTool;