import json
import random

# Get recent messages
def get_previous_responses():

    json_file = "data.json"
    
    # Learning instructions
    instruction = {
        "role": "system",
        "content": """You are an assistant whom will faciliate the conversation between a mute and a normal person. The mute persons name is Roydon and the normal person is indicated as other person.
        You should be generating 3 responses which the mute person could choose from and the responses generated should follow the context of the conversation. 
        The topic should be interpreted from the conversation.
        If no topic could be interpreted, provide default responses that a person would start with such as greetings. 
        The responses should be what a person would say and should not include actions in a third person view. Your persona would be from the perspective of the mute person.
        In the case the responses are not chosen, the mute person could type their own response. Do take note of this response and continue the conversation from the response selected or typed out by the mute person.
        Ensure the responses generated will allow the conversation to flow smoothly.

        Start by generating 3 responses to what the other person says.
        After generating the 3 responses, you will then receive the following for all subsequent conversations
        Roydon says: ... Other person says ... After which generate the 3 responses.

        The 3 responses must be seperated by an @, for example: "Response 1@Response 2@Response 3" all in one line and it must be in english. 
        """,
    }

    # Initialize messages
    messages = []

    # Add personality to the chatbot
    rand_num = random.uniform(0,1)

    if (rand_num < 0.3):
        instruction["content"] = instruction["content"] + "Out of the 3 responses, include some dry humour in at least 1."

    # Add learn instruction to message array
    messages.append(instruction)

    # Get last 5 messages
    try:
        with open(json_file) as user_messages:
            data = json.load(user_messages)
            
            if data:
                if len(data) < 5:
                    for message in data:
                        messages.append(message)
                else:
                    for message in data[-5]:
                        messages.append(message)
    except Exception as e:
        print(e)
        pass

    # Return
    return messages


# Store messages into json file:
def store_messages(user_message, gpt_response):

    json_file = "data.json"

    # Get recent messages and exclude first response:
    messages = get_previous_responses()[1:]

    # Store user response:
    user_response = {
        "role": "user", 
        "content": user_message
    }

    # Store chatgpt generated response
    chat_gpt_response = {
        "role": "assistant", 
        "content": gpt_response
    }

    messages.append(user_response)
    messages.append(chat_gpt_response)

    # Save and overwrite json file
    with open(json_file, "w") as f:
        json.dump(messages,f)


# Reset messages stored in json file
def reset_messages():

    # Overwrite current json file with nothing
    open("data.json", "w")