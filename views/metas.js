import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Metas() {

    const [fontsLoaded] = useFonts({
        'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    });

    const [modal, setModal] = useState(false);

    const [editModal, setEditModal] = useState(false);

    const [currentEditMeta, setCurrentEditMeta] = useState([]);

    const [currentMetasTitle, setCurrentMetasTitle] = useState("");

    const [currentMetasText, setCurrentMetasText] = useState("");

    const [metas, setMetas] = useState([
        {
            id: 0,
            completed: false,
            title: 'Sua primeira meta',
            metaText: 'Fazer devocional segunda, quarta e sexta às 13:00.'
        },
    ]);

    ///////////////////////////
    // Async Storage Use Effect

    useEffect(() => {

        (async () => {

            try {
                let metasAtual = await AsyncStorage.getItem('@currentMetas2');

                if (metasAtual === null) {

                    setMetas([
                        {
                            id: 0,
                            completed: false,
                            title: 'Sua primeira meta',
                            metaText: 'Fazer devocional segunda, quarta e sexta às 13:00.'
                        },
                    ]);

                } else {

                    let JSONparse = JSON.parse(metasAtual);

                    setMetas(JSONparse);
                }

            } catch (error) {
                alert(error);
            }
        })();
    }, [])


    ///////////////////////////

    function showModal() {
        setModal(true);
    }

    function addMeta() {
        if (currentMetasTitle) {
            setModal(!modal);

            let currentid = 0;

            if (metas.length > 0) {
                currentid = metas[metas.length - 1].id + 1;
            }

            let newMeta = { id: currentid, completed: false, title: currentMetasTitle, metaText: currentMetasText };

            setCurrentMetasTitle("");
            setCurrentMetasText("");

            (async () => {

                setMetas([...metas, newMeta]);

                try {
                    let JSONstringify = JSON.stringify([...metas, newMeta]);
                    await AsyncStorage.setItem('@currentMetas2', JSONstringify);

                } catch (error) {
                    alert(error)
                }
            })();

        } else {
            alert("Sua meta precisa ter pelo menos um título.")
        }
    }

    function editMeta(val) {
        setEditModal(true);

        setCurrentEditMeta(val);
        setCurrentMetasTitle(val.title);
        setCurrentMetasText(val.metaText);
    }

    function finishedEditMeta() {
        if (currentMetasTitle) {

            let currentMetasEditPage;

            if (metas != null) {
                currentMetasEditPage = metas.filter(function (val) {
                    return val.id != currentEditMeta.id;
                })
            } else {
                alert('Erro ao tentar salvar a edição.');
            }

            let newMeta = {
                id: currentEditMeta.id,
                completed: currentEditMeta.completed,
                title: currentMetasTitle,
                metaText: currentMetasText
            }

            setEditModal(false);

            (async () => {

                setMetas([...currentMetasEditPage, newMeta])

                try {

                    let JSONstringifed = JSON.stringify([...currentMetasEditPage, newMeta])

                    await AsyncStorage.setItem('@currentMetas2', JSONstringifed)

                } catch (error) {
                    alert(error)
                }
            })();

        } else {
            alert("Sua meta precisa ter pelo menos um título.")
        }
    }

    const deleteMeta = (id) => {
        let newMetas = metas.filter(function (val) {
            return val.id != id;
        });

        setMetas(newMetas);

        (async () => {
            try {
                let JSONstringify = JSON.stringify(newMetas);
                await AsyncStorage.setItem('@currentMetas2', JSONstringify);

            } catch (error) {
                alert(error)
            }
        })();
    }

    function changeCompleted(id) {
        let newCompleted = metas.filter(function (val) {
            if (val.id == id && val.completed == false) {
                val.completed = true;

            } else if (val.id == id && val.completed == true) {
                val.completed = false;
            }

            return val;
        })

        setMetas(newCompleted);

        (async () => {

            try {
                let JSONstringify = JSON.stringify(newCompleted);
                await AsyncStorage.setItem('@currentMetas2', JSONstringify);

            } catch (error) {
                alert(error)
            }
        })();
    }

    /////////////////////////////////////////////////////////////////////
    // RETURN

    return (
        <View style={Styles.mainContainer} key={'mainViewMetas'}>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modal}
            >
                <View style={Styles.modalView}>

                    <TouchableOpacity onPress={() => { setModal(!modal), Keyboard.dismiss() }} style={{
                        position: 'relative',
                        top: -15
                    }}>
                        <AntDesign name="closecircleo" size={32} color='white'></AntDesign>
                    </TouchableOpacity>

                    <View style={Styles.modalCenterView}>
                        <TextInput onChangeText={text => setCurrentMetasTitle(text)} autoFocus={false}
                            placeholder={"Título"} placeholderTextColor={'#c4c4c4'} style={Styles.modalTextBoxs}
                            numberOfLines={1} multiline={false}>
                        </TextInput>


                        <TextInput onChangeText={text => setCurrentMetasText(text)} autoFocus={false}
                            placeholder={"Detalhes da meta/objetivo"} placeholderTextColor={'#c4c4c4'}
                            style={{ ...Styles.modalTextBoxs, width: 260, height: 85, padding: 15 }} multiline={true}
                            numberOfLines={15}>
                        </TextInput>

                        <TouchableOpacity onPress={() => { addMeta(), Keyboard.dismiss() }} style={Styles.modalAddMetaButton}>
                            <Text style={{ marginTop: 20, width: '100%', height: '100%', color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'Inter-Regular' }}>Adicionar Meta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={editModal}
            >
                <View style={Styles.modalView}>

                    <TouchableOpacity onPress={() => { setEditModal(!editModal), Keyboard.dismiss() }} style={{
                        position: 'relative',
                        top: -15
                    }}>
                        <AntDesign name="closecircleo" size={32} color='white'></AntDesign>
                    </TouchableOpacity>

                    <View style={Styles.modalCenterView}>
                        <TextInput defaultValue={currentEditMeta.title} onChangeText={text => setCurrentMetasTitle(text)} autoFocus={false}
                            placeholder={"Título"} placeholderTextColor={'#c4c4c4'} style={Styles.modalTextBoxs}
                            numberOfLines={1} multiline={false}>
                        </TextInput>


                        <TextInput defaultValue={currentEditMeta.metaText} onChangeText={text => setCurrentMetasText(text)} autoFocus={false}
                            placeholder={"Detalhes da meta/objetivo"} placeholderTextColor={'#c4c4c4'}
                            style={{ ...Styles.modalTextBoxs, width: 260, height: 85, padding: 15 }} multiline={true}
                            numberOfLines={15}>
                        </TextInput>

                        <TouchableOpacity onPress={() => { finishedEditMeta(), Keyboard.dismiss() }} style={Styles.modalAddMetaButton}>
                            <Text style={{
                                ...Styles.textFont,
                                marginTop: 20,
                                width: '100%', 
                                height: '100%', 
                                color: 'white', 
                                textAlign: 'center', 
                                fontSize: 16,
                                fontFamily: 'Inter-Regular',
                            }}>
                                Finalizar Edição
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

            <ScrollView>
                {
                    metas.map(function (val) {
                        if (val.completed == false) {
                            return (
                                <View style={{ flex: 1, flexDirection: 'row', padding: 5 }}>
                                    <View style={{ marginRight: 5, alignSelf: 'center' }}>
                                        <TouchableOpacity onPress={() => changeCompleted(val.id)}>
                                            <MaterialCommunityIcons name="checkbox-blank-outline" size={33} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity delayOnLongPress={550} onLongPress={() => editMeta(val)} style={Styles.metaView}>
                                        <Text style={{...Styles.textFont, fontSize: 21, color: 'white' }}>{val.title}</Text>
                                        <Text style={{...Styles.textFont, marginTop: 6, fontSize: 15.5, color: '#c9c9c9' }}>{val.metaText}</Text>

                                        <View style={{ alignItems: 'flex-end', flex: 1, marginTop: 10 }}>
                                            <TouchableOpacity onPress={() => deleteMeta(val.id)}>
                                                <AntDesign name="minuscircleo" size={22} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        } else {
                            return (
                                <View style={{ flex: 1, flexDirection: 'row', padding: 5 }}>
                                    <View style={{ marginRight: 5, alignSelf: 'center' }}>
                                        <TouchableOpacity onPress={() => changeCompleted(val.id)}>
                                            <Ionicons name="checkbox-outline" size={33} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity delayOnLongPress={550} onLongPress={() => editMeta(val)} style={{ ...Styles.metaView, backgroundColor: '#027a24'}}>
                                        <Text style={{...Styles.textFont, fontSize: 21, color: 'white', opacity: 0.43 }}>{val.title}</Text>
                                        <Text style={{...Styles.textFont, marginTop: 6, fontSize: 15.5, color: '#c9c9c9', opacity: 0.4 }}>{val.metaText}</Text>

                                        <View style={{ alignItems: 'flex-end', flex: 1, marginTop: 10 }}>
                                            <TouchableOpacity onPress={() => deleteMeta(val.id)}>
                                                <AntDesign name="minuscircleo" size={22} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    })
                }
            </ScrollView>

            <TouchableOpacity onPress={() => showModal()} style={Styles.addMetaBtn}>
                <AntDesign name="pluscircleo" size={26} color="white" />
            </TouchableOpacity>
        </View>
    );

}

const Styles = StyleSheet.create({
    // Font Load
    textFont: {
        fontFamily: 'Inter-Regular',
    },

    // Main
    mainContainer: {
        backgroundColor: '#363636',
        width: '100%',
        height: '100%',
        flex: 1
    },
    metaView: {
        width: '90%',
        height: 'auto',
        marginTop: 12,
        marginBottom: 12,
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#232323',
        padding: 20,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    addMetaBtn: {
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 10,
    },

    // Modal for add Meta.

    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    modalCenterView: {
        padding: 35,
        width: '75%',
        height: 350,
        backgroundColor: '#333333',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: "center",
    },
    modalTextBoxs: {
        width: '95%',
        height: 60,
        padding: 20,
        marginBottom: 18,
        borderRadius: 20,
        backgroundColor: '#3d3d3d',
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
    },
    modalAddMetaButton: {
        width: '75%',
        height: '20%',
        marginTop: 15,
        padding: 2,
        backgroundColor: '#4f4f4f',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        textalign: 'center',
    }
})