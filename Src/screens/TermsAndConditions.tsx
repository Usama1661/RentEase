import React from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const TermsAndConditions = () => {
  const navigation = useNavigation();

  const handleAgree = async () => {
    await AsyncStorage.setItem('termsAgreed', 'true');
    Alert.alert('Agreement', 'You have agreed to the terms and conditions.');
    navigation.navigate('BottomTab');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Terms and Conditions</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>
        1. **Ownership**: The Rentee retains full ownership of the asset. The Renter is only granted temporary use of the asset as per the terms of this Agreement.

2. **Use of Asset**: The Renter agrees to use the asset in a careful and proper manner and comply with all laws, ordinances, and regulations relating to the possession, use, and maintenance of the asset.

3. **Maintenance and Repairs**: The Renter is responsible for routine maintenance and any repairs needed due to misuse or negligence. The Rentee is responsible for any necessary repairs due to normal wear and tear.

4. **Insurance**: The Renter shall maintain insurance on the asset during the rental term. Proof of insurance must be provided to the Rentee upon request.

5. **Indemnification**: The Renter agrees to indemnify and hold the Rentee harmless from any and all claims, actions, damages, liabilities, and expenses, including reasonable attorneys' fees, arising out of the use of the asset.

6. **Termination**: Either party may terminate this Agreement with [number] days' written notice to the other party. Upon termination, the Renter shall return the asset to the Rentee in the same condition as received, reasonable wear and tear excepted.

7. **Default**: If the Renter fails to make a rental payment or breaches any other term of this Agreement, the Rentee may terminate this Agreement immediately and take possession of the asset without notice.

8. **Governing Law**: This Agreement shall be governed by and construed in accordance with the laws of the [State/Country].

9. **Entire Agreement**: This Agreement constitutes the entire agreement between the parties and supersedes all prior understandings, agreements, representations, and warranties, both written and oral.

10. **Amendments**: No amendment or modification of this Agreement shall be valid unless in writing and signed by both parties.

11. **Severability**: If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
        </Text>
      </ScrollView>
      <Button title="Agree to Terms and Conditions" onPress={handleAgree} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default TermsAndConditions;

