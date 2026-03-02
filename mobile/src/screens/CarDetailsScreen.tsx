import { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import type { Car } from "../types";

export function CarDetailsScreen({ carId }: { carId: number }) {
  const { token } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getCar(carId).then(setCar);
  }, [carId]);

  if (!car) return <View style={styles.container}><Text>Ładowanie...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{car.make} {car.model}</Text>
      <Text>ID: {car.displayId}</Text>
      <Text>Rok: {car.year}</Text>
      <Text>Przebieg: {car.mileage} km</Text>
      <Text>Cena wywoławcza: {car.price ? `${car.price} PLN` : "brak"}</Text>
      <Text>{car.description || "Brak opisu"}</Text>
      <View style={{ height: 12 }} />
      <Button title="Dodaj do ulubionych" onPress={async () => {
        if (!token) return Alert.alert("Wymagane logowanie");
        try { await api.addFavorite(token, car.id); Alert.alert("Dodano"); } catch (e) { Alert.alert("Błąd", (e as Error).message); }
      }} />
      <View style={{ height: 16 }} />
      <Text style={styles.subtitle}>Złóż ofertę</Text>
      <TextInput style={styles.input} placeholder="Kwota (PLN)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Wiadomość" value={message} onChangeText={setMessage} />
      <Button title="Wyślij ofertę" onPress={async () => {
        if (!token) return Alert.alert("Wymagane logowanie");
        try {
          await api.placeOffer(token, { carId: car.id, amount: Number(amount), message });
          Alert.alert("Sukces", "Oferta została wysłana");
        } catch (e) { Alert.alert("Błąd", (e as Error).message); }
      }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 12 },
});
