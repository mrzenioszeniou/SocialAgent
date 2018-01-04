import React, {Component} from 'react';
import { NavigationActions } from 'react-navigation';
import {
  AsyncStorage,
  ScrollView,
  StyleSheet,
  InteractionManager,
  View,
  Image,
  Text,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import UserIcon from '../UserIcon/';

export default class ActivityPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      pageDidMount: false,
      activity: props.navigation.state.params.activity,
      followed: null
    };
    this._handleFollowPush = this._handleFollowPush.bind(this);
  }

  static navigationOptions = function(props) {
    return({
      title: props.navigation.state.params.activity.name,
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
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerBackTitleStyle: styles.headerButton,
      });
  }

  async _handleFollowPush(){
    try{
      const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      var user = await AsyncStorage.getItem('@SocialAgent:user');
      user = JSON.parse(user);
      const activity_url = this.state.activity.url;
      if(this.state.followed){ // Unfollow
        var url = user.activities.filter(function( obj ) {
          return obj.activity == activity_url;
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
            this.setState({followed:false});
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
            await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(responseJson));
            ToastAndroid.show("Unfollowed.",ToastAndroid.SHORT);
          }else{
            ToastAndroid.show("Something went wrong..",ToastAndroid.SHORT);
          }
      }else{ // Follow
        let response = await fetch(
          server_address + 'activityfollows/',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + token,
            },
            body: JSON.stringify({
              user: user.url,
              activity: activity_url
            })
          });
          if(response.ok){
            this.setState({followed:true});
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

  async componentWillMount() {

    try{
      const user = await AsyncStorage.getItem('@SocialAgent:user');
      var followed_activities = JSON.parse(user).activities;
      if(followed_activities.some((e) => e.activity === this.state.activity.url)){
        this.setState({followed: true});
      }else{
        this.setState({followed: false})
      }
    }catch(error){
      console.error(error);
    }
    return;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(()=>{
      this.setState({pageDidMount: true});
    });
  }

  render() {
    if(this.state.pageDidMount){
      return (
        <View style={styles.mainContainer}>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainers}>
            <View style={[styles.horizontalContainer,
                          {margin:20,justifyContent:'space-between'}]}>{/*Activity Icon + Name*/}
              <View style={[styles.activityIconWrapper,
                  { backgroundColor:this.state.activity.color}]}>
                <Text style={styles.activityIcon}>{this.state.activity.charUnicode}</Text>
              </View>
              <View style={[styles.verticalContainer,styles.activityNameWrapper]}>
                <Text style={[styles.activityName]}>{this.state.activity.name}</Text>
                <Text style={[styles.activityDescription]}>{this.state.activity.description}</Text>
              </View>
            </View>
            <View style={[styles.horizontalContainer,
                          {marginHorizontal:20,paddingBottom:10,justifyContent:'space-around',
                           borderBottomWidth: 1,borderColor:'#1a1a1a'}]}>{/*Followers + Buttons*/}
              <View style={styles.verticalContainer}>{/*Followers*/}
                <Text style={styles.followersText}>Followers</Text>
                <Text style={styles.followersNumber}>{this.state.activity.followed.length}</Text>
              </View>
              <View>{/*Buttons*/}
                <TouchableOpacity onPress={this._handleFollowPush.bind(this)}>
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
            </View>{/*End of Followers + Buttons*/}
            <Text style={[styles.title]}>Followers:</Text>
            <View style={styles.followersList}>
              {
                this.state.activity.followed.map(function(follower, index){
                  return <UserIcon navigation={this.props.navigation} key={index} uri={follower} showDistance={false}/>;
                },this)
              }
            </View>
          </ScrollView>
        </View>
      );
    }else{
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }
  }

}


const styles= StyleSheet.create({
  activityIcon: {
    fontFamily: 'activities',
    fontSize: 100,
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 150,
    width: 150
  },
  activityIconWrapper: {
    borderRadius: 75,
    height: 150,
    width: 150,
    borderWidth: 4,
    borderColor: '#1a1a1a',
    margin: 5
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  activityNameWrapper: {
    flexWrap: 'wrap',
    flex:1,
    margin: 5,
    justifyContent: 'center'
  },
  activityDescription: {
    color: '#595959',
    flexWrap: 'wrap',
    fontSize: 18
  },
  followersText: {
    textAlign:'center',
    color: '#1a1a1a',
    fontSize:22,
    fontWeight: 'bold'
  },
  followersNumber: {
    textAlign:'center',
    color: '#1a1a1a',
    fontSize:22
  },
  followersList: {
    flexDirection: 'row',
    margin: 5,
    flexWrap:'wrap'
  },
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
  scrollContainer: {
    paddingHorizontal: 5,
    flex:1,
    backgroundColor: '#f2f2f2',
    flexDirection: 'column'
  },
  scrollItemMargin: {
    margin:5
  },
  contentContainers: {
    alignItems: 'stretch'
  },
  title: {
    fontSize: 22,
    color: '#1a1a1a',
    margin: 5,
    fontWeight: 'bold'
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
