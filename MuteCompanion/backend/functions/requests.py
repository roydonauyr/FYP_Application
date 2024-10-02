import openai
import json
import os
from decouple import config

# Import custom function
from functions.database import get_previous_responses, get_stored_topic, store_documents

# Import vector store embeddings
from langchain_openai.embeddings import AzureOpenAIEmbeddings
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from uuid import uuid4

# Ensemble retrieval and filters
import nltk
from langchain.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain.retrievers import BM25Retriever, EnsembleRetriever


# Environment variables
# nltk.download('punkt')
#nltk.download('wordnet')
#nltk.download('averaged_perceptron_tagger')
openai.organisation = config("OPEN_AI_ORG")
openai.api_key = config("OPEN_AI_KEY")

# embeddings = AzureOpenAIEmbeddings(azure_endpoint=config('AZURE_OPENAI_ENDPOINT'), 
#                                    api_key=config('AZURE_OPENAI_APIKEY'), 
#                                    model=config('TEXT_EMBEDDING_MODEL_NAME'),
#                                    azure_deployment=config('TEXT_EMBEDDING_DEPLOYMENT_NAME'))

embeddings=HuggingFaceInferenceAPIEmbeddings(
    api_key=config('HUGGING_FACE_ACCESS_TOKEN'),
    model_name='BAAI/bge-base-en-v1.5'
)

# Hugging face embeddings vector store
global loaded_faiss_vs_hf_v3
global documents_json
global documents

json_file_path = 'C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\mockdata\\documents.json'

# Open_ai_vector store
loaded_faiss_vs = FAISS.load_local("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\\vector_store\\vectorstores\\faiss_vs", embeddings=embeddings, allow_dangerous_deserialization=True)

# Initialize variables
#start = 0
#final_response = ""

# Load documents
# json_file_path = 'C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\mockdata\\documents.json'

# Initiate retrievers
global retriever_vectordb
global keyword_retriever
global ensemble_retriever

def initialize_variables(json_file_path=json_file_path):
    global loaded_faiss_vs_hf_v3
    global documents_json
    global documents

    # Retrievers
    global retriever_vectordb
    global keyword_retriever
    global ensemble_retriever


    loaded_faiss_vs_hf_v3 = FAISS.load_local("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\\vector_store\\vectorstores\\hugging_face\\faiss_vs_hf_v3", embeddings=embeddings, allow_dangerous_deserialization=True)
    with open(json_file_path, 'r') as json_file:
        documents_json = json.load(json_file)
    
    # Convert the JSON serializable format back to Document objects
    documents = [
        Document(page_content=doc['page_content'], metadata=doc['metadata'])
        for doc in documents_json
    ]

    print(f"Loaded {len(documents)} documents.")

    # Initialize the retrievers
    retriever_vectordb = loaded_faiss_vs_hf_v3.as_retriever(search_kwargs={"k": 6})
    keyword_retriever = BM25Retriever.from_documents(documents)
    keyword_retriever.k =  3
    ensemble_retriever = EnsembleRetriever(retrievers=[retriever_vectordb,keyword_retriever],
                                        weights=[0.7, 0.3])
    
#--------------------------------------------- Initialize variables ---------------------------------------------

# Initialize variables
initialize_variables()

#--------------------------------------------- Helper Functions ---------------------------------------------

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


def getTopic(meta_content, query):
    # Learning instructions
    instruction = {
        "role": "system",
        "content": meta_content,
    }

    #print("Query is: " + query)

    # Initialize messages
    messages_topic = []

    # Add learn instruction to message array
    messages_topic.append(instruction)

    user_message = {
            "role": "user",
            "content": query
    }

    messages_topic.append(user_message)

    try:
        raw_response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages = messages_topic,
        )
        topic = raw_response.choices[0].message.content

        return topic
    except Exception as e:
        print(e)
        return




# Get chatgpt assistant responses
# message input is the audio input from
# Output: 3 response choices, user message content
def get_response_choice(mute, normal, final_response, message, search, failsafe_retriever = loaded_faiss_vs):
    global start
    #global final_response
    messages = get_previous_responses(getTopic, ensemble_retriever, message, search, failsafe_retriever)
    user_message = {}
  
    # Editing user_message based on response user picked. At the start, user does not need to pick
    # What you send in to chat gpt

    # if start == 0:
    #     start += 1
    #     #print("entered once")
    #     user_message = {
    #         "role": "user",
    #         "content": f"{normal} says: " + message
    #     }
    # else:
    #print("Entered second time")
    user_message = {
        "role": "user",
        "content": f"{mute} says: " + final_response + f"{normal} says: " + message
    }

    messages.append(user_message)
    # print(messages)
    # print("Start is: " + str(start))

    try:
        raw_response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages = messages 
        )
        #print(raw_response)
    
        # Split response choices for user to pick
        response_choices = raw_response.choices[0].message.content
        print("User message is: ", user_message["content"])
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

# Add conversation into respective person's json
def store_conversation(filename, mute, normal, query, response):
    try:
        # Load existing data from the JSON file
        if os.path.exists(filename):
            with open(filename, "r") as file:
                data = json.load(file)
        else:
            data = {}

        # Determine the next response number
        next_response_number = len(data) + 1
        response_key = f"Response {next_response_number}"

        # Append new response
        data[response_key] = {
            normal: query,
            mute: response
        }

        with open(filename, "w") as file:
            json.dump(data, file, indent=4)

        # Vector store adding
        add_to_vector_store(filename, mute, normal, query, response, get_stored_topic(), response_key)

        return {"message": "Response stored successfully"}

    except Exception as e:
       print("Error is:", e)
       return

# Adds the response and vectorizes
def add_to_vector_store(filename, mute, normal, query, response, topic, response_key):
    vectorized_response = {
        f"{normal}": query,
        f"{mute}": response,
    }

    vectorized_response_str = json.dumps(vectorized_response)
    vector_id = uuid4()

    doc_metadata = {"label": response_key, "source": filename,  'file_name': filename, 'topic': topic, 'id': vector_id}
    print(doc_metadata)

    try:
        response_document = Document(page_content=vectorized_response_str, metadata=doc_metadata)
    except Exception as e:
        print(e)
        return

    documents = [response_document]
    ids=[vector_id]

    loaded_faiss_vs_hf_v3.add_documents(documents=documents, ids=ids)
    loaded_faiss_vs_hf_v3.save_local("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\\vector_store\\vectorstores\\hugging_face\\faiss_vs_hf_v3_new") # Remember to save else when reinitialize, variables gone
    print("Vector Added successfully")

    # Add to documents list
    store_documents(json_file_path= json_file_path, page_content=vectorized_response, meta_data=doc_metadata)

    # Reinitialize variables for reuse
    initialize_variables()

def delete_from_vector_store(source):
    # Search vector store to delete
    results = loaded_faiss_vs_hf_v3.similarity_search(
        "",
        k=1,
        filter={"source": source},
    )

    result_id = results[0].metadata['id']

    # Delete from vector store
    loaded_faiss_vs_hf_v3.delete(ids=[result_id])
    loaded_faiss_vs_hf_v3.save_local("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\\vector_store\\vectorstores\\hugging_face\\faiss_vs_hf_v3_new") # Remember to save else when reinitialize, variables gone
    print("Deleted successfully")

    # Reinitialize variables for reuse
    initialize_variables()






    








