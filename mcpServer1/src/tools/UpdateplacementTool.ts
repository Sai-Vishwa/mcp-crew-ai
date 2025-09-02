import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface UpdateplacementInput {
  session : string;
  company_name : string;
  old_visiting_date : string;
  new_visiting_date : string;
  old_interview_start : string;
  new_interview_start : string;
  old_interview_end : string;
  new_interview_end : string;
}

class UpdateplacementTool extends MCPTool<UpdateplacementInput> {
  name = "UpdatePlacement";
  description = "This tool is used to update a placement entry on the databse by changing the visiting date , start time and end time for the provided company";

  schema = {
        session: {
          type: z.string(),
          description: "Session identifier",
        },
        company_name: {
          type: z.string(),
          description: "Name of the company whose visiting date is to be changed",
        },
        old_visiting_date: {
          type: z.string(),
          description: "Old date of visit",
        },
        new_visiting_date: {
          type: z.string(),
          description: "New date of visit",
        },
        old_interview_start: {
          type: z.string(),
          description: "Old interview start time (HH:MM:SS)",
        },
        new_interview_start: {
          type: z.string(),
          description: "New interview start time (HH:MM:SS)",
        },
        old_interview_end: {
          type: z.string(),
          description: "Old interview end time (HH:MM:SS)",
        },
        new_interview_end: {
          type: z.string(),
          description: "New interview end time (HH:MM:SS)",
        },
  };

  async execute(input: UpdateplacementInput) {
     try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/update-placement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session : input.session, 
            company_name: input.company_name, 
            old_visiting_date: input.old_visiting_date, 
            new_visiting_date : input.new_visiting_date,
            old_interview_start: input.old_interview_start,
            new_interview_start: input.new_interview_start, 
            old_interview_end: input.old_interview_end , 
            new_interview_end : input.new_interview_end}),    
        });
        const data = await res.json() ;
        console.log(JSON.stringify(data))
        console.log("Hey i am returning data");
        console.log(data);
        return data
    } catch (error) {
        return { status: "error", message: "Failed to update placement entry" };
    } 
  }
}

export default UpdateplacementTool;