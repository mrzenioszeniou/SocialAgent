import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  ToastAndroid,
  View,
} from 'react-native';
import { getElapsedTimeFromTimestamp } from '../../assets/support.js';
import { getDistanceFromLatLonInKm } from '../../assets/support.js';
import Comment from './FeedComment/';

export default class FeedItem extends Component {

  constructor(props){
    super(props);
    this.state = {
      user: null,
      activity: null,
      latitude: null,
      longitude: null,
      liked: null,
      commenting: false,
      commentText: ''
    }
    this._handleLikePress = this._handleLikePress.bind(this);
    this._handleCommentPress = this._handleCommentPress.bind(this);
  }

  async componentWillMount(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    const curr_user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
    this.setState({
      latitude: curr_user.latitude,
      longitude: curr_user.longitude,
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
      if(this.props.feed.reactions.filter(r => r.type === 'Like' && r.user === curr_user.url).length > 0){
        this.setState({liked: true});
      }else{
        this.setState({liked: false});
      }
      this.setState({user: user});
      this.setState({activity: activity});
    }catch(error){
      ToastAndroid.show('Something went wrong. Couldn\'t fetch feed.',ToastAndroid.SHORT);
      console.log(error);
    }
  }

  async _handleLikePress(){
    try{
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      const curr_user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
      if(this.state.liked){
        const reaction = this.props.feed.reactions.filter(r => r.type === 'Like' && r.user === curr_user.url)[0];
        let response = await fetch(
          reaction.url,
          {
            method: 'DELETE',
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
          this.setState({liked: false})
          this.props.refreshFeed();
        }
      }else{
        const body = {
          user: curr_user.url,
          feed: this.props.feed.url,
          type: 'Like'
        }
        let response = await fetch(
          server_address+'reactions/',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + token,
            },
            body: JSON.stringify(body)
          });
        if(!response.ok) {
          ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
          return;
        }else{
          this.setState({liked: true})
          this.props.refreshFeed();
        }
      }
    }catch(error){
      ToastAndroid.show('Something went wrong.',ToastAndroid.SHORT);
      console.log(error);
    }
    return;
  }

  async _handleCommentPress(){
    if(this.state.commentText.replace(/\s/g, '') === ''){
      ToastAndroid.show('Empty comments are not allowed',ToastAndroid.SHORT);
    }
    try{
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      const curr_user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
      const body = {
        user: curr_user.url,
        feed: this.props.feed.url,
        type: 'Comment',
        content: this.state.commentText
      }
      let response = await fetch(
        server_address+'reactions/',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
        return;
      }else{
        this.setState({commenting: false});
        this.props.refreshFeed();
      }
    }catch(error){
      ToastAndroid.show('Something went wrong.',ToastAndroid.SHORT);
      console.log(error);
    }
    return;
  }

  render() {
    if(this.state.user && this.state.activity){
      return(
        <View style={styles.mainContainer}>
          <View style={styles.title}>
            <Image style={styles.avatar} source={{uri: this.state.user.avatar}}/>
            <View style={{flexDirection:'column', padding: 4, flex:1, justifyContent:'space-between'}}>
              <View style={{flexDirection:'row', flex:1, justifyContent:'space-between', alignItems:'center'}}>
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
              {this.props.feed.picture && <Image resizeMode={'contain'} style={styles.picture} source={{uri: this.props.feed.picture}} />}
          </View>
          <View style={styles.reactionsContainer}>
            <View style={styles.reactionCountContainer}>
              <Text style={styles.likeCountIcon}>{'\uF087'}</Text>
              <Text style={styles.reactionCountText}>{this.props.feed.reactions.reduce((acc,cur) => cur.type === 'Like' ? acc + 1 : acc ,0)}</Text>
            </View>
            <View style={styles.reactionCountContainer}>
              <Text style={styles.commentCountIcon}>{'\uF086'}</Text>
              <Text style={styles.reactionCountText}>{this.props.feed.reactions.reduce((acc,cur) => cur.type === 'Comment' ? acc + 1 : acc ,0)}</Text>
            </View>
            <TouchableOpacity onPress={this._handleLikePress}>
              <View style={[styles.reactionsSubContainer,{backgroundColor:
                this.state.liked ? '#ff6666' : '#b3b3b3'}]}>
                <Text style={styles.reactionsIcon}>{'\uF087'}</Text>
                <Text style={styles.reactionsText}>LIKE</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({commenting: true})}>
              <View style={[styles.reactionsSubContainer,{backgroundColor: '#b3b3b3'}]}>
                <Text style={styles.reactionsIcon}>{'\uF075'}</Text>
                <Text style={styles.reactionsText}>COMMENT</Text>
              </View>
            </TouchableOpacity>

          </View>
          <View>
            {
              this.props.feed.reactions.filter((r) => r.type === 'Comment').map(function(reaction, index){
                return <Comment reaction={reaction} key={index}/>;
              },this)
            }
          </View>
          <Modal
            transparent={true}
            visible={this.state.commenting}
            animationType={'slide'}
            onRequestClose={() => this.setState({commenting: false})}
          >
            <View style={{flex:1}}/>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => this.setState({commenting: false})}>
                <Text style={styles.modalCancelIcon}>{'\uF057'}</Text>
              </TouchableOpacity>
              <TextInput
                maxLength={128}
                style={styles.modalText}
                placeholder={"Maximum 128 characters."}
                onChangeText={(text) => this.setState({commentText: text})}
                value={this.state.commentText}
                multiline={true}
                underlineColorAndroid={'#0099ff'}
              />
              <TouchableOpacity onPress={this._handleCommentPress}>
                <Text style={styles.modalPostIcon}>{'\uF045'}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      )
    }else{
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }


  }
}

const styles = StyleSheet.create({
  modalContainer:{
    backgroundColor: '#ffffff',
    flexDirection:'row',
    height:70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e6e6e6'
  },
  modalCancelIcon:{
    fontFamily: 'awesome',
    color: '#ff6666',
    fontSize: 32,
    padding: 4,
  },
  modalPostIcon:{
    fontFamily: 'awesome',
    fontSize: 30,
    padding: 4,
    color: '#0099ff'
  },
  modalText:{
    flex:1,
    fontSize: 15
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
  },
  reactionCountText:{
    color: '#595959',
    fontSize: 15,
    padding: 2
  },
  reactionCountContainer: {
    margin: 2,
    padding: 4,
    flexDirection: 'row',
  },
  reactionsContainer:{
    margin: 4,
    flexDirection: 'row'
  },
  reactionsSubContainer:{
    margin: 2,
    padding: 4,
    borderRadius: 4,
    flexDirection: 'row',
  },
  reactionsIcon:{
    textAlignVertical: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'awesome',
    padding: 2
  },
  reactionsText:{
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    padding: 2
  },
  picture: {
    flex: 1,
    height: 250,
    width: null,
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
    fontSize: 18,
  },
  mainContainer:{
    flexDirection: 'column',
    borderWidth: 3,
    borderColor: '#e6e6e6',
    padding: 10,
  },
  title:{
    flexDirection: 'row'
  },
  content:{
    flexDirection: 'column',
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
