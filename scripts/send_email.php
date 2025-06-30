<?php
// Set your email address where you want to receive emails
$to = 'hakai197@gmail.com';
$subject = 'New Appointment Request - Crowned Mobile';

// Collect form data
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'] ?? 'Not provided';
$service_zip = $_POST['service_zip'];
$vehicle = $_POST['vehicle'] ?? 'Not provided';
$service = $_POST['service'];
$date = $_POST['date'];
$time = $_POST['time'];
$message = $_POST['message'] ?? 'No special requests';

// Create email body
$body = "
<html>
<head>
    <title>New Appointment Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .detail { margin-bottom: 10px; }
        .label { font-weight: bold; display: inline-block; width: 180px; }
    </style>
</head>
<body>
    <h2>New Appointment Request</h2>
    
    <div class='detail'><span class='label'>Name:</span> $name</div>
    <div class='detail'><span class='label'>Email:</span> $email</div>
    <div class='detail'><span class='label'>Phone:</span> $phone</div>
    <div class='detail'><span class='label'>Service Zip Code:</span> $service_zip</div>
    <div class='detail'><span class='label'>Vehicle:</span> $vehicle</div>
    <div class='detail'><span class='label'>Service Needed:</span> $service</div>
    <div class='detail'><span class='label'>Preferred Date:</span> $date</div>
    <div class='detail'><span class='label'>Preferred Time:</span> $time</div>
    <div class='detail'><span class='label'>Special Requests:</span> $message</div>
</body>
</html>
";

// Set email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Cc: $to\r\n"; // CC to yourself

// Send email
$mailSent = mail($to, $subject, $body, $headers);

// Return JSON response
header('Content-Type: application/json');
echo json_encode(['success' => $mailSent]);
?>