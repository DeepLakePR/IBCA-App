import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';

import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase-app.js';
import { storage } from '../firebase-app.js';

export default function EditPage({ route, navigation }) {

    const [fontsLoaded] = useFonts({
        'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    });

    const [modal, setModal] = useState(false);

    const [currentJovemImage, setCurrentJovemImage] = useState(null);

    const [currentName, setCurrentName] = useState(null);

    const [currentPhoneNumber, setCurrentPhoneNumber] = useState(null);

    const [currentBirthDate, setCurrentBirthDate] = useState(null);

    const [currentStatus, setCurrentStatus] = useState(null);

    const [currentAnotations, setCurrentAnotations] = useState(null);

    const [CurrentOpacity, setOpacity] = useState(1);

    // Keyboard
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

    // Parameters Receiveds
    const {
        id,
        image,
        name,
        phone,
        birthdate,
        age,
        status,
        anotations
    } = route.params;

    // Pick Image
    let pickImage = async () => {
        let PermissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (PermissionResult.granted === false) {
            PermissionResult.canAskAgain
        }

        let PickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [2, 2],
            quality: 1,
        });

        if (PickerResult.canceled === true) {
            return false;

        }

        setCurrentJovemImage({ localUri: PickerResult.assets[0] });
    }

    async function updateCard() {
        Keyboard.dismiss();

        if(
            currentJovemImage === null &&
            currentName === null &&
            currentPhoneNumber === null &&
            currentBirthDate === null &&
            currentStatus === null &&
            currentAnotations === null
        ){
            navigation.navigate('main')

        }else {

            if(currentJovemImage !== null){
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
                                await setDoc(doc(db, 'jovens-cards', id), {
                                    image: currentJovemImage === null ? image : url,
                                    name: currentName === null ? name : currentName,
                                    phone: currentPhoneNumber === null ? phone : currentPhoneNumber,
                                    birthdate: currentBirthDate === null ? birthdate : currentBirthDate,
                                    age: age,
                                    status: currentStatus === null ? status : currentStatus,
                                    anotations: currentAnotations === null ? anotations : currentAnotations,
                                })

                            } catch (error) {
                                alert('Erro ao atualizar card: ' + error);

                            }
                        })
                    }, 3000);

                }catch(VAL_error){
                    alert('Erro ao atualizar card: ' + VAL_error);

                }


            }else{ // Not updated card image
                let editedCard = {
                    image: currentJovemImage === null ? image : url,
                    name: currentName === null ? name : currentName,
                    phone: currentPhoneNumber === null ? phone : currentPhoneNumber,
                    birthdate: currentBirthDate === null ? birthdate : currentBirthDate,
                    age: age,
                    status: currentStatus === null ? status : currentStatus,
                    anotations: currentAnotations === null ? anotations : currentAnotations,
                }
    
                await setDoc(doc(db, 'jovens-cards', id), editedCard)
            }

            navigation.navigate('main')

            setCurrentJovemImage(null);
            setCurrentName(null);
            setCurrentPhoneNumber(null);
            setCurrentBirthDate(null);
            setCurrentStatus(null);
        }
    }

    function deleteCard(){
        setModal(false);

        deleteDoc(doc(db, 'jovens-cards', id));

        navigation.navigate('main')

    }

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
        <View style={Styles.container}>

            <Modal
                animationType='slide'
                visible={modal}
                transparent={true}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <View style={Styles.modalDeleteCard}>
                        <Text style={{ ...Styles.textModal, fontSize: 15 }}>Deseja excluir as informações dessa pessoa?</Text>

                        <View style={{ flex: 1, flexDirection: 'row', padding: 45 }}>
                            <TouchableOpacity onPress={() => deleteCard()} style={{
                                ...Styles.Buttons,
                                marginRight: 35,
                                backgroundColor: '#d60404',
                            }}>
                                <Text style={Styles.textModal}>Sim</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setModal(false)} style={Styles.Buttons}>
                                <Text style={Styles.textModal}>Não</Text>
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
            ></LinearGradient>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: 5 }}>
                <View style={{ alignSelf: 'center', marginTop: 50 }}>
                    <Image resizeMode={'cover'} style={Styles.cardImage} source={[currentJovemImage === null ? { uri: image } : { uri: currentJovemImage.localUri.uri }]}>
                    </Image>

                    <TouchableOpacity onPress={() => pickImage()} style={{ alignItems: 'center', width: '100%', height: 75 }}>
                        <Text style={{...Styles.selectOtherImage, fontFamily: 'Inter-Regular'}}>Selecionar Imagem</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: -50 }}>
                    <Text style={{ ...Styles.texts, marginTop: 25, marginBottom: 5 }}>Card ID: {id}</Text>

                    <Text style={{ ...Styles.texts }}>Idade: {age}</Text>

                    <TextInput onChangeText={text => setCurrentName(text)} defaultValue={name} style={Styles.inputs} >

                    </TextInput>

                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <TextInput onChangeText={text => formatBirthDate(text)} defaultValue={currentBirthDate != null ? currentBirthDate : birthdate} keyboardType='numeric'
                            style={{ ...Styles.inputs, width: '45%', alignSelf: 'flex-start' }} maxLength={10}></TextInput>
                    </View>

                    <TextInput onChangeText={text => setCurrentStatus(text)} defaultValue={status} style={{ ...Styles.inputs, width: '45%' }}></TextInput>

                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={{ ...Styles.inputs, width: '20%', marginRight: 15, paddingTop: 12 }}>(41)</Text>

                        <TextInput onChangeText={text => formatPhoneNumber(text)} defaultValue={currentPhoneNumber != null ? currentPhoneNumber : phone} keyboardType='phone-pad' style={{ ...Styles.inputs, width: '50%' }}
                        maxLength={10}>
                        </TextInput>
                    </View>

                    <TextInput onChangeText={text => setCurrentAnotations(text)} defaultValue={anotations} style={{ ...Styles.inputs, width: '65%', height: 75, padding: 10 }}
                        multiline={true}>

                    </TextInput>
                </View>
            </View>

            <View style={{ position: 'absolute', top: '84%', opacity: CurrentOpacity }}>
                <TouchableOpacity onPress={() => setModal(true)}>
                    <Text style={{ color: 'red', fontSize: 16, fontFamily: 'Inter-Regular' }}>Excluir Card</Text>
                </TouchableOpacity>
            </View>

            <View style={{ position: 'absolute', top: '91.5%', opacity: CurrentOpacity }}>
                <TouchableOpacity onPress={() => updateCard()}>
                    <View style={Styles.backButton}>
                        <Text style={{...Styles.backButtonText, fontFamily: 'Inter-Regular' }}>Concluir e Voltar</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const Styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#101010',
    },

    cardImage: {
        alignSelf: 'center',
        marginTop: -190,
        width: 94,
        height: 94,
        borderRadius: 64,
    },

    selectOtherImage: {
        marginTop: 12,
        alignSelf: 'center',
        width: '100%',
        height: 40,
        color: '#999999',
        opacity: 0.6,
        fontSize: 15,
    },

    inputs: {
        marginTop: 15,
        padding: 5,
        width: '55%',
        height: 50,
        backgroundColor: '#363636',
        borderRadius: 15,
        textAlign: 'center',
        color: 'white',
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },

    texts: {
        color: '#ccc',
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        opacity: 0.7,
        marginBottom: 10
    },

    backButton: {
        paddingTop: 10,
        width: 200,
        height: 50,
        backgroundColor: '#363636',
        borderRadius: 15,
    },

    backButtonText: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        fontSize: 15,
        color: 'white',
    },

    // Modal

    modalDeleteCard: {
        padding: 20,
        alignItems: 'center',
        width: '60%',
        height: '25%',
        backgroundColor: '#404040',
        borderRadius: 25,
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
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        textAlign: 'center'
    }
});