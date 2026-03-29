import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const DetailForAdminScreen = ({ route }) => {
  const navigation = useNavigation();
  const { item } = route.params;

  // Handling hardware back button press
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={styles.detailsContainer}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.ImageTitle}>Images</Text>

        <FlatList
          data={item.Images}
          horizontal
          renderItem={({ item: image }) => (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: image }} 
                style={styles.image} 
                resizeMode='cover' 
              />
            </View>
          )}
          keyExtractor={(image, index) => index.toString()}
        />

        <Text style={styles.title}>Title: </Text>
        <Text style={styles.text}>{item.Title}</Text>

        <Text style={styles.title}>Duration: </Text>
        <Text style={styles.text}>{item.Duration}</Text>
        <Text style={styles.title}>Price: </Text>
        <Text style={styles.text}>{item.Price}</Text>

        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>{item.Description}</Text>
      </ScrollView>
     
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ImageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
  },
  title: {
    fontWeight: 'bold', 
    fontSize: 16,
    top: 5,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    borderBottomWidth: 1,
  },
  imageContainer: {
    width: 320,
    height: 400,
    margin: 5,
    backgroundColor: '#EAC43D', // Adjust this color or make dynamic as per your original code
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default DetailForAdminScreen;




