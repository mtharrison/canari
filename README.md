#canari

Graphite backed alerting system with a simple JSON configuration approach

###Sample config.json

	{
		"reporters": {
			"email": {
				"from": "alerts@example.com",
				"user": "user@gmail.com",
				"password": "password",
				"host": "smtp.gmail.com",
				"port": 465,
				"ssl": true
			},
			"slack": {
				"webhookUrl": "https://hooks.slack.com/services/XXX/XXX/XXX"
			}
		},
		"users": {
			"matt": {
				"email": "user@gmail.com",
				"slack": "#alerts"
			}
		},
		"alerts": {
			"Disk usage too high on appserver": {
				"index": "stats.timers.transponder.appserver.diskusage.mean",
				"condition": "> 70",
				"from": "-1hour",
				"users": ["matt"]
			}
		},
		"settings": {
			"interval": 5000,
			"graphiteBaseUrl": "http://graphite.example.com"
		}
	}