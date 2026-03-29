import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';
import CarouselCardItem, { SLIDER_WIDTH, ITEM_WIDTH } from './CarouselCardItem';
import CarouselData from './CarouselData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [mydata, setMyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('any');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAgreementVisible, setIsAgreementVisible] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState({});

  const category = [
    { title: 'Property', image: require('../images/propertyrent.png') },
    { title: 'Vehicles', image: require('../images/carrent.png') },
    { title: 'Equipment', image: require('../images/equipmentrent.png') },
    { title: 'Electronics', image: require('../images/electronicrent.png') },
    { title: 'Fashion & Beauty', image: require('../images/fashionrent.png') },
  ];

  const getDatabase = async () => {
    try {
      const listingSnapshot = await firestore().collection('Listings').get();
      const listingData = listingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch reviews for each listing
      const reviewsSnapshot = await firestore().collection('Reviews').get();
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Associate reviews with listings based on itemid
      const listingsWithReviews = listingData.map(listing => {
        const reviewsForListing = reviewsData.filter(
          review => review.itemid === listing.Itemid,
        );
        return { ...listing, Reviews: reviewsForListing };
      });

      console.log('Listings with reviews:', listingsWithReviews);
      setMyData(listingsWithReviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDatabase();
  }, []);

  useEffect(() => {
    const checkAgreement = async () => {
      const agreementAccepted = await AsyncStorage.getItem('agreementAccepted');
      console.log(agreementAccepted);
      if (!agreementAccepted) {
        setIsAgreementVisible(true);
      }
    };

    checkAgreement();
  }, []);

  useEffect(() => {
    const loadFavoriteItems = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favoriteItems');
        if (storedFavorites) {
          setFavoriteItems(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorite items:', error);
      }
    };

    loadFavoriteItems();
  }, []);

  const saveFavoriteItems = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem('favoriteItems', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error saving favorite items:', error);
    }
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

  const filterDataByCategory = (categoryTitle: string) => {
    if (categoryTitle === 'any') {
      return mydata;
    }
    const filteredData = mydata.filter(
      item => item.Category.toLowerCase() === categoryTitle.toLowerCase(),
    );
    return filteredData;
  };

  const handleSearch = () => {
    const result = mydata.filter(item =>
      item.Title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setSearchResult(result);
    setIsSearching(true);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setSearchResult([]);
    setIsSearching(false);
    setLoading(true);
    getDatabase();
  };

  const renderRatingStars = (averageRating: number) => {
    const totalStars = 5;
    const filledStars = Math.floor(averageRating);
    const emptyStars = totalStars - filledStars;
    let stars = '';

    // Add filled stars
    for (let i = 0; i < filledStars; i++) {
      stars += '★';
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }

    return stars;
  };

  const handleAcceptAgreement = async () => {
    console.log('Accept button pressed');
    await AsyncStorage.setItem('agreementAccepted', 'true');
    setIsAgreementVisible(false);
    console.log('Agreement accepted and modal hidden');
  };

  const renderItem = ({ item }) => {
    const reviews = item.Reviews;
    let averageRating = 0;
    let totalReviews = 0;

    if (reviews && reviews.length > 0) {
      totalReviews = reviews.length;
      const sum = reviews.reduce((acc: any, review: { rating: any }) => acc + review.rating, 0);
      averageRating = sum / totalReviews;
    }

    const isItemFavorite = favoriteItems[item.id] || false; // Check if item is marked as favorite

    return (
      item.approve === true && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ItemScreen', { itemid: item.Itemid });
          }}>
          <View style={styles.listItem}>
            <View style={{ flexDirection: 'column' }}>
              <Image
                source={{ uri: item.Images[0] }}
                style={{ height: 85 * (4 / 3), width: 50 * (4 / 3), margin: 8, borderRadius: 10 }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flexDirection: 'column', marginTop: 10, marginRight: 15 }}>
              <Text style={{ fontSize: 12 }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    width: 100,
                  }}>
                  {item.Title}
                </Text>
                <Text style={{ color: 'green' }}>
                  {'\n'}
                  Rs {item.Price}
                </Text>
                <Text style={{ color: 'white' }}>
                  {'\n'}
                  {item.Duration}
                </Text>

                {item.rentOut && (
                  <Text style={{ color: 'yellow' }}>{'\n'}Rent out</Text>
                )}

                {reviews && reviews.length > 0 && (
                  <Text style={{ color: 'orange' }}>
                    {'\n'}
                    {renderRatingStars(averageRating)} ({totalReviews} reviews)
                  </Text>
                )}
              </Text>
              <TouchableOpacity
                onPress={() => handleToggleFavorite(item.id)}>
                <Icon
                  name={isItemFavorite ? 'heart' : 'heart-o'}
                  size={25}
                  color={isItemFavorite ? 'red' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )
    );
  };

  const renderCategory = ({ item }) => (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 5,
        right: 10,
      }}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('CategoryScreen', { category: item.title })
        }>
        <Image source={item.image} style={{ height: 40, width: 40 }} />
        <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
          {item.title}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#8e9eab', '#eef2f3']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Modal
          visible={isAgreementVisible}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.title}>User Agreement</Text>
                <Text style={styles.content}>
                  Welcome to Rentease! Before you start using our app, please
                  read and accept the following terms and conditions:
                  {'\n\n'}
                  1. You agree to provide accurate information when listing
                  items for rent.
                  {'\n\n'}
                  2. You agree to comply with all applicable laws and
                  regulations.
                  {'\n\n'}
                  3. You agree to treat other users with respect and conduct
                  transactions in good faith.
                  {'\n\n'}
                  4. Rentease is not responsible for any damages or losses
                  resulting from transactions between users.
                  {'\n\n'}
                  5. You agree to our privacy policy and terms of service.
                  {'\n\n'}
                  Please review the full terms and conditions at our website.
                  {'\n\n'}
                  By clicking "Accept", you agree to the terms and conditions
                  outlined above.
                </Text>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAcceptAgreement}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <View
          style={{
            flex: 0.3,
            borderBottomStartRadius: 20,
            borderBottomEndRadius: 20,
            backgroundColor: 'black',
            marginHorizontal: -10,
            bottom: 10,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Image
              source={require('../images/logo.png')}
              style={{ height: 70, width: 100 }}
            />
            <TouchableOpacity>
              <Icon
                style={{ top: 40, right: 10 }}
                name="bell"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', top: 10 }}>
            <Icon
              style={{ left: 40, margin: 5 }}
              name="search"
              size={25}
              color="white"
            />
            <TextInput
              style={{
                borderWidth: 3,
                borderRadius: 16,
                height: 40,
                textAlign: 'center',
                paddingHorizontal: 80,
                marginRight: 40,
                borderColor: 'white',
                color: 'white',
                fontFamily: 'Sedan-Regular',
              }}
              placeholderTextColor="white"
              placeholder="Please Enter to Search"
              value={searchTerm}
              onChangeText={text => setSearchTerm(text)}
              onBlur={handleSearch}
            />
          </View>
        </View>
        <ScrollView
          style={{
            flex: 1,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }>
          {isSearching && searchResult.length > 0 ? (
            <FlatList
              data={searchResult}
              renderItem={renderItem}
              horizontal
              keyExtractor={item => item.id}
            />
          ) : (
            <View>
              <View style={{ right: 80 }}>
                <Carousel
                  layout="tinder"
                  layoutCardOffset={9}
                  data={CarouselData}
                  renderItem={CarouselCardItem}
                  sliderWidth={SLIDER_WIDTH}
                  itemWidth={ITEM_WIDTH}
                  inactiveSlideShift={0}
                  useScrollView={true}
                />
              </View>
              <View style={{ flex: 0.4 }}>
                <Text
                  style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>
                  Browse Categories
                </Text>
                <FlatList
                  data={category}
                  renderItem={renderCategory}
                  horizontal
                  keyExtractor={item => item.title}
                />
              </View>
              {category.map((categoryItem, index) => (
                <View style={{ marginTop: 5 }} key={index}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text
                      style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>
                      {categoryItem.title}
                    </Text>

                    <TouchableOpacity onPress={() => navigation.navigate('CategoryScreen', { category: categoryItem.title })}>
                      <Text
                        style={{ color: 'darkblue', fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>
                        See all
                      </Text>
                    </TouchableOpacity>

                  </View>
                  <FlatList
                    data={filterDataByCategory(categoryItem.title)}
                    renderItem={renderItem}
                    horizontal
                    keyExtractor={item => item.id}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
  listItem: {
    height: 130,
    width: 230,
    borderRadius: 15,
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    right: 10,

  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    height: '50%',
  },

  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
  },

  scrollViewContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Sedan-Regular',
  },
});

export default HomeScreen;
