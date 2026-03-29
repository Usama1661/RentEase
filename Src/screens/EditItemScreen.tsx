import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

const EditItemScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [title, setTitle] = useState(item.Title);
  const [duration, setDuration] = useState(item.Duration);
  const [price, setPrice] = useState(item.Price);
  const [description, setDescription] = useState(item.Description || ''); // Add description state
  const [selectedImages, setSelectedImages] = useState(item.Images || []);
  const [category, setCategory] = useState(item.Category);

  const updateItem = () => {
    firestore()
      .collection('Listings')
      .doc(item.id)
      .update({
        Title: title,
        Duration: duration,
        Description: description, // Update description
        Price: price,
        Images: selectedImages,
        Category: category,
        approve: false, // Reset approval status
      })
      .then(() => {
        console.log('Item updated and is now waiting for approval.');
        navigation.goBack();
      })
      .catch((error) => {
        console.error('Error updating item: ', error);
      });
  };

  const uploadImages = () => {
    let options = {
      storageOptions: {
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.assets) {
        setSelectedImages((prevImages) => [
          ...prevImages,
          ...response.assets.map((asset) => asset.uri),
        ]);
      }
    });
  };

  const removeImage = (uri) => {
    setSelectedImages((prevImages) => prevImages.filter((image) => image !== uri));
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>Upload Photos</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadImages}>
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>

        <FlatList
          data={selectedImages}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <TouchableOpacity style={{}} onPress={() => removeImage(item)}>
                <Text style={{color: 'white', backgroundColor: 'red', borderRadius: 2, width: 25, textAlign: 'center', fontWeight: 'bold'}}>X</Text>
              </TouchableOpacity>
              <Image key={item} style={styles.uploadedImage} source={{ uri: item }} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />

        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.inputdes}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Duration</Text>
        <Picker style={styles.input} selectedValue={duration} onValueChange={(itemValue) => setDuration(itemValue)}>
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Hourly" value="Hourly" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>

        <Text style={styles.label}>Category</Text>
        <Picker style={styles.input} selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
          <Picker.Item label="Vehicles" value="Vehicles" />
          <Picker.Item label="Property" value="Property" />
          <Picker.Item label="Electronics" value="Electronics" />
          <Picker.Item label="Fashion & Beauty" value="Fashion & Beauty" />
          <Picker.Item label="Services" value="Services" />
          <Picker.Item label="Equipment" value="Equipment" />
          <Picker.Item label="Others" value="Others" />
        </Picker>

        <TouchableOpacity style={styles.saveButton} onPress={updateItem}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  inputdes: {
    height: 'auto',
    
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  uploadButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  uploadedImage: {
    height: 100,
    width: 100,
    margin: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center'
  },
});

export default EditItemScreen;






