import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { api } from "../api/client";
import { CarListItem } from "../components/CarListItem";
import type { Car } from "../types";

export function HomeScreen({ onOpenCar }: { onOpenCar: (carId: number) => void }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCars().then(setCars).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={cars}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={<Text>Brak ofert.</Text>}
      renderItem={({ item }) => <CarListItem car={item} onPress={() => onOpenCar(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
