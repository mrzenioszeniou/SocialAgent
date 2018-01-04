import React, { Component } from 'react';
import {
  AsyncStorage,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import { getDistanceFromLatLonInKm } from '../../assets/support.js';

export default class UserIconLarge extends Component {
  constructor(props){
    super(props);
    this.state = {
       person: null,
       user: null
    };
    //this._navigateParent = this._navigateParent.bind(this);
  }

  async componentWillMount(){
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    const user = await AsyncStorage.getItem('@SocialAgent:user');
    this.setState({user: JSON.parse(user)})
    try{
      let response = await fetch(
        this.props.uri,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
        });
      if(!response.ok) return;
      let responseJson = await response.json();
      this.setState({person: responseJson});
    }catch(error){
      console.error(error);
    }
    return;
  }

  render(){
    if(this.state.person == null || this.state.user == null) {
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else{
      return(
        <TouchableOpacity onPress={() => {
          if("backPreCall" in this.props){
            this.props.navigation.navigate('UserPage',{
              person: this.state.person,
              backPreCall: this.props.backPreCall
            });
          }else{
            this.props.navigation.navigate('UserPage',{person: this.state.person});
          }
        }}>
          <View style={styles.followerContainer}>
            <Image style={styles.followerAvatar} source={{uri:this.state.person.avatar}}/>
            <Text style={styles.followerName}>{this.state.person.first_name} {this.state.person.last_name}</Text>
            <Text style={styles.followerName}>{
              getDistanceFromLatLonInKm(
                this.state.user.latitude,
                this.state.user.longitude,
                this.state.person.latitude,
                this.state.person.longitude)} away
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }
}
const styles= StyleSheet.create({
  followerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: 5,
    width: 118,
  },
  followerAvatar: {
    height: 118,
    width: 118,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: '#404040'
  },
  followerName: {
    textAlign: 'center',
    fontSize: 17,
    color: '#1a1a1a'
  }
});
