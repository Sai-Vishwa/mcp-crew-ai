import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface UpdatetransportInput {
  session : string;
  bus_date : string;
  old_start_time : string;
  new_start_time : string;
  old_leave_time : string;
  new_leave_time : string;
}

class UpdatetransportTool extends MCPTool<UpdatetransportInput> {
  name = "updateTransport";
  description = "This tool is used to update a transport entry in the database by changing the start and leave time for the provided bus date";

  schema = {
        session: {
          type: z.string(),
          description: "Session identifier",
        },
        bus_date: {
          type: z.string(),
          description: "Date for which the bus details is to be updated",
        },
        old_start_time: {
          type: z.string(),
          description: "Old time when busses start (HH:MM:SS)",
        },
        new_start_time: {
          type: z.string(),
          description: "New time when busses start (HH:MM:SS)",
        },
        old_leave_time: {
          type: z.string(),
          description: "Old time when busses leave (HH:MM:SS)",
        },
        new_leave_time: {
          type: z.string(),
          description: "New time when busses leave (HH:MM:SS)",
        },
  };

  async execute(input: UpdatetransportInput) {
    try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/update-transport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session : input.session, 
            bus_date : input.bus_date, 
            old_start_time : input.old_start_time,
            new_start_time : input.new_start_time,
            old_leave_time : input.old_leave_time,
            new_leave_time : input.new_leave_time,
          }),    
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

export default UpdatetransportTool;