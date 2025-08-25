import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface CreatePlacementInput {
  session: string;
  company_name: string;
  visiting_date: Date;
  interview_start: string; 
  interview_end: string;   
}

interface CreatePlacementOutput {
  status: string;
  message?: string;
  error?: string;
}

class CreatePlacementTool extends MCPTool<CreatePlacementInput>{
  name = "create_placement";
  description = "This tool creates a new placement entry in the database";

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
      type: z.date(),
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

  async execute(input: CreatePlacementInput) : Promise<CreatePlacementOutput>{
    try {

      const res = await fetch(`http://localhost:4006/create-placement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session, company_name: input.company_name, visiting_date: input.visiting_date, interview_start: input.interview_start, interview_end: input.interview_end}),    
        });
        const data = await res.json() ;
        console.log(JSON.stringify(data))

        return data
    } catch (error) {
        return { status: "error", error: "Failed to create placement entry" };
    } 
  }
}

export default CreatePlacementTool;