import React, { Component } from 'react';
import {
  AsyncStorage,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FeedItem from '../../FeedItem/';

export default class FeedComposer extends Component {

  constructor(props){
    super(props);
    this.state = {
      text: ''
    };
  }

  static navigationOptions = function(props) {
    return({
      title: 'Post new feed',
      // headerLeft:
      //     <TouchableOpacity onPress={ () => props.navigation.navigate("Messages") }>
      //       <Text style={styles.headerButton}>{'\uF003'}</Text>
      //     </TouchableOpacity>,
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle
      });
  }

  // async refreshFeed(){
  //   const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
  //   const token = await AsyncStorage.getItem('@SocialAgent:token');
  //   try{
  //     let response = await fetch(
  //       server_address + 'feed/',
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Accept': 'application/json',
  //           'Content-Type': 'application/json',
  //           'Authorization': 'Token ' + token,
  //         },
  //       });
  //     if(!response.ok){
  //       ToastAndroid.show('Something went wrong. STATUS('+response.status+')',ToastAndroid.SHORT);
  //       return;
  //     }
  //     let responseJson = await response.json();
  //     this.setState({feed_list: responseJson});
  //     console.log(responseJson);
  //   }catch(error){
  //     ToastAndroid.show('Something went wrong. Couldn\'t fetch feed.',ToastAndroid.SHORT);
  //     console.log(error);
  //   }
  //   return;
  // }
  // componentWillMount(){
  //     this.refreshFeed();
  //     return
  // }

  render() {
    if(true){
      return (
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            multiline={true}
            maxLength={256}
            underlineColorAndroid={'transparent'}
            placeholder={'Max 256 characters.'}
            value={this.state.text}
            onChange={(text) => {this.setState({text: text});}}
          />
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
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
  textInput: {
    margin: 8,
    textAlign: 'left',
    textAlignVertical: 'top',
    width: 300,
    height: 100,
    borderWidth: 1,
    borderColor: '#cccccc'
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
