import React, { Component } from 'react';
import {
  AsyncStorage,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  TouchableOpacity,

} from 'react-native';
import ActivityIcon from '../../ActivityIcon/';

export default class Main extends Component {

  constructor(props){
    super(props);
    this.state = {
      active: null,
      location: null,
      user: null,
    };
    this.refreshUser = this.refreshUser.bind(this);
  }

  static navigationOptions = function(props) {
    return({
      title: 'Main',
      headerLeft:
          <TouchableOpacity onPress={ () => props.navigation.navigate("Settings",{backPreCall: props.navigation.state.params.refreshUser})}>
            <Text style={styles.headerButton}>{'\uF013'}</Text>
          </TouchableOpacity>,
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle
      });
  };

  _handleActivityStatusChange(newUserObject){
    this.setState({user: newUserObject});
  }

  async _handlePressStatus() {
    const active = !this.state.active;
    const location = !this.state.active && this.state.location;
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const body = {
      online: active,
      discoverable: location
    };
    try{
      let response = await fetch(
        server_address+ 'me/',
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
      }else{
        let user = await response.json();
        await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(user));
        this.setState({
          user: user,
          active: active,
          location: location,
        });
        let text = this.state.active?'online.':'offline.';
        ToastAndroid.show('You are now '+text,ToastAndroid.SHORT);
      }
    }catch(error){
      ToastAndroid.show('Something went wrong..'+text,ToastAndroid.SHORT);
      console.log(error);
    }
  }

  async _handlePressLocation() {
    if(!this.state.active) return;
    const location = !this.state.location;
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const body = {
      discoverable: location
    };
    try{
      let response = await fetch(
        server_address+ 'me/',
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
          body: JSON.stringify(body)
        });
      if(!response.ok) {
        ToastAndroid.show('Something went wrong..',ToastAndroid.SHORT);
      }else{
        let user = await response.json();
        await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(user));
        this.setState({
          user: user,
          location: location,
        });
        let text = this.state.location?'discoverable.':'not discoverable.';
        ToastAndroid.show('You are now '+text,ToastAndroid.SHORT);
      }
    }catch(error){
      ToastAndroid.show('Something went wrong..'+text,ToastAndroid.SHORT);
      console.log(error);
    }
  }

  async refreshUser(){
    try{
      const response = await AsyncStorage.getItem('@SocialAgent:user');
      const user = await JSON.parse(response);
      this.setState({
        user: user,
        active: user.online,
        location: user.discoverable,
      });
    }catch(error){
      console.error(error);
    }
    return;
  }

  componentDidMount() {
    this.props.navigation.setParams({ refreshUser: this.refreshUser });
  }

  componentWillMount() {
    this.refreshUser();
    return;
  }


  render() {
    var statusIcon = this.state.active ? 'online' : 'offline';
    var locationIcon = this.state.location ? 'locationon' : 'locationoff';
    if(this.state.user != null){
    return (
      <View style={styles.mainContainer}>
              <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
                <View style={styles.scrollItemMargin}>
                  <Text style={styles.profileName}>{this.state.user.first_name} {this.state.user.last_name}</Text>
                </View>
                <View style={[styles.avatarContainer,styles.scrollItemMargin]}>
                  <View style={[styles.activityButtonWrapper,
                      this.state.active
                      ? {borderColor: '#33cc33'}
                      : {borderColor: '#808080'}
                      ]}>
                    <TouchableOpacity onPress={this._handlePressStatus.bind(this)}>
                      <View style={{flexDirection:'row'}}>
                      <Text
                        style={this.state.active
                            ? styles.activityButtonTextOn
                            : styles.activityButtonTextOff}
                      >{this.state.active ? 'Online' : 'Offline'}</Text>
                        <Image style={{height:40,width:40}} source={{uri: statusIcon}}/>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.locationButtonWrapper,
                      this.state.location
                      ? {borderColor: '#3366cc'}
                      : {borderColor: '#808080'}
                      ]}>
                    <TouchableOpacity onPress={this._handlePressLocation.bind(this)}>
                      <View style={{flexDirection:'row'}}>
                        <Text
                          style={this.state.location
                              ? styles.locationButtonTextOn
                              : styles.locationButtonTextOff}
                        >{this.state.location ? 'Visible' : 'Invisible'}</Text>
                        <Image style={{height:40,width:40}} source={{uri: locationIcon}}/>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <Image style={styles.avatar} source={{uri: this.state.user.avatar}}/>
                </View>
                <View style={[styles.followsContainer,styles.horizontalContainer,styles.scrollItemMargin]}>
                  <TouchableOpacity onPress={ () => {this.props.navigation.navigate("Following", {
                      followers: this.state.user.following,
                      backPreCall: this.refreshUser
                    });}}
                    style={{flex:1}}>
                    <View style={[styles.verticalContainer,{flex:1}]}>
                      <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:16}}>Following</Text>
                      <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:20}}>{this.state.user.following.length}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={ () => {this.props.navigation.navigate("Followers", {
                      followers: this.state.user.followers,
                      backPreCall: this.refreshUser
                    });}}
                    style={{flex:1}}>
                    <View style={[styles.verticalContainer,{flex:1}]}>
                      <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:16}}>Followers</Text>
                      <Text style={{textAlign:'center',color: '#1a1a1a',fontSize:20}}>{this.state.user.followers.length}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.horizontalContainer,styles.scrollItemMargin]}>
                  <Text style={[styles.itemTitle,{flex:1}]}>Followed Activities:</Text>
                  {/*<Text style={{height:38,fontSize: 38,color: '#1a1a1a',textAlignVertical:'bottom'}}>+</Text>*/}
                </View>
                <View style={styles.activitiesList}>
                  {
                    this.state.user.activities.map(function(activity, index){
                      return <ActivityIcon
                              navigation={this.props.navigation}
                              key={index}
                              uri={activity.activity}
                              backPreCall={this.refreshUser}
                            />;
                    },this)
                  }
                  <TouchableOpacity onPress={ () => this.props.navigation.navigate("ActivityPicker",{backPreCall: this.refreshUser})}>
                    <View style={styles.iconMainContainer}>
                        <View style={styles.charContainer}>
                          <Text style={[styles.activityChar,{fontFamily:'awesome'}]}>{'\uF067'}</Text>
                        </View>
                        <Text style={styles.activityName}>Pick New</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              </View>

    );}else{
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
    avatarContainer: {
      height: 170,
      width: 280,
      alignSelf: 'center'
    },
    avatar: {
      height: 170,
      width: 170,
      borderRadius: 85,
      borderWidth: 4,
      borderColor: '#1a1a1a'
    },
    activityButtonWrapper: {
      position: 'absolute',
      top: 15,
      left: 110
      ,borderWidth : 2
      ,padding: 3
      ,borderRadius: 8
      ,paddingLeft: 50
    },
    activityButtonTextOn: {
      textAlign: 'center'
      ,textAlignVertical: 'center'
      ,color: '#33cc33'
      ,fontSize: 18
      ,width: 80
    },
    activityButtonTextOff: {
      textAlign: 'center'
      ,textAlignVertical: 'center'
      ,color: '#808080'
      ,fontSize: 18
      ,width: 80
    },
    locationButtonTextOn: {
      textAlign: 'center'
      ,textAlignVertical: 'center'
      ,color: '#3366cc'
      ,fontSize: 18
      ,width: 80
    },
    locationButtonTextOff: {
      textAlign: 'center'
      ,textAlignVertical: 'center'
      ,color: '#808080'
      ,fontSize: 18
      ,width: 80
    },
    locationButtonWrapper: {
      position: 'absolute',
      bottom: 15,
      left: 110
      ,borderWidth : 2
      ,padding: 3
      ,borderRadius: 8
      ,paddingLeft: 50
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
    scrollContainer: {
      paddingHorizontal: 5,
      backgroundColor: '#f2f2f2',
      flexDirection: 'column',
      flex:1
    },
    scrollItemMargin: {
      margin:5
    },
    contentContainer: {
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
    iconMainContainer: {
      flexDirection: 'column',
      flexWrap: 'wrap',
      width: 55,
      alignItems: 'center',
      margin: 5
    },
    charContainer: {
      borderWidth: 2,
      borderRadius: 16,
      borderColor: '#999999',
      width: 55,
      backgroundColor: '#bfbfbf'
    },
    activityChar: {
      textAlign: 'center',
      fontFamily: 'activities',
      fontSize: 40,
      textAlignVertical:'center',
      height: 50,
      width: 50
    },
    activityName: {
      textAlign: 'center',
      fontSize: 12,
      color: '#1a1a1a'
    },
    activitiesList: {
      flexDirection:'row',
      flexWrap:'wrap'
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
