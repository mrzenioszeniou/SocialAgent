import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import UserIconLarge from '../../UserIconLarge/';

export default class Main extends Component{

  constructor(props){
    super(props);
    this.state = {
      people: null
    };
    this.refreshPeople = this.refreshPeople.bind(this);
  }

  async refreshPeople(){
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    try{
      let response = await fetch(
        server_address + 'users/',
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
      this.setState({people: responseJson});
    }catch(error){
      console.error(error);
    }
    return;
  }

  componentDidMount() {
    this.props.navigation.setParams({ refreshPeople: this.refreshPeople });
  }

  componentWillMount(){
    this.refreshPeople();
    return;
  }

  render(){
    if(this.state.people == null){
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else{
      if(this.state.people.length == 0){
        return(
          <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
            <Text>
              No other users nearby or your status is set to invisible.
            </Text>
          </View>
        );
      }else{
        return (
          <View style={styles.mainContainer}>
            <ScrollView>
            <View style={styles.followersList}>
              {
                  this.state.people.map(function(person, index){
                    return <UserIconLarge navigation={this.props.navigation} key={person.url} uri={person.url} backPreCall={this.refreshPeople}/>;
                  },this)
              }
            </View>
            </ScrollView>
          </View>
        );
      }
    }
  }

  static navigationOptions = function(props) {
    return({
      title: 'Discover',
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerBackTitleStyle: styles.headerButton,
      headerLeft:
          <TouchableOpacity onPress={ () => props.navigation.navigate("Settings",{backPreCall: props.navigation.state.params.refreshPeople})}>
            <Text style={styles.headerButton}>{'\uF0B0'}</Text>
          </TouchableOpacity>,
      headerRight:
      <TouchableOpacity onPress={ () => props.navigation.state.params.refreshPeople()}>
        <Text style={styles.headerButton}>{'\uF021'}</Text>
      </TouchableOpacity>,
    });
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
