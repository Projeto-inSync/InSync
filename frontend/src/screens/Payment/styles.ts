import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 45,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textGray,
        marginBottom: 15,
        lineHeight: 20,
    },
    planCard: {
        backgroundColor: "#F9F9F9",
        borderWidth: 2,
        borderColor: "#EEEEEE",
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        position: "relative",
    },
    selectedCard: {
        borderColor: colors.primaryGreen,
        backgroundColor: "#F0FAF0",
    },
    checkBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: colors.primaryGreen,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },
    tagWrapper: {
        position: "absolute",
        top: -10,
        left: 15,
        backgroundColor: "#FFA000",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    tagText: {
        color: "white",
        fontSize: 9,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    planName: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 5,
        marginTop: 5,
    },
    planPrice: {
        fontSize: 26,
        fontWeight: "900",
        color: colors.primaryGreen,
        marginBottom: 5,
    },
    planPeriod: { fontSize: 14, fontWeight: "normal", color: colors.textGray },
    planDesc: { fontSize: 13, color: colors.textGray },

    benefitsSection: {
        marginTop: 5,
        padding: 15,
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: 10,
    },
    benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 }, // Diminuído respiro
    benefitText: { fontSize: 13, color: colors.textDark, marginLeft: 10 },

    buttonWrapper: {
        marginTop: 15,
        marginBottom: 30,
    },
});