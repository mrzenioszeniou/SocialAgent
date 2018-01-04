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

export default class UserIcon extends Component {
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
    if(this.state.person == null) {
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
    width: 74,
  },
  followerAvatar: {
    height: 74,
    width: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  followerName: {
    textAlign: 'center',
    fontSize: 12,
    color: '#1a1a1a'
  }
});
