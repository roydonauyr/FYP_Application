import json
import random


#The 3 responses must be seperated by an @, for example: "Response 1 generated@Response 2generated@Response 3 generated" all in one line and 
# Start by generating 3 responses to what the other person says.
        # After generating the 3 responses, you will then receive the following for all subsequent conversations
        # Roydon says: ... Other person says ... After which generate the 3 responses.
# Get recent messages
def get_previous_responses(loaded_faiss_vs, query, search):

    json_file = "data.json"
    
    # Initialize messages
    messages = []

    if(search):
        
        context = loaded_faiss_vs.similarity_search(query, k=3)
        contexts = ""

        for con in context:
            contexts += con.page_content


        content = f"""You are an assistant whom will faciliate the conversation between a mute and a normal person. The mute persons name is Roydon and the normal person is indicated as other person.
                        You should be generating 3 responses which the mute person could choose from and the responses generated should follow the context of the conversation. 
                        The responses should be what a person would say and should not include actions in a third person view. Your persona would be from the perspective of the mute person.

                        Snippets of conversation would be given below in the section of Context. Use the conversations to assist in the generation the 3 responses. Primarily the topic should be inferred from the question asked but if no topic can be inferred, infer the topics from the conversations given in the context. The conversations are seperated by "{{" and "}}":\n
                        Context: {contexts}

                        For example, if the context above contains "{{"Roydon": "Recently my new pet dog has been so fun!", "Jacob": "That\'s awesome! What breed is it?"}}"

                        If the user asks "What have you been up to?"

                        An example of the 3 generated response would be in the format of 1 single string "Response 1: I have been playing with my new pet dog. Response 2: Nothing much, I recently brought my new pet dog to a park. Response 3: Its been tiring lately after getting a new pet dog.
                                """
                            
        print("This is the context: " + content)

        # Learning instructions
        instruction = {
            "role": "system",
            "content": content,
        }


        # # Add personality to the chatbot
        # rand_num = random.uniform(0,1)

        # if (rand_num < 0.3):
        #     instruction["content"] = instruction["content"] + "Out of the 3 responses, include some dry humour in at least 1."

        # Add learn instruction to message array
        messages.append(instruction)

    #Get last 5 messages
    try:
        with open(json_file) as user_messages:
            data = json.load(user_messages)
            
            if data:
                if len(data) < 5:
                    for message in data:
                        messages.append(message)
                else:
                    for message in data[-5:]:
                        messages.append(message)
    except Exception as e:
        print(e)
        pass

    # Return
    return messages


# Store messages into json file:
def store_messages(user_message, gpt_response):

    json_file = "data.json"
    embeddings = ''

    # Get recent messages and exclude first response:
    messages = get_previous_responses(embeddings, user_message, search=False)

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