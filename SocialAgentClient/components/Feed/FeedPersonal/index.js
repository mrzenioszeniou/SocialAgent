import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  Alert,
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

export default class FeedPersonal extends Component {

  constructor(props){
    super(props);
    this.state = {
      user: null,
      feed_list: [],
    };
  }

  static navigationOptions = function(props) {
    return({
      title: 'My Feed Posts',
      headerLeft:
        <TouchableOpacity onPress={ () => {
          if ( "backPreCall" in props.navigation.state.params) {
            props.navigation.state.params.backPreCall();
          }
            props.navigation.dispatch(NavigationActions.back());
          }}>
          <Text style={styles.headerButton}>{'\uF060'}</Text>
        </TouchableOpacity>,
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle
      });
  }


  async _refreshFeedData(){
    try{
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      let response = await fetch(
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
      let feed_list = [];
      let feed_url_list =  Array.from(new Set(user.feed.concat(user.reactions.map(r => r.feed))));
      for(let i=0;i<feed_url_list.length;i++){
        response = await fetch(
          feed_url_list[i],
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + token,
            }
          }
        );
        if(!response.ok){
          ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
          return;
        }else{
          feed_list.push(await response.json());
        }
      }
      this.setState({
        user: user,
        feed_list: feed_list
      });
    }catch(error){
      console.error(error);
    }
    return;
  }

  async _removeFeed(feed_item){
    Alert.alert(
      'Delete Feed',
      'Are you sure you want to delete this feed?',
      [
        {text: 'Delete', onPress: async () => {
          const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
          const token = await AsyncStorage.getItem('@SocialAgent:token');
          try{
            let response = await fetch(
              feed_item.url,
              {
                method: 'DELETE',
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
            this._refreshFeedData();
          }catch(error){
            console.error(error);
          }
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false }
    );
    return;
  }


  componentWillMount(){
      this._refreshFeedData();
      return
  }

  render() {
    if(this.state.feed_list!=null && this.state.feed_list.length != 0){
      return (
        <View style={styles.container}>
          <ScrollView>
            {
              this.state.feed_list.sort((a,b) => b.datetime > a.datetime ? 1 : -1).map(function(item, index){
                return (
                  <TouchableOpacity key={index} onLongPress={()=> this._removeFeed(item)}>
                    <FeedItem key={item.id} feed={item}/>
                  </TouchableOpacity>
                );
              },this)
            }
          </ScrollView>
        </View>
      );
    }else if (this.state.feed_list!=null) {
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <Text>No feed items available.</Text>
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
    borderColor: '#cccccc'
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
