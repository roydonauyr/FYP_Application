import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import SearchBar from "../components/UI/SearchBar";

// Data for the chat items
import garyData from "../assets/mockdata/Yu Min/Gary.json";
import jacksonData from "../assets/mockdata/Yu Min/Jackson.json";
import maryData from "../assets/mockdata/Yu Min/Mary.json";
import mattData from "../assets/mockdata/Yu Min/Matt.json";
import nattyData from "../assets/mockdata/Yu Min/Natty.json";
import xavierData from "../assets/mockdata/Yu Min/Xavier.json";

const chatData = [
  {
    id: "1",
    name: "Gary Lim",
    message: "Hows your day...",
    allMessages: garyData,
    chatType: "historical",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\man1.jpg"),
  },
  {
    id: "2",
    name: "Jackson Tan",
    message: "Hows your day...",
    allMessages: jacksonData,
    chatType: "historical",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\man2.jpg"),
  },
  {
    id: "3",
    name: "Mary Tan",
    message: "Hows your day...",
    allMessages: maryData,
    chatType: "historical",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\woman1.jpg"),
  },
  {
    id: "4",
    name: "Matt Boey",
    message: "Hows your day...",
    allMessages: mattData,
    chatType: "historical",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\man3.jpg"),
  },
  {
    id: "5",
    name: "Natty Toh",
    message: "Hows your day...",
    allMessages: nattyData,
    chatType: "historical",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\woman2.jpg"),
  },
  {
    id: "6",
    name: "Xavier Oh",
    message: "Hows your day...",
    allMessages: xavierData,
    chatType: "historical",
    time: "9:00 pm",
    imageUrl: require("C:\\Roydon\\Github\\FYP_Application\\MuteCompanion\\MuteApp\\assets\\man4.jpg"),
  },
];

function AllChat({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("Chat", {
          chatId: item.id,
          chatName: item.name,
          allMessages: item.allMessages,
          chatType: item.chatType,
        })
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
