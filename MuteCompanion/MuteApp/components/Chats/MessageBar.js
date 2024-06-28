import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants/styles";
import { useState } from "react";


function MessageBar({ activeId, onSendMessage, onSendVoiceMessage, currentMessage, onChangeMessage, style }) {
  
  const [isRecording, setIsRecording] = useState(false);

  function handleRecording() {
    if (isRecording) {
      onSendVoiceMessage.stop();
      setIsRecording(false);
    } else {
      onSendVoiceMessage.start();
      setIsRecording(true);
    }
  }
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Send a message"
        value={currentMessage}
        onChangeText={onChangeMessage}
      />
      <TouchableOpacity onPress={() => onSendMessage(currentMessage, activeId)}>
        <Ionicons
          name="send"
          size={24}
          color={GlobalStyles.colors.primary100}
          style={styles.iconButton}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleRecording()}>
        <Ionicons
          name="mic"
          size={24}
          color={GlobalStyles.colors.primary100}
          style={styles.iconButton}
        />
      </TouchableOpacity>
    </View>
  );
}

export default MessageBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "lightgrey",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "grey",
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
  },
  iconButton: {
    padding: 10,
  },
});
