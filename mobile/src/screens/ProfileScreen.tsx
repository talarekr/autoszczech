import { Button, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      {user ? (
        <>
          <Text>{user.firstName} {user.lastName}</Text>
          <Text>{user.email}</Text>
          <Text>Rola: {user.role}</Text>
          <View style={{ height: 12 }} />
          <Button title="Wyloguj" onPress={() => void logout()} />
        </>
      ) : (
        <Text>Nie jesteś zalogowany.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
});
