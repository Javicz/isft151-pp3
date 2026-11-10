export function logHandler(req, res){
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
        success: true,
        message: "Endpoint /log ejecutado correctamente"
    }));
}

export function sayHelloHandler(req, res){
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify({
        success: true,
        message: "Endpoint /sayHello ejecutado correctamente"
    }));
}
