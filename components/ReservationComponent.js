import React, { Component } from 'react';
import { ScrollView, Text, View, StyleSheet, Picker, Switch, Button, Alert } from 'react-native';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import * as Animatable from "react-native-animatable";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import * as Calendar from 'expo-calendar';


class Reservation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            guests: 1,
            smoking: false,
            date: ''
        }
    }

    static navigationOptions = {
        title: 'Reserve Table',
    };

    handleReservation() {
        console.log(JSON.stringify(this.state));
        Alert.alert(
            "Confirm your Reservation:",
            "Number of Guests: " +
              this.state.guests +
              "\nSmoking Status: " +
              this.state.smoking +
              "\nDate: " +
              this.state.date,
            [
              {
                text: "Cancel",
                onPress: () => this.resetForm(),
                style: "cancel",
              },
              {
                text: "Confirm",
                onPress: () => {
                    this.presentLocalNotif(this.state.date);                   
                    this.addReservationToCalendar(this.state.date);                   
                    this.resetForm();
                },
                style: "default",
              },
            ]
        );
    }

    resetForm() {
        this.setState({
            guests: 1,
            smoking: false,
            date: ''
        });
    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAsync(
           Permissions.USER_FACING_NOTIFICATIONS
        );
    
        if (permission.status !== "granted") {
            permission = await Permissions.askAsync(
                Permissions.USER_FACING_NOTIFICATIONS
            );

            if (permission.status !== "granted") {
                Alert.alert("Permission not granted to show notifications");
            }
        } else {
            if (Platform.OS === "android") {
                Notifications.createChannelAndroidAsync("notify", {
                    name: "notify",

                    sound: true,

                    vibrate: true,
                });
            }
        }
    
        return permission;
    }

    async obtainCalendarPermission() {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status === "granted") {
          const calendars = await Calendar.getCalendarsAsync();
        }
    }

    async getDefaultCalendarSource() {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
        return defaultCalendars[0].source;
    }
      
    async getCalendarID() {
        const defaultCalendarSource =
          Platform.OS === 'ios'
            ? await getDefaultCalendarSource()
            : { isLocalAccount: true, name: 'Expo Calendar' };
        const newCalendarID = await Calendar.createCalendarAsync({
          title: 'Expo Calendar',
          color: 'blue',
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultCalendarSource.id,
          source: defaultCalendarSource,
          name: 'internalCalendarName',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
        return newCalendarID;
    }

    async addReservationToCalendar(date) {
        this.obtainCalendarPermission();
        var ID = await this.getCalendarID();
        const newCalendarID = await Calendar.createEventAsync(ID, {
          title: "Con Fusion Table Reservation",
          startDate: new Date(Date.parse(date)),
          endDate: new Date(Date.parse(date).getTime() + 7200000),
          timeZone: "Asia/Hong_Kong",
          location:
            "121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong",
        });
        console.log(`Your new event id is: ${newCalendarID}`);
    }

    async presentLocalNotif(date) {
        await this.obtainNotificationPermission();
    
        Notifications.presentLocalNotificationAsync({
          title: "Your Reservation",
    
          body: "Reservation for " + date + " requested",
    
          ios: {
            sound: true,
          },
    
          android: {
            channelId: "notify",
            sound: true,
            color: "#512DA8",
          },
        });
    }

    

    render() {
        return(

            <ScrollView>
                <Animatable.View animation='zoomIn' duration={2000}>                
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Number of Guests</Text>
                        <Picker
                            style={styles.formItem}
                            selectedValue={this.state.guests}
                            onValueChange={(itemValue, itemIndex) => this.setState({guests: itemValue})}>
                            <Picker.Item label="1" value="1" />
                            <Picker.Item label="2" value="2" />
                            <Picker.Item label="3" value="3" />
                            <Picker.Item label="4" value="4" />
                            <Picker.Item label="5" value="5" />
                            <Picker.Item label="6" value="6" />
                        </Picker>
                        </View>
                        <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
                        <Switch
                            style={styles.formItem}
                            value={this.state.smoking}
                            onTintColor='#512DA8'
                            onValueChange={(value) => this.setState({smoking: value})}>
                        </Switch>
                        </View>
                        <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Date and Time</Text>
                        <DatePicker
                            style={{flex: 2, marginRight: 20}}
                            date={this.state.date}
                            format=''
                            mode="date"
                            placeholder="select date and Time"
                            minDate="2020-01-01"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                            dateIcon: {
                                position: 'absolute',
                                left: 0,
                                top: 4,
                                marginLeft: 0
                            },
                            dateInput: {
                                marginLeft: 36
                            }
                            }}
                            onDateChange={(date) => this.setState({date: date})}
                        />
                    </View>


                    <View style={styles.formRow}>
                        <Button
                            onPress={() => this.handleReservation()}
                            title="Reserve"
                            color="#512DA8"
                            accessibilityLabel="Learn more about this purple button"
                            />
                    </View>
                </Animatable.View>
            </ScrollView>
        );
    }

};

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    }
});

export default Reservation;