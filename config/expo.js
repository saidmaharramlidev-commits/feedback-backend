import Expo from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (pushToken, title, body) => {
    // check if token is valid
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.log("Invalid push token:", pushToken);
        return;
    }

    const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: { title, body },
    };

    try {
        const ticket = await expo.sendPushNotificationsAsync([message]);
        console.log("Push notification sent:", ticket);
    } catch (error) {
        console.error("Push notification error:", error);
    }
};