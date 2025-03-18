import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function LeaderboardScreen() {

  const scores = [
    { id: "1", username: "Alice", score: 1500 },
    { id: "2", username: "Bob", score: 1300 },
    { id: "3", username: "Charlie", score: 1100 },
    { id: "4", username: "David", score: 950 },
    { id: "5", username: "Emma", score: 850 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Meilleurs Scores</Text>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.scoreItem}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.score}>{item.score} pts</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 20,
    alignItems: "center",
    paddingTop : 100
  },
  title: {
    fontSize: 26,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  scoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    marginBottom: 10,
  },
  rank: {
    fontSize: 20,
    color: "gold",
    fontWeight: "bold",
  },
  username: {
    fontSize: 18,
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  score: {
    fontSize: 18,
    color: "lightgreen",
    fontWeight: "bold",
  },
});
