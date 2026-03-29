import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category } = route.params;
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const listingSnapshot = await firestore().collection('Listings').where('Category', '==', category).get();
        const listingData = listingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategoryData(listingData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category data:', error);
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ItemScreen', { itemid: item.Itemid });
        }}
      >
        <View style={styles.listItem}>
          <Image
            source={{ uri: item.Images[0] }}
            style={{ height: 150, width: 100, margin: 10, borderRadius: 10 }}
            resizeMode="cover"
          />
          <View style={{ flexDirection: 'column', marginTop: 25, flex: 1 }}>
            <Text style={{ fontSize: 18, marginRight: 10 }}>
              <Text style={{ color: 'white' }}>
                Title: {item.Title}
              </Text>
              <Text style={{ color: 'white' }}>
                {'\n'}Price: {item.Price}
              </Text>
              <Text style={{ color: 'white' }}>
                {'\n'}Duration: {item.Duration}
              </Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#8e9eab', '#eef2f3']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <FlatList
          data={categoryData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => setLoading(true)} />
          }
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
    color: 'black',
    textAlign: 'center',
  },
  listItem: {
    height: 170,
    borderRadius: 15,
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginVertical: 5,
  },
});

export default CategoryScreen;

