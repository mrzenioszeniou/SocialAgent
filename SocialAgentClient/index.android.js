import React, { Component } from 'react';
import {
  ActivityIndicator,
  AppRegistry,
  AsyncStorage,
  Button,
  DatePickerAndroid,
  Image,
  Picker,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  View
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import Home from './components/Home/';
import Discover from './components/Discover/';
import Feed from './components/Feed/';
import config from './assets/config.json';

export default class SocialAgentClient extends Component {
  constructor (props) {
    super(props);
    this.state = {
      isPageReady: false,
      accepted: false, // If true we render navigator
      authentication: 'login', // 'login' or 'register'
      user: null,
      latitude: null,
      longitude: null,
      login_field_username: "",
      login_field_password: "",
      register_field_username: "",
      register_field_password1: "",
      register_field_password2: "",
      register_field_first_name: "",
      register_field_last_name: "",
      register_field_email: "",
      register_field_dateOfBirth: "",
      register_field_avatar_uri: "",
      register_field_avatar_name: "",
      register_field_avatar_type: "",
    };
  }

  async componentWillMount(){
    // Try fetching GPS coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {console.log(error);},
      { enableHighAccuracy: true, timeout: 20000},
    );

    try{ // Attempt to fetch user's profile
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      if(this.state.latitude && this.state.longitude){
        var body = {
          latitude: this.state.latitude,
          longitude: this.state.longitude
        };
      }else{
        var body = {};
      }
      if(token==null) throw("No token was found");
      let response = await fetch(
        'http://'+config['server-ip']+':'+config['server-port']+'/me/',
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
      }else{
        let user = await response.json();
        await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(user));
        this.setState({
          user: user
        });
      }
    }catch(error){ // Failed. Prompt for login/register credentials
      console.log(error);
    }

    try{ // Save server address for future calls
      await AsyncStorage.setItem('@SocialAgent:server-address',
        'http://'+config['server-ip']+':'+config['server-port']+'/');
    }catch(error){
      console.error(error);
    }
    this.setState({isPageReady: true});
    return;
  }

  async _loginWithCredentials(){
    try{
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      let body = {
        username: this.state.login_field_username,
        password: this.state.login_field_password,
      }
      let response = await fetch(
        server_address+'token/',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
        return;
      }
      const token = (await response.json()).token;
      await AsyncStorage.setItem('@SocialAgent:token',token);
      if(this.state.latitude && this.state.longitude){
        body = {
          latitude: this.state.latitude,
          longitude: this.state.longitude
        };
      }else{
        body = {};
      }
      response = await fetch(
        server_address + 'me/',
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
        return;
      }
      let user = await response.json();
      await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(user));
      this.setState({user: user});
    }catch(error){
      ToastAndroid.show('Something went wrong..', ToastAndroid.SHORT);
      console.log(error);
    }
    return;
  }

  async _registerAccount(){
    if(this.state.register_field_password1 != this.state.register_field_password2){
      ToastAndroid.show('Password entries do not match.', ToastAndroid.SHORT);
      return;
    }
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    try{
      let body = new FormData();
      body.append('username', this.state.register_field_username);
      body.append('password', this.state.register_field_password1);
      body.append('first_name', this.state.register_field_first_name);
      body.append('last_name', this.state.register_field_last_name);
      body.append('email', this.state.register_field_email);
      body.append('dateOfBirth', this.state.register_field_dateOfBirth);
      body.append('latitude', this.state.latitude.toFixed(6));
      body.append('longitude', this.state.longitude.toFixed(6));
      if(this.state.register_field_avatar_uri!=''){
        body.append('avatar', {
          uri: this.state.register_field_avatar_uri,
          type: this.state.register_field_avatar_type, // or photo.type
          name: this.state.register_field_avatar_name
        });
      }
      let response = await fetch(
        server_address+'me/',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          },
          body: body
        });
      if(!response.ok) {
        if(response.status === 400){
          ToastAndroid.show('Username and/or email already registered. If you need a password reset contact the adminstrator.',ToastAndroid.LONG);
        }else{
          ToastAndroid.show('Something went wrong. "'+response.body+'"STATUS('+response.status+')',ToastAndroid.SHORT);
        }
        return;
      }
      let user = await response.json();
      body = {
        "username": this.state.register_field_username,
        "password": this.state.register_field_password1
      };
      response = await fetch(
        server_address+'token/',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
        return;
      }
      const token = (await response.json()).token;
      await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(user));
      await AsyncStorage.setItem('@SocialAgent:token',token);
      this.setState({user: user});
    }catch(error){
      console.error(error);
    }
    return;
  }

  _selectAvatarFromGallery(){
    var ImagePicker = require('react-native-image-picker');
    var options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        this.setState({
          register_field_avatar_uri: response.uri,
          register_field_avatar_type: response.type,
          register_field_avatar_name: response.fileName
        });
      }
    });
  }

  _switchToRegistrationPage(){
    this.setState({
      authentication: 'register'
    });
    return;
  }

  _switchToLoginPage(){
    this.setState({
      authentication: 'login'
    });
    return;
  }

  async _clearUser(){
    this.setState({
      user: null,
      login_field_username: '',
      login_field_password: '',
    });
    await AsyncStorage.removeItem('@SocialAgent:user');
    await AsyncStorage.removeItem('@SocialAgent:token');
  }

  async _loginEnterApp(){
    this.setState({
      accepted: true
    })
  }

  async changeDateOfBirth(){
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: Date.now()
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        this.setState({ register_field_dateOfBirth: year+'-'+(month+1)+'-'+day});
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  render() {
    if(!this.state.isPageReady){
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }
    if(this.state.accepted){
      const TabNav = TabNavigator(
        {
          Home: {
            screen: Home,
          },
          Discover: {
            screen: Discover,
          },
          Feed: {
            screen: Feed,
          },
        },{
          lazy: true,
          tabBarPosition: 'bottom',
          order: ['Discover','Home','Feed'],
          initialRouteName: 'Home',
          swipeEnabled: false,
          animationEnabled: false,
          tabBarOptions: {
            labelStyle: {
              fontSize:36,
              fontFamily: 'awesome',
            },
            style : {
              backgroundColor: '#ff4d4d'
            },
          }
        }
      );
      return <TabNav/>;
    }else if (this.state.user) { // Account is present. Prompot to launch interface
      return(
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome to Social Agent!</Text>
            <Text style={styles.instructions}>
              Login as {this.state.user.username}
            </Text>
            <Image style={styles.avatar} source={{uri: this.state.user.avatar}}/>
            <Button
              title="Log In"
              color="#ff4d4d"
              onPress={() => this._loginEnterApp()}
            />
            <Text
              style={styles.subtext}
              onPress={() => this._clearUser()}
              >I am not {this.state.user.username}.</Text>
        </View>
      );
    }else if (this.state.authentication=='login') { // Account is not present. Prompt for login
      return(
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome to Social Agent!</Text>
            <Text style={styles.instructions}>
              Login using your credentials
            </Text>
            <TextInput
              style={styles.text_input}
              placeholder={"Username"}
              onChangeText={(text) => this.setState({login_field_username: text})}
              value={this.state.login_field_username}
            />
            <TextInput
              style={styles.text_input}
              placeholder={"Password"}
              secureTextEntry={true}
              onChangeText={(text) => this.setState({login_field_password: text})}
              value={this.state.login_field_password}
            />
            <Button
              title="Log In"
              color="#ff4d4d"
              onPress={() => {this._loginWithCredentials();}}
            />
            <Text
              style={styles.subtext}
              onPress={() => {this._switchToRegistrationPage();}}
              >I don't have an account.</Text>
        </View>
      );
    }else if (this.state.authentication=='register'){ // Account is not present. Prompt for registration
      return(
        <View style={styles.scrollOuterContainer}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
              <Text style={styles.welcome}>Welcome to Social Agent!</Text>
              <Text style={styles.instructions}>
                Register for an account below.
              </Text>
              <TextInput
                style={styles.text_input}
                placeholder={"Username"}
                onChangeText={(text) => this.setState({register_field_username: text})}
                value={this.state.register_field_username}
              />
              <TextInput
                style={styles.text_input}
                placeholder={"Password"}
                secureTextEntry={true}
                onChangeText={(text) => this.setState({register_field_password1: text})}
                value={this.state.register_field_password1}
              />
              <TextInput
                style={styles.text_input}
                placeholder={"Repeat Password"}
                secureTextEntry={true}
                onChangeText={(text) => this.setState({register_field_password2: text})}
                value={this.state.register_field_password2}
              />
              <TextInput
                style={styles.text_input}
                placeholder={"Name"}
                onChangeText={(text) => this.setState({register_field_first_name: text})}
                value={this.state.register_field_first_name}
              />
              <TextInput
                style={styles.text_input}
                placeholder={"Surname"}
                onChangeText={(text) => this.setState({register_field_last_name: text})}
                value={this.state.register_field_last_name}
              />
              <TextInput
                keyboardType={'email-address'}
                style={styles.text_input}
                placeholder={"Email"}
                onChangeText={(text) => this.setState({register_field_email: text})}
                value={this.state.register_field_email}
              />
              <TouchableOpacity onPress={() => {this.changeDateOfBirth();}}>
                <TextInput
                  editable={false}
                  style={[styles.text_input,{color: 'black'}]}
                  placeholder={"Date of Birth"}
                  onChangeText={(text) => {}}
                  value={this.state.register_field_dateOfBirth}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this._selectAvatarFromGallery();}}>
                <Image style={styles.avatar} source={{uri:
                  this.state.register_field_avatar_uri == ''
                  ? 'default_avatar'
                  : this.state.register_field_avatar_uri
                }}/>
              </TouchableOpacity>
              <Button
                title="Register"
                color="#ff4d4d"
                onPress={() => {this._registerAccount();}}
              />
              <Text
                style={styles.subtext}
                onPress={() => {this._switchToLoginPage();}}
                >I already have an account.</Text>
            </ScrollView>
            </View>
      );
    }else{ // Should never reach this point
      return(
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome to Social Agent!</Text>
            <Text style={styles.instructions}>
              Something is wrong here...
            </Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  avatar: {
    margin: 8,
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#1a1a1a'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  scrollOuterContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollContainer: {
    flex:1,
    paddingHorizontal: 5,
    backgroundColor: '#f2f2f2',
    flexDirection: 'column',
  },
  contentContainer: {
    justifyContent:'center',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333333',
  },
  subtext: {
    margin: 8,
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    textDecorationLine: 'underline'
  },
  text_input:{
    width: 130,
    textAlign: 'center',
    fontSize: 15
  }
});

AppRegistry.registerComponent('SocialAgentClient', () => SocialAgentClient);
