import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    Keyboard,
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import EditPageJovens from './editpagejovens.js';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//// Firebase
// Firestore
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-app.js';

// Storage
import * as firebase from 'firebase/compat';
import { ref, putFile } from 'firebase/storage';
import { storage } from '../firebase-app.js';

const Stack = createNativeStackNavigator();

function MainJovens({ route, navigation }) {

    const currentYear = new Date().getFullYear();

    const [modal, setModal] = useState(false);

    const [currentJovemImage, setCurrentJovemImage] = useState('');

    const [currentName, setCurrentName] = useState(null);

    const [currentPhoneNumber, setCurrentPhoneNumber] = useState(null);

    const [currentBirthDate, setCurrentBirthDate] = useState(null);

    const [currentStatus, setCurrentStatus] = useState(null);

    const [jovens, setJovens] = useState([]);

    ///////////////////////////////////////////////////////////
    // Get Item Cards
    useEffect(()=>{
        db.collection('jovens-cards').orderBy('name', 'asc').onSnapshot(snapshot=>{
            setJovens(snapshot.docs.map((doc)=>{
                return {id: doc.id, card: doc.data()};
            }))
        })

    },[]);

    // Image
    let pickImage = async () => {

        let PermissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (PermissionResult.granted === false) {
            PermissionResult.canAskAgain();

        }

        let PickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 2],
            quality: 1,
        });

        if(PickerResult.canceled === true){
            return true;

        }

        setCurrentJovemImage({ localUri: PickerResult.assets[0] });

    }

    ///////////////////////////////////////////////////////////
    // Create Jovens Card
    const createCard = () => {

        if (currentJovemImage && currentName && currentBirthDate) {
            setModal(!modal);

            (async () => {
                try{

                    let newAge = currentBirthDate.split('-');
                    let calc = currentYear - newAge[2];

                    const uploadImage = async () => {

                        const responseImage = await fetch(currentJovemImage.localUri.uri);
                        const imageFile = await responseImage.blob();
                        var imageName = currentJovemImage.localUri.uri.substring(currentJovemImage.localUri.uri.lastIndexOf('/') + 1);

                        var storageRef = storage.ref('jovens-cards-images/');
                        var childRef = storageRef.child(imageName);
                        childRef.put(imageFile);

                        try{
                            setTimeout(async ()=>{
                                await storage.ref(`/jovens-cards-images/${imageName}`).getDownloadURL().then(async function(url) {
                                    try {
                                        await db.collection('jovens-cards').add({
                                            image: url,
                                            name: currentName,
                                            phone: currentPhoneNumber,
                                            birthdate: currentBirthDate,
                                            age: calc,
                                            status: currentStatus,
                                            anotations: 'Anotação Vazia.',
                                        })
                                    } catch (error) {
                                        alert('Erro ao adicionar Card: ' + error);

                                    }
                                })
                            }, 3000);

                        }catch(error){
                            alert('Erro no upload da imagem: ' + error);

                        }
                    }

                    uploadImage();

                    /*
                    const addCard = async () => {
                        storage.ref('jovens-cards-images').child(lastImageURL).getDownloadURL().then(async function(url) {
                            try{
                                await db.collection('jovens-cards').add({
                                    image: url,
                                    name: currentName,
                                    phone: currentPhoneNumber,
                                    birthdate: currentBirthDate,
                                    age: calc,
                                    status: currentStatus,
                                    anotations: 'Anotação Vazia.',
                                })
                            }catch(error){
                                alert('Erro ao adicionar Card: ' + error);
                            }
                        })
                    }

                    addCard();
                    */

                    //firebase.storage().ref().child(`jovens-cards-images/${currentJovemImage.localUri.fileName}`).putFile(currentJovemImage.localUri.uri);

                    /*var uploadTask = storage.ref(`jovens-cards-images/${currentJovemImage.localUri.fileName}`)
                    uploadTask.putFile(currentJovemImage.localUri.uri);*/

                    /*
                    let newCardJovem = {
                        image: currentJovemImage,
                        name: currentName,
                        phone: currentPhoneNumber,
                        birthdate: currentBirthDate,
                        age: calc,
                        status: currentStatus,
                        anotations: 'Anotação Vazia.',
                    }

                    const docRef = await addDoc(collection(db, 'jovens-cards'), newCardJovem);
*/

                    setCurrentJovemImage('');
                    setCurrentName(null);
                    setCurrentPhoneNumber(null);
                    setCurrentBirthDate(null);
                    setCurrentStatus(null);

                    console.log('added with success');

                }catch(error){
                    alert('Erro ao criar card: ' + error);
                }
            })();
        } else {
            alert('Você precisa adicionar pelo menos imagem, nome e data de nascimento.')
        }
    };

    function EditPageFunction(val) {

        let jovens = jovens;
        let id = val.id;
        let name = val.card.name;
        let image = val.card.image;
        let phone = val.card.phone;
        let birthdate = val.card.birthdate;
        let age = val.card.age;
        let status = val.card.status;
        let anotations = val.card.anotations;

        navigation.push('edit', { jovens, id, name, image, phone, birthdate, age, status, anotations });
    };

    function closeModal() {

        setModal(!modal)
        Keyboard.dismiss()

        setCurrentJovemImage('');
        setCurrentName(null);
        setCurrentPhoneNumber(null);
        setCurrentBirthDate(null);
        setCurrentStatus(null);
    };

    async function calcAge() {
        jovens.map(function(val){
            let splitedBirthDate = val.card.birthdate.split('-');

            val.card.age = currentYear - splitedBirthDate[2];

            return val;
        })
    }
    
    calcAge();

    function formatBirthDate(text) {
        var date_text = text;
        var validated_date = /^(([01-31]{2}-[01-12]{2}-[0-9999]{5}))$/;
        if (validated_date.test(date_text) == false) {

            date_text = date_text.replace(/\D/g, "");

            date_text = date_text.replace(/(\d{2})(\d)/, "$1-$2");
            date_text = date_text.replace(/(\d{2})(\d)/, "$1-$2");

            setCurrentBirthDate(date_text);
            return date_text;
        }
    }

    function formatPhoneNumber(text){
        var phone_text = text;
        var validated_phone = /^(([00000-99999]{5}-[0000-9999]{5}))$/;
        if (validated_phone.test(phone_text) == false) {

            phone_text = phone_text.replace(/\D/g, "");

            phone_text = phone_text.replace(/(\d{5})(\d)/, "$1-$2");

            setCurrentPhoneNumber(phone_text);
            return phone_text;
        }
    }

    return (
        <View style={Styles.container} key={'mainViewJovens'}>

            <Modal
                animationType='slide'
                visible={modal}
                transparent={true}
            >

                <View style={Styles.modalContainerView}>
                    <TouchableOpacity onPress={() => closeModal()} style={{ top: -10 }}>
                        <AntDesign name="closecircleo" size={32} color="white"></AntDesign>
                    </TouchableOpacity>

                    <View style={Styles.modalMainView}>

                        <View style={Styles.ImagePickerStyle}>
                            <View>
                                <Image source={[currentJovemImage.localUri != null ? { uri: currentJovemImage.localUri.uri } : {}]}
                                    style={[currentJovemImage.localUri != null ? Styles.CurrentImageStyle : { ...Styles.CurrentImageStyle, backgroundColor: 'white' }]}>
                                </Image>
                            </View>


                            <TouchableOpacity onPress={() => { pickImage(), Keyboard.dismiss() }} style={{ alignSelf: 'center', marginLeft: 10 }}>
                                <Text style={{ fontSize: 16, color: '#ccc', fontFamily: 'Inter-Regular', opacity: 0.6 }}>Selecione a imagem</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ alignSelf: 'center', width: '100%' }}>
                            <TextInput
                                onChangeText={text => setCurrentName(text)} autoFocus={false}
                                placeholder="Nome" placeholderTextColor="#ccc"
                                style={{ ...Styles.InputStyle, width: '58%', fontFamily: 'Inter-Regular' }} multiline={false} numberOfLines={1}>
                            </TextInput>

                            <TextInput onChangeText={text => formatBirthDate(text)} autoFocus={false}
                                placeholder="Data de Nascimento" defaultValue={currentBirthDate != null ? currentBirthDate : null} maxLength={10} placeholderTextColor="#ccc" keyboardType='numeric'
                                style={{ ...Styles.InputStyle, width: '58%', fontFamily: 'Inter-Regular' }} multiline={false}
                                numberOfLines={1}>
                            </TextInput>

                            <TextInput onChangeText={text => setCurrentStatus(text)}
                                style={{ ...Styles.InputStyle, width: '58%', fontFamily: 'Inter-Regular' }} placeholder="Status" placeholderTextColor="#ccc"
                                autoFocus={false} multiline={false} numberOfLines={1}>
                            </TextInput>

                            <View style={{ alignSelf: 'center', flexDirection: 'row', width: '80%' }}>
                                <Text style={Styles.numberDDDStyle}>
                                    (41)
                                </Text>

                                <TextInput onChangeText={text => formatPhoneNumber(text)} autoFocus={false}
                                    placeholder="Telefone" placeholderTextColor="#ccc" keyboardType='phone-pad'
                                    defaultValue={currentPhoneNumber != null ? currentPhoneNumber : null}
                                    style={{
                                        ...Styles.InputStyle,
                                        width: '70%',
                                        height: 45,
                                        fontSize: 17,
                                        fontFamily: 'Inter-Regular',
                                        textAlign: 'center',
                                        alignSelf: 'center'
                                    }} multiline={false} numberOfLines={1} maxLength={10}>
                                </TextInput>
                            </View>

                            <TouchableOpacity onPress={() => { createCard(), Keyboard.dismiss() }} style={Styles.createCardBtn}>
                                <Text style={{ fontSize: 16.5, color: 'white', fontFamily: 'Inter-Regular' }}>Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </Modal>

            <LinearGradient
                start={[0.4, 0]}
                end={[0, 0.9]}
                colors={['#292929', '#101010']}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                }}
            >

            </LinearGradient>

            <ScrollView>
                {
                    jovens.map((val) => {

                        return (
                            <TouchableOpacity delayLongPress={550} onLongPress={() => EditPageFunction(val)} style={{ marginTop: 10, alignSelf: 'center', sflex: 1, flexDirection: 'row', padding: 2, width: '94%' }}>

                                <View style={Styles.MainPersonalCard}>
                                    <View style={{ alignSelf: 'center' }}>
                                        <Image resizeMode={'cover'} style={Styles.PersonalImage} source={[val.card.image ? { uri: val.card.image } : {}]}></Image>
                                    </View>

                                    <View style={{ marginLeft: 7, alignSelf: 'center' }}>
                                        <Text style={{
                                            ...Styles.PersonalText,
                                            fontSize: 14.5,
                                            color: 'white',
                                            fontFamily: 'Inter-Regular'
                                        }}
                                        >
                                            Nome: {val.card.name}
                                        </Text>
                                        <Text style={{ ...Styles.PersonalText, fontFamily: 'Inter-Regular' }}>Idade: {val.card.age}</Text>
                                        <Text style={{ ...Styles.PersonalText, fontSize: 14.5, fontFamily: 'Inter-Regular' }}>Status: {val.card.status}</Text>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        );
                    })
                }
            </ScrollView>

            <TouchableOpacity onPress={() => setModal(true)} style={Styles.addCardBtn}>
                <AntDesign name="pluscircleo" size={26} color="white"></AntDesign>
            </TouchableOpacity>
        </View>
    );
}

