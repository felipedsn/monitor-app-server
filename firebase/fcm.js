var admin = require('firebase-admin');

module.exports = {

	sendPushNotification: function(title, body) {
		console.log("[" + (new Date()).toLocaleString() + "]" + "Sending Push Notification message:\nTitle: " + title + "\nBody: " + body);

		var message = {
		  android: {
		    priority: 'high',
		    notification: {
		      title: title,
		      body: body,
		      color: '#ff0000',
		      sound: "default"
		    }
		  },
		  topic: 'monitor'
		};

		admin.messaging().send(message)
			.then((response) => {
				// Response is a message ID string.
				console.log("[" + (new Date()).toLocaleString() + "]" + 'Successfully sent message:', response);
			})
			.catch((error) => {
				console.log("[" + (new Date()).toLocaleString() + "]" + 'Error sending message:', error);
			});
	}
}