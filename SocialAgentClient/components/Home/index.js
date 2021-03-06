import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Main from './Main/';
import Settings from './Settings/';
import ActivityPicker from '../ActivityPicker';
import ActivityPage from '../ActivityPage/';
import UserPage from '../UserPage/';
import Followers from '../Followers/';
import Following from '../Following/';

export default class Home extends Component {

  constructor(props){
    super(props);
    this.state = {
      pageDidMount: false,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(()=>{
      this.setState({pageDidMount: true});
    });
  }

  static navigationOptions = {
    tabBarLabel: '\uF015',
  }

  render() {
    if(this.state.pageDidMount){
      const StackNav = StackNavigator({
          Main: {
            screen: Main
          },
          Settings: {
            screen: Settings
          },
          ActivityPicker: {
            screen: ActivityPicker
          },
          ActivityPage: {
            screen: ActivityPage
          },
          Followers: {
            screen: Followers
          },
          Following: {
            screen: Following
          },
          UserPage: {
            screen: UserPage
          },
        },
        {
          initialRouteName: 'Main',
          headerMode: 'screen'
        }
      );
    return <StackNav/>;
  }else{
    return (
    <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
      <ActivityIndicator color={'#ff4d4d'}/>
    </View>
    );
  }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  },
});