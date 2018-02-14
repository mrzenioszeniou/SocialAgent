import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  ActivityIndicator,
  AsyncStorage,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ToastAndroid
} from 'react-native';
import { getDistanceFromLatLonInKm } from '../../assets/support.js';
import { getAgeFromDateOfBirth } from '../../assets/support.js';
import ActivityIcon from '../ActivityIcon/';

export default class UserPage extends Component {
  constructor(props){
    super(props);
    this.state ={
      person: props.navigation.state.params.person,
      user: null,
      followed: null
    };
  }

  async _handleFollowPush(){
    try{
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      var user = this.state.user;
      const person_url = this.state.person.url;

      if(this.state.followed){ // Unfollow
        var url = user.following.filter(function( obj ) {
          return obj.followee == person_url;
        })[0].url;
        let response = await fetch(
          url,
          {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + token,
            },
          });
          if(response.ok){
            let response = await fetch(
              server_address+'me/',
              {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Token ' + token,
                },
              });
            let responseJson = await response.json();
            this.setState({
              followed:false,
              user: responseJson
            });
            await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(responseJson));
            ToastAndroid.show("Unfollowed.",ToastAndroid.SHORT);
          }else{
            ToastAndroid.show("Something went wrong..",ToastAndroid.SHORT);
          }
      }else{ // Follow
        let response = await fetch(
          server_address + 'follows/',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + token,
            },
            body: JSON.stringify({
              follower: user.url,
              followee: person_url
            })
          });
          if(response.ok){
            let response = await fetch(
              server_address+'me/',
              {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Token ' + token,
                },
              });
            let responseJson = await response.json();
            this.setState({
              followed: true,
              user: responseJson
            });
            await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(responseJson));
            ToastAndroid.show("Followed.",ToastAndroid.SHORT);
          }else{
            ToastAndroid.show("Something went wrong..",ToastAndroid.SHORT);
          }
      }
    }catch(error){
      console.error(error);
    }
  }

  async componentWillMount(){
    try{
      const user = await AsyncStorage.getItem('@SocialAgent:user');
      var followed_users = JSON.parse(user).following;
      if(followed_users.some((e) => e.followee === this.state.person.url)){
        this.setState({
          followed: true,
          user: JSON.parse(user)
        });
      }else{
        this.setState({
          followed: false,
          user: JSON.parse(user)
      });
      }
    }catch(error){
      console.error(error);
    }
    return;
  }

  static navigationOptions = function(props) {
    return({
      title: 'User',
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerLeft:
          <TouchableOpacity onPress={ () => {
                if( "backPreCall" in props){
                  props.backPreCall();
                }else if("backPreCall" in props.navigation.state.params){
                  props.navigation.state.params.backPreCall();
                }
               props.navigation.dispatch(NavigationActions.back());
             }}>
             <Text style={styles.headerButton}>{'\uF060'}</Text>
           </TouchableOpacity>,
      headerBackTitleStyle: styles.headerButton,
      });
  }

  render() {
    if(this.state.user != null){
      return (
        <View style={styles.mainContainer}>
          <ScrollView>
          <View style={styles.scrollItemMargin}>
            <Text style={styles.profileName}>{ this.state.person.first_name}
               {" "+this.state.person.last_name} {getAgeFromDateOfBirth(this.state.person.dateOfBirth)}</Text>
          </View>
          <View style={styles.scrollItemMargin}>
            <Text style={[styles.profileName,{fontWeight:'normal'}]}>{getDistanceFromLatLonInKm(
                  this.state.user.latitude,
                  this.state.user.longitude,
                  this.state.person.latitude,
                  this.state.person.longitude)} away</Text>
          </View>
          <View style={[styles.avatarContainer,styles.scrollItemMargin,styles.horizontalContainer]}>
            <Image style={styles.avatar} source={{uri: this.state.person.avatar}}/>
          </View>
          <View style={[styles.followsContainer,styles.horizontalContainer,styles.scrollItemMargin]}>
            <View style={[styles.verticalContainer,{flex:1}]}>
              <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:16}}>Following</Text>
              <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:20}}>{this.state.person.following.length}</Text>
            </View>
            <View style={[styles.verticalContainer,{flex:1}]}>
              <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:16}}>Followers</Text>
              <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:20}}>{this.state.person.followers.length}</Text>
            </View>
          </View>
          <View style={[styles.verticalContainer,styles.horizontalContainer,
                        styles.scrollItemMargin,{justifyContent:'space-around'}]}>
            <TouchableOpacity onPress={ this._handleFollowPush.bind(this) }>
              <View style={this.state.followed?styles.unfollowButtonWrapper:styles.followButtonWrapper}>
                <Text style={[styles.scrollItemMargin,this.state.followed?styles.unfollowButtonIcon:styles.followButtonIcon]}>
                  {this.state.followed?'\uF056':'\uF055'}
                </Text>
                <Text style={styles.followButtonText}>
                  {this.state.followed ?'Unfollow':'Follow'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.horizontalContainer,styles.scrollItemMargin]}>
            <Text style={[styles.itemTitle,{flex:1}]}>Activities:</Text>
          </View>
          <View style={[styles.horizontalContainer,styles.scrollItemMargin,{flexWrap:'wrap'}]}>
            {
              this.state.person.activities.map(function(activity, index){
                return <ActivityIcon navigation={this.props.navigation} key={activity.activity} uri={activity.activity}/>;
              },this)
            }
          </View>
        </ScrollView>
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

const styles= StyleSheet.create({
  followButtonText: {
      color:'#595959',
      fontSize: 16,
      fontWeight: 'bold'
  },
  followButtonIcon: {
    fontFamily: 'awesome',
    fontSize:28,
    fontWeight:'normal',
    color:'#00e600'
  },
  unfollowButtonIcon: {
    fontFamily: 'awesome',
    fontSize:28,
    fontWeight:'normal',
    color:'#e60000'
  },
  followButtonWrapper: {
    height: 50,
    width: 120,
    borderColor: '#00cc00',
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'

  },
  unfollowButtonWrapper: {
    height: 50,
    width: 120,
    borderColor: '#cc0000',
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  pokeButtonWrapper : {
    height: 50,
    width: 120,
    borderColor: '#005c99',
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'

  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    height: 170,
    width: 170,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: '#1a1a1a'
  },
  followsContainer: {
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 8
  },
  verticalContainer: {
    flexDirection: 'column'
  },
  horizontalContainer: {
    flexDirection: 'row'
  },
  mainContainer: {
    flex:1,
    backgroundColor: '#f2f2f2',
    flexDirection: 'column'
  },
  scrollItemMargin: {
    margin:5
  },
  profileName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  itemTitle: {
    fontSize: 20,
    color: '#1a1a1a'
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
