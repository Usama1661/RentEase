import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errmessage, setErrorMessage] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    try {
      if (email === 'rogovos513@qiradio.com' && password === '123456789') {
        await auth().signInWithEmailAndPassword(email, password);
        navigation.navigate('Adminpanel');
      } else {
        // Display an error message for unauthorized access
        setErrorMessage('Unauthorized access. Please check your credentials.');
      }
    } catch (error) {
      setErrorMessage(error.message);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
        {/* Admin Panel */}
      </Text>
      <StatusBar style="auto" />
      <Image style={styles.image} source={require('../images/logo.png')} />
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputView}>
        <Icon
          style={{width: 20, height: 20, marginLeft: 10, marginRight: 10}}
          name="envelope"
          size={20}
          color="black"
        />
        <TextInput
          style={styles.TextInput}
          placeholder="Email"
          onChangeText={text => setEmail(text)}
          value={email}
        />
      </View>
      <View style={styles.inputView}>
        <Icon
          style={{width: 20, height: 20, marginLeft: 10, marginRight: 10}}
          name="lock"
          size={20}
          color="black"
        />
        <TextInput
          style={styles.TextInput}
          placeholder="Password"
          secureTextEntry
          onChangeText={text => setPassword(text)}
          value={password}
        />
      </View>
      <TouchableOpacity onPress={handleLogin} style={styles.loginBtn}>
        <Text style={styles.loginText}>Login as admin</Text>
      </TouchableOpacity>
      <Text style={{color: 'red'}}>{errmessage}</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text
          style={{
            color: 'green',
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 10,
          }}>
          Login as User
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  inputView: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    width: '100%',
    height: 45,
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 2,
  },
  loginBtn: {
    width: '80%',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: 'green',
  },
  loginContainer: {
    flexDirection: 'row',
    bottom: 10,
  },
  loginText: {
    fontSize: 18,
    color: 'black',
  },
  loginLink: {
    color: 'orange',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  image: {
    marginBottom: 40,
    height: 150,
    width: 200,
  },
  loginText2: {
    fontSize: 18,
    color: 'white',
  },
});

export default LoginAdmin;

