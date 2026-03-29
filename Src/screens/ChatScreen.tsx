import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = () => {
  const navigation = useNavigation();
  const [currentUserID, setCurrentUserID] = useState(null);
  const [peopleInChat, setPeopleInChat] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newMessages, setNewMessages] = useState({}); // To keep track of new messages

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async user => {
      if (user) {
        setCurrentUserID(user.uid);
        const cachedPeopleInChat = await AsyncStorage.getItem('peopleInChat');
        if (cachedPeopleInChat) {
          setPeopleInChat(JSON.parse(cachedPeopleInChat));
        } else {
          fetchPeopleInChat();
        }
        setupChatListener();
      } else {
        console.log('No authenticated user.');
      }
    });
    return () => {
      unsubscribeAuth();
    };
  }, []);

  const fetchPeopleInChat = useCallback(async () => {
    setRefreshing(true);
    try {
      if (currentUserID) {
        const chatSnapshot = await firestore()
          .collection('Chats')
          .where('participants', 'array-contains', currentUserID)
          .get();

        if (!chatSnapshot.empty) {
          const userIds = new Set();
          chatSnapshot.forEach(doc => {
            const participants = doc.data().participants;
            if (participants.length > 1) {
              participants.forEach(participant => {
                userIds.add(participant);
              });
            }
          });

          if (userIds.size > 0) {
            const peopleSnapshot = await firestore()
              .collection('UserProfile')
              .where(
                firestore.FieldPath.documentId(),
                'in',
                Array.from(userIds),
              )
              .get();

            const peopleData = peopleSnapshot.docs.map(doc => ({
              id: doc.id,
              UserName: doc.data().UserName,
              ProfilePicture: doc.data().ProfilePicture,
              email: doc.data().Email,
              status: 'Online',
            })).filter(person => person.id !== currentUserID);

            setPeopleInChat(peopleData);
            await AsyncStorage.setItem('peopleInChat', JSON.stringify(peopleData));
          } else {
            setPeopleInChat([]);
          }
        } else {
          setPeopleInChat([]);
        }
      }
    } catch (error) {
      console.error('Error fetching people data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [currentUserID]);

  const setupChatListener = useCallback(() => {
    if (currentUserID) {
      const unsubscribeChats = firestore()
        .collection('Chats')
        .where('participants', 'array-contains', currentUserID)
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const chatID = change.doc.id;
              firestore()
                .collection('Chats')
                .doc(chatID)
                .collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .onSnapshot(messageSnapshot => {
                  if (!messageSnapshot.empty) {
                    const message = messageSnapshot.docs[0].data();
                    if (message.senderId !== currentUserID) {
                      setNewMessages(prevState => ({
                        ...prevState,
                        [message.senderId]: true,
                      }));
                    } else {
                      setNewMessages(prevState => ({
                        ...prevState,
                        [message.receiverId]: true,
                      }));
                    }
                  }
                });
            }
          });
        });
  
      return () => {
        unsubscribeChats();
      };
    }
  }, [currentUserID]);
  

  const handlePersonPress = profile => {
    navigation.navigate('MyChat', { user: profile });
    // Mark the chat as read when navigating to MyChat
    setNewMessages(prevState => ({
      ...prevState,
      [profile.id]: false,
    }));
  };

  const deleteChat = async profile => {
    try {
      const chatQuery = await firestore()
        .collection('Chats')
        .where('participants', 'array-contains', currentUserID)
        .get();

      const batch = firestore().batch();

      chatQuery.forEach(doc => {
        const participants = doc.data().participants;
        if (participants.includes(profile.id)) {
          batch.delete(doc.ref);
        }
      });

      await batch.commit();

      const updatedPeople = peopleInChat.filter(person => person.id !== profile.id);
      setPeopleInChat(updatedPeople);
      await AsyncStorage.setItem('peopleInChat', JSON.stringify(updatedPeople));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renderProfile = ({ item }) => {
    const rightSwipeActions = (progress, dragX, profile) => {
      return (
        <TouchableOpacity onPress={() => deleteChat(profile)}>
          <View style={styles.deleteBox}>
            <Text style={styles.deleteText}>Delete</Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable renderRightActions={(_, dragX) => rightSwipeActions(_, dragX, item)}>
        <TouchableOpacity onPress={() => handlePersonPress(item)}>
          <View style={styles.personContainer}>
            <Image
              source={require('../images/chatuser.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.personName}>{item.UserName || item.email}</Text>
              {newMessages[item.id] && <Text style={styles.newMessage}>New Message</Text>}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={peopleInChat}
        renderItem={renderProfile}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats available</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchPeopleInChat}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  deleteBox: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  newMessage: {
    color: 'green',
    fontWeight: 'bold',
  },
});

export default ChatScreen;





