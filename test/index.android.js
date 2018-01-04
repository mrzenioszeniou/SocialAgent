import React from 'react';
import {
  AppRegistry,
  Text,
  View,
  Button,
} from 'react-native';
import { TabNavigator,StackNavigator } from 'react-navigation';

class Home extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };
  render() {
      return (
        <View>
          <Text>Hello, you're at Home!</Text>
        </View>
      );
  }
}

class Discover extends React.Component {
    static navigationOptions = {
      title: 'Discover'
    };

    render() {
      return (
        <View>
          <Text>Hello, you're at Discover</Text>
        </View>
      );
    }
}


class FeedMain extends React.Component {
  static navigationOptions = {
    title: 'FeedMain'
  };
class Feed extends React.Component {
  render () {

    const SubNav = TabNavigator({
        FeedMain:{ screen: FeedMain },
        FeedPop: { screen: FeedSub},
      },{
        initialRouteName: 'FeedMain',
    });

    return (<SubNav/>)
  }

}
    render() {
      return (
        <View>
          <Text>Hello, you're at Feed Main</Text>
          <Button
            onPress={() => this.props.navigation.navigate('FeedPop')}
            title="Go deeper!"
          />
        </View>
      );
    }
}

class FeedSub extends React.Component {
  static navigationOptions = {
    title: 'FeedSub'
  };

    render() {
      return (
        <View>
          <Text>Hello, you're at Feed Sub!!!</Text>
        </View>
      );
    }
}

class Feed extends React.Component {


  render () {

    const SubNav = TabNavigator({
        FeedMain:{ screen: FeedMain },
        FeedPop: { screen: FeedSub},
      },{
        initialRouteName: 'FeedMain',
    });

    return (<SubNav/>)
  }

}

const test = TabNavigator({
    Home: { screen: Home },
    Discover: { screen: Discover },
    Feed: { screen: Feed},
  },
  {
    tabBarPosition: 'bottom',
    order: ['Discover','Home', 'Feed'],
    initialRouteName: 'Home',
    tabBarOptions: {
      style: {
        backgroundColor: '#ff4d4d',
      }
    },

  },
);

AppRegistry.registerComponent('test', () => test);
