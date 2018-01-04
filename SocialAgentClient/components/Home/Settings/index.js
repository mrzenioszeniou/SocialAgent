import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  AsyncStorage,
  ActivityIndicator,
  Button,
  DatePickerAndroid,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  View,
} from 'react-native';



export default class Main extends Component {

  constructor(props){
    super(props);
    this.state = {
      done: false
    };
    this.updatePersonalInfo = this.updatePersonalInfo.bind(this);
    this.selectAvatar = this.selectAvatar.bind(this);
  }

  static navigationOptions = function(props) {
    return({
      title: 'Settings',
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerBackTitleStyle: styles.headerButton,
      headerLeft:
        <TouchableOpacity onPress={ () => {
            if( "backPreCall" in props){
              props.backPreCall();
            }else if ( "backPreCall" in props.navigation.state.params) {
              props.navigation.state.params.backPreCall();
            }
            props.navigation.dispatch(NavigationActions.back());
           }}>
           <Text style={styles.headerButton}>{'\uF060'}</Text>
         </TouchableOpacity>,
      headerRight:
        <TouchableOpacity onPress={ () => {props.navigation.state.params.updatePersonalInfo();}}>
           <Text style={styles.headerButton}>{'\uF00C'}</Text>
         </TouchableOpacity>,
      });
  }

  async updatePersonalInfo(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    try{
      const body = new FormData();
      body.append('first_name', this.state.first_name);
      body.append('last_name', this.state.last_name);
      body.append('email', this.state.email);
      body.append('dateOfBirth', this.state.dateOfBirth);
      body.append('avatar', {
        uri: this.state.avatar.uri,
        type: this.state.avatar.type, // or photo.type
        name: this.state.avatar.name
      });
      let response = await fetch(
        server_address+'me/',
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Token ' + token,
          },
          body: body
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
        return;
      }
      let responseJson = await response.json();
      await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(responseJson));
      this.props.navigation.state.params.backPreCall();
      this.props.navigation.dispatch(NavigationActions.back());
    }catch(error){
      console.error(error);
    }
    return;

  }

  selectAvatar(){
    var ImagePicker = require('react-native-image-picker');

    // More info on all the options is below in the README...just some common use cases shown here
    var options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    /**
     * The first arg is the options object for customization (it can also be null or omitted for default options),
     * The second arg is the callback which sends object: response (more info below in README)
     */
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        //let source = { uri: response.uri };
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          avatar: {
            uri: response.uri,
            type: response.type,
            name: response.fileName
          }
        });
      }
    });
  }



  componentDidMount() {
    this.props.navigation.setParams({ updatePersonalInfo: this.updatePersonalInfo });
  }

  async componentWillMount(){
    try{
      const user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
      this.setState({
        done: true,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        avatar: {
          uri: user.avatar
        }
      })
    }catch(error){
      console.error(error);
    }
    return;
  }

  async changeDate(){
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        // Use `new Date()` for current date.
        // May 25 2020. Month 0 is January.
        date: Date.parse(this.state.dateOfBirth)
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        this.setState({ dateOfBirth: year+'-'+(month+1)+'-'+day});
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  render() {
    if(!this.state.done){
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else{
      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            Update your personal info
          </Text>
          <Text style={styles.subtitle}>
            First Name
          </Text>
          <TextInput
            style={styles.input}
            value={this.state.first_name}
            onChangeText={(text) => this.setState({first_name: text})}
            />
          <Text style={styles.subtitle}>
            Last Name
          </Text>
          <TextInput
            style={styles.input}
            value={this.state.last_name}
            onChangeText={(text) => this.setState({last_name: text})}
            />
          <Text style={styles.subtitle}>
            Date of Birth
          </Text>
          <TouchableOpacity onPress={() => {this.changeDate();}}>
            <Text style={[styles.input,{color: '#000000', borderBottomWidth: 1, marginBottom: 6}]}>
              {this.state.dateOfBirth}
            </Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>
            Email
          </Text>
          <TextInput
            style={styles.input}
            value={this.state.email}
            onChangeText={(text) => this.setState({email: text})}
            onFocus={() => this.changeDate()}
            />
          <Text style={styles.subtitle}>
            Avatar
          </Text>
          <TouchableOpacity onPress={() => {this.selectAvatar();}}>
            <Image style={styles.avatar} source={{uri: this.state.avatar.uri}}/>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  avatar: {
    height: 86,
    width: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'left',
    color: '#333333',
    margin: 2
  },
  input: {
    fontSize: 14,
    textAlign: 'left',
    width: 200,
  },
  headerButton: {
    margin: 4,
    padding: 2,
    fontFamily: 'awesome',
    fontSize: 32,
    color: '#F5FCFF',
  },
  header: {
    backgroundColor: '#ff4d4d',
  },
  headerTitle: {
    color: '#F5FCFF'
  }
});
