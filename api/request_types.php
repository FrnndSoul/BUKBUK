<?php
header('Content-Type: application/json');

// $conn = new mysqli("localhost", "root", "", "barangayadmin_db");
$conn = new mysqli("153.92.15.84","u279021732_brgyadmin_db","JYEj8JIW8w*","u279021732_brgyadmin_db");
// HOST, USERNAME, PASSWORD, DATABASE

if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "Database connection failed"]);
  exit;
}

$sql = "
  SELECT id, name, slug
  FROM request_types
  WHERE is_active = 1
    AND is_archived = 0
  ORDER BY name ASC
";

$result = $conn->query($sql);

$data = [];

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }
}

echo json_encode($data);
