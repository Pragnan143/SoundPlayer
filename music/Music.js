import { useEffect, useState } from "react";
import { View, StyleSheet, Button, Text, FlatList } from "react-native";
import { Audio } from "expo-av";
import Sound1 from "./cool.mp3";
// const SoundCard = (name ) => {
//   //add your music here
//   useEffect(() => {
//    console.log(name)
//   }, []);
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         marginBottom: 10,
//         backgroundColor: "red",
//       }}
//     >
//       <Text>{name}</Text>
//     </View>
//   );
// };

// const data = [
//   { key: 1, name: "Sound 1" },
//   { key: 2, name: "Sound 2" },
//   { key: 3, name: "Sound 3" },
//   { key: 4, name: "Sound 4" },
//   { key: 5, name: "Sound 5" },
//   { key: 6, name: "Sound 6" },
//   { key: 7, name: "Sound 7" },
//   { key: 8, name: "Sound 8" },
//   { key: 9, name: "Sound 9" },
//   { key: 10, name: "Sound 10" },
// ];
export default function App() {
  const [sound, setSound] = useState();

  async function stopSound() {
    sound.unloadAsync();
  }

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(Sound1);
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      {/* Select Music */}.
      {/* <FlatList
       keyExtractor={(item) => item.key}
        data={data}
        renderItem={(item) => <SoundCard name={item.name} />}
        s tyle={styles.Flatcontainer}
      /> */}
      <Button title="Play Sound" onPress={playSound} /> 
      <Button title="Stop Sound" onPress={stopSound} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
    gap: 5,
  },
  Flatcontainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
});
