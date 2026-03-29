import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Import Firebase authentication module
import Icon from 'react-native-vector-icons/FontAwesome';
import ReviewsScreen from './ReviewsScreen';


const Tab = createMaterialTopTabNavigator();

const ItemScreen = ({ route , props}) => {
  const { itemid } = route.params;
  console.log('item id : ', itemid);
  const [itemData, setItemData] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [starRating, setStarRating] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const user = auth().currentUser;
  const userId = user.uid;
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setCurrentUserEmail(currentUser.email);
    }
  }, []);

  const handleChatPress = async () => {
    try {
      const querySnapshot = await firestore()
        .collection('Listings')
        .where('Itemid', '==', itemid)
        .get();
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (data.length > 0) {
        data.forEach(item => {
          if (item && item.UserId) {
            navigation.navigate('MyChat', { user: { id: item.UserId } });
          } else {
            console.warn('User ID not found for the item:', item.id);
          }
        });
      } else {
        console.warn('No items found for the provided item ID.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const querySnapshot = await firestore()
          .collection('Listings')
          .where('Itemid', '==', itemid)
          .get();
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItemData(data[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchdata();
  }, [itemid]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot = await firestore()
          .collection('Reviews')
          .where('itemid', '==', itemid)
          .get();
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const reviewsWithUser = await Promise.all(
          data.map(async review => {
            const userData = await firestore()
              .collection('Users')
              .doc(review.userId)
              .get();
            const user = userData.data();
            return { ...review, user };
          }),
        );

        setReviews(reviewsWithUser);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [itemid]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore()
          .collection('UserProfile')
          .doc(userId)
          .get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserData(userData);
          console.log(userData);
        } else {
          console.warn('User data not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleReviewSubmit = async () => {
    if (reviewText.trim() !== '') {
      try {
        await firestore().collection('Reviews').add({
          itemid: itemid,
          text: reviewText,
          rating: starRating,
          userId: userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          useremail: currentUserEmail,
          username: userData.UserName,
          image: userData.ProfilePicture,
        });
        setReviewText('');
        setStarRating(0);
        setIsModalVisible(false);

        fetchReviews();
      } catch (error) {
        console.error('Error adding review:', error);
      }
    }
  };

  const translateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -300],
    extrapolate: 'clamp',
  });

  const renderRatingStars = (averageRating) => {
    const totalStars = 5;
    const filledStars = Math.floor(averageRating);
    const emptyStars = totalStars - filledStars;
    let stars = '';

    for (let i = 0; i < filledStars; i++) {
      stars += '★';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }

    return stars;
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <View style={styles.container}>
      
      <Animated.Image
        source={
          itemData && itemData.Images && itemData.Images[0]
            ? { uri: itemData.Images[0] }
            : null
        }
        style={[styles.image, { transform: [{ translateY }] }]}
        
      />
      <Animated.View style={[styles.tabContainer, { transform: [{ translateY }] }]}>
        <Text style={styles.titleText}>
          {itemData.Title}
        </Text>
       <View>
       <Text style={styles.priceText}>
          {itemData.Price + ' ' + 'Rs'}
        </Text>
        {reviews.length > 0 && (
          <Text style={styles.ratingText}>
            {renderRatingStars(averageRating)} ({reviews.length} reviews)
          </Text>
        )}
       </View>
        
        <Tab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: 'black' },
          }}>
          <Tab.Screen name="Details">
            {() => (
              
                <View style={styles.detailsContainer}>
                   <ScrollView style={styles.scrollView}>

                   <Text style={styles.descriptionTitle}>Description</Text>
                   <Text style={styles.description}>{itemData.Description}</Text>


                   </ScrollView>
                  
                 <View style={{height: 60, width: 370, marginLeft: -15, backgroundColor: 'white'}}>
                 <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleChatPress}>
                    <Icon name="comment" size={18} color={'white'} />
                    <Text style={styles.chatButtonText}> Chat</Text>
                  </TouchableOpacity>
                 </View>
                </View>
              
            )}
          </Tab.Screen>
          <Tab.Screen name="Reviews">
            {() => (
              <View style={styles.reviewsTabContainer}>
                <ScrollView style={styles.scrollView}>
                  <View style={styles.reviewsContainer}>
                    {reviews.map((review, index) => (
                      <View key={index} style={styles.reviewContainer}>
                        <View style={styles.userInfo}>
                          <View style={styles.userInfoRow}>
                            <Image
                              source={require('../images/user.png')}
                              style={styles.avatar}
                            />
                            <View style={styles.userInfoColumn}>
                              <Text style={styles.userName}>{review.username}</Text>
                              <View style={styles.starRatingContainer}>
                                {[...Array(review.rating)].map((_, i) => (
                                  <Icon
                                    key={i}
                                    name={i < starRating ? 'star' : 'star'}
                                    size={15}
                                    color={i < starRating ? 'orange' : 'orange'}
                                  />
                                ))}
                              </View>
                            </View>
                          </View>
                          <Text style={styles.reviewText}>{review.text}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
               <View style={{height: 60, width: 370, marginLeft: -10, backgroundColor: 'white'}}>

               <TouchableOpacity onPress={() => navigation.navigate('ReviewsScreen', { itemid })}>
  <Text style={{color: 'darkblue', fontSize: 14, fontWeight: 'bold', bottom: 23, borderRadius: 10, width: 70, textAlign: 'center', marginLeft: 'auto'}}>View all</Text>
</TouchableOpacity>
               <TouchableOpacity
                  style={styles.fixedReviewButton}
                  onPress={() => setIsModalVisible(true)}>
                  <Text style={styles.reviewButtonText}>Write a review</Text>
                </TouchableOpacity>
               </View>
              </View>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </Animated.View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
         
          <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
            <Text style={styles.modalTitle}>What's Your Rate?</Text>
            <View style={styles.starRatingContainer}>
              {[...Array(5)].map((_, i) => (
                <TouchableOpacity style={{marginLeft: 25}} key={i} onPress={() => setStarRating(i + 1)}>
                  <Icon
                    name={i < starRating ? 'star' : 'star-o'}
                    size={25}
                    color={i < starRating ? 'orange' : 'black'}
                  style={{}}/>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalSubtitle}>Please share your opinion about product!</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Write a review"
              value={reviewText}
              onChangeText={setReviewText}
              multiline={true}
            />
           
            <TouchableOpacity style={styles.submitButton} onPress={handleReviewSubmit}>
              <Text style={{color: 'white'}}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  image: {
    height: 250,
    width: '100%',
    resizeMode: 'stretch',
    marginBottom: 10,
  },
  tabContainer: {
    flex: 1,
    borderRadius: 20
    
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailsContainer: {
    backgroundColor: 'white',
    flex: 1,
    margin: 5,
  },
  descriptionTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'Caveat-VariableFont_wght',
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
  },
  chatButton: {
    position: 'absolute',
    bottom: 1,
    left: '50%',
    transform: [{ translateX: -75 }],
    borderWidth: 1,
    height: 50,
    width: 320,
    backgroundColor: 'black',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -80,
    flexDirection: 'row'
  },
  submitButton: {
    borderWidth: 1,
    height: 50,
    width: 'auto',
    backgroundColor: 'black',
    borderRadius: 20,
    margin: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    top: 30
   
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  reviewsTabContainer: {
    flex: 1,
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  reviewContainer: {
    borderBottomWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
    marginBottom: 1,
    backgroundColor: 'white',
  },
  userInfo: {
    marginBottom: 5,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userInfoColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  userName: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 14,
    marginLeft: -3
  },
  starRatingContainer: {
    flexDirection: 'row',
    marginLeft: -5
    
  },
  reviewText: {
    color: 'black',
    fontSize: 12,
  },
  fixedReviewButton: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -75 }],
    borderWidth: 1,
    height: 50,
    width: 320,
    backgroundColor: 'black',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -80,
    
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 18,
    
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: 'Sedan-Regular',
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Sedan-Regular',
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    marginBottom: 10,
    width: 260,
    height: 60,
    backgroundColor: 'white',
    top: 20
  },
  titleText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  priceText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default ItemScreen;
