import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Button, BackHandler } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ScrollView } from 'react-native-gesture-handler';

const Adminpanel = ({ navigation }) => {
  const signout = () => {
    auth().signOut().then(() => {
      console.log('User signed out!');
       // Replace 'LoginScreen' with your login screen name
    });
  };

  const [myData, setMyData] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('Listings')
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyData(data);
      });

    return () => subscriber();
  }, []);

  useEffect(() => {
    const backAction = () => {
      signout();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const approveListing = (listingId) => {
    firestore()
      .collection('Listings')
      .doc(listingId)
      .update({
        approve: true,
      })
      .then(() => {
        console.log('Listing approved successfully!');
      })
      .catch(error => {
        console.error('Error approving listing: ', error);
      });
  };

  const unapproveListing = (listingId) => {
    firestore()
      .collection('Listings')
      .doc(listingId)
      .update({
        approve: false,
      })
      .then(() => {
        console.log('Listing unapproved successfully!');
      })
      .catch(error => {
        console.error('Error unapproving listing: ', error);
      });
  };

  const deleteListing = (listingId) => {
    firestore()
      .collection('Listings')
      .doc(listingId)
      .delete()
      .then(() => {
        console.log('Listing deleted successfully!');
        setMyData(prevData => prevData.filter(item => item.id !== listingId));
      })
      .catch(error => {
        console.error('Error deleting listing: ', error);
      });
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate('DetailForAdminScreen', { item })}>
        <View style={styles.listItem}>
          <FlatList
            data={item.Images}
            horizontal
            renderItem={({ item: image }) => (
              <Image source={{ uri: image }} style={{ height: 120, width: 80, margin: 5, backgroundColor: item.approve ? '#EAC43D' : 'green', borderRadius: 10 }} />
            )}
            keyExtractor={(image, index) => index.toString()}
          />
          <View style={{ width: '50%' }}>
            <Text style={{ fontSize: 12, color: 'white', width: 130, marginLeft: 10}}>
              Title: {item.Title}{'\n'}
              Duration: {item.Duration}{'\n'}
              Price: {item.Price}{'\n'}
              {item.approve ? (
                <Text style={{ color: 'green', }}>Approved</Text>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                  <TouchableOpacity style={{marginHorizontal: 140}} onPress={() => approveListing(item.id)}>
                    <Text style={{ color: 'yellow', marginTop: 30, fontWeight: 'bold', fontSize: 14 }}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Text>
          </View>
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginHorizontal: -10 }}>
          {item.approve && (
              <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => unapproveListing(item.id)}>
                <Text style={styles.unapButton}>Unapprove</Text>
              </TouchableOpacity>
            )}


              <TouchableOpacity onPress={() => deleteListing(item.id)} style={styles.deleteButton}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, margin: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 60, marginTop: -10 }}>
        <Image source={require('../images/admin.png')} style={{ height: 46, width: 46, borderRadius: 50 }} />
        <Text style={{ height: 40, lineHeight: 50, fontWeight: 'bold', fontSize: 18, marginLeft: 2 }}>Admin Panel</Text>
      </View>
      <ScrollView>
        <View style={{ flex: 0.65, marginVertical: 10 }}>
          <FlatList data={myData} renderItem={renderItem} keyExtractor={(item, index) => index.toString()} />
        </View>
      </ScrollView>
      <Button onPress={signout} title="LogOut" color="black" />
    </View>
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
  deleteButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  unapButton: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 12,
    textAlign: 'center'
  },
});

export default Adminpanel;



