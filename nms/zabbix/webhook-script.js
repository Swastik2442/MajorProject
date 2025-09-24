try {
    var params = JSON.parse(value);

    var url = params.URL;
    var to = params.To;
    var subject = params.Subject;
    var message = params.Message;

    var req = new HttpRequest();

    // Optional: Add headers if needed
    req.addHeader('Content-Type: application/json');
    // req.addHeader('Authorization: Bearer ' + params.token);

    var payload = {
        "to": to,
        "subject": subject,
        "message": message
    };

    var response = req.post(url, JSON.stringify(payload));

    if (req.getStatus() != 200) {
        throw 'HTTP error ' + req.getStatus() + ': ' + response;
    }

    return 'Message sent successfully';
}
catch (error) {
    Zabbix.log(3, 'custom_webhook error: ' + error);
    throw 'custom_webhook failed: ' + error;
}
