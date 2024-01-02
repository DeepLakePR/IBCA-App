import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
    Keyboard,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import ColorPicker from 'react-native-wheel-color-picker'
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

LocaleConfig.locales['pt-br'] = {
    monthNames: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ],

    monthNamesShort: ['Jan', 'Fev', 'Març', 'Abril', 'Maio', 'Jun', 'Jul', 'Agost', 'Setem', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Domingo'
};
LocaleConfig.defaultLocale = 'pt-br';
let FullDate;

// Get Date
async function getTodayDate() {
    const CurrentToday = LocaleConfig.today();
    const toDate = CurrentToday.toDate();

    const TodayToString = toDate.toLocaleDateString();
    let SplitedToday = TodayToString.split('/');

    let Day = SplitedToday[1];
    let Month = SplitedToday[0];
    let Year = CurrentToday.getFullYear();

    let YearString = Year.toString();
    let MonthString = Month.toString();
    let DayString = Day.toString();

    FullDate = YearString.concat("-", MonthString, "-", DayString);
}

getTodayDate();

////////////
export default function CalendarHome() {

    const [fontsLoaded] = useFonts({
        'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    });

    // Create date
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDateCreator = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDateCreator);

        const TodayToString = selectedDate.toLocaleDateString();
        let SplitedToday = TodayToString.split('/');

        let Day = SplitedToday[1];
        let Month = SplitedToday[0];

        let DayString = Day.toString();
        let MonthString = Month.toString();

        let tempDate = new Date(currentDateCreator);
        let formatedDate = DayString + '-' + MonthString + '-' + tempDate.getFullYear();

        // Format Time
        let hoursFormated = tempDate.getHours();
        if (hoursFormated <= 9) {
            hoursFormated = "0" + hoursFormated
        }

        let minutesFormated = tempDate.getMinutes();
        if (minutesFormated <= 9) {
            minutesFormated = "0" + minutesFormated
        }


        let formatedTime = hoursFormated + ":" + minutesFormated;

        setCurrentDateCreator(formatedDate);
        setCurrentTime(formatedTime);
    }

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode)
    }

    // Data Config
    const [currentDateCreator, setCurrentDateCreator] = useState();
    const [currentTime, setCurrentTime] = useState();
    const [currentColor, setCurrentColor] = useState('#fff');
    const [currentAnotation, setCurrentAnotation] = useState();

    // Selected Day/Date
    const [currentDate, setCurrentDate] = useState(FullDate);

    // Marked Dates

    const [markedDates, setMarkedDates] = useState([]);

    // Marked Dates
    const [selectedDay, setSelectedDay] = useState(FullDate);

    const [colorWheelModalView, setColorModalView] = useState(false);
    const [createDateModal, setCreateDateModal] = useState(false);
    const [deleteAnotationModal, setDeleteAnotationModal] = useState(false);
    const [currentDeletationAnotation, setCurrentDeletationAnotation] = useState([]);
    const [currentDeletationArray, setCurrentDeletationArray] = useState([]);
    const [currentOpacity, setOpacity] = useState(1);

    const closeCreatorDateSize = 28;

    var loaded = false;
    var loadedCreatorDate = false;

    function makeId() {
        var newid = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 15; i++)
            newid += possible.charAt(Math.floor(Math.random() * possible.length));

        return newid;
    }

    useEffect(() => {
        (async () => {
            try {
                let markedDatesAtual = await AsyncStorage.getItem('@markedDatesData1');

                if (markedDatesAtual === null) {

                    setMarkedDates([]);

                } else {
                    let JSONparsed = JSON.parse(markedDatesAtual);

                    setMarkedDates(JSONparsed);
                }

            } catch (error) {
                alert(error);
            }
        })();
    }, [])


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setOpacity(0)
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setOpacity(1)
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    function loadDotDates() {
        var newMKDates = markedDates.map(function (val) {
            return { 'date': val.dateString, 'color': val.dotColor };
        })

        const loadedMarkedDates = {
            [selectedDay.toString('yyyy-MM-dd')]: { marked: true },
            [newMKDates]: { selected: true, marked: true }
        };

        newMKDates.forEach((day) => {
            loadedMarkedDates[day.date] = {
                marked: true,
                dotColor: day.color,
            };
        });

        return loadedMarkedDates;
    }

    const createDate = () => {
        if (currentAnotation && currentTime && currentDateCreator) {

            let formatedDateCreator = currentDateCreator.toString();
            formatedDateCreator = formatedDateCreator.split('-');

            let newDateFormated = formatedDateCreator[2] + "-" + formatedDateCreator[1] + "-" + formatedDateCreator[0]

            if (markedDates.length != 0) {

                markedDates.map(function (val) {
                    if (val !== null || val != null) {
                        let dateStringVal = val.dateString

                        if (newDateFormated == dateStringVal && loadedCreatorDate == false) {
                            loadedCreatorDate = true;
                            setCreateDateModal(false);

                            let newAnotation = {
                                'id': makeId(),
                                'time': currentTime,
                                'message': currentAnotation,

                            }

                            let updatedDate = {
                                'id': val.id,
                                'dotColor': val.dotColor,
                                'dateString': val.dateString,
                                'anotations': [...val.anotations, newAnotation]
                            }

                            let newMarkedDates;

                            if (markedDates != null) {
                                newMarkedDates = markedDates.filter(function (val) {
                                    return val.id != updatedDate.id;
                                })
                            } else {
                                alert('Erro ao tentar criar anotação para esta data.')
                            }

                            setMarkedDates([...newMarkedDates, updatedDate]);
                            setAsync1();

                            async function setAsync1() {
                                try {
                                    let JSONstringify = JSON.stringify([...newMarkedDates, updatedDate]);
                                    await AsyncStorage.setItem('@markedDatesData1', JSONstringify);

                                } catch (error) {
                                    alert(error);
                                }
                            }

                            setCurrentDateCreator(null);
                            setCurrentTime(null);
                            setCurrentColor('#fff');
                            setCurrentAnotation(null);

                            ////////////////////////////////////////
                            // End of existed data

                        } else if (val == markedDates[markedDates.length - 1] && loadedCreatorDate == false) {

                            // Not Existed Data, creating a new data...

                            loadedCreatorDate = true;
                            setCreateDateModal(false);

                            let newDate = {
                                'id': makeId(),
                                'dotColor': currentColor,
                                'dateString': newDateFormated,
                                'anotations': [
                                    {
                                        'id': makeId(),
                                        'time': currentTime,
                                        'message': currentAnotation,
                                    },
                                ]
                            }

                            setMarkedDates([...markedDates, newDate]);
                            setAsync2();

                            async function setAsync2() {
                                try {
                                    let JSONstringify = JSON.stringify([...markedDates, newDate]);
                                    await AsyncStorage.setItem('@markedDatesData1', JSONstringify);

                                } catch (error) {
                                    alert(error);
                                }
                            }

                            setCurrentDateCreator(null);
                            setCurrentTime(null);
                            setCurrentColor('#fff');
                            setCurrentAnotation(null);
                        }
                    }
                })
            } else {
                loadedCreatorDate = true;
                setCreateDateModal(false);

                let newDate = {
                    'id': makeId(),
                    'dotColor': currentColor,
                    'dateString': newDateFormated,
                    'anotations': [
                        {
                            'id': makeId(),
                            'time': currentTime,
                            'message': currentAnotation,
                        },
                    ]
                }

                setMarkedDates([...markedDates, newDate]);
                setAsync2();

                async function setAsync2() {
                    try {
                        let JSONstringify = JSON.stringify([...markedDates, newDate]);
                        await AsyncStorage.setItem('@markedDatesData1', JSONstringify);

                    } catch (error) {
                        alert(error);
                    }
                }

                setCurrentDateCreator(null);
                setCurrentTime(null);
                setCurrentColor('#fff');
                setCurrentAnotation(null);
            }
        } else {
            alert('Adicione uma data, horário e uma anotação para que a data seja criada.')
        }
    }

    const deleteDateAnotation = () => {
        setDeleteAnotationModal(false);

        if (currentDeletationArray != undefined || currentDeletationArray != null) {
            setDeleteAnotationModal(false);

            let anotations = currentDeletationArray.anotations.filter((val) => {
                return val.id != currentDeletationAnotation.id;
            })

            let updatedDateAnotation = {
                'id': currentDeletationArray.id,
                'dotColor': currentDeletationArray.dotColor,
                'dateString': currentDeletationArray.dateString,
                'anotations': anotations
            }

            let updatedMarkedDates = markedDates.filter((val) => {
                return val.id != currentDeletationArray.id;
            })

            setAsync3();

            async function setAsync3() {

                let save;

                if (currentDeletationArray.anotations.length == 1) {
                    let newMarkedDates = markedDates.filter((val) => {
                        return val.id != currentDeletationArray.id;
                    })

                    setMarkedDates(newMarkedDates);
                    save = newMarkedDates;
                } else {
                    setMarkedDates([...updatedMarkedDates, updatedDateAnotation])
                    save = [...updatedMarkedDates, updatedDateAnotation];
                }

                try {
                    let JSONstringify = JSON.stringify(save);
                    await AsyncStorage.setItem('@markedDatesData1', JSONstringify);

                } catch (error) {
                    alert(error);
                }
            }
        } else {
            alert('Erro ao tentar deletar a anotação');
        }
    }

    function addDataAnotations() {
        setCreateDateModal(true);
        loadedCreatorDate = false;
    }

    function closeCreatorDate() {
        setCreateDateModal(false);
        loadedCreatorDate = false;
    }

    function sortFunction(anotationsVal) {
        anotationsVal.sort((a, b) => {
            let aTime = a.time.replace(/[^0-9]/g, '')
            let bTime = b.time.replace(/[^0-9]/g, '')
            Number(aTime);
            Number(bTime);

            return aTime - bTime;
        })
    }

    // Return
    return (
        <View style={Styles.container}>

            <LinearGradient
                start={[0.4, 0]}
                end={[0, 0.9]}
                colors={['transparent', '#171717']}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                }}
            />

            <Modal
                visible={colorWheelModalView}
                animationType='fade'
                transparent={true}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <TouchableOpacity onPress={() => { setColorModalView(false), setCreateDateModal(true) }} style={Styles.closeCreatorDateStyle}>
                        <AntDesign name="minuscircleo" size={closeCreatorDateSize} color="white" />
                    </TouchableOpacity>

                    <View style={{ width: '80%', height: '50%', backgroundColor: 'rgb(40,40,40)', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                        <ColorPicker
                            color={'#fff'}
                            swatchesOnly={false}
                            onColorChangeComplete={(color) => setCurrentColor(color)}
                            thumbSize={30}
                            sliderSize={15}
                            gapSize={7}
                            noSnap={false}
                            row={false}
                            swatchesLast={true}
                            swatches={true}
                            discrete={false}
                            shadeWheelThumb={true}

                            style={{ width: '60%', bottom: 50 }}
                        />

                        <TouchableOpacity onPress={() => { setColorModalView(false), setCreateDateModal(true) }} style={Styles.selectDateTimeStyle}>
                            <Text style={{...Styles.selectDateTextStyle, fontFamily: 'Inter-Regular'}}>Concluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={createDateModal}
                animationType='fade'
                transparent={true}>
                <View style={Styles.modalMainView}>
                    <TouchableOpacity onPress={() => closeCreatorDate()} style={Styles.closeCreatorDateStyle}>
                        <AntDesign name="minuscircleo" size={closeCreatorDateSize} color="white" />
                    </TouchableOpacity>

                    <View style={Styles.modalCreateDate}>
                        <View style={{ width: '100%', flexDirection: 'row', padding: 5, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{
                                ...Styles.selectDateTextStyle,
                                fontSize: 18,
                                fontFamily: 'Inter-Regular',
                                marginTop: -50, 
                                marginBottom: 35,
                                opacity: currentOpacity
                            }}>
                                Data: {currentDateCreator ? currentDateCreator : 'Vazio'}
                                {'\n'}Horário: {currentTime ? currentTime : 'Vazio'}
                            </Text>

                            <View style={{
                                width: 25,
                                height: 25,
                                borderRadius: 50,
                                backgroundColor: currentColor,
                                position: 'absolute',
                                top: -35,
                                bottom: 0,
                                right: 25,
                                opacity: currentOpacity
                            }}>

                            </View>
                        </View>

                        <TouchableOpacity onPress={() => showMode('date')} style={Styles.selectDateTimeStyle}>
                            <Text style={{...Styles.selectDateTextStyle, fontFamily: 'Inter-Regular',}}>Selecionar data</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => showMode('time')} style={Styles.selectDateTimeStyle}>
                            <Text style={{...Styles.selectDateTextStyle, fontFamily: 'Inter-Regular',}}>Selecionar horário</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setColorModalView(true), setCreateDateModal(false) }} style={Styles.selectDateTimeStyle}>
                            <Text style={{...Styles.selectDateTextStyle, fontFamily: 'Inter-Regular',}}>Selecionar cor de marcação</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={{
                                ...Styles.selectDateTimeStyle,
                                width: '60%', 
                                height: 45, 
                                backgroundColor: 'rgb(60,60,60)', 
                                color: 'white', 
                                fontSize: 15,
                                fontFamily: 'Inter-Regular',
                            }}
                            placeholder='Sua Anotação' placeholderTextColor={'#ccc'} textAlign='center'
                            onChangeText={(text) => setCurrentAnotation(text)}
                        >
                        </TextInput>

                        <View style={{
                            ...Styles.selectDateTimeStyle,
                            marginBottom: -55, marginTop: 25, width: '35%', height: 40, opacity: currentOpacity
                        }}>
                            <TouchableOpacity onPress={() => createDate()}>
                                <Text style={{...Styles.selectDateTextStyle, fontFamily: 'Inter-Regular'}}>Criar Data</Text>
                            </TouchableOpacity>
                        </View>

                        {show && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode={mode}
                                is24Hour={true}
                                display='default'
                                onChange={onChange}>

                            </DateTimePicker>
                        )

                        }
                    </View>
                </View>
            </Modal>

            <Modal
                visible={deleteAnotationModal}
                animationType='slide'
                transparent={true}>
                <View style={Styles.modalMainView}>
                    <TouchableOpacity onPress={() => setDeleteAnotationModal(false)} style={Styles.closeCreatorDateStyle}>
                        <AntDesign name="minuscircleo" size={closeCreatorDateSize} color="white" />
                    </TouchableOpacity>

                    <View style={{ ...Styles.modalCreateDate, height: '25%', width: '60%' }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 16,
                            fontFamily: 'Inter-Regular',
                            top: 15,
                            textAlign: 'center'
                        }}>Deseja deletar a anotação "{currentDeletationAnotation.message}"?</Text>

                        <View style={{ flex: 1, flexDirection: 'row', padding: 45, bottom: -50 }}>
                            <TouchableOpacity onPress={() => deleteDateAnotation()} style={{
                                ...Styles.Buttons,
                                marginRight: 35,
                                backgroundColor: '#d60404',
                            }}>
                                <Text style={{...Styles.textModal, fontFamily: 'Inter-Regular'}}>Sim</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setDeleteAnotationModal(false)} style={Styles.Buttons}>
                                <Text style={{...Styles.textModal, fontFamily: 'Inter-Regular'}}>Não</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Calendar
                current={FullDate}
                minDate={'2023-01-01'}
                maxDate={'2026-12-31'}

                markedDates={loadDotDates()}
                markingType={'dot'}

                onDayPress={(day) => {
                    setCurrentDate(day),
                        setSelectedDay(day.dateString),
                        loaded = false
                }}

                theme={{
                    calendarBackground: 'transparent',
                    textSectionTitleColor: 'white',
                    textSectionTitleDisabledColor: 'white',
                    selectedDayBackgroundColor: '#20373b',
                    selectedDayTextColor: '#d7d9d9',
                    todayTextColor: 'white',
                    todayBackgroundColor: '#067394',
                    dayTextColor: 'white',
                    textDisabledColor: '#5c5c5c',
                    arrowColor: 'white',
                    disabledArrowColor: 'white',
                    monthTextColor: 'white',
                    indicatorColor: 'blue',
                    textDayFontFamily: 'Inter-Regular',
                    textMonthFontFamily: 'Inter-Regular',
                    textDayHeaderFontFamily: 'Inter-Regular',
                    textDayFontWeight: '300',
                    textDayHeaderFontWeight: '500',
                    textDayFontSize: 15,
                    textMonthFontSize: 17,
                    textDayHeaderFontSize: 15,
                    'stylesheet.calendar.header': {
                        week: {
                            marginTop: 10,
                            padding: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        },
                    }
                }}>
            </Calendar>

            {
                markedDates.length != 0 
                ? 
                    markedDates.map((arrayDate) => {
                        if (arrayDate !== null || arrayDate != null) {
                            if (arrayDate.dateString == currentDate.dateString && loaded == false) {
                                loaded = true
                                let anotationsVal = arrayDate.anotations
                                sortFunction(anotationsVal);

                                // Opened

                                return (
                                    <ScrollView style={{ flex: 1 }}>
                                        <View style={Styles.DayItens}>

                                            <Text style={{...Styles.selectedDayText, fontFamily: 'Inter-Regular'}}>Dia selecionado: {currentDate.day}</Text>

                                            {
                                                anotationsVal.map(function (valAnotation) {
                                                    return (
                                                        <TouchableOpacity delayLongPress={600} onLongPress={() => {
                                                            setDeleteAnotationModal(true),
                                                                setCurrentDeletationAnotation(valAnotation),
                                                                setCurrentDeletationArray(arrayDate)
                                                        }
                                                        }>
                                                            <Text style={{...Styles.itemDayText, fontFamily: 'Inter-Regular'}}>
                                                                {valAnotation.time} {valAnotation.message}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            }

                                        </View>
                                    </ScrollView>
                                );

                            } else if (currentDate.day == null && loaded == false) {
                                loaded = true

                                return (
                                    <ScrollView style={{ flex: 1, opacity: 0.7 }}>
                                        <View style={Styles.DayItens}>

                                            <Text style={{...Styles.selectedDayText, fontFamily: 'Inter-Regular'}}>
                                                Nenhuma data foi carregada
                                            </Text>

                                        </View>
                                    </ScrollView>
                                );

                            } else if (arrayDate == markedDates[markedDates.length - 1] && arrayDate.dateString != currentDate.dateString && loaded == false) {
                                loaded = true;

                                // Dont have data

                                let day;

                                if (currentDate.day == null) {
                                    day = currentDate
                                } else if (currentDate.day != null) {
                                    day = currentDate.day
                                }

                                return (
                                    <ScrollView style={{ flex: 1, opacity: 0.7 }}>
                                        <View style={Styles.DayItens}>

                                            <Text style={{...Styles.selectedDayText, fontFamily: 'Inter-Regular'}}>Nenhuma anotação foi encontrada para o dia {day}</Text>

                                        </View>
                                    </ScrollView>
                                );

                            }
                        }
                    })
                : 
                    <ScrollView style={{ flex: 1, opacity: 0.7 }}>
                        <View style={Styles.DayItens}>
                            <Text style={{...Styles.selectedDayText, fontFamily: 'Inter-Regular',}}>Nenhuma anotação foi encontrada para o dia {
                                currentDate.day != null ? currentDate.day : new Date().getDate()
                            }</Text>
                        </View>
                    </ScrollView>
                
            }

            <View style={{ position: 'relative', bottom: 10, right: 10, alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={() => addDataAnotations()} style={{ alignItems: 'center', justifyContent: 'center', width: 35, height: 35, borderRadius: 30, backgroundColor: 'rgb(40,40,40)' }}>
                    <AntDesign name='plus' color='white' size={25} />
                </TouchableOpacity>
            </View>
        </View>
    );
}


const Styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2e2e2e',
    },
    selectedDayText: {
        padding: 10,
        color: 'white',
        fontSize: 16,
        width: '100%',
        textAlign: 'center'
    },
    DayItens: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 15,
        marginBottom: 15,
        width: '92%',
        height: 'auto',
        padding: 10,
        borderRadius: 15,
        backgroundColor: 'rgba(16,16,16,0.5)'
    },
    itemDayText: {
        padding: 10,
        color: 'white',
        fontSize: 15,
        width: '100%',
        textAlign: 'left'
    },
    modalMainView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    modalCreateDate: {
        backgroundColor: 'rgb(35,35,35)',
        borderRadius: 20,
        height: '55%',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    closeCreatorDateStyle: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 15
    },
    selectDateTimeStyle: {
        marginBottom: 15,
        width: '55%',
        height: 45,
        backgroundColor: 'rgb(50,50,50)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 'auto',
        marginLeft: 'auto',
    },
    selectDateTextStyle: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center'
    },
    Buttons: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f8a01',
        width: 70,
        height: 45,
        borderRadius: 15,
    },
    textModal: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    }
})