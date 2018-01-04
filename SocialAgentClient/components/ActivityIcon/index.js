import React, {Component} from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';



export default class ActivityIcon extends Component {

  constructor(props){
    super(props);
    this.state = {
      activity : null
    };
    this._navigateParent = this._navigateParent.bind(this);
  }

  _navigateParent() {
    this.props.callBack(this.state.activity);
    return;
  }

  async componentWillMount() {
      const token = await AsyncStorage.getItem('@SocialAgent:token');
      try{
        let response = await fetch(
          this.props.uri,
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
        this.setState({activity: responseJson});
      }catch(error){
        console.error(error);
      }
      return;
  }

  render() {
    if(this.state.activity == null) {
      return (
        <View style={{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:'#f2f2f2'}}>
          <ActivityIndicator color={'#ff4d4d'}/>
        </View>
      );
    }else{
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity onPress={() => {
              if("backPreCall" in this.props){
                this.props.navigation.navigate('ActivityPage',{
                  activity: this.state.activity,
                  backPreCall: this.props.backPreCall
                });
              }else{
                this.props.navigation.navigate('ActivityPage',{activity: this.state.activity});
              }
            }}>
            <View style={[styles.charContainer,{backgroundColor:this.state.activity.color}]}>
              <Text style={styles.activityChar}>{this.state.activity.charUnicode}</Text>
            </View>
            <Text style={styles.activityName}>{this.state.activity.name.length > 7 ? this.state.activity.name.substring(0,7) + '.' : this.state.activity.name}</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

}

const styles= StyleSheet.create({
  mainContainer: {
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
    width: 55
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
  }
});
