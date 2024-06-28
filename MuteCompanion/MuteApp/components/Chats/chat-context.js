import { createContext, useReducer } from "react";

// Defining the chat structure
const initialState = {
  messages: [], // Dictionary containing text and choices
  replyChosen: [],
};

export const ChatContext = createContext({
  ...initialState,
  addMessage: (message) => {},
  chooseReply: (messageId, reply) => {},
});

function chatReducer(state, action) {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, {...action.payload, replyIndex: state.messages.length}],
      };
    case "CHOOSE_REPLY":
      return {
        ...state,
        replyChosen: [...state.replyChosen, {reply: action.payload, id: action.messageId}],
      };
    default:
      return state;
  }
}

function ChatContextProvider({ children }){
    const [chatState, dispatch] = useReducer(chatReducer, initialState);
    
    // message would be the dictionary containing text and choices
    function addMessage(message){
      dispatch({ type: "ADD_MESSAGE", payload: message });
    }
    
    // reply would be the choice made by the user
    function chooseReply(messageId, reply){
      dispatch({ type: "CHOOSE_REPLY", payload: reply, messageId: messageId});
    }

    const value = {
        ...chatState,
        addMessage: addMessage,
        chooseReply: chooseReply,
    };
    
    return (
        <ChatContext.Provider value={value}>
        {children}
        </ChatContext.Provider>
    );
}

export default ChatContextProvider;
