<?php
header("Content-Type: application/json");

// DB connection
$conn = new mysqli(
  "153.92.15.84",
  "u279021732_brgyadmin_db",
  "JYEj8JIW8w*",
  "u279021732_brgyadmin_db"
);

if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "Database connection failed"]);
  exit;
}

$ref = $_GET["ref"] ?? "";

if (!$ref) {
  http_response_code(400);
  echo json_encode(["error" => "Missing reference number"]);
  exit;
}

// Query
$sql = "
  SELECT ref_number, status, requested_at, updated_at
  FROM requests
  WHERE ref_number = ?
  LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $ref);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
  echo json_encode($row);
} else {
  echo json_encode(null);
}
