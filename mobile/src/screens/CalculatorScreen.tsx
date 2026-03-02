import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export function CalculatorScreen() {
  const [chf, setChf] = useState("10000");
  const [rate, setRate] = useState("4.6");

  const pln = useMemo(() => Number(chf || 0) * Number(rate || 0), [chf, rate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalkulator CHF → PLN</Text>
      <TextInput style={styles.input} value={chf} onChangeText={setChf} keyboardType="numeric" placeholder="Kwota CHF" />
      <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="numeric" placeholder="Kurs" />
      <Text style={styles.result}>Wynik: {pln.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} PLN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 12 },
  result: { fontSize: 18, fontWeight: "700" },
});
