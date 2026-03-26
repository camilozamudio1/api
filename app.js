    const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
}));

// CONEXIÓN
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'comidas_rapidas'
});

conexion.connect(err => {
    if (err) throw err;
    console.log("✅ Conectado");
});

// 🔐 MIDDLEWARE
function verificarLogin(req, res, next) {
    if (req.session.logueado) next();
    else res.redirect('/login');
}

// ================= VISTAS =================

app.get('/', (req, res) => res.sendFile(__dirname + '/paginas/index.html'));

app.get('/clientes', (req, res) => {
    res.sendFile(__dirname + '/paginas/clientes.html');
});

app.get('/productos', (req, res) => {
    res.sendFile(__dirname + '/paginas/productos.html');
});

app.get('/login', (req, res) => res.sendFile(__dirname + '/paginas/login.html'));

app.get('/admin', verificarLogin, (req, res) => {
    res.sendFile(__dirname + '/paginas/admin.html');
});

// ================= LOGIN =================

app.post('/login', (req, res) => {
    const { usuario, clave } = req.body;

    conexion.query(
        "SELECT * FROM usuarios WHERE usuario=? AND clave=?",
        [usuario, clave],
        (err, datos) => {
            if (datos.length > 0) {
                req.session.logueado = true;
                res.redirect('/admin');
            } else {
                res.send("❌ Login incorrecto");
            }
        }
    );
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ================= USUARIO =================

// CREAR CLIENTE
app.post('/clientes', (req, res) => {
    const { cedula, nombre, correo } = req.body;

    conexion.query(
        "INSERT INTO clientes (cedula,nombre,correo) VALUES (?,?,?)",
        [cedula, nombre, correo],
        () => res.send("Cliente creado")
    );
});

// CREAR PRODUCTO
app.post('/productos', (req, res) => {
    const { nombre, precio } = req.body;

    conexion.query(
        "INSERT INTO productos (nombre,precio) VALUES (?,?)",
        [nombre, precio],
        () => res.send("Producto creado")
    );
});

// ================= ADMIN CLIENTES =================

app.get('/admin/clientes', verificarLogin, (req,res)=>{
    conexion.query("SELECT * FROM clientes",(e,d)=>res.json(d));
});

app.post('/admin/editarCliente', verificarLogin, (req,res)=>{
    const {id,cedula,nombre,correo}=req.body;
    conexion.query(
        "UPDATE clientes SET cedula=?,nombre=?,correo=? WHERE id=?",
        [cedula,nombre,correo,id],
        ()=>res.send("ok")
    );
});

app.get('/admin/eliminarCliente/:id', verificarLogin, (req,res)=>{
    conexion.query("DELETE FROM clientes WHERE id=?",[req.params.id],()=>res.send("ok"));
});

// ================= ADMIN PRODUCTOS =================

app.get('/admin/productos', verificarLogin, (req,res)=>{
    conexion.query("SELECT * FROM productos",(e,d)=>res.json(d));
});

app.post('/admin/editarProducto', verificarLogin, (req,res)=>{
    const {id,nombre,precio}=req.body;
    conexion.query(
        "UPDATE productos SET nombre=?,precio=? WHERE id=?",
        [nombre,precio,id],
        ()=>res.send("ok")
    );
});

app.get('/admin/eliminarProducto/:id', verificarLogin, (req,res)=>{
    conexion.query("DELETE FROM productos WHERE id=?",[req.params.id],()=>res.send("ok"));
});

// ================= SERVIDOR =================

app.listen(3000, ()=>console.log("🚀 http://localhost:3000"));