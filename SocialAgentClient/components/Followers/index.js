import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import UserIcon from '../UserIcon/';


export default class Followers extends Component  {

  static navigationOptions = function(props) {
    return({
      title: 'Followers',
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
    return(
      <View style={styles.mainContainer}>
        <View style={styles.followersList}>
          {
            this.props.navigation.state.params.followers.map(function(follower, index){
              return <UserIcon navigation={this.props.navigation} key={index} uri={follower.follower}/>;
            },this)
          }
        </View>
      </View>
    );
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
