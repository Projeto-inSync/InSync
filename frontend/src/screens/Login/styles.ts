import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

const isWeb = Platform.OS === "web";

export const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    backgroundWeb: {
        flex: 1,
        minHeight: "100vh" as any,
        backgroundColor: "#e8f5e9",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        width: isWeb ? 420 : "100%",
        maxWidth: isWeb ? 420 : 320,
        borderRadius: 25,
        padding: isWeb ? 45 : 30,
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        ...(isWeb ? { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" } as any : {}),
    },
    title: {
        fontSize: isWeb ? 30 : 24,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 25,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: colors.textDark,
        marginBottom: 5,
        fontWeight: "500",
    },
    input: {
        width: "100%",
        height: isWeb ? 48 : 45,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: "#FAFAFA",
        fontSize: isWeb ? 15 : 14,
        ...(isWeb ? { outlineStyle: "none", boxSizing: "border-box" } as any : {}),
    },
    button: {
        backgroundColor: colors.primaryGreen,
        width: "100%",
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        ...(isWeb ? { cursor: "pointer" } as any : {}),
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    forgotContainer: {
        marginTop: 12,
        ...(isWeb ? { cursor: "pointer" } as any : {}),
    },
    forgotText: {
        color: colors.primaryGreen,
        fontSize: 13,
    },
    linkContainer: {
        marginTop: 20,
        ...(isWeb ? { cursor: "pointer" } as any : {}),
    },
    linkText: {
        color: colors.textDark,
        fontSize: 13,
    },
    linkTextBold: {
        fontWeight: "bold",
        color: colors.primaryGreen,
    },
});