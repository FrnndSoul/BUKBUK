
<?php
header('Content-Type: application/json; charset=utf-8');

mysqli_report(MYSQLI_REPORT_OFF);

// Database connection
$conn = new mysqli(
    "153.92.15.84",
    getenv("u279021732_brgyadmin_db") ?: "u279021732_brgyadmin_db",
    getenv("JYEj8JIW8w*") ?: "JYEj8JIW8w*",
    getenv("u279021732_brgyadmin_db") ?: "u279021732_brgyadmin_db"
);

if ($conn->connect_error) {
    http_response_code(500);
    error_log("get_request_fields.php DB connection error: " . $conn->connect_error);
    echo json_encode([
        "error" => "Database connection failed."
    ]);
    exit;
}

$conn->set_charset("utf8mb4");

$id = intval($_GET['request_type_id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        "error" => "Invalid request_type_id."
    ]);
    exit;
}

$stmt = $conn->prepare("
    SELECT request_sections
    FROM request_types
    WHERE id = ? AND is_active = 1
");

if (!$stmt) {
    http_response_code(500);
    error_log("get_request_fields.php prepare error: " . $conn->error);

    echo json_encode([
        "error" => "Unable to prepare request query.",
        "details" => $conn->error
    ]);

    exit;
}

$stmt->bind_param("i", $id);

if (!$stmt->execute()) {
    http_response_code(500);
    error_log("get_request_fields.php execute error: " . $stmt->error);
    echo json_encode([
        "error" => "Unable to retrieve request fields."
    ]);
    exit;
}

$stmt->bind_result($requestSections);

$sections = [];

if ($stmt->fetch() && !empty($requestSections)) {
    $decoded = json_decode($requestSections, true);

    if (is_array($decoded)) {
        $sections = $decoded;
    } else {
        error_log("Invalid request_sections JSON for request_type_id: " . $id);
    }
}

echo json_encode([
    "request_sections" => $sections
]);

$stmt->close();
$conn->close();
