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
import UserIcon from '../UserIcon/';


export default class Following extends Component  {

  constructor(props){
    super(props);
    this.state = {
      followers: null
    };
  }

  async componentWillMount(){
    try{
      const response = await AsyncStorage.getItem('@SocialAgent:user');
      const user = await JSON.parse(response);
      this.setState({
        followers: user.following
      });
    }catch(error){
      console.error(error);
    }
    return;
  }

  static navigationOptions = function(props) {
    return({
      title: 'Following',
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

  render() {
    if(this.state.followers!==null){
      return(
        <View style={styles.mainContainer}>
          <View style={styles.followersList}>
            {
              this.state.followers.map(function(follower, index){
                return <UserIcon navigation={this.props.navigation} key={follower.followee} uri={follower.followee}/>;
              },this)
            }
          </View>
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
