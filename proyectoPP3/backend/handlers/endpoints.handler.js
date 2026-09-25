export function log_handler(req, res){
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
        success: true,
        message: "Endpoint /log ejecutado correctamente"
    }));
}

export function say_hello_handler(req, res){
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
        success: true,
        message: "Endpoint /sayHello ejecutado correctamente"
    }));
}