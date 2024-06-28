import { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { GlobalStyles } from "../../constants/styles";

//Context
import { ChatContext } from "./chat-context";

function ChatDisplay({ messageId, responses, onChooseReply }) {

  const  chatCtx = useContext(ChatContext);

  // Find the selected response for the current message
  const selectedResponse = chatCtx.replyChosen.find((reply) => reply.id === messageId)?.reply;

  function handleResponseSelection(response) {
    onChooseReply(messageId, response);
  }

  return (
    <View style={styles.container}>
      {responses.map((response, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.responseButton}
          onPress={() => handleResponseSelection(response)}
        >
          <Text style={styles.responseText}>{response}</Text>
        </TouchableOpacity>
      ))}
      {selectedResponse && (
        <Text style={styles.selectedResponseText}>{selectedResponse}</Text>
      )}
    </View>
  );
}

export default ChatDisplay;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    backgroundColor: '#fff', // Optional: changes background of the response area
    padding: 10,
    borderRadius: 10, // Rounded corners for the container
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  responseButton: {
    backgroundColor: GlobalStyles.colors.primary100,
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    width: '80%', // Makes buttons occupy only 80% of the width
    alignSelf: 'center', // Centers button in the container
  },
  responseText: {
    color: "white",
    textAlign: 'center', // Center align text within the button
  },
  selectedResponseText: {
    marginTop: 10,
    fontSize: 16,
    color: GlobalStyles.colors.primary100,
    textAlign: 'center', // Center align the selected response text
    paddingTop: 5,
    borderTopWidth: 1, // Adds a line above the selected response
    borderTopColor: GlobalStyles.colors.primary100,
  },
});
