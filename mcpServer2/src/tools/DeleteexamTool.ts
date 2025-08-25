import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface DeleteexamInput {
  session : string;
  exam_date : string;
}

class DeleteexamTool extends MCPTool<DeleteexamInput> {
  name = "DeleteExam";
  description = "This tool is used to delete an exam entry from the database with the date of the exam being provided";

  schema = {
    session: {
      type: z.string(),
      description: "Session identifier",
    },
    exam_date: {
      type: z.string(),
      description: "Date of the exam to be deleted",
    }
  };

  async execute(input: DeleteexamInput) {
    try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/delete-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session , exam_date: input.exam_date}),    
        });
        const data = await res.json() ;


        console.log(JSON.stringify(data))
        console.log("Hey i am returning data");
        console.log(data);
        return data
    } catch (error) {
        return { status: "error", message: "Failed to delete exam entry" };
    } 
  }
}

export default DeleteexamTool;