import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";

import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import type { Offer } from "../types";

export function MyOffersScreen() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    if (!token) return;
    api.myOffers(token).then(setOffers).catch((e) => Alert.alert("Błąd", e.message));
  }, [token]);

  if (!token) return <View style={styles.center}><Text>Zaloguj się, aby zobaczyć swoje oferty.</Text></View>;

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={offers}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.car.make} {item.car.model}</Text>
          <Text>Kwota: {item.amount} PLN</Text>
          <Text>{new Date(item.createdAt).toLocaleString("pl-PL")}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>Nie masz jeszcze ofert.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  list: { padding: 12 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, marginBottom: 10 },
  title: { fontWeight: "700", marginBottom: 6 },
});
