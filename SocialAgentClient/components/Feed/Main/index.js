import React, { Component } from 'react';
import {
  AsyncStorage,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FeedItem from '../../FeedItem/';

export default class Main extends Component {

  constructor(props){
    super(props);
    this.state = {
      feed_list: null
    };
    this.refreshFeed = this.refreshFeed.bind(this);
  }

  static navigationOptions = function(props) {
    return({
      title: 'Feed',
      headerLeft:
          <TouchableOpacity onPress={ () => props.navigation.navigate("FeedComposer", {backPreCall: props.navigation.state.params.refreshFeed}) }>
            <Text style={styles.headerButton}>{'\uF044'}</Text>
          </TouchableOpacity>,
      headerRight:
          <TouchableOpacity onPress={ () => props.navigation.navigate("FeedPersonal", {backPreCall: props.navigation.state.params.refreshFeed})}>
            <Text style={styles.headerButton}>{'\uF022'}</Text>
          </TouchableOpacity>,
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle
      });
  }

  async refreshFeed(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    try{
      let response = await fetch(
        server_address + 'feed/',
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
      let responseJson = await response.json();
      this.setState({feed_list: responseJson});
    }catch(error){
      ToastAndroid.show('Something went wrong. Couldn\'t fetch feed.',ToastAndroid.SHORT);
      console.log(error);
    }
    return;
  }

  componentDidMount() {
    this.props.navigation.setParams({ refreshFeed: this.refreshFeed });
  }

  componentWillMount(){
      this.refreshFeed();
      return
  }

  render() {
    if(this.state.feed_list!=null && this.state.feed_list.length != 0){
      return (
        <View style={styles.container}>
          <ScrollView>
            {
              this.state.feed_list.map(function(item, index){
                return <FeedItem key={index} feed={item}/>;
              },this)
            }
          </ScrollView>
        </View>
      );
    }else if (this.state.feed_list!=null) {
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <Text>No feed items available.</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  flatList: {
    flex:1,
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
