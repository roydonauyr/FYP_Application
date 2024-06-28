import openai
from decouple import config

# Import custom function
from functions.database import get_previous_responses

# Environment variables
openai.organisation = config("OPEN_AI_ORG")
openai.api_key = config("OPEN_AI_KEY")

# Initialize variables
start = 0
final_response = ""

# Convert audio to text using open ai whisper
def audio_to_text(audio_file):
    try:
        transcript = openai.audio.transcriptions.create(
            model = "whisper-1", 
            file = audio_file,
            language = "en",)
        text = transcript.text
        return text
    except Exception as e:
        print(e)
        return

# Get chatgpt assistant responses
# message input is the audio input from
# Output: 3 response choices, user message content
def get_response_choice(message):
    global start
    global final_response
    messages = get_previous_responses()
    user_message = {}
  
    # Editing user_message based on response user picked. At the start, user does not need to pick
    # What you send in to chat gpt

    if start == 0:
        start += 1
        #print("entered once")
        user_message = {
            "role": "user",
            "content": "Other person says: " + message
        }
    else:
         #print("Entered second time")
         user_message = {
            "role": "user",
            "content": "Roydon says: " + final_response + "Other person says: " + message
        }
    
    messages.append(user_message)
    print(messages)
    print("Start is: " + str(start))

    try:
        raw_response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages = messages 
        )
        #print(raw_response)
    
        # Split response choices for user to pick
        response_choices = raw_response.choices[0].message.content
        return response_choices, user_message["content"]
    except Exception as e:
        print(e)
        return

# Adds the final response to the final response variable for the next use of query
def add_final_response(response_selected):
    global final_response

    # For now assume user picks first choice
    final_response = response_selected
    print(final_response)






