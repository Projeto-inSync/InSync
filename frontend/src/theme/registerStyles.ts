import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const registerStyles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: '100%',
        maxWidth: 320,
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 25,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#FAFAFA',
    },
    button: {
        backgroundColor: colors.primaryGreen,
        width: '100%',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkContainer: {
        marginTop: 20,
    },
    linkText: {
        color: colors.textDark,
        fontSize: 13,
    },
    linkTextBold: {
        fontWeight: 'bold',
        color: colors.primaryGreen,
    }
});