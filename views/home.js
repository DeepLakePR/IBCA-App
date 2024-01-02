// Setup
import * as React from 'react';
import * as Font from 'expo-font';
import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, ImageBackground, Image, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pages
import Jovens from './jovens.js';
import Calendar from './calendar.js';
import Metas from './metas.js';

// Default Function

const Stack = createNativeStackNavigator();

function HomePageFunction({ navigation }) {

    const AnimatedImage = Animated.createAnimatedComponent(Image);

    const fadeHomeTitle = useRef(new Animated.Value(0)).current;
    const fadeJovensBtn = useRef(new Animated.Value(0)).current;
    const fadeCalendarBtn = useRef(new Animated.Value(0)).current;
    const fadeMetasBtn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        //
        let hometitleTimeOut = setTimeout(() => {
            Animated.timing(fadeHomeTitle, {
                toValue: 1,
                duration: 1450,
                useNativeDriver: true
            }).start();
        }, 800);

        let jovensTimeOut = setTimeout(() => {
            Animated.timing(fadeJovensBtn, {
                toValue: 1,
                duration: 1450,
                useNativeDriver: true
            }).start();
        }, 1500);

        let calendarTimeOut = setTimeout(() => {
            Animated.timing(fadeCalendarBtn, {
                toValue: 1,
                duration: 1450,
                useNativeDriver: true
            }).start();
        }, 2500);

        let metasTimeOut = setTimeout(() => {
            Animated.timing(fadeMetasBtn, {
                toValue: 1,
                duration: 1450,
                useNativeDriver: true
            }).start();
        }, 3500);

        return () => {
            clearTimeout(hometitleTimeOut);
            clearTimeout(jovensTimeOut);
            clearTimeout(calendarTimeOut);
            clearTimeout(metasTimeOut);
        }
    }, [])

    return (
        <View style={Styles.container}>

            <ImageBackground source={require('../assets/home_background.png')} resizeMode="cover" style={Styles.ImgBGHome}>

                <Animated.View style={[Styles.HeaderHomePageView, { opacity: fadeHomeTitle }]}>
                    <Text style={Styles.titleFontLoad}>Para onde deseja navegar?</Text>
                </Animated.View>

                <View style={Styles.ButtonScreensView}>

                    <TouchableOpacity onPress={() => navigation.push('Jovens')} >
                        <AnimatedImage source={require('../assets/new_jovens.png')} resizeMode="contain"
                            style={[Styles.BtnScreens, { opacity: fadeJovensBtn }]} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.push('Calendar')} >
                        <AnimatedImage source={require('../assets/new_calendar.png')} resizeMode="contain"
                            style={[Styles.BtnScreens, { opacity: fadeCalendarBtn }]} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.push('Metas')} >
                        <AnimatedImage source={require('../assets/new_metas.png')} resizeMode="contain"
                            style={[{ ...Styles.BtnScreens, marginLeft: 15 }, { opacity: fadeMetasBtn }]} />
                    </TouchableOpacity>

                </View>

            </ImageBackground>
        </View>
    );
}

// Fonts
const customFonts = {
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
};

export default class Home extends React.Component {

    state = {
        fontsLoaded: false,
    };

    async _loadFontsAsync(){
        await Font.loadAsync(customFonts);
        this.setState({ fontsLoaded: true });
    }

    componentDidMount(){
        this._loadFontsAsync();
    }

    render(){
        if(!this.state.fontsLoaded){
            return null;
        }

        return (
            <View style={{ backgroundColor: '#232323', width: '100%', height: '100%' }}>
                <NavigationContainer independent={true}>
                    <StatusBar style="auto" />

                    <Stack.Navigator>

                        <Stack.Screen name="Home" component={HomePageFunction} options={{
                            headerShown: false,
                        }}
                        />

                        <Stack.Screen name="Jovens" component={Jovens} options={{
                            title: "Jovens da Igreja",
                            headerShown: false,
                            headerStyle: {
                                backgroundColor: '#232323',
                            },
                            headerTintColor: 'white',
                            headerBlurEffect: 'prominent',
                            headerTitleStyle: {
                                fontSize: 20,
                                fontFamily: 'Inter-Regular'
                            },
                        }}
                        />

                        <Stack.Screen name="Calendar" component={Calendar} options={{
                            title: "Calendário",
                            headerStyle: {
                                backgroundColor: '#232323'
                            },
                            headerTintColor: 'white',
                            headerBlurEffect: 'prominent',
                            headerTitleStyle: {
                                fontSize: 20,
                                fontFamily: 'Inter-Regular'
                            }
                        }}
                        />

                        <Stack.Screen name="Metas" component={Metas} options={{
                            title: "Metas/Objetivos/Projetos",
                            headerStyle: {
                                backgroundColor: '#232323',
                            },
                            headerTintColor: 'white',
                            headerBlurEffect: 'prominent',
                            headerTitleStyle: {
                                fontSize: 20,
                                fontFamily: 'Inter-Regular'
                            }
                        }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </View>
        );
    }
}

const Styles = StyleSheet.create({
    container: {
        backgroundColor: '#454545',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    ImgBGHome: {
        width: '100%',
        height: '100%',
    },
    HeaderHomePageView: {
        backgroundColor: 'rgba(133,133,133, 0)',
        width: '75%',
        height: 60,
        padding: 15,
        marginTop: 95,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 15,
    },
    ButtonScreensView: {
        width: '35%',
        height: '70%',
        marginTop: 55,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    BtnScreens: {
        width: '100%',
        height: 105,
        marginBottom: 70,
    },

    titleFontLoad: {
        width: '100%', 
        height: 75, 
        color: 'white', 
        textAlign: 'center', 
        fontSize: 17, 
        fontFamily: 'Inter-Regular',
    },
})