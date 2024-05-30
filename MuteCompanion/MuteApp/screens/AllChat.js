import { Text, View, StyleSheet } from "react-native";
import SearchBar from "../components/UI/SearchBar";

function AllChat() {
  return (
    <View style={styles.container}>
      <SearchBar />
      <View style = {styles.textContainer}>
        <Text style={styles.text}>Testing All Chat</Text>
      </View>
    </View>
  );
}

export default AllChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 1, // Takes the remaining space after the SearchBar
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16, // You can adjust the font size as needed
    textAlign: "center", // Ensures the text is centered if it wraps to a new line
  },
});
