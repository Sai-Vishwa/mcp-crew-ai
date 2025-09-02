import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface UpdateexamInput {
  session: string;
  exam_name: string;
  old_exam_date: string;
  old_exam_start: string; 
  old_exam_end: string;
  new_exam_date: string;
  new_exam_start: string; 
  new_exam_end: string;
}

class UpdateexamTool extends MCPTool<UpdateexamInput> {
  name = "UpdateExam";
  description = "This tool is used to update a exam entry on the database by the changing the exam date , start time and end time of the provided exam name";

  schema = {
        session: {
          type: z.string(),
          description: "Session identifier",
        },
        exam_name: {
          type: z.string(),
          description: "Name of the Exam whose date and timings is to be changed"
        },
        old_exam_date: {
          type: z.string(),
          description: "Old date of the Exam",
        },
        new_exam_date: {
          type: z.string(),
          description: "New date of the Exam",
        },
        old_exam_start: {
          type: z.string(),
          description: "Old exam start time (HH:MM:SS)",
        },
        new_exam_start: {
          type: z.string(),
          description: "New exam start time (HH:MM:SS)",
        },
        old_exam_end: {
          type: z.string(),
          description: "Old exam end time (HH:MM:SS)",
        },
        new_exam_end: {
          type: z.string(),
          description: "New exam end time (HH:MM:SS)",
        },
  };

  async execute(input: UpdateexamInput) {
      try {
      console.log("Hey i am getting called");
      console.log(input);
      const res = await fetch(`http://localhost:4004/update-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session : input.session, 
            exam_name : input.exam_name , 
            old_exam_date: input.old_exam_date, 
            new_exam_date: input.new_exam_date, 
            old_exam_start: input.old_exam_start, 
            new_exam_start: input.new_exam_start, 
            old_exam_end: input.old_exam_end,
            new_exam_end: input.new_exam_end,
          }),    
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

export default UpdateexamTool;