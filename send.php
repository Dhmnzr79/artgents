<?php

declare(strict_types=1);

const TO_EMAIL = 'denis.today@yandex.ru';
const FROM_EMAIL = 'bot@artgents.ru';
const FROM_NAME = 'Artgents';
const MIN_FORM_FILL_MS = 3000;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(405, [
        'ok' => false,
        'message' => 'Метод не поддерживается.',
    ]);
}

if (is_spam_submission($_POST)) {
    send_json(200, [
        'ok' => true,
        'message' => 'Заявка отправлена. Скоро свяжемся с вами.',
    ]);
}

$formType = trim((string) ($_POST['form_type'] ?? ''));

if ($formType === 'auditPopup') {
    $lead = [
        'form_type' => 'auditPopup',
        'name' => clean($_POST['audit_name'] ?? ''),
        'clinic_city' => '',
        'contact_method' => clean($_POST['audit_contact_method'] ?? ''),
        'contact' => clean($_POST['audit_contact'] ?? ''),
        'site' => clean($_POST['audit_site'] ?? ''),
        'comment' => clean($_POST['audit_goal'] ?? ''),
    ];
} else {
    $lead = [
        'form_type' => 'contactPopup',
        'name' => clean($_POST['name'] ?? ''),
        'clinic_city' => clean($_POST['clinic_city'] ?? ''),
        'contact_method' => clean($_POST['contact_method'] ?? ''),
        'contact' => clean($_POST['contact'] ?? ''),
        'site' => clean($_POST['site'] ?? ''),
        'comment' => clean($_POST['comment'] ?? ''),
    ];
}

$validationError = validate_lead($lead);
if ($validationError !== '') {
    send_json(400, [
        'ok' => false,
        'message' => $validationError,
    ]);
}

$subject = $lead['form_type'] === 'auditPopup'
    ? 'Новая заявка: мини-аудит сайта'
    : 'Новая заявка: обсудить подключение';

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . encode_mailbox(FROM_NAME, FROM_EMAIL),
];

if (strtolower($lead['contact_method']) === 'email' && filter_var($lead['contact'], FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $lead['contact'];
}

$message = build_message($lead);
$encodedSubject = encode_header($subject);
$sent = @mail(TO_EMAIL, $encodedSubject, $message, implode("\r\n", $headers), '-f ' . FROM_EMAIL);

if (!$sent) {
    $sent = @mail(TO_EMAIL, $encodedSubject, $message, implode("\r\n", $headers));
}

if (!$sent) {
    send_json(500, [
        'ok' => false,
        'message' => 'Не удалось отправить заявку. Попробуйте ещё раз позже.',
    ]);
}

send_json(200, [
    'ok' => true,
    'message' => 'Заявка отправлена. Скоро свяжемся с вами.',
]);

function clean(string $value): string
{
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
}

function is_spam_submission(array $payload): bool
{
    $honeypot = trim((string) ($payload['company_website'] ?? ''));
    if ($honeypot !== '') {
        return true;
    }

    $startedAt = (int) ($payload['form_started_at'] ?? 0);
    if ($startedAt <= 0) {
        return true;
    }

    $elapsedMs = (int) round(microtime(true) * 1000) - $startedAt;
    return $elapsedMs < MIN_FORM_FILL_MS;
}

function validate_lead(array $lead): string
{
    if ($lead['name'] === '') {
        return 'Укажите имя.';
    }

    if ($lead['contact_method'] === '') {
        return 'Выберите способ связи.';
    }

    if ($lead['contact'] === '') {
        return 'Укажите контакт для связи.';
    }

    if ($lead['form_type'] === 'auditPopup' && $lead['site'] === '') {
        return 'Укажите сайт клиники.';
    }

    if ($lead['form_type'] === 'contactPopup' && $lead['clinic_city'] === '') {
        return 'Укажите клинику или город.';
    }

    return '';
}

function build_message(array $lead): string
{
    $lines = [
        'Новая заявка с сайта Artgents',
        '',
        'Тип заявки: ' . ($lead['form_type'] === 'auditPopup' ? 'Мини-аудит сайта' : 'Обсудить подключение'),
        'Имя: ' . $lead['name'],
    ];

    if ($lead['clinic_city'] !== '') {
        $lines[] = 'Клиника / город: ' . $lead['clinic_city'];
    }

    $lines[] = 'Способ связи: ' . $lead['contact_method'];
    $lines[] = 'Контакт: ' . $lead['contact'];

    if ($lead['site'] !== '') {
        $lines[] = 'Сайт: ' . $lead['site'];
    }

    if ($lead['comment'] !== '') {
        $lines[] = ($lead['form_type'] === 'auditPopup' ? 'Что хочет понять: ' : 'Комментарий: ') . $lead['comment'];
    }

    $lines[] = '';
    $lines[] = 'Дата: ' . date('d.m.Y H:i:s');

    return implode("\n", $lines);
}

function encode_header(string $value): string
{
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function encode_mailbox(string $name, string $email): string
{
    return encode_header($name) . ' <' . $email . '>';
}

function send_json(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
