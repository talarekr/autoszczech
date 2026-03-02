import { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

export function RegisterScreen({ onBack }: { onBack: () => void }) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Imię" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Nazwisko" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="E-mail" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Hasło" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Zarejestruj" onPress={async () => {
        try { await register({ firstName, lastName, email, password }); } catch (e) { Alert.alert("Błąd", (e as Error).message); }
      }} />
      <View style={{ height: 8 }} />
      <Button title="Powrót" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9fafb" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
});
