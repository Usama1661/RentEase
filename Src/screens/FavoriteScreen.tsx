import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';

export const FavoriteScreen = () => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  useEffect(() => {}, []);

  return (
    <View>
      {/* Render favorite items */}
      {favoriteItems.map(item => (
        <Text style={{color: 'black'}} key={item.Itemid}>
          {item.Title}
        </Text>
      ))}
    </View>
  );
};

