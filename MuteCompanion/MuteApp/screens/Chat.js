import { View, ScrollView, Text, StyleSheet } from "react-native";
import MessageBar from "../components/Chats/MessageBar";
import ChatDisplay from "../components/Chats/ChatDisplay";

//Imports for state
import { act, useContext, useState } from "react";
import { ChatContext } from "../components/Chats/chat-context";

// For Audio
import { Audio } from "expo-av";

//Axios
import axios from "axios";

function Chat() {
  const chatCtx = useContext(ChatContext);
  const [currentMessage, setCurrentMessage] = useState(""); // To store the users input of message if there is
  const [activeId, setActiveId] = useState(null); // To store the active message id
  const [recording, setRecording] = useState(); // Audio Recording

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      const { status } = await Audio.requestPermissionsAsync();
      if (status === "granted") {
        console.log("Microphone permissions granted.");
      } else {
        console.log("Microphone permissions denied.");
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");

    if (!recording) {
      console.error("No recording to stop.");
      return;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(undefined);
    console.log("Recording stopped and stored at", uri);
    return uri;
  }

  async function uploadAudio(uri, recordingId, selectedResponse) {
    const formData = new FormData();
    var recording_name = `recording_${recordingId}.m4a`;
    formData.append("file", {
      uri: uri,
      name: recording_name, // Ensure the file extension is correct
      type: "audio/m4a", // Make sure MIME type matches the file type
    });

    // Add selected response if not null
    formData.append("selectedResponse", selectedResponse);

    try {
      const response = await axios.post(
        "http://192.168.18.13:8000/post-audio-response/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading the audio:", error);
      return "";
    }
  }



  async function voiceMessage() {
    const uri = await stopRecording();
    if (!uri) {
      console.log("Recording did not finish properly.");
      return;
    }

    var selectedResponse = null;

    if (chatCtx.replyChosen.length > 0) {
      selectedResponse = chatCtx.replyChosen[chatCtx.replyChosen.length - 1].reply;
    }

    const result = await uploadAudio(uri, chatCtx.messages.length, selectedResponse);
    console.log("Transcribed text:", result.transcription);

    const newMessage = {
      id: chatCtx.messages.length,
      text: result.transcription || "No transcription available",
      responses: result.response_choices,
    };

    console.log("New message:", newMessage);

    chatCtx.addMessage(newMessage);
    setCurrentMessage(""); // Clear message after sending\
    setActiveId(newMessage.id); // Set the active message id
  }

  function sendMessage(reply, messageId) {
    const isAlreadyChosen = chatCtx.replyChosen.some(
      (item) => item.id === messageId
    );

    if (isAlreadyChosen) {
      setCurrentMessage("");
      console.log("Response already chosen for this message");
      return;
    }

    chatCtx.chooseReply(messageId, reply);
    setCurrentMessage("");
    console.log("Response list:", chatCtx.replyChosen);
  }

  function chooseReply(messageId, reply) {
    const isAlreadyChosen = chatCtx.replyChosen.some(
      (item) => item.id === messageId
    );

    if (isAlreadyChosen) {
      console.log("Response already chosen for this message");
      return;
    }
    chatCtx.chooseReply(messageId, reply);
    console.log("Response list:", chatCtx.replyChosen);
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {chatCtx.messages.map((msg) => (
          <View key={msg.id} style={styles.messageBlock}>
            <Text style={[styles.messageText, styles.textBubble]}>
              {msg.text}
            </Text>
            <ChatDisplay
              messageId={msg.id}
              responses={msg.responses}
              onChooseReply={chooseReply}
            />
          </View>
        ))}
      </ScrollView>
      <MessageBar
        activeId={activeId}
        onSendMessage={sendMessage}
        onSendVoiceMessage={{ start: startRecording, stop: voiceMessage }}
        currentMessage={currentMessage}
        onChangeMessage={setCurrentMessage}
        style={styles.messageBar}
      />
    </View>
  );
}

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f8", // Light grey background
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBar: {
    padding: 10,
  },
  messageBlock: {
    marginBottom: 20, // Adds space between each message block
  },
  textBubble: {
    backgroundColor: "#e8eaf6", // Light blue background for the bubble
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
    alignSelf: "flex-start",
    marginLeft: 10,
    marginRight: 10,
    overflow: "hidden",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    textAlign: "left", // Aligns text to the left
    marginRight: 20, // Ensures text doesn't stick to the edge
    marginBottom: 20, // Space before the responses
  },
});
