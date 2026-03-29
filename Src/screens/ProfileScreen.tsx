import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Editic from 'react-native-vector-icons/Feather';
import moment from 'moment'; // Add moment for date manipulation

const ProfileScreen = () => {
  const [myData, setMyData] = useState([]);
  const [profileData, setProfileData] = useState();
  const user = auth().currentUser;
  const userId = user.uid;
  const navigation = useNavigation();

  const signout = () => {
    auth().signOut().then(() => console.log('User signed out!'));
  };

  const editItem = (item) => {
    navigation.navigate('EditItemScreen', { item }); // Ensure you have an EditItemScreen in your navigation
  };

  const deleteItem = (itemId) => {
    firestore()
      .collection('Listings')
      .doc(itemId)
      .delete()
      .then(() => {
        console.log('Item deleted!');
        // Optionally, you can update the local state to remove the deleted item
        setMyData((prevData) => prevData.filter(item => item.id !== itemId));
      })
      .catch(error => {
        console.error('Error deleting item: ', error);
      });
  };

  const toggleRentOut = (item) => {
    const newRentOutStatus = !item.rentOut;
    const expiryDate = newRentOutStatus ? firestore.Timestamp.fromDate(moment().add(30, 'days').toDate()) : null; // Set expiry date to 30 days from now
  
    firestore()
      .collection('Listings')
      .doc(item.id)
      .update({
        rentOut: newRentOutStatus,
        expiryDate: expiryDate
      })
      .then(() => {
        console.log('Rent out status updated!');
        setMyData((prevData) =>
          prevData.map((dataItem) =>
            dataItem.id === item.id
              ? { ...dataItem, rentOut: newRentOutStatus, expiryDate: expiryDate }
              : dataItem
          )
        );
      })
      .catch(error => {
        console.error('Error updating rent out status: ', error);
      });
  };
  
  const renderItem = ({ item }) => {
    const daysLeft = item.expiryDate && item.expiryDate.toDate ? moment(item.expiryDate.toDate()).diff(moment(), 'days') : null;
  
    return (
      <View style={item.approve === false ? styles.listItemblur : styles.listItem}>
        <FlatList
          data={item.Images}
          horizontal
          renderItem={({ item: image }) => (
            <Image source={{ uri: image }} style={{ height: 120, width: 80, margin: 5, backgroundColor: '#EAC43D' }} />
          )}
          keyExtractor={(image, index) => index.toString()}
        />
        <View style={{ width: '50%' }}>
          <Text style={{ fontSize: 15, color: 'white', marginHorizontal: 5, }}>
            Title: {item.Title}{'\n'}
            Duration: {item.Duration}{'\n'}
            Price: {item.Price}{'\n'}
            <Text style={{ color: item.approve ? 'green' : 'white' }}>
              {item.approve ? 'Approved' : 'Waiting for Approval'}
            </Text>
            {item.rentOut && daysLeft !== null && (
              <Text style={{ color: 'yellow' }}>{'\n'}Days left: {daysLeft}</Text>
            )}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => editItem(item)}>
            <Editic name="edit" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
            <Icon name="trash" size={20} color="white" />
          </TouchableOpacity>
          
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={() => toggleRentOut(item)}>
            <Text style={{ color: 'white', fontSize: 12 }}>{item.rentOut ? 'Clear' : 'Rent Out'}</Text>
          </TouchableOpacity>
      </View>
    );
  };
  

  useEffect(() => {
    const subscriber = firestore()
      .collection('Listings')
      .where('UserId', '==', userId)
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyData(data);

        // Fetch user profile data
        firestore()
          .collection('UserProfile')
          .doc(userId)
          .get()
          .then(snapshot => {
          const profileDataFromFirestore = snapshot.data();
            setProfileData(profileDataFromFirestore);
          })
          .catch(error => {
            console.error('Error fetching profile data: ', error);
          });
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [userId]);

  return (
    <LinearGradient colors={['#8e9eab', '#eef2f3']} style={{ flex: 1 }}>
      <View style={{ flex: 1, margin: 10 }}>
        <View style={{ flex: 0.35, alignItems: 'center', borderBottomStartRadius: 20, borderBottomEndRadius: 20, }}>
          <Image style={styles.profilePictureContainer} source={{ uri: profileData?.ProfilePicture || 'fallback_image_url' }} />
          <Text style={{ color: 'black', fontSize: 16 }}>{user.email}</Text>
          <TouchableOpacity style={{ borderRadius: 10, borderWidth: 2, height: 25, width: 150, backgroundColor: 'black', top: 5 }} onPress={() => navigation.navigate("UserProfile")}>
            <Text style={{ textAlign: 'center', color: 'white', fontSize: 18, fontFamily: 'Caveat-VariableFont_wght' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 0.65, marginVertical: 10 }}>
          <FlatList data={myData} renderItem={renderItem} keyExtractor={(item, index) => index.toString()} />
        </View>

        <Button onPress={signout} title="LogOut" color="black" />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  listItem: {
    padding: 16,
    borderWidth: 3,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'black',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  listItemblur: {
    padding: 16,
    borderWidth: 3,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'grey',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 20
  },
  editButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  toggleButton: {
    padding: 5,
    backgroundColor: 'green',
    borderRadius: 15,
    height: 30,
    width: 80,
    top: 90,
    marginLeft: -90,
    alignItems: 'center'
  },
});

export default ProfileScreen;


