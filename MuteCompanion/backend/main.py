#uvicorn main:app --reload
#.\venv\Scripts\activate.ps1

# Main imports
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
import openai

# Custom functions import
from functions.requests import audio_to_text, get_response_choice, add_final_response
from functions.database import store_messages, reset_messages
from functions.text_to_speech import convert_text_to_speech

# Initiate App
app = FastAPI()

# CORS - Origins (Domains to accepts) (Add front end local host url here later)
origins = [

]

# CORS - Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

# Transcribe audio and get chat gpt response
@app.get("/post-audio-get/")
async def get_audio():
# @app.post("/post-audio/")
# async def post_audio(file: UploadFile = File(...)):

    # Get saved audio
    audio_input = open("voice_test/voice_test.mp3", "rb")

    # # Save file from Frontend
    # with open(file.filename, "wb") as buffer:
    #     buffer.write(file.file.read())

    # audio_input = open(file.filename, "rb")

    # Decoding audio
    text = audio_to_text(audio_input)
   
    # Guard: Ensure message was decoded:
    if not text:
        return HTTPException(status_code = 400, detail = "Failed to decode audio")
    
    print("text converted is: " + text)
    
    # Get ChatGPT Response
    user_message_and_response = get_response_choice(text)
    response_choices = user_message_and_response[0]
    responses = response_choices.split('@')
    if(len(responses) < 3):
        responses = response_choices.split('\n')
    print(responses)

    # Guard: Ensure there was a response from chatgpt
    if not user_message_and_response:
        return HTTPException(status_code = 400, detail = "Failed to get chatgpt response")

    # Store messages
    #store_messages(user_message_and_response[1], response_choices)

    final_response = responses[0]
    add_final_response(final_response) # Assume use pick the first response

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

    return "Completed"

# Reset messages or conversation to start a new conversation
@app.get("/reset")
async def reset():
    reset_messages()
    return {"message": "Conversation has been resetted"}



# Post request for audio to chatgpt
# @app.post("/post-audio/")
# async def post_audio(file: UploadFile = File(...)):
#     print("Testing")