import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

export function LoginScreen({ onRegister }: { onRegister: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AutoSzczech iOS</Text>
      <TextInput style={styles.input} placeholder="E-mail" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Hasło" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Zaloguj" onPress={async () => {
        try { await login(email, password); } catch (e) { Alert.alert("Błąd", (e as Error).message); }
      }} />
      <View style={{ height: 8 }} />
      <Button title="Załóż konto" onPress={onRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9fafb" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
});
