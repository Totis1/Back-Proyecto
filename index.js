const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const multer = require('multer')
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDoc, doc, getDocs, setDoc, updateDoc, deleteDoc} = require('firebase/firestore')
const {getStorage, ref, getDownloadURL, uploadBytes } = require('firebase/storage')

require('dotenv/config')

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiJ48JbUDsjO5y1NqEYLlkgom2tzTcA8U",
  authDomain: "muebleria-hernandez-a5878.firebaseapp.com",
  projectId: "muebleria-hernandez-a5878",
  storageBucket: "muebleria-hernandez-a5878.appspot.com",
  messagingSenderId: "395331226377",
  appId: "1:395331226377:web:1a7a4fac600ad5e968a1d8"
}

//inicializacion de db en firebase
const firebase = initializeApp(firebaseConfig)
const bd = getFirestore()
const storage = getStorage(firebase)
const storageRef = ref(storage)

//inicializamos el servidor
const app = express()
const storage1 = multer.memoryStorage();
const upload = multer({ storage: storage1 });

//opciones de CORS
const corsOptions = {
    "origin": "*",
    "optionSuccessStatus": 200
}

//configuracion del servidor
app.use(express.json())
app.use(cors(corsOptions))

//ruta para insertar ventas 
app.post('/insertarventas', (req, res) => {
    const {Numero, Nombre, Categoria, Modelo, NombreM, GrModelo, TiempoImp, Tmaterial, Seguro, Insumos, Ptotal, Fecha} = req.body
    const ventas = collection(bd, "ventas")
    getDoc(doc(ventas, Nombre)).then(venta => {
        if(venta.exists()){
            sendData = {
                Numero,
                Nombre,
                Categoria,
                Modelo,
                NombreM,
                GrModelo,
                TiempoImp,
                Tmaterial,
                Seguro,
                Insumos,
                Ptotal, 
                Fecha
            }   
            //Guardar en la BD
            setDoc(doc(ventas, Nombre), sendData).then(() => {
                res.json({
                    'alert': 'success'
                })
            }).catch(error => {
                res.json({
                    'alert': error
                })
            })
        }else{
            sendData = {
                Numero,
                Nombre,
                Categoria,
                Modelo,
                NombreM,
                GrModelo,
                TiempoImp,
                Tmaterial,
                Seguro,
                Insumos,
                Ptotal, 
                Fecha
            }
            //Guardar en la BD
            setDoc(doc(ventas, Nombre), sendData).then(() => {
                res.json({
                    'alert': 'success'
                })
            }).catch(error => {
                res.json({
                    'alert': error
                })
            })
        }
    })
})

//ruta para insertar registro
app.post('/insertar', (req, res) => {
    const { name, lastname, email, password, number } = req.body

    if (!name || !lastname || !email || !password) {
        res.json({
            'alert': 'Faltan datos'
        })
        return
    }

    //Validaciones
    if (name.length < 3) {
        res.json({
            'alert': 'El nombre requiere minimo 3 caracteres'
        })
    } else if (lastname.length < 3) {
        res.json({
            'alert': 'El apellido requiere minimo 3 caracteres'
        })
    } else if (!email.length) {
        res.json({
            'alert': 'Debes de ingresar un correo electronico'
        })
    } else if (password.length < 8) {
        res.json({
            'alert': 'La contraseña debe de tener minimo 8 caracteres'
        })
    } else if (!Number(number) || !number.length === 10) {
        res.json({
            'alert': 'Introduce un numero valido'
        })
    } else {
        const usuarios = collection(bd, "usuarios")

        getDoc(doc(usuarios, email)).then(usuario => {
            if (usuario.exists()) {
                res.json({
                    'alert': 'El correo ya existe en la BD'
                })
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        sendData = {
                            name,
                            lastname,
                            email,
                            password: hash,
                            number
                        }

                        //Guardar en la BD
                        setDoc(doc(usuarios, email), sendData).then(() => {
                            res.json({
                                'alert': 'success'
                            })
                        }).catch(error => {
                            res.json({
                                'alert': error
                            })
                        })
                    })
                })
            }
        })
    }
})

//ruta para login
app.post('/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.json({
            'alert': 'Faltan Datos'
        })
    }

    const usuarios = collection(bd, 'usuarios')
    getDoc(doc(usuarios, email))
        .then((usuario) => {
            if (!usuario.exists()) {
                return res.status(400).json({ 'alert': 'Correo no registrado' })
            } else {
                bcrypt.compare(password, usuario.data().password, (error, result) => {
                    if (result) {
                        // Para regresar datos
                        let data = usuario.data()
                        res.json({
                            'alert': 'success',
                            name: data.name,
                            lastname: data.lastname
                        })
                    } else {
                        return res.status(400).json({ 'alert': 'Contraseña Incorrecta' })
                    }
                })
            }
        })
})




const PORT = process.env.PORT || 12000

app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
})