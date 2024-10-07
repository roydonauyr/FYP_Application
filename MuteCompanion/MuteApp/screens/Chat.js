import { View, ScrollView, Text, StyleSheet } from "react-native";
import MessageBar from "../components/Chats/MessageBar";
import ChatDisplay from "../components/Chats/ChatDisplay";

//Imports for state
import { useNavigation } from '@react-navigation/native';
import { useContext, useState, useEffect, useRef } from "react";
import { ChatContext } from "../components/Chats/chat-context";

// For Audio
import { Audio } from "expo-av";

//Axios
import axios from "axios";

function Chat({ route }) {
  const scrollViewRef = useRef(null); // For starting at the very end of messages
  const navigation = useNavigation(); 
  const chatCtx = useContext(ChatContext);
  const [historicalChatMessages, setHistoricalChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(""); // To store the users input of message if there is
  const [activeId, setActiveId] = useState(null); // To store the active message id
  const [recording, setRecording] = useState(); // Audio Recording
  const [normalPersonName, setnormalPersonName] = useState(null);
  const [muteUserName, setmuteUserName] = useState("Yu Min");
  const [selectedResponse, setSelectedResponse] = useState(null);

  // Function to convert JSON data to chat messages type
  const convertToChatMessages = (data) => {
    const messages = [];
    let idCounter = 1;

    setnormalPersonName(route.params?.chatName.split(" ")[0]);

    Object.keys(data).forEach((key) => {
      const responseSet = data[key];
      Object.keys(responseSet).forEach((speaker) => {
        messages.push({
          id: String(idCounter++), // ensure unique ID, convert number to string
          name: speaker,
          text: responseSet[speaker],
          type: "historical",
        });
      });
    });

    return messages;
  };

  // Handles initiation of messages
  useEffect(() => {
    if (route.params?.allMessages) {
      const historicalMessages = convertToChatMessages(
        route.params.allMessages
      );
      setHistoricalChatMessages(historicalMessages);
    } else {
      setHistoricalChatMessages([]);
    }
  }, [route.params?.allMessages]);

  // Handles the back button press
  useEffect(() => {
    const backHandler = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault(); // Prevent default behavior of leaving the screen
      chatCtx.clearMessages(); // Clear messages
      navigation.dispatch(e.data.action); // Proceed with the original action
    });

    return backHandler; // Cleanup the listener
  }, [navigation, chatCtx]);

  // To render a combined view of historical and current messages
  const renderMessageItem = (msg) => {
    const isRightAligned = msg.id % 2 === 1;
    const messageStyle = isRightAligned
      ? styles.messageRight
      : styles.messageLeft;

    if (msg.type === "historical") {
      return (
        <View key={msg.id} style={[styles.messageBlock]}>
          <Text style={[styles.messageText, styles.textBubble, messageStyle]}>
            {msg.text}
          </Text>
        </View>
      );
    } else {
      return (
        <View key={msg.key} style={styles.messageBlock}>
          <Text style={[styles.messageText, styles.textBubble]}>
            {msg.text}
          </Text>
          <ChatDisplay
            messageId={msg.id}
            responses={msg.responses}
            onChooseReply={chooseReply}
          />
        </View>
      );
    }
  };

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

  async function uploadAudio(uri, recordingId, mute = muteUserName, normal= normalPersonName, final_response = selectedResponse) {
    const formData = new FormData();
    var recording_name = `recording_${recordingId}.m4a`;
    formData.append("file", {
      uri: uri,
      name: recording_name, // Ensure the file extension is correct
      type: "audio/m4a", // Make sure MIME type matches the file type
    });

    // Add selected response if not null
    formData.append("mute", mute);
    formData.append("normal", normal);
    formData.append("final_response", final_response);

    //192.168.18.13
    //192.168.1.16
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

  async function voiceMessage(selectedResponse = selectedResponse) {
    const uri = await stopRecording();
    if (!uri) {
      console.log("Recording did not finish properly.");
      return;
    }

    // var selectedResponse = null;

    // if (chatCtx.replyChosen.length > 0) {
    //   selectedResponse =
    //     chatCtx.replyChosen[chatCtx.replyChosen.length - 1].reply;
    // }

    const result = await uploadAudio(
      uri,
      chatCtx.messages.length,
      selectedResponse
    );
    console.log("Transcribed text:", result.transcription);

    const newMessage = {
      key: historicalChatMessages.length + chatCtx.messages.length + 1,
      id: chatCtx.messages.length, // used for finding response selection
      text: result.transcription || "No transcription available",
      responses: result.response_choices,
      type: "current",
    };

    console.log("New message:", newMessage);

    chatCtx.addMessage(newMessage);
    setCurrentMessage(""); // Clear message after sending\
    setActiveId(newMessage.id); // Set the active message id
  }

  function chooseReply(messageId, reply, mute = muteUserName, normal= normalPersonName) {
    const isAlreadyChosen = chatCtx.replyChosen.some(
      (item) => item.id === messageId
    );

    if (isAlreadyChosen) {
      console.log("Response already chosen for this message");
      return;
    }
    chatCtx.chooseReply(messageId, reply);
    setSelectedResponse(reply);

    const query = chatCtx.messages.find(msg => msg.id === messageId).text;

    // To fix logic of new person later, for now assume will not be null
    //console.log("Normal Person Name:", normalPersonName);
     // API call to the backend to store the conversation
    const formData = new FormData();
    
    // Add form data in
    formData.append("mute", mute);
    formData.append("normal", normal);
    formData.append("query", query);
    formData.append("response", reply);

    //192.168.18.13
    //192.168.1.16
    try {
      axios.post(
        "http://192.168.18.13:8000/store-response/", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      //console.log("Upload successful!");
      return;
    } catch (error) {
      console.error("Error Saving Conversation:", error);
      return "";
    }
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

    chooseReply(messageId, reply);
    setCurrentMessage("");
    console.log("Response list:", chatCtx.replyChosen);
  }


  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({ animated: true })
        }
      >
        {historicalChatMessages.concat(chatCtx.messages).map(renderMessageItem)}
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
  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#e8eaf6",
  },
  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#d0d9e8",
  },
  textBubble: {
    // Light blue background for the bubble
    backgroundColor: "#e8eaf6",
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
