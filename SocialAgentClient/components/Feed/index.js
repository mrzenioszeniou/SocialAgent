import React, { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Main from './Main/';
import FeedComposer from './FeedComposer/';

export default class Feed extends Component {

  static navigationOptions = {
    tabBarLabel: '\uF0AC',
  }

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

  render(){
    if(this.state.pageDidMount){
      const StackNav = StackNavigator(
        {
          Main: {
            screen: Main,
          },
          FeedComposer: {
            screen: FeedComposer,
          }
        },{
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
