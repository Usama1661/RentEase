import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const ReviewsScreen = ({ route }) => {
  const { itemid } = route.params;
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true); // Start loading
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
      } finally {
        setIsLoadingReviews(false); // Stop loading
      }
    };

    fetchReviews();
  }, [itemid]);

  return (
    <View style={styles.container}>
      <View style={{ }}>
        <Text style={{fontSize: 16,}}>User's Reviews</Text>
      </View>
      {isLoadingReviews ? ( // Add loading indicator
        <ActivityIndicator size="large" color="grey" />
      ) : (
        <ScrollView>
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
                            name='star'
                            size={15}
                            color='orange'
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});

export default ReviewsScreen;




