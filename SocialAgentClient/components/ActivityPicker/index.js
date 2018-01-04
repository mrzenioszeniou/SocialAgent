import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import ActivityIcon from '../ActivityIcon/';


export default class ActivityPicker extends Component  {

  constructor(props){
    super(props);
    this.state = {
      activities: null
    };
  }

  async componentWillMount(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    try{
      let response = await fetch(
        server_address + 'activities/',
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
      this.setState({activities: responseJson});
    }catch(error){
      console.error(error);
    }
    return;
  }

  static navigationOptions = function(props) {
    return({
      title: 'Find Activities',
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerBackTitleStyle: styles.headerButton,
      headerLeft:
          <TouchableOpacity onPress={ () => {
            if( "backPreCall" in props){
              props.backPreCall();
            }
            props.navigation.dispatch(NavigationActions.back());
          }}>
            <Text style={styles.headerButton}>{'\uF060'}</Text>
          </TouchableOpacity>,
      });
  }

  render() {
    if(this.state.activities == null){
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else if (this.state.activities.length == 0) {
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <Text>No unfollowed activities available.</Text>
        </View>
      );
    }else{
      return(
        <View style={styles.mainContainer}>
          <View style={styles.followersList}>
            {
              this.state.activities.map(function(activity, index){
                return <ActivityIcon
                  navigation={this.props.navigation}
                  key={index}
                  uri={activity.url}
                  backPreCall={this.props.navigation.state.params.backPreCall}
                />;
              },this)
            }
          </View>
        </View>
      );
    }
  }

}

const styles= StyleSheet.create({
  mainContainer: {
    flex:1,
    backgroundColor: '#f2f2f2',
    flexDirection: 'column',

  },
  followersList: {
    flexDirection: 'row',
    margin: 5,
    flexWrap:'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
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
