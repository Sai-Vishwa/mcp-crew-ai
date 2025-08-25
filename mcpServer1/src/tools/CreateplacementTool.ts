import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface CreateplacementInput {
  session: string;
  company_name: string;
  visiting_date: string;
  interview_start: string; 
  interview_end: string; 
}

class CreateplacementTool extends MCPTool<CreateplacementInput> {
  name = "CreatePlacement";
  description = "This tool is used to create a new placement entry or update an existing one in the database";

  schema = {
        session: {
          type: z.string(),
          description: "Session identifier",
        },
        company_name: {
          type: z.string(),
          description: "Name of the company",
        },
        visiting_date: {
          type: z.string(),
          description: "Date of the company visit",
        },
        interview_start: {
          type: z.string(),
          description: "Interview start time (HH:MM:SS)",
        },
        interview_end: {
          type: z.string(),
          description: "Interview end time (HH:MM:SS)",
        },
  };

  async execute(input: CreateplacementInput) {
    try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/create-placement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session, company_name: input.company_name, visiting_date: input.visiting_date, interview_start: input.interview_start, interview_end: input.interview_end}),    
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

export default CreateplacementTool;