import openai
import json
from decouple import config

# Import custom function
from functions.database import get_previous_responses

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
loaded_faiss_vs_hf_v3 = FAISS.load_local("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\\vector_store\\vectorstores\\hugging_face\\faiss_vs_hf_v3", embeddings=embeddings, allow_dangerous_deserialization=True)

# Open_ai_vector store
loaded_faiss_vs = FAISS.load_local("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\\vector_store\\vectorstores\\faiss_vs", embeddings=embeddings, allow_dangerous_deserialization=True)

# Initialize variables
start = 0
final_response = ""

# Load documents
json_file_path = 'C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\backend\mockdata\\documents.json'

with open(json_file_path, 'r') as json_file:
    documents_json = json.load(json_file)

# Convert the JSON serializable format back to Document objects
documents = [
    Document(page_content=doc['page_content'], metadata=doc['metadata'])
    for doc in documents_json
]

print(f"Loaded {len(documents)} documents.")

# Initiate retrievers
retriever_vectordb = loaded_faiss_vs_hf_v3.as_retriever(search_kwargs={"k": 6})
keyword_retriever = BM25Retriever.from_documents(documents)
keyword_retriever.k =  3
ensemble_retriever = EnsembleRetriever(retrievers=[retriever_vectordb,keyword_retriever],
                                       weights=[0.7, 0.3])

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
def get_response_choice(message, search, failsafe_retriever = loaded_faiss_vs):
    global start
    global final_response
    messages = get_previous_responses(getTopic, ensemble_retriever, message, search, failsafe_retriever)
    #messages = get_previous_responses(loaded_faiss_vs, message, search)
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

# Adds the response and vectorizes
def add_to_vector_store(query, final_response):
    vectorized_response = {
        "John": query,
        "Roydon": final_response,
    }

    vectorized_response_str = json.dumps(vectorized_response)

    response_label = "Response 1"
    filename = "current_conversation.json"

    doc_metadata = {"label": response_label, "source": filename,  'file_name': filename}
    print(doc_metadata)

    try:
        response_document = Document(page_content=vectorized_response_str, metadata=doc_metadata)

    except Exception as e:
        print(e)
        return

    documents = [response_document]
    ids=[uuid4()]
    
    print(ids)

    #loaded_faiss_vs.add_documents(documents=documents, ids=ids)
    print("Added successfully")

    








