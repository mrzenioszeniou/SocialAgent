import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ToastAndroid,
  View,
} from 'react-native';
import { getElapsedTimeFromTimestamp } from '../../../assets/support.js';

export default class Comment extends Component {

  constructor(props){
    super(props);
    this.state = {
      user: null
    };
  }

  async componentWillMount(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    let response = await fetch(
      this.props.reaction.user,
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
    }else{
      this.setState({
        user: await response.json()
      });
    }
  }

  render(){
    if(this.state.user === null){
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else{
      return(
        <View style={styles.commentContainer}>
          <View style={styles.commentHeader}>
            <Image style={styles.commentAvatar} source={{uri: this.state.user.avatar}}/>
            <Text style={styles.commentTitle}>{this.state.user.first_name} {this.state.user.last_name}</Text>
            <Text style={[styles.commentTitle,{flex:1, textAlign: 'right'}]}>{getElapsedTimeFromTimestamp(this.props.reaction.datetime)}</Text>
          </View>
          <Text style={styles.commentText}>{this.props.reaction.content}</Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    padding: 4,
  },
  commentHeader: {
    flexDirection: 'row'
  },
  commentTitle: {
    marginLeft: 2,
    fontSize: 15,
    textAlignVertical: 'center',
    color: '#4d4d4d'
  },
  commentText: {
    fontSize: 13
  },
  commentAvatar: {
      height: 30,
      width: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#4d4d4d'
  },
  likeCountIcon:{
    textAlignVertical: 'center',
    color: '#ff3333',
    fontSize: 16,
    fontFamily: 'awesome',
    padding: 2
  },
  commentCountIcon:{
    textAlignVertical: 'center',
    color: '#0073e6',
    fontSize: 16,
    fontFamily: 'awesome',
    padding: 2
  }
});
