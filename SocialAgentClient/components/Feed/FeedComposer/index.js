import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  AsyncStorage,
  ActivityIndicator,
  Image,
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import FeedItem from '../../FeedItem/';

export default class FeedComposer extends Component {

  constructor(props){
    super(props);
    this.state = {
      user: null,
      picture: null,
      activities_list: [],
      activity: '',
      text: ''
    };
    this._postNewFeed = this._postNewFeed.bind(this);
  }

  static navigationOptions = function(props) {
    return({
      title: 'Post new feed',
      headerLeft:
        <TouchableOpacity onPress={ () => {
            if ( "backPreCall" in props.navigation.state.params) {
              props.navigation.state.params.backPreCall();
            }
            props.navigation.dispatch(NavigationActions.back());
           }}>
           <Text style={styles.headerButton}>{'\uF060'}</Text>
         </TouchableOpacity>,
     headerRight:
       <TouchableOpacity onPress={ () => {props.navigation.state.params._postNewFeed();}}>
          <Text style={styles.headerButton}>{'\uF046'}</Text>
        </TouchableOpacity>,
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle
      });
  }

  _selectPictureFromGallery(){
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
          picture: {
            uri: response.uri,
            type: response.type,
            name: response.fileName
          }
        });
      }
    });
  }

  async _refreshStateData(){
    try{
      const user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      let activities_list = [];
      let response = null;
      for(let i=0;i<user.activities.length;i++){
        response = await fetch(
          user.activities[i].activity,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + token,
            },
          }
        );
        if(!response.ok){
          ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
          return;
        }else{
          activities_list.push(await response.json());
        }
      }
      this.setState({
        user: user,
        activities_list: activities_list
      });
    }catch(error){
      console.error(error);
    }
    return;
  }

  async _postNewFeed(){
    console.log(this.state);
    if(this.state.activity == ''){
      ToastAndroid.show('Feed\'s relevevant activity cannot be empty.',ToastAndroid.SHORT);
      return;
    }
    if(this.state.text == ''){
      ToastAndroid.show('Feed\'s text content cannot be empty.',ToastAndroid.SHORT);
      return;
    }

    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    try{
      const body = new FormData();
      body.append('user', this.state.user.url);
      body.append('activity', this.state.activity);
      body.append('text', this.state.text);
      body.append('latitude', this.state.user.latitude);
      body.append('longitude', this.state.user.longitude);
      if(this.state.picture){
        body.append('picture', {
          uri: this.state.picture.uri,
          type: this.state.picture.type,
          name: this.state.picture.name
        });
      }
      let response = await fetch(
        server_address+'feed/',
        {
          method: 'POST',
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
      response = await fetch(
        server_address + 'me/',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          }
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
        return;
      }
      let user = await response.json();
      await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(user));
      this.props.navigation.state.params.backPreCall();
      this.props.navigation.dispatch(NavigationActions.back());
    }catch(error){
      console.error(error);
    }
    return;
  }

  componentDidMount() {
    this.props.navigation.setParams({ _postNewFeed: this._postNewFeed });
  }

  componentWillMount(){
      this._refreshStateData();
      return
  }

  render() {
    if(this.state.user){
      return (
        <View style={styles.container}>
          <Picker
            mode={'dropdown'}
            prompt={"Please pick an activity"}
            style={styles.picker}
            selectedValue={this.state.activity}
            onValueChange={(itemValue, itemIndex) => this.setState({activity: itemValue})}>
            <Picker.Item label="Select Activity.." value='' />
            {
              this.state.activities_list.map(function(activity, index){
                return <Picker.Item label={activity.name} value={activity.url} key={activity.url}/>;
              },this)
            }
          </Picker>
          <TextInput
            style={styles.textInput}
            multiline={true}
            maxLength={256}
            underlineColorAndroid={'transparent'}
            placeholder={'Tell your followers about it!'}
            value={this.state.text}
            onChangeText={(text) => this.setState({text: text})}
          />
          <TouchableOpacity
            onPress={ () => {this._selectPictureFromGallery();}}
            style={styles.pictureWrapper}
          >
            {   !this.state.picture &&
              <View style={styles.picturePromptContainer}>
                <Text style={styles.picturePromptIcon}>{'\uF083'}</Text>
                <Text style={styles.picturePromptText}>Attach a picture..</Text>
              </View>
            }
            { this.state.picture &&
              <Image style={styles.picture} resizeMode={'contain'} source={{uri: this.state.picture.uri}}/>
            }
          </TouchableOpacity>
        </View>
      );
    }else{
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  picture: {
    flex: 1
  },
  pictureWrapper: {
    flex: 1,
    margin: 8,
  },
  picturePromptContainer:{
    flexDirection: 'row'
  },
  picturePromptIcon: {
    margin: 4,
    fontFamily: 'awesome',
    fontSize: 26,
    color: '#595959',
    textAlignVertical: 'center'
  },
  picturePromptText:{
    margin: 4,
    fontSize: 16,
    color: '#595959',
    textAlignVertical: 'center'
  },
  picker: {
    width: 200,
    borderWidth: 2,
    borderColor: '#000000',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
  textInput: {
    margin: 8,
    textAlign: 'left',
    textAlignVertical: 'top',
    width: 300,
    height: 100,
    borderWidth: 1,
    borderColor: '#cccccc',
    fontSize: 15,
    color: '#595959',
  },
  headerButton: {
    margin: 4,
    padding: 2,
    fontFamily: 'awesome',
    fontSize: 32,
    color: '#F5FCFF'
  },
  header: {
    backgroundColor: '#ff4d4d',
  },
  headerTitle: {
    color: '#F5FCFF'
  }
});
