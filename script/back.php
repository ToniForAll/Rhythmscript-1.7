<?php
//Conectamos a la BD
$servername = 'localhost';
$username = 'root';
$password = '';
$database = 'rhythmscriptbd';

$conn = new mysqli(
    $servername,
    $username,
    $password,
    $database
);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$rawData;
$data;
$requestNumber;
$userNickname;
$userPass;

$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);
file_put_contents('php_request_log.txt', "Raw Data: " . $rawData . "\n", FILE_APPEND); //nada mas para verificar

if (isset($data['requestNumber'])) {
    $requestNumber = $data['requestNumber'];
} else if (isset($_POST['requestNumber'])) {
    $requestNumber = $_POST['requestNumber'];
}

//manejo de solicitudes
switch ($requestNumber) {
    case 1: //Registro de usuario
        session_unset();

        $userName = $data['userName'];
        $userNickname = $data['userNickname'];
        $userPass = $data['userPass'];


        $stmt = $conn->prepare("SELECT * FROM user WHERE userNickname = ?");
        $stmt->bind_param("s", $userNickname);
        $stmt->execute();
        $result = $stmt->get_result();

        //si ya existe un usuario comprueba
        if ($result->num_rows > 0) {
            $response = array(
                'success' => false,
                'message' => ' el usuario ya existe'
            );
            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
        }

        //si el usuario no existe lo crea e inicia sesion:
        $stmt = $conn->prepare("INSERT INTO user (userName, userNickname, userPass) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $userName, $userNickname, $userPass);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("SELECT * FROM user WHERE userNickname = ?");
        $stmt->bind_param("s", $userNickname);
        $stmt->execute();
        $result = $stmt->get_result();

        $user = $result->fetch_assoc();

        if ($userPass != $user['userPass']) {
            $response = array(
                'success' => false,
                'message' => ' Clave incorrecta'
            );
            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
        }

        session_start(); //iniciar la sesión
        $_SESSION['user'] = $user;

        $response = array(
            'success' => true,
            'message' => 'user created',
            'url' => 'music.html?id=' . $_SESSION['user']['userId'],
            'userData' => array(
                'userId' => $_SESSION['user']['userId'],
                'userNickname' => $_SESSION['user']['userNickname'],
                'userName' => $_SESSION['user']['userName']
            )
        );

        header('Content-Type: application/json');
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        break;
    case 2: //Inicio de sesion
        session_unset();

        $userNickname = $data['userNickname'];
        $userPass = $data['userPass'];


        $stmt = $conn->prepare("SELECT * FROM user WHERE userNickname = ?");
        $stmt->bind_param("s", $userNickname);
        $stmt->execute();
        $result = $stmt->get_result();

        //comprueba si existe un usuario 
        if (!($result->num_rows > 0)) {
            $response = array(
                'success' => false,
                'message' => ' el usuario no existe'
            );
            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
        }

        //si el usuario existe inicia sesion:
        $stmt = $conn->prepare("SELECT * FROM user WHERE userNickname = ?");
        $stmt->bind_param("s", $userNickname);
        $stmt->execute();
        $result = $stmt->get_result();

        $user = $result->fetch_assoc();

        if ($userPass != $user['userPass']) {
            $response = array(
                'success' => false,
                'message' => ' Clave incorrecta'
            );
            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
        }

        session_start(); //iniciar la sesión
        $_SESSION['user'] = $user;

        $response = array(
            'success' => true,
            'message' => 'user created',
            'url' => 'music.html?id=' . $_SESSION['user']['userId'],
            'userData' => array(
                'userId' => $_SESSION['user']['userId'],
                'userNickname' => $_SESSION['user']['userNickname'],
                'userName' => $_SESSION['user']['userName']
            )
        );

        header('Content-Type: application/json');
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        break;
    case 3://registro de score
        $score = $data['resultado'];
        $levelDificulty = $data['musica'];
        $userId = $data['userId'];

        $stmt = $conn->prepare("INSERT INTO ranking (difficultyId,	score,userId) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $levelDificulty, $score, $userId);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("SELECT * FROM user WHERE userId = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $user = $result->fetch_assoc();

        $response = array(
            'success' => true,
            'message' => 'score created',
            'userData' => array(
                'userId' => $user['userId'],
                'userNickname' => $user['userNickname'],
                'userName' => $user['userName']
            )
        );

        header('Content-Type: application/json');
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        break;
    case 4: //traerse los score

        $stmt = $conn->prepare("
        SELECT 
            r.scoreId,
            r.difficultyId,
            r.score,
            r.userId,
            u.userName,
            u.userNickname
        FROM 
            ranking r
        INNER JOIN 
            user u ON r.userId = u.userId;
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $scores = [];

        while ($row = $result->fetch_assoc()) {
            $scores[] = [
                'scoreId' => $row['scoreId'],
                'difficultyId' => $row['difficultyId'],
                'score' => $row['score'],
                'userId' => $row['userId'],
                'userName' => $row['userName'],
                'userNickname' => $row['userNickname']
            ];
        }


        $response = array(
            'success' => true,
            'message' => 'scores retrieved',
            'scores' => $scores
        );

        header('Content-Type: application/json');
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        break;
}