import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
  Button,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import {NavigationContainer, useIsFocused} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';

var db = openDatabase({name: 'TripDB.db'});

function HomeScreen({navigation}) {
  //radiobutton
  var radio_props = [
    {label: 'Yes', value: 'Yes'},
    {label: 'No', value: 'No'},
  ];

  const tickRadioButton = value => {
    setRisk(value);
  };
  //end radiobutton

  //Pickerdate
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirmDate = date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${day}-${month}-${year}`;
    setDate(dateString);
    hideDatePicker();
  };
  //endpickerdate

  const [tripName, setTripName] = useState('');
  const [tripDestination, setTripDestination] = useState();
  const [tripDescribe, setTripDescribe] = useState('');
  const [date, setDate] = useState('');
  const [risk, setRisk] = useState('Yes');

  // create sqlite and table
  useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_tripe'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_trip', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_trip(trip_id INTEGER PRIMARY KEY AUTOINCREMENT, trip_name VARCHAR(20), trip_destination VARCHAR(20), trip_describe varchar(255), trip_date VARCHAR(20), trip_risk VARCHAR(20))',
              [],
            );
          }
        },
      );
    });
  }, []);

  // function confirmData when create new trip
  const confirmData = () => {
    console.log(tripName, tripDestination, tripDescribe, date, risk);
    if (tripName == '' || tripDestination == '' || date == '' || risk == '') {
      Alert.alert('Please Enter All the Values');
    } else {
      Alert.alert(
        'Confirm trip',
        'Trip name: ' +
          tripName +
          '\n' +
          'Trip Destination: ' +
          tripDestination +
          '\n' +
          'Trip Description: ' +
          tripDescribe +
          '\n' +
          'Trip Date: ' +
          date +
          '\n' +
          'Requires risk assessment: ' +
          risk,
        [
          {
            text: 'Confirm',
            onPress: insertData,
          },
        ],
        {cancelable: true},
      );
    }
  };

  //function insert new trip
  const insertData = () => {
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO table_trip (trip_name, trip_destination, trip_describe, trip_date, trip_risk) VALUES (?,?,?,?,?)',
        [tripName, tripDestination, tripDescribe, date, risk],
      );
    });
  };

  // navigation to view all trip
  navigateToViewScreen = () => {
    navigation.navigate('View All Trip');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.mainContainer}>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={text => setTripName(text)}
          placeholder="Enter Trip Name"
          value={tripName}
        />

        <TextInput
          style={styles.textInputStyle}
          onChangeText={text => setTripDestination(text)}
          placeholder="Enter Destination "
          value={tripDestination}
        />

        <TextInput
          style={[styles.textInputStyle, {marginBottom: 20}]}
          onChangeText={text => setTripDescribe(text)}
          placeholder="Enter Description"
          value={tripDescribe}
        />

        <View style={{paddingLeft: 30, paddingRight: 30, paddingTop: 20}}>
          <Button title="Show Date Picker" onPress={showDatePicker} />
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
          />
          <Text style={{color: 'black'}}> {date}</Text>
        </View>

        <View style={{paddingLeft: 30, paddingRight: 30, paddingTop: 20}}>
          <Text style={{color: 'black', paddingBottom: 18}}>
            Requires risk assessment
          </Text>
          <RadioForm
            radio_props={radio_props}
            initial={0}
            formHorizontal={false}
            onPress={tickRadioButton}
          />
        </View>
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.touchStyle, {marginTop: 20}]}
            onPress={confirmData}>
            <Text style={styles.touchStyleText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.touchStyle,
              {marginTop: 20, backgroundColor: '#61764B'},
            ]}
            onPress={navigateToViewScreen}>
            <Text style={styles.touchStyleText}> View All Trips List </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ViewAllTripScreen() {
  const [items, setItems] = useState([]);
  const [empty, setEmpty] = useState([]);
  const isFocused = useIsFocused();

  // read data from sqlite
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM table_trip', [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i)
          temp.push(results.rows.item(i));
        setItems(temp);
        if (results.rows.length >= 1) {
          setEmpty(false);
        } else {
          setEmpty(true);
        }
      });
    });
  }, [isFocused]);

  // list view trip
  const listViewItemSeparator = () => {
    return <View style={{height: 1, width: '100%', backgroundColor: '#000'}} />;
  };
  // when trip empty
  const emptyMSG = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <Text style={{fontSize: 25, textAlign: 'center'}}>
          Empty Trip. Let's create new trip.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {empty ? (
          emptyMSG(empty)
        ) : (
          <FlatList
            data={items}
            ItemSeparatorComponent={listViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View key={item.trip_id} style={styles.itemContainer}>
                <View style={styles.itemCloumn}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.itemTripIdView}>
                      <Text style={styles.itemTripId}>{item.trip_id} </Text>
                    </View>
                    <View>
                      <Text style={styles.itemsStyle}>
                        Name: {item.trip_name}{' '}
                      </Text>
                      <Text style={styles.itemsStyle}>
                        Destination: {item.trip_destination}{' '}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.itemsStyle}> {item.trip_date} </Text>
                      <Text style={styles.itemsStyle}>
                        {' '}
                        Risk: {item.trip_risk}{' '}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.itemTripDescriptionView}>
                  <Text style={styles.itemsStyle}>
                    {' '}
                    Description: {item.trip_describe}{' '}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// create stack navigator
const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home Screen" component={HomeScreen} />
        <Stack.Screen name="View All Trip" component={ViewAllTripScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },

  itemContainer: {
    marginTop: 5,
    padding: 14,
  },

  itemCloumn: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },

  itemTripIdView: {
    marginRight: 6,
  },

  itemTripId: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },

  itemTripDescriptionView: {
    marginLeft: 22,
  },

  buttonSection: {
    marginTop: 134,
    width: '100%',
  },

  touchStyle: {
    backgroundColor: '#0091EA',
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  touchStyleText: {
    color: '#FFFFFF',
    fontSize: 23,
    textAlign: 'center',
    padding: 8,
  },

  textInputStyle: {
    height: 45,
    width: '90%',
    borderWidth: 1,
    borderRadius: 7,
    marginTop: 15,
  },

  itemsStyle: {
    fontSize: 22,
    color: '#000',
  },
});
