import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";

import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import type { Favorite } from "../types";

export function FavoritesScreen() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const load = () => {
    if (!token) return;
    api.getFavorites(token).then(setFavorites).catch((e) => Alert.alert("Błąd", e.message));
  };

  useEffect(load, [token]);

  if (!token) return <View style={styles.center}><Text>Zaloguj się, aby zobaczyć ulubione.</Text></View>;

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={favorites}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.car.make} {item.car.model}</Text>
          <Button title="Usuń" onPress={async () => {
            try { await api.removeFavorite(token, item.car.id); load(); } catch (e) { Alert.alert("Błąd", (e as Error).message); }
          }} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  list: { padding: 12 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, marginBottom: 10 },
  title: { fontWeight: "700", marginBottom: 8 },
});
