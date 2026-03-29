import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import UUIDGenerator from 'react-native-uuid-generator';
import ImageResizer from 'react-native-image-resizer';

const ListingScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Any');
  const [duration, setDuration] = useState('Daily');
  const [uuid, setUuid] = useState('');
  const [approve, setApprove] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    UUIDGenerator.getRandomUUID((uuid) => {
      setUuid(uuid);
    });
  }, []);

  const compressImage = async (uri) => {
    try {
      const resizedImage = await ImageResizer.createResizedImage(uri, 800, 600, 'JPEG', 80);
      return resizedImage.uri;
    } catch (err) {
      console.error(err);
      return uri;
    }
  };

  const uploadImageToStorage = async (uri, path) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reference = storage().ref(path);
    await reference.put(blob);
    const url = await reference.getDownloadURL();
    return url;
  };

  const Upload = () => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    let options = {
      storageOptions: {
        path: 'image',
      },
    };

    launchImageLibrary(options, async (response) => {
      if (response.assets) {
        setLoading(true); // Start loading indicator
        const compressedUris = await Promise.all(
          response.assets.map((asset) => compressImage(asset.uri))
        );
        const uploadPromises = compressedUris.map((uri, index) => {
          const path = `images/${uuid}/${response.assets[index].fileName}`;
          return uploadImageToStorage(uri, path);
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        setSelectedImages((prevImages) => [...prevImages, ...uploadedUrls]);
        setLoading(false); // Stop loading indicator
      }
    });
  };

  const handleAddItem = async () => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    const userId = user.uid;
    const listingRef = await firestore().collection('Listings').add({
      UserId: userId,
      Title: title,
      Description: description,
      Price: price,
      Images: selectedImages,
      Category: category,
      Duration: duration,
      Itemid: uuid,
      approve: approve,
    });

    console.log('Listing added with ID: ', listingRef.id);
    navigation.goBack();
  };

  const removeImage = (uri) => {
    setSelectedImages((prevImages) => prevImages.filter((image) => image !== uri));
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>Upload Photos</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={Upload}>
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
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
        )}

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.Titleinput}
          maxLength={24}
          placeholder="Title (max 24 characters)"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={price}
          onChangeText={(text) => setPrice(text)}
          keyboardType="numeric"
        />

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

        <Text>Duration</Text>
        <Picker style={styles.input} selectedValue={duration} onValueChange={(itemValue) => setDuration(itemValue)}>
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Hourly" value="Hourly" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>

        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  Titleinput: {
    height: 40,
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
  uploadedImage: {
    height: 100,
    width: 100,
    margin: 5,
  },
  addButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  removeImageText: {
    color: 'white',
    backgroundColor: 'red',
    borderRadius: 2,
    width: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    position: 'absolute',
    right: 5,
    top: 5,
    zIndex: 1,
  },
});

export default ListingScreen;

