<?php
// Konfiguration
$to_email = "info@informatik-luzern.ch";
$subject_prefix = "[Informatik Luzern] Kontaktanfrage";

// CORS Headers für Frontend-Integration
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Nur POST-Requests erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Nur POST-Requests erlaubt']);
    exit();
}

// Rate Limiting (einfache Session-basierte Implementierung)
session_start();
$current_time = time();
$rate_limit_window = 300; // 5 Minuten
$max_requests = 3; // Maximal 3 Anfragen pro 5 Minuten

if (!isset($_SESSION['contact_requests'])) {
    $_SESSION['contact_requests'] = [];
}

// Alte Einträge entfernen
$_SESSION['contact_requests'] = array_filter($_SESSION['contact_requests'], function($timestamp) use ($current_time, $rate_limit_window) {
    return ($current_time - $timestamp) < $rate_limit_window;
});

// Rate Limit prüfen
if (count($_SESSION['contact_requests']) >= $max_requests) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Zu viele Anfragen. Bitte warten Sie 5 Minuten.']);
    exit();
}

// Input validieren und sanitizen
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// JSON Input lesen
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if (!$data) {
    // Fallback für normale Form-Daten
    $data = $_POST;
}

// Pflichtfelder prüfen
$required_fields = ['name', 'email', 'company', 'message'];
$errors = [];

foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        $errors[] = "Das Feld '$field' ist erforderlich.";
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Validierungsfehler', 'errors' => $errors]);
    exit();
}

// Daten sanitizen
$name = sanitize_input($data['name']);
$email = sanitize_input($data['email']);
$company = sanitize_input($data['company']);
$message = sanitize_input($data['message']);

// E-Mail validieren
if (!validate_email($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige E-Mail-Adresse']);
    exit();
}

// Spam-Schutz: Einfache Heuristiken
function is_spam($name, $email, $company, $message) {
    // Zu viele Links im Text
    if (substr_count(strtolower($message), 'http') > 2) {
        return true;
    }
    
    // Verdächtige Keywords
    $spam_keywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations', 'click here', 'free money'];
    $full_text = strtolower($name . ' ' . $email . ' ' . $company . ' ' . $message);
    
    foreach ($spam_keywords as $keyword) {
        if (strpos($full_text, $keyword) !== false) {
            return true;
        }
    }
    
    // Zu kurze oder zu lange Nachrichten
    if (strlen($message) < 10 || strlen($message) > 5000) {
        return true;
    }
    
    // Name zu kurz
    if (strlen($name) < 2) {
        return true;
    }
    
    return false;
}

// Spam-Prüfung
if (is_spam($name, $email, $company, $message)) {
    // Spam-Verdacht: Stille Ablehnung (kein Fehler für den Benutzer)
    error_log("Spam-Verdacht von IP: " . $_SERVER['REMOTE_ADDR'] . " - Email: $email");
    echo json_encode(['success' => true, 'message' => 'Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden.']);
    exit();
}

// Honeypot-Feld prüfen (falls vorhanden)
if (!empty($data['website'])) {
    // Honeypot wurde ausgefüllt - wahrscheinlich ein Bot
    error_log("Honeypot-Spam von IP: " . $_SERVER['REMOTE_ADDR'] . " - Email: $email");
    echo json_encode(['success' => true, 'message' => 'Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden.']);
    exit();
}

// E-Mail zusammenstellen
$email_subject = $subject_prefix . " von " . $name;
$email_body = "Neue Kontaktanfrage von der Creative Web Studio Website\n\n";
$email_body .= "Name: " . $name . "\n";
$email_body .= "E-Mail: " . $email . "\n";
$email_body .= "Unternehmen: " . $company . "\n";
$email_body .= "Nachricht:\n" . $message . "\n\n";
$email_body .= "---\n";
$email_body .= "IP-Adresse: " . $_SERVER['REMOTE_ADDR'] . "\n";
$email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
$email_body .= "Zeitstempel: " . date('Y-m-d H:i:s') . "\n";

// E-Mail Headers
$headers = "From: noreply@informatik-luzern.ch\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// E-Mail senden
if (mail($to_email, $email_subject, $email_body, $headers)) {
    // Erfolgreiche Anfrage zur Rate-Limit-Liste hinzufügen
    $_SESSION['contact_requests'][] = $current_time;
    
    // Erfolg
    echo json_encode(['success' => true, 'message' => 'Vielen Dank für Ihre Nachricht. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.']);
} else {
    // E-Mail-Versand fehlgeschlagen
    error_log("E-Mail-Versand fehlgeschlagen für: $email");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Entschuldigung, beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.']);
}
?>

