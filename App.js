import {
  StyleSheet,StatusBar,
  Text,
  View,
  Pressable,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import Music from "./music/cool.mp3";
// 🔔 Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: true,
  }),
});

export default function AlarmClock() {
  const [hourr, setHour] = useState("");
  const [minutee, setMinute] = useState("");
  const [ampm, setAmpm] = useState("");
  const [wakeTask, setWakeTask] = useState("");
  const [alarmList, setAlarmList] = useState([]);
  const [currentSound, setCurrentSound] = useState(null); // Track playing sound
  const [sound, setSound] = useState();

  async function stopSound() {
    sound.unloadAsync();
  }

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(Music);
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

  useEffect(() => {
    requestPermissions();
    getData();
    startAlarmChecker();
  }, []);

  async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Please enable notifications to use the alarm.");
    }
  }

  function startAlarmChecker() {
    setInterval(async () => {
      let now = new Date();
      let currentHour = now.getHours();
      let currentMinute = now.getMinutes();
      let ampm = currentHour >= 12 ? "pm" : "am";

      let formattedHour = currentHour % 12;
      formattedHour = formattedHour === 0 ? 12 : formattedHour;

      const storedAlarms = await AsyncStorage.getItem("alarmList");
      if (storedAlarms) {
        const alarms = JSON.parse(storedAlarms);
        alarms.forEach((alarm) => {
          if (
            parseInt(alarm.hour) === formattedHour &&
            parseInt(alarm.minute) === currentMinute &&
            alarm.ampm === ampm
          ) {
            triggerAlarm(alarm);
          }
        });
      }
    }, 60000);
  }

  async function triggerAlarm(alarm) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alarm ⏰",
        body: `It's ${alarm.hour}:${alarm.minute} ${alarm.ampm}! Wake up!`,
        sound: "default",
      },
      trigger: null,
    });
    playAlarmSound();
  }

  async function playAlarmSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("./music/cool.mp3")
    );
    setCurrentSound(sound);
    await sound.playAsync();
  }

  async function stopAlarmSound() {
    if (currentSound) {
      await currentSound.stopAsync();
      setCurrentSound(null);
    }
  }

  async function scheduleAlarm() {
    if (!hourr || !minutee || !ampm || !wakeTask) {
      Alert.alert("Error", "Please enter all fields and select a wake task.");
      return;
    }

    const hourNum = parseInt(hourr);
    const minuteNum = parseInt(minutee);

    if (isNaN(hourNum) || hourNum < 1 || hourNum > 12) {
      Alert.alert("Invalid Input", "Hour must be between 1 and 12.");
      return;
    }

    if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
      Alert.alert("Invalid Input", "Minutes must be between 0 and 59.");
      return;
    }

    const newAlarm = { hour: hourr, minute: minutee, ampm, wakeTask };
    const updatedAlarms = [...alarmList, newAlarm];

    setAlarmList(updatedAlarms);
    await AsyncStorage.setItem("alarmList", JSON.stringify(updatedAlarms));

    setHour("");
    setMinute("");
    setAmpm("");
    setWakeTask("");
  }

  async function getData() {
    const storedAlarms = await AsyncStorage.getItem("alarmList");
    if (storedAlarms) setAlarmList(JSON.parse(storedAlarms));
  }

  async function turnOffAlarm(index) {
    const updatedAlarms = alarmList.filter((_, i) => i !== index);
    setAlarmList(updatedAlarms);
    await AsyncStorage.setItem("alarmList", JSON.stringify(updatedAlarms));
    stopAlarmSound();
  }

  const renderItem = ({ item, index }) => (
    <View style={styles.alarmItem}>
      <Text style={styles.alarmText}>
        {item.hour}:{item.minute} {item.ampm} - {item.wakeTask}
      </Text>
      <Pressable style={styles.button} onPress={() => turnOffAlarm(index)}>
        <Text style={styles.buttonText}>Turn off</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar/>
      <View style={
        {
          backgroundColor: "#f5f5f5",
          padding: 10,
          marginVertical: 10,
          borderRadius: 10,
          flexDirection: "row",
        }
      }>
        <Pressable style={styles.radioButton} onPress={playSound}>
          <Text style={styles.radioText}>Listen</Text>
        </Pressable>
        <Pressable style={styles.radioButton} onPress={stopSound}>
          <Text style={styles.radioText}>stop</Text>
        </Pressable>
      </View>

      <Text style={styles.header}>Alarm App</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="00 hrs"
          value={hourr}
          onChangeText={setHour}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.textInput}
          placeholder="00 mins"
          value={minutee}
          onChangeText={setMinute}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.radioContainer}>
        <Pressable
          style={[styles.radioButton, ampm === "am" && styles.radioSelected]}
          onPress={() => setAmpm("am")}
        >
          <Text style={styles.radioText}>AM</Text>
        </Pressable>
        <Pressable
          style={[styles.radioButton, ampm === "pm" && styles.radioSelected]}
          onPress={() => setAmpm("pm")}
        >
          <Text style={styles.radioText}>PM</Text>
        </Pressable>
      </View>

      <View style={styles.optioncontainer}>
        <Pressable
          style={[
            styles.radioButton,
            wakeTask === "blowair" && styles.radioSelected,
          ]}
          onPress={() => setWakeTask("blowair")}
        >
          <Text style={styles.radioText}>Blow Air</Text>
        </Pressable>
        <Pressable
          style={[
            styles.radioButton,
            wakeTask === "shake" && styles.radioSelected,
          ]}
          onPress={() => setWakeTask("shake")}
        >
          <Text style={styles.radioText}>Shake to Wake</Text>
        </Pressable>
        <Pressable
          style={[
            styles.radioButton,
            wakeTask === "smileselfie" && styles.radioSelected,
          ]}
          onPress={() => setWakeTask("smileselfie")}
        >
          <Text style={styles.radioText}>Smile Selfie</Text>
        </Pressable>
        <Pressable
          style={[
            styles.radioButton,
            wakeTask === "solvemath" && styles.radioSelected,
          ]}
          onPress={() => setWakeTask("solvemath")}
        >
          <Text style={styles.radioText}>Maths</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={scheduleAlarm}>
        <Text style={styles.buttonText}>Set Alarm</Text>
      </Pressable>

      <FlatList
        data={alarmList}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  music: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    width: "90%",
  },
  optioncontainer: {
    justifyContent: "start",
    height:"auto",
    marginBottom: 10,
    width: "80%",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "teal",
    margin: 20,
    fontSize: 40,
    fontWeight: "bold",
  },
  button: {
    width: "70%",
    backgroundColor: "teal",
    borderRadius: 18,
    margin: 15,
    padding: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  textInput: {
    fontSize: 20,
    margin: 5,
    borderBottomWidth: 1,
    width: "40%",
    textAlign: "center",
  },
  alarmItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  alarmText: {
    fontSize: 20,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  radioButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    alignItems: "center",
  },
  radioSelected: {
    backgroundColor: "teal",
  },
  radioText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "80%",
  },
});
