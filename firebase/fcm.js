var admin = require('firebase-admin');

module.exports = {

	sendPushNotification: function(title, body) {
		console.log("Sending Push Notification message:\nTitle: " + title + "\nBody: " + body);

		var message = {
		  android: {
		    priority: 'high',
		    notification: {
		      title: title,
		      body: body,
		      color: '#ff0000'
		    }
		  },
		  topic: 'monitor'
		};

		admin.messaging().send(message)
			.then((response) => {
				// Response is a message ID string.
				console.log('Successfully sent message:', response);
			})
			.catch((error) => {
				console.log('Error sending message:', error);
			});
	}
}