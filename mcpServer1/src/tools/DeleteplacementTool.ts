import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface DeleteplacementInput {
  company_name: string;
  session : string;
}

class DeleteplacementTool extends MCPTool<DeleteplacementInput> {
  name = "DeletePlacement";
  description = "This tool is used to delete a placement entry from the database with the name of the organisation been provided";

  schema = {
    company_name: {
      type: z.string(),
      description: "Name of the company whose placement entry to be deleted",
    },
    session : {
      type: z.string(),
      description: "Session identifier",
    }
  };

  async execute(input: DeleteplacementInput) {

     try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/delete-placement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session , company_name: input.company_name}),    
        });
        const data = await res.json() ;


        console.log(JSON.stringify(data))
        console.log("Hey i am returning data");
        console.log(data);
        return data
    } catch (error) {
        return { status: "error", message: "Failed to delete placement entry" };
    } 
  }
}

export default DeleteplacementTool;