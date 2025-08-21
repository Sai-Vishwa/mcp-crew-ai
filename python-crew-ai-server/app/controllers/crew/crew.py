from crewai import Agent, Task, Crew, Process , LLM
import os

# Initialize tools (optional)

llm =  LLM(
        model="llama3-8b-8192",  
        api_key="your-api-key-here",
        base_url="https://api.groq.com/openai/v1",  
        temperature=0.7,
        max_tokens=2000
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
        goal='Explains the topic {topic} in a clear and engaging manner',
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

# Create a reusable crew instance
crew_instance = create_crew()

def process_message_with_crew(message):
    """Process a message using the CrewAI instance"""
    
    data = message.get("userMessage")
    try:
        # Kickoff the crew with the message as input
        result = crew_instance.kickoff(inputs={'topic': data})
        return str(result)
    except Exception as e:  
        return f"Error processing message: {str(e)}"