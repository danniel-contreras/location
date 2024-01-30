import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("auth.db");

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS UserLocation (id INTEGER PRIMARY KEY AUTOINCREMENT, latitude REAL, longitude REAL, timestamp INTEGER, username TEXT, uuid TEXT)"
    );
  });
};

export const insertLocation = (
  latitude: number,
  longitude: number,
  timestamp: number,
  username: string,
  uuid: string
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO UserLocation (latitude, longitude, timestamp, username, uuid) VALUES (?, ?, ?, ?, ?)",
      [latitude, longitude, timestamp, username, uuid]
    );
  });
};

export const get_by_uuid = (uuid: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM UserLocation WHERE uuid = ?",
        [uuid],
        (_, { rows }) => resolve(rows._array),
      );
    });
  });
};

export const emptyUserLocation = () => {
  db.transaction((tx) => {
    tx.executeSql("DELETE FROM UserLocation");
  });
};

export default db;
