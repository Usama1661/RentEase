import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const MyChat = ({ route }) => {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [userID, setUserID] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (user) {
        setUserID(user.uid);
      } else {
        navigation.navigate('Login');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigation]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore()
          .collection('UserProfile')
          .doc(user.id)
          .get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          console.warn('User data not found for ID:', user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user.id]);

  useEffect(() => {
    if (userID) {
      const chatRef1 = firestore()
        .collection('Chats')
        .doc(`${userID}_${user.id}`)
        .collection('messages')
        .orderBy('createdAt', 'desc');

      const chatRef2 = firestore()
        .collection('Chats')
        .doc(`${user.id}_${userID}`)
        .collection('messages')
        .orderBy('createdAt', 'desc');

      const unsubscribeChat1 = chatRef1.onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Check if createdAt is defined before calling .toDate()
            _id: doc.id,
          };
        });
        setMessages(msgs);
      });

      const unsubscribeChat2 = chatRef2.onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Check if createdAt is defined before calling .toDate()
            _id: doc.id,
          };
        });
        setMessages(prevMessages => [...prevMessages, ...msgs]);
      });

      return () => {
        unsubscribeChat1();
        unsubscribeChat2();
      };
    }
  }, [userID, user.id]);

  const onSend = useCallback(
    (messages = []) => {
      const message = messages[0];
      
      const chatDocID = `${userID}_${user.id}`;
      const reverseChatDocID = `${user.id}_${userID}`;
  
      const messageData = {
        ...message,
        createdAt: firestore.FieldValue.serverTimestamp(),
        senderId: userID,
        receiverId: user.id,
      };
  
      const chatDocRef = firestore().collection('Chats').doc(chatDocID);
      const reverseChatDocRef = firestore().collection('Chats').doc(reverseChatDocID);
  
      chatDocRef.collection('messages').add(messageData).then(() => {
        chatDocRef.set(
          {
            lastMessage: message.text,
            lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
            participants: [userID, user.id],
          },
          { merge: true }
        );
      });
  
      // Update last message for the reverse document as well
      reverseChatDocRef.set(
        {
          lastMessage: message.text,
          lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
          participants: [user.id, userID],
        },
        { merge: true }
      );
    },
    [userID, user.id]
  );
  

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        {userData && (
          <View style={styles.userInfo}>
            <Image
              source={{ uri: userData.ProfilePicture }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{userData.UserName}</Text>
          </View>
        )}
      </View>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: userID }}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: 'lightblue' },
              right: { backgroundColor: 'orange' },
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    height: 40,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 5,

    top: 2
    
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MyChat;
