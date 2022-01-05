const express = require('express')
const mongoose = require('mongoose')
const app = express()
const jwt = require('jsonwebtoken')
const SECRET = 'teste'

let port = process.env.PORT || 3000

const User = require('./models/User')

app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(express.json())

// LOGOUT
app.post('/logout', (req, res) => {
    res.end()
})

// CONSULTADO NO DB (consultando todos os usuarios cadastrados)
app.get('/consulta', (req, res) => {
    User.find({}, (err, docs) => {
        if(!err){
            res.status(200).json(docs)
        }else{
            throw err
        }
    })
})

// CONSULTANDO NO DB (procurando usuario cadastrado para login)
app.post('/login', async (req, res) => {
    const { login, senha } = req.body

    // ###################################################
    // VERIFICA SE LOGIN OU SENHA FORAM INFORMADOS
    // ###################################################
    if (!login)
        return res.status(422).json({ error: 'O login é obrigatorio!' })
    if (!senha)
        return res.status(422).json({ error: 'A senha é obrigatoria!' })

    // ###################################################
    // VERIFICA SE EMAIL, LOGIN OU SENHA FORAM INFORMADOS
    // ###################################################
    if (await User.findOne({ login })) {
        if (await User.findOne({ senha })) {
            let userId
            // dentro do model user vai buscar no banco de dados um usuario com login e senha igual a login e senha
            User.find({login: login, senha: senha}, (err, docs) => { //vai salvar os erros em err, e os dados do usuario em docs
                if(!err){
                    userId = docs[0]._id // vai salvar na variavel userId, o primeiro elemento de docs(e o unico), com o valor de _id (ou seja o id do usuario no bd)
                }else{
                    return res.status(422).json({ error: err })
                }
            })
            const token = jwt.sign({ userId: userId }, SECRET, { expiresIn: 300 })
            return res.status(200).json({ message: "Usuario logado com sucesso!", auth: true, token })
        } else {
            return res.status(422).json({ error: "Senha incorreta!" })
        }
    } else {
        return res.status(422).json({ error: "Login incorreto!" })
    }
})

// INSERINDO NO DB (cadastrando novo usuario)
app.post('/cadastro', async (req, res) => {
    const { email, login, senha } = req.body

    // ###################################################
    // VERIFICA SE EMAIL, LOGIN OU SENHA FORAM INFORMADOS
    // ###################################################
    if (!email)
        return res.status(422).json({ error: 'O email é obrigatorio!' })
    if (!login)
        return res.status(422).json({ error: 'O login é obrigatorio!' })
    if (!senha)
        return res.status(422).json({ error: 'A senha é obrigatoria!' })

    // ###################################################
    // VERIFICA SE EMAIL, LOGIN OU SENHA JA EXISTE NO DB
    // ###################################################
    if (await User.findOne({ email }))
        return res.status(422).json({ error: 'O email já existe!' })
    if (await User.findOne({ login }))
        return res.status(422).json({ error: 'O login já existe!' })
    if (await User.findOne({ senha }))
        return res.status(422).json({ error: 'A senha já existe!' })

    const user = {
        email,
        login,
        senha
    }

    try {
        await User.create(user)
        res.status(201).json({ message: `User ${user.login} criado com sucesso!` })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

app.get('/', (req, res) => {
    res.status(200).json({ message: "Tudo ok!" })
})

mongoose.connect(`mongodb+srv://jukita:jucajuca123@apicluster.zzahs.mongodb.net/cadastro?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Conectado ao MongoDB!')
        app.listen(port, () => {
            console.log("Servidor rodando")
        })
    })
    .catch((err) => {
        console.log("ERRO AO CONECTAR AO MONGO DB: " + err)
    })