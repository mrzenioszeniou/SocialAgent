import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';



export default class Main extends Component {

  constructor(props){
    super(props);
    this.state = {
      done: false
    }
    this.updateSettings = this.updateSettings.bind(this);
  }

  static navigationOptions = function(props) {
    return({
      title: 'Settings',
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerBackTitleStyle: styles.headerButton,
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
      headerRight:
          <TouchableOpacity onPress={ () => {props.navigation.state.params.updateSettings();}}>
             <Text style={styles.headerButton}>{'\uF00C'}</Text>
           </TouchableOpacity>,
      });
  }

  componentDidMount() {
    this.props.navigation.setParams({ updateSettings: this.updateSettings });
  }

  async updateSettings(){
    if(this.state.max_age < this.state.min_age){
      ToastAndroid.show('Maximum age is smaller than the minimum age. Change and try again..',ToastAndroid.LONG);
      return;
    }
    const server_address = await AsyncStorage.getItem('@SocialAgent:server-address');
    const token = await AsyncStorage.getItem('@SocialAgent:token');
    try{
      var body = {
        discover_distance: String(this.getActualDistanceFromState(this.state.distance)),
        discover_age_max: this.state.max_age > 60 ? 100 : this.state.max_age,
        discover_age_min: this.state.min_age
      };
      let response = await fetch(
        server_address+'me/',
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
        return;
      }
      let responseJson = await response.json();
      await AsyncStorage.setItem('@SocialAgent:user',JSON.stringify(responseJson));
      this.props.navigation.state.params.backPreCall();
      this.props.navigation.dispatch(NavigationActions.back());
    }catch(error){
      console.error(error);
    }
    return;

  }

  async componentWillMount(){
    try{
      const user = JSON.parse(await AsyncStorage.getItem('@SocialAgent:user'));
      this.setState({
        done: true,
        distance: this.getStateFromActualDistance(user.discover_distance),
        max_age: user.discover_age_max,
        min_age: user.discover_age_min,
      });
    }catch(error){
      console.error(error);
    }
    return;
  }

  getStateFromActualDistance(d){
    d = parseFloat(d);
    switch(true){
      case (d==0.001):
        return 1;
        break;
      case (d==0.010):
        return 2;
        break;
      case (d==0.050):
        return 3;
        break;
      case (d>=0.1 && d<=0.5):
        return (d*10) + 3;
        break;
      case (d>=1 && d<=100):
        return d+8
        break;
      default:
        return 109;
        break;
    }
  }

  getActualDistanceFromState(d){
    switch(true){
      case (d==1):
        return 0.005;
        break;
      case (d==2):
        return 0.010;
        break;
      case (d==3):
        return 0.050;
        break;
      case (d>=4 && d<=8):
        return (d-3)/10;
        break;
      case (d>=9 && d<=108):
        return (d-8)* 1.0
        break;
      default:
        return 9999.999;
        break;
    }
  }

  getStringDistanceFromState(d){
    switch(true){
      case (d==1):
        return '5 meters';
        break;
      case (d==2):
        return '10 meters';
        break;
      case (d==3):
        return '50 meters';
        break;
      case (d>=4 && d<=8):
        return (d-3)*100 + ' meters';
        break;
      case (d>=9 && d<=108):
        return d-8 + ' km'
        break;
      default:
        return '100+ km'
        break;
    }
  }

  render() {
    if(!this.state.done){
      return(
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else{
      return(
          <ScrollView style={[styles.mainContainer,{marginHorizontal:4}]} contentContainerStyle={styles.contentContainers}>
              <View style={{flex:1}}>
                <Text style={styles.itemTitle}>Distance</Text>
              </View>
              <View style={[styles.horizontalContainer,{margin:4}]}>
                <Text>{'5m'}</Text>
                <Text style={{fontSize: 16 ,flex:1,textAlign:'center'}}>
                {this.getStringDistanceFromState(this.state.distance)}</Text>
                <Text>{'100km'}</Text>
              </View>
              <Slider
                maximumValue={109}
                minimumValue={1}
                step={1}
                onValueChange={(value) => {
                  this.setState({distance: value});
                }}
                value={this.state.distance}
                disabled={false}
                style={{marginBottom: 10}}
              />
              <View style={{flex:1}}>
                <Text style={styles.itemTitle}>Minimum Age</Text>
              </View>
              <View style={[styles.horizontalContainer,{margin:4}]}>
                <Text>18</Text>
                <Text style={{fontSize: 16 ,flex:1,textAlign:'center'}}>
                  {this.state.min_age>60?'60+':this.state.min_age}
                </Text>
                <Text>60</Text>
              </View>
              <Slider
                maximumValue={61}
                minimumValue={18}
                step={3}
                onValueChange={(value) => {this.setState({min_age: value});}}
                value={this.state.min_age}
                disabled={false}
                style={{marginBottom: 10}}
              />
              <View style={{flex:1}}>
                <Text style={styles.itemTitle}>Maximum Age</Text>
              </View>
              <View style={[styles.horizontalContainer,{margin:4}]}>
                <Text>18</Text>
                <Text style={{fontSize: 16 ,flex:1,textAlign:'center'}}>
                  {this.state.max_age>60?'60+':this.state.max_age}
                </Text>
                <Text>60</Text>
              </View>
              <Slider
                maximumValue={61}
                minimumValue={18}
                step={1}
                onValueChange={(value) => {this.setState({max_age: value});}}
                value={this.state.max_age}
                disabled={false}
                style={{marginBottom: 10}}
              />
          </ScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  mainContainer: {
      flex:1,
      backgroundColor: '#f2f2f2',
      flexDirection: 'column'
    },
    contentContainers: {
      alignItems: 'stretch',
      margin: 4
    },
    itemTitle: {
      fontSize: 20,
      color: '#1a1a1a'
    },
    verticalContainer: {
      flexDirection: 'column'
    },
    horizontalContainer: {
      flexDirection: 'row'
    },
    checkboxWrapper: {
      justifyContent: 'space-around',
      flexDirection: 'row',
      flex: 1
    },
    checkbox: {
      height: 20,
      width: 20,
      borderWidth: 1,
      marginLeft: 6
    },
    checkboxIcon: {
      fontFamily: 'awesome',
      fontSize: 16,
      textAlign: 'center'
    },
    checkboxText: {
      fontSize: 16,
      color: '#1a1a1a',
      textAlign: 'center'
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
