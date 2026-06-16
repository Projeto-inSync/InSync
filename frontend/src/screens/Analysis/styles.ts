import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#333333",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    analysisCard: {
        backgroundColor: "#E0E0E0",
        width: "100%",
        height: Dimensions.get("window").height * 0.8,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: "#42A5F5",
        padding: 30,
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    titleText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000000",
        textAlign: "center",
        marginTop: 20,
    },
    syncIcon: {},
    pandaImage: {
        width: 220,
        height: 220,
        resizeMode: "contain",
        marginBottom: 20,
    },
});