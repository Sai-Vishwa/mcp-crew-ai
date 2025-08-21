from crewai import Agent, Task, Crew, Process , LLM
import os

import sys
import time
# Initialize tools (optional)

llm =  LLM(
        model="llama3-8b-8192",  
        api_key="my-api-key",
        base_url="https://api.groq.com/openai/v1",  
        temperature=0.7,
        max_tokens=8000
    )

def create_crew():
    # Define agents
    researcher = Agent(
        role='Joke Agent',
        goal='Tells a joke based on the topic {topic}',
        backstory="""You're a profession joke teller who specializes in creating jokes""",
        verbose=True,
        llm=llm,
    )

    writer = Agent(
        role='Explanation Agent',
        goal='Explains the topic {topic} in a clear and engaging manner in exactly 8000 words ',
        backstory="""You're a professional writer who specializes in creating engaging content""",
        verbose=True,
        llm=llm
    )

    # Define tasks
    joke_task = Task(
        description="""Using the topic {topic}, create a humorous joke that is engaging and fun.""",
        expected_output="A well-crafted joke related to the topic",
        agent=researcher
    )

    explain_task = Task(
        description="""Using the topic {topic}, write a clear and engaging explanation that is easy to understand.""",
        expected_output="A well-written explanation of the topic",
        agent=writer
    )

    # Create crew
    crew = Crew(
        agents=[researcher, writer],
        tasks=[joke_task, explain_task],
        process=Process.sequential,
        verbose=True
    )

    return crew

class StreamingCallbackHandler:
    def __init__(self):
        self.chunks = []
    
    def on_task_output(self, output):
        # Process output in chunks
        chunk_size = 1000  # characters per chunk
        for i in range(0, len(output), chunk_size):
            chunk = output[i:i+chunk_size]
            self.chunks.append(chunk)
            # Send chunk immediately (to API, websocket, etc.)
            yield chunk
    
    def on_crew_output(self, output):
        # Process final output if needed
        pass

# Create a reusable crew instance
crew_instance = create_crew()
def process_message_with_crew(message):
    """Process a message using the CrewAI instance and yield chunks"""
    
    callback_handler = StreamingCallbackHandler()
    data = message.get("userMessage")
    
    try:
        # Kickoff the crew with callback
        result = crew_instance.kickoff(
            inputs={'topic': data}, 
        )
        
        # Yield all chunks collected during processing
        for chunk in callback_handler.chunks:
            print("sending a chunk inside func")
            yield chunk
            time.sleep(2)
        
        # Also yield the final result in chunks as backup
        final_result = str(result)
        chunk_size = 500
        for i in range(0, len(final_result), chunk_size):
            print("sending final chunk inside func")
            yield final_result[i:i+chunk_size]
            time.sleep(2)
            
    except Exception as e:  
        yield f"Error processing message: {str(e)}" 