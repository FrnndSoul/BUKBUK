<?php
header("Content-Type: application/json");

// DB connection
$conn = new mysqli("153.92.15.84","u279021732_brgyadmin_db","JYEj8JIW8w*","u279021732_brgyadmin_db");
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit;
}

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["type_id"]) || !isset($data["fields"])) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid payload"]);
  exit;
}

$type_id = (int)$data["type_id"];
$fields = $data["fields"];

// 🔑 Generate reference number
$ref_number = "BRG-" . date("Y") . "-" . strtoupper(bin2hex(random_bytes(3)));

$conn->begin_transaction();

try {
  // 1️⃣ Insert into requests table
  $stmt = $conn->prepare("
    INSERT INTO requests (ref_number, type_id, status)
    VALUES (?, ?, 'on_queue')
  ");
  $stmt->bind_param("si", $ref_number, $type_id);
  $stmt->execute();

  $request_id = $stmt->insert_id;
  $stmt->close();

  // 2️⃣ Insert form values
  $stmt = $conn->prepare("
    INSERT INTO request_form_values (request_id, field_key, field_value)
    VALUES (?, ?, ?)
  ");

  foreach ($fields as $key => $value) {
    if (is_array($value)) {
      $value = implode(", ", $value);
    }
    $stmt->bind_param("iss", $request_id, $key, $value);
    $stmt->execute();
  }

  $stmt->close();
  $conn->commit();

  // 3️⃣ Return reference number
  echo json_encode([
    "success" => true,
    "ref_number" => $ref_number
  ]);

} catch (Exception $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}
