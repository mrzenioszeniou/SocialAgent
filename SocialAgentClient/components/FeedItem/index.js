import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { getElapsedTimeFromTimestamp } from '../../assets/support.js';
import { getDistanceFromLatLonInKm } from '../../assets/support.js';

export default class FeedItem extends Component {

  constructor(props){
    super(props);
    this.state = {
      user: null,
      activity: null,
      latitude: null,
      longitude: null,
    }
  }

  async componentWillMount(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    const user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
    this.setState({
      latitude: user.latitude,
      longitude: user.longitude,
    });
    try{
      let response = await fetch(
        this.props.feed.user,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
        });
      if(!response.ok){
        ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
        return;
      }
      const user = await response.json();
      response = await fetch(
        this.props.feed.activity,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
        });
      if(!response.ok){
        ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
        return;
      }
      const activity = await response.json();
      this.setState({user: user});
      this.setState({activity: activity});
    }catch(error){
      ToastAndroid.show('Something went wrong. Couldn\'t fetch feed.',ToastAndroid.SHORT);
      console.log(error);
    }
  }

  render() {
    if(this.state.user && this.state.activity){
      return(
        <View style={styles.mainContainer}>
          <View style={styles.title}>
            <Image style={styles.avatar} source={{uri: this.state.user.avatar}}/>
            <View style={{flexDirection:'column', padding: 4, flex:1, justifyContent:'space-between'}}>
              <View style={{flexDirection:'row', flex:1, justifyContent:'space-between'}}>
                <Text style={styles.name}>{this.state.user.first_name} {this.state.user.last_name}</Text>
                <Text style={styles.time}>{getElapsedTimeFromTimestamp(this.props.feed.datetime)}</Text>
              </View>
              <Text style={styles.activityAndLocation}>{this.state.activity.name} @ {
                getDistanceFromLatLonInKm(
                  this.state.latitude,this.state.longitude,this.props.feed.latitude,this.props.feed.longitude
                )} away</Text>
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.contentText}>{this.props.feed.text}</Text>
              {this.props.feed.picture && <Image resizeMode={'stretch'} style={styles.picture} source={{uri: this.props.feed.picture}} />}
          </View>
        </View>
      )
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
    height: 250,
    width: null,
    borderWidth: 1,
    borderColor: '#e6e6e6'
  },
  activityAndLocation:{
    fontSize: 18,
    color: '#4d4d4d',
  },
  name:{
    color: '#333333',
    textAlignVertical: 'bottom',
    fontSize: 22,
  },
  time:{
    color: '#333333',
    textAlign: 'right',
    textAlignVertical: 'bottom',
    fontSize: 20,
  },
  mainContainer:{
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 6
  },
  title:{
    flexDirection: 'row'
  },
  content:{
    flexDirection: 'column',
    padding: 12,
  },
  contentText: {
    marginBottom: 4,
    color: '#595959',
    fontSize: 16,
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
});
