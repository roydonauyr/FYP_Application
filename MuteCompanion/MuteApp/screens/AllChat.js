import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import SearchBar from "../components/UI/SearchBar";

const chatData = [
  {
    id: "1",
    name: "John Boh",
    message: "Hows your day...",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\man1.jpg"),
  },
  {
    id: "2",
    name: "John Boh",
    message: "Hows your day...",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\man1.jpg"),
  },
  // Add more items as needed
];

function AllChat({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("Chat", { chatId: item.id, chatName: item.name })
      }
    >
      <Image source={item.imageUrl} style={styles.profilePic} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatSnippet}>{item.message}</Text>
      </View>
      <Text style={styles.chatTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchBar />
      <FlatList
        data={chatData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      {/* <View style = {styles.textContainer}>
        <Text style={styles.text}>Testing All Chat</Text>
      </View> */}
    </View>
  );
}

export default AllChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatSnippet: {
    fontSize: 14,
    color: "grey",
  },
  chatTime: {
    fontSize: 12,
    color: "grey",
  },
  // textContainer: {
  //   flex: 1, // Takes the remaining space after the SearchBar
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },

  // text: {
  //   fontSize: 16, // You can adjust the font size as needed
  //   textAlign: "center", // Ensures the text is centered if it wraps to a new line
  // },
});
