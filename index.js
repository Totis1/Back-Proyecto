const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const multer = require('multer')
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDoc, doc, getDocs, setDoc, updateDoc, deleteDoc} = require('firebase/firestore')
const {getStorage, ref, getDownloadURL, uploadBytes, deleteObject } = require('firebase/storage')

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

//ruta para obtener documentos en DB
app.get('/traertodo', async(req, res) => {
    const usuarios = collection(bd, "usuarios")
    const arreglo = await getDocs(usuarios)
    let returnData = []
    arreglo.forEach(usuario => {
        returnData.push(usuario.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//ruta para obtener documentos en DB de Ventas
app.get('/traerventas', async(req, res) => {
    const ventas = collection(bd, "ventas")
    const arreglo = await getDocs(ventas)
    let returnData = []
    arreglo.forEach(venta => {
        returnData.push(venta.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//ruta eliminar
app.post('/eliminar', (req, res) => {
    const { email } = req.body
        //const refer = bd.collection('alumnos').doc()
        //let alumnoBorrado = bd.collection('alumnos').where('email', '==', email)
    let usuarioBorrado = doc(bd, 'usuarios', email)
    deleteDoc(usuarioBorrado)
        .then((result) => {
            res.json({
                'alert': 'user deleted'
            })
        })
        .catch((error) => {
            res.json({
                'alert': 'error'
            })
        })
})

//ruta eliminar venta
app.post('/eliminarventa', (req, res) => {
    const { Nombre } = req.body
        //const refer = bd.collection('alumnos').doc()
        //let alumnoBorrado = bd.collection('alumnos').where('email', '==', email)
    let ventaBorrado = doc(bd, 'ventas', Nombre)
    deleteDoc(ventaBorrado)
        .then((result) => {
            res.json({
                'alert': 'user deleted'
            })
        })
        .catch((error) => {
            res.json({
                'alert': 'error'
            })
        })
})

//ruta eliminar modelo
app.post('/eliminarmodelo', (req, res) => {
    const { id_Modelo } = req.body
        //const refer = bd.collection('alumnos').doc()
        //let alumnoBorrado = bd.collection('alumnos').where('email', '==', email)
    let modeloBorrado = doc(bd, 'modelos', id_Modelo)
    deleteDoc(modeloBorrado)
        .then((result) => {
            res.json({
                'alert': 'user deleted'
            })
        })
        .catch((error) => {
            res.json({
                'alert': 'error'
            })
        })
})

//ruta actualizar
app.post('/actualizar', (req, res) => {
    const { name, email, lastname, number } = req.body

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
    } else if (!Number(number) || !number.length === 10) {
        res.json({
            'alert': 'Introduce un numero valido    '
        })
    } else {
        //Obtener el doc del usuario
        //bd.collection('alumnos'.doc(id))
        const dataUpdate = {
            name,
            lastname,
            number
        }
        updateDoc(doc(bd, "usuarios", email), dataUpdate)
            .then((response) => {
                res.json({
                    'alert': 'success'
                })
            }).catch((error) => {
                res.json({
                    'alert': 'error'
                })
            })
            //updateDoc(doc(bd),"alumnos",{name, lastname, number},email)
    }
})

//ruta actualizar una venta
app.post('/actualizarventa', (req, res) => {
    const {Numero, Nombre, Categoria, Modelo, NombreM, GrModelo, TiempoImp, Tmaterial, Seguro, Insumos, Ptotal, Fecha} = req.body

    if (Nombre.length < 3) {
        res.json({
            'alert': 'El nombre requiere minimo 3 caracteres'
        })
    } else if (Categoria.length < 3) {
        res.json({
            'alert': 'El apellido requiere minimo 3 caracteres'
        })
    } else if (!Modelo.length) {
        res.json({
            'alert': 'Debes de ingresar un correo electronico'
        })
    } else {
        //Obtener el doc de la venta
        //bd.collection('ventas'.doc(id))
        const dataUpdate2 = {
            Numero,
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
        updateDoc(doc(bd, "ventas", Nombre), dataUpdate2)
            .then((response) => {
                res.json({
                    'alert': 'success'
                })
            }).catch((error) => {
                res.json({
                    'alert': 'error'
                })
            })
            //updateDoc(doc(bd),"alumnos",{name, lastname, number},email)
    }
})

app.get('/traermodelos', async(req, res) => {
    const modelos = collection(bd, "modelos")
    const arreglo = await getDocs(modelos)
    let returnData = []
    arreglo.forEach(modelo => {
        returnData.push(modelo.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//ruta subir imagenes
app.post('/insertarmodelo', (req, res) => {
    const {id_Modelo, Nombre, Categoria, GrModelo, TiempoImp, Imagen} = req.body
    const modelos = collection(bd, "modelos")
    sendData = {
        id_Modelo,
        Nombre,
        Categoria,
        GrModelo,
        TiempoImp,
        Imagen
    }
    setDoc(doc(modelos, id_Modelo), sendData).then(() => {
        res.json({
            'alert': 'success'
        })
    }).catch(error => {
        res.json({
            'alert': error
        })
    })

})

app.post('/insertarimgmodelo', upload.single('Imagen'), (req, res) => {
    const imagen = req.file;
    const imagesRef = ref(storageRef,'imagenes/'+imagen.originalname);
    const metadata = {
        contentType: 'image/jpeg'
    }
    uploadBytes(imagesRef, imagen.buffer, metadata).then((snapshot) => {
        getDownloadURL(imagesRef)
        .then((url) => {
            res.status(200).json({ message: 'Imagen subida correctamente.', imageUrl: url });
          })
    }).catch(err => {console.error(err)});
    
})

app.post('/borrarimagenmodelo', (req, res) => {
    const {id_modelo} = req.body
    console.log(id_modelo)
    deleteObject(id_modelo).then(() => {
        res.json({
            'alert': 'success, deleted imagen'
        })
    }).catch(error => {
        res.json({
            'alert': error
        })
    })
})


const PORT = 5000

app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
})