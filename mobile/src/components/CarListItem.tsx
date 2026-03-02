import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Car } from "../types";

export function CarListItem({ car, onPress }: { car: Car; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{car.make} {car.model}</Text>
      <Text>Rocznik: {car.year} • Przebieg: {car.mileage} km</Text>
      <Text>Cena: {car.price ? `${car.price.toLocaleString("pl-PL")} PLN` : "Do ustalenia"}</Text>
      <Text>Nr aukcji: {car.displayId}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
});