export default function Jovens({ }) {
    const [fontsLoaded] = useFonts({
        'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    });

    return (
        <View style={{ backgroundColor: '#292929', width: '100%', height: '100%' }}>
            <NavigationContainer independent={true}>
                <Stack.Navigator>
                    <Stack.Screen name="main" component={MainJovens} options={{
                        title: "Jovens da Igreja",
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: '#232323',
                        },
                        headerTintColor: 'white',
                        headerBlurEffect: 'prominent',
                        headerTitleStyle: {
                            fontSize: 20,
                            fontFamily: 'Inter-Regular'
                        },
                    }} />
                    <Stack.Screen name="edit" component={EditPageJovens} options={{
                        title: "Voltar",
                        headerShown: true,
                        headerStyle: {
                            backgroundColor: '#232323',
                        },
                        headerTintColor: 'white',
                        headerBlurEffect: 'prominent',
                        headerTitleStyle: {
                            fontSize: 20,
                            fontFamily: 'Inter-Regular'
                        },
                    }} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
}

const Styles = StyleSheet.create({
    container: {
        backgroundColor: '#363636',
        width: '100%',
        height: '100%'
    },
    MainPersonalCard: {
        backgroundColor: '#323232',
        padding: 8,
        width: '100%',
        height: 100,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 20,
    },
    PersonalImage: {
        alignItems: 'flex-start',
        width: 62,
        height: 62,
        borderRadius: 48,
    },

    PersonalText: {
        color: '#bababa',
        fontSize: 14.5
    },
    addCardBtn: {
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 10,
    },

    // Modal Styles
    modalContainerView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    modalMainView: {
        alignItems: 'center',
        width: '85%',
        height: 450,
        backgroundColor: '#323232',
        borderRadius: 35,
    },
    ImagePickerStyle: {
        alignSelf: 'center',
        flexDirection: 'row',
        padding: 12
    },
    CurrentImageStyle: {
        width: 50,
        height: 50,
        borderRadius: 50,
        alignSelf: 'flex-start'
    },
    InputStyle: {
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: '#414141',
        borderRadius: 15,
        width: '75%',
        height: '13%',
        textAlign: 'center',
        fontSize: 15,
        color: 'white',
    },
    numberDDDStyle: {
        paddingTop: 10,
        marginTop: 8,
        marginRight: 10,
        width: 80,
        height: 43,
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        backgroundColor: '#414141',
        borderRadius: 15,
        color: 'white',
    },
    createCardBtn: {
        marginTop: 20,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
        height: 40,
        backgroundColor: '#555555',
        borderRadius: 25,
    },
})