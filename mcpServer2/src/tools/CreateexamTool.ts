import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface CreateexamInput {
  session: string;
  exam_name: string;
  exam_date: string;
  exam_start: string; 
  exam_end: string;
}

class CreateexamTool extends MCPTool<CreateexamInput> {
  name = "CreateExam";
  description = "This tool is used to create a new exam entry on the database";

  schema = {
        session: {
          type: z.string(),
          description: "Session identifier",
        },
        exam_name: {
          type: z.string(),
          description: "Name of the Exam"
        },
        exam_date: {
          type: z.string(),
          description: "Date of the Exam",
        },
        exam_start: {
          type: z.string(),
          description: "Exam start time (HH:MM:SS)",
        },
        exam_end: {
          type: z.string(),
          description: "Exam end time (HH:MM:SS)",
        },
  };

  async execute(input: CreateexamInput) {
    try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/create-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({session : input.session, exam_name : input.exam_name , exam_date: input.exam_date, exam_start: input.exam_start, exam_end: input.exam_end}),    
        });
        const data = await res.json() ;


        console.log(JSON.stringify(data))
        console.log("Hey i am returning data");
        console.log(data);
        return data
    } catch (error) {
        return { status: "error", message: "Failed to create exam schedule entry" };
    } 
  }
}

export default CreateexamTool;