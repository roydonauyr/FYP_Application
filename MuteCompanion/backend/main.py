#uvicorn main:app --reload
#.\venv\Scripts\activate.ps1

# Main imports
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
import openai
import re

# To time functionalities
import time

# Custom functions import
from functions.requests import audio_to_text, get_response_choice, add_final_response, add_to_vector_store, store_conversation
from functions.database import store_messages, reset_messages
from functions.text_to_speech import convert_text_to_speech


# Initiate App
app = FastAPI()

# CORS - Origins (Domains to accepts) (Add front end local host url here later)
# 192.168.18.13
origins = [
    "http://192.168.18.13:8081",
    "http://localhost:8000",
]

# CORS - Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hellow World"}

# Checking of health
@app.get("/health")
async def check_health():
    return {"message": "Healthy!"}

@app.post("/post-audio/")
async def post_audio(file: UploadFile = File(...)):

    safe_filename = file.filename.replace(" ", "_")
    print(safe_filename)

    try:
        # Save file from Frontend
        with open(safe_filename, "wb") as buffer:
            buffer.write(await file.read())

        # Read the saved file and process it
        with open(safe_filename, "rb") as audio_input:
            text = audio_to_text(audio_input)

        # Ensure text was decoded
        if not text:
            return JSONResponse(status_code=400, content={"message": "Failed to decode audio"})

        print("Text converted is:", text)
        return {"message": "File processed successfully", "text": text}

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

# Transcribe audio and get chat gpt response
@app.post("/post-audio-response/")
async def post_audio_response(file: UploadFile = File(...), mute: str = Form(...), normal: str = Form(...), final_response: str = Form(...)):
    
    safe_filename = "recordings/" + file.filename.replace(" ", "_")
    print(safe_filename)

    try:
        start_audio_to_text = time.time()
        # Save file from Frontend
        with open(safe_filename, "wb") as buffer:
            buffer.write(await file.read())

        # Read the saved file and process it
        with open(safe_filename, "rb") as audio_input:
            text = audio_to_text(audio_input)

        # Ensure text was decoded
        if not text:
            return JSONResponse(status_code=400, content={"message": "Failed to decode audio"})
        audio_to_text_time = time.time() - start_audio_to_text
        print(f"Audio to text time: {audio_to_text_time} seconds")

        # Get ChatGPT Response
        start_get_response_choice = time.time()
        user_message_and_response = get_response_choice(mute, normal, final_response, text, search = True)
        get_response_choice_time = time.time() - start_get_response_choice

        response_choices = user_message_and_response[0]
        #print("response_choices:", response_choices)
        print(f"Get response choice time: {get_response_choice_time} seconds")

        responses = split_and_clean_responses(response_choices)

        #responses = response_choices.split('@')
                
        # if(len(responses) < 3):
        #     responses = response_choices.split('\n')

        if(len(responses) > 3):
            responses = responses[:3]

        #print(responses)

        # Guard: Ensure there was a response from chatgpt
        if not user_message_and_response:
            return HTTPException(status_code = 400, detail = "Failed to get chatgpt response")

        # Store messages
        store_messages(user_message_and_response[1], response_choices)

        # Total time
        total_process_time = time.time() - start_audio_to_text
        print(f"Total process time: {total_process_time} seconds")


        # if(selectedResponse):
        #     final_response = selectedResponse
        #     add_final_response(final_response) # Update final response globally

        #     print("Final response is: ", final_response)

            # Store in vectore store
            # if (final_response != "null"):
            #     print("entered")
               
            #     #add_to_vector_store(user_message_and_response[1], final_response)
               

        return {"message": "File processed successfully", "transcription": text, "response_choices": responses}

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
    
    
    

    # # Convert final response to audio
    # audio_output = convert_text_to_speech(final_response)

    # # Guard: Ensure text converted to audio
    # if not audio_output:
    #     return HTTPException(status_code = 400, detail = "Failed to convert text to audio")

    # # Create a generator that yield data
    # def iterfile():
    #     yield audio_output

    # # Return and save audio file:
    # #return StreamingResponse(iterfile(), media_type="audio/mpeg")
    # return StreamingResponse(iterfile(), media_type="application/octet-stream")

# Store conversation (Response selected and normal persons prompts/query)
@app.post("/store-response/")
async def store_response(mute: str = Form(...), normal: str = Form(...), query: str = Form(...), response: str = Form(...)):
    filename = f"C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\mockdata\\{mute}\\{normal}.json"
    store_conversation(filename, mute, normal, query, response)
    return {"message": "Conversation stored successfully"}

# Reset messages or conversation to start a new conversation
@app.get("/reset")
async def reset():
    reset_messages()
    return {"message": "Conversation has been resetted"}



# Post request for audio to chatgpt
# @app.post("/post-audio/")
# async def post_audio(file: UploadFile = File(...)):
#     print("Testing")


# Helper functions:
def split_and_clean_responses(input_string):
    # Split the string using the pattern "Response X:"
    responses = re.split(r'Response \d+:', input_string)
    
    # Remove the first empty item and strip whitespace and new lines from each response
    cleaned_responses = [response.strip() for response in responses if response]

    return cleaned_responses