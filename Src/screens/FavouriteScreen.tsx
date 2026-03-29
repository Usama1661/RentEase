import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const FavoriteScreen = () => {
  const navigation = useNavigation<any>();
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getItems = async () => {
    try {
      const value = await AsyncStorage.getItem('favoriteItems');
      if (value !== null) {
        const parsedValue = JSON.parse(value);
        const favoriteItemIds = Object.keys(parsedValue);

        const favoriteItemsData = await Promise.all(
          favoriteItemIds.map(async itemId => {
            const itemSnapshot = await firestore()
              .collection('Listings')
              .doc(itemId)
              .get();
            if (itemSnapshot.exists) {
              return {id: itemSnapshot.id, ...itemSnapshot.data()};
            }
            return null;
          }),
        );

        setFavoriteItems(favoriteItemsData.filter(item => item !== null));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving favorite items:', error);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getItems();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getItems();
    }, [])
  );

  const renderRatingStars = averageRating => {
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

  const handleToggleFavorite = async (itemId) => {
    try {
      const updatedFavorites = { ...favoriteItems };
      if (updatedFavorites[itemId]) {
        delete updatedFavorites[itemId];
      } else {
        updatedFavorites[itemId] = true;
      }

      setFavoriteItems(updatedFavorites);
      await saveFavoriteItems(updatedFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderItem = ({item}) => {
    const reviews = item.Reviews || [];
    let averageRating = 0;
    let totalReviews = 0;

    if (reviews.length > 0) {
      totalReviews = reviews.length;
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / totalReviews;
    }

    const isItemFavorite = favoriteItems[item.id] || false; // Check 

    return (
      item.approve === true && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ItemScreen', {itemid: item.Itemid});
          }}>
          <View style={styles.listItem}>
            <View style={{flexDirection: 'column'}}>
              <Image
                source={{uri: item.Images[0]}}
                style={{height: 100 * (4 / 3), width: 100 * (4 / 3), borderRadius: 10}}
                resizeMode='stretch'
              />
            </View>
            <View style={{flexDirection: 'column', marginHorizontal: 10}}>
              <Text style={{fontSize: 12}}>
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 14}}>
                  {item.Title}
                </Text>
                <Text style={{color: 'green'}}>
                  {'\n'}
                  Rs {item.Price}
                </Text>
                <Text style={{color: 'white'}}>
                  {'\n'}
                  {item.Duration}
                </Text>

                {reviews.length > 0 && (
                  <Text style={{color: 'orange'}}>
                    {'\n'}
                    {renderRatingStars(averageRating)} ({totalReviews} reviews)
                  </Text>
                )}
              </Text>
              <TouchableOpacity
               >
                <Icon name='heart' size={25} color={'red'}/>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={favoriteItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
  listItem: {
    padding: 16,
    borderWidth: 3,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingRight: 10,
    marginRight: 10,
  },
});

export default FavoriteScreen;


