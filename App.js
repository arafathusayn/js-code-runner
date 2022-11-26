import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import ReactNative, {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import {
  Provider as PaperProvider,
  DarkTheme,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { Button, TextInput } from "react-native-paper";

/**
 * @typedef {Object} File
 * @property {string} name
 * @property {string} content
 */

const storageKey = "files";

const defaultFiles = [
  {
    name: "Alert Example 1.js",
    content: `alert("Hello, World!");`,
  },
  {
    name: "Alert Example 2.js",
    content: `const { Alert } = this.ReactNative;
Alert.alert(
"Alert Title",
"My Alert Msg",
[
  {
    text: "Cancel",
    onPress: () => alert("Cancel Pressed"),
    style: "cancel"
  },
  { text: "OK", onPress: () => alert("OK Pressed") }
]);`,
  },
];

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const theme = {
  ...DarkTheme,
};

const initialCode = "\n".repeat(20);

export default function App() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState({
    name: `File_${Date.now()}.js`,
    content: initialCode,
  });

  const saveFiles = useCallback(async (files) => {
    await AsyncStorage.setItem(storageKey, JSON.stringify(files));
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);

      const savedFiles = JSON.parse(
        (json && json !== "[]" && json) || JSON.stringify(defaultFiles),
      );

      setFiles(savedFiles);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const tid = setTimeout(() => {
      loadFiles();
      clearTimeout(tid);
    }, 200);
  }, [loadFiles]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        animated={true}
        backgroundColor="#0d0515"
        barStyle="light-content"
      />

      <SafeAreaView style={styles.container}>
        <ScrollView>
          <TextInput
            label="File name"
            mode="outlined"
            placeholder="Enter file name"
            value={file.name}
            onChangeText={(text) =>
              setFile({
                name: text,
                content: file.content,
              })
            }
            style={{ width: screenWidth / 1.25 }}
            autoCompleteType
          />

          <TextInput
            multiline={true}
            label="Your code"
            mode="outlined"
            value={file.content}
            onChangeText={(text) =>
              setFile({
                name: file.name,
                content: text,
              })
            }
            onFocus={() => {
              if (file.content.trim() === "") {
                setFile({
                  name: file.name,
                  content: "",
                });
              }
            }}
            onBlur={() => {
              if (file.content.trim() === "") {
                setFile({
                  name: file.name,
                  content: initialCode,
                });
              }
            }}
            style={styles.codeTextInput}
            autoCompleteType
            autoCapitalize="none"
            textAlignVertical="top"
            editable
          />

          <Button
            style={styles.button}
            mode="contained"
            onPress={() => {
              try {
                (function () {
                  this.RN = ReactNative;
                  this.ReactNative = ReactNative;

                  eval(file.content);
                })();
              } catch (error) {
                alert(error);
              }
            }}
          >
            Run
          </Button>

          {file.content.trim() !== "" && (
            <Button
              style={styles.button}
              mode="contained"
              onPress={() => {
                try {
                  const foundFile = files.find((x) => x.name === file.name);

                  if (foundFile) {
                    const index = files.findIndex((x) => x.name === file.name);

                    files[index].content = file.content;

                    setFiles([...files]);
                    saveFiles([...files]);
                  } else {
                    setFiles([file, ...files]);
                    saveFiles([file, ...files]);
                  }
                } catch (error) {
                  alert(error);
                }
              }}
            >
              Save
            </Button>
          )}

          <View style={{ marginTop: 20 }}>
            {files.map((/** @type {File} */ x, i) => {
              return (
                <TouchableRipple
                  key={i}
                  onPress={() => {
                    const selectedFile = files[i];
                    setFile(selectedFile);
                  }}
                  onLongPress={() => {
                    Alert.alert("Confirm", "Do you want to delete this file?", [
                      {
                        text: "Cancel",
                        onPress: () => {
                          // no op
                        },
                        style: "cancel",
                      },
                      {
                        text: "OK",
                        onPress: () => {
                          files[i] = undefined;

                          setFiles([...files.filter((x) => x)]);
                          saveFiles([...files.filter((x) => x)]);
                        },
                      },
                    ]);
                  }}
                  style={{
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      borderWidth: 2,
                      borderRadius: 12,
                      borderColor: "white",
                      textAlign: "center",
                      padding: 2,
                    }}
                  >
                    {x.name}
                  </Text>
                </TouchableRipple>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingTop: (StatusBar.currentHeight || 0) + 5,
    backgroundColor: "#0d0515",
  },
  codeTextInput: {
    width: screenWidth / 1.25,
    // bug makes text centered
    // height: screenHeight / 2,
    margin: 10,
    marginLeft: 0,
    textAlignVertical: "top",
  },
  button: {
    width: screenWidth / 2,
    alignSelf: "center",
    margin: 10,
  },
});
