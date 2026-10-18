<?php
header('Content-Type: application/json');

// $conn = new mysqli("localhost", "root", "", "barangayadmin_db");
$conn = new mysqli("153.92.15.84","u279021732_brgyadmin_db","JYEj8JIW8w*","u279021732_brgyadmin_db");
// HOST, USERNAME, PASSWORD, DATABASE


$id = intval($_GET['request_type_id'] ?? 0);

$stmt = $conn->prepare("
  SELECT request_sections
  FROM request_types
  WHERE id = ? AND is_active = 1
");
$stmt->bind_param("i", $id);
$stmt->execute();

$row = $stmt->get_result()->fetch_assoc();

$sections = [];
if ($row && $row['request_sections']) {
  $decoded = json_decode($row['request_sections'], true);
  if (is_array($decoded)) {
    $sections = $decoded;
  }
}

echo json_encode([
  "request_sections" => $sections
]);