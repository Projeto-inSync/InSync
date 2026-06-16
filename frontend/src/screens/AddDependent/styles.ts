import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
        container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 25,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textGray,
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: colors.textDark,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#F9F9F9",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: colors.textDark,
    },
    imageContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    pandaImage: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        opacity: 0.8,
    },
});