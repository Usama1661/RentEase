import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const UserDetailsScreen = ({ route }) => {
  const { userData } = route.params;

  return (
    <View style={styles.container}>
      <Image style={styles.profilePicture} source={{ uri: userData.ProfilePicture || 'fallback_image_url' }} />
      <Text style={styles.userName}>{userData.UserName}</Text>
      <Text style={styles.userEmail}>{userData.email}</Text>
      {/* Add more user details here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 18,
    color: 'gray',
  },
});

export default UserDetailsScreen;




