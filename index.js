const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const Sleeps = require("./model/sleep")
const Data = require("./model/data")
const app = express()
const url = "mongodb+srv://admin:AaKYPNbjCSfaejM7@cluster0.b7eml.mongodb.net/sleepDB?retryWrites=true&w=majority"
const JWT_KEY = "mni373tgvw029hdv62980kjn4f8"
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use(cors())
app.use(cookieParser())
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})






app.post('/api/register', async (req, res) => {
    const { email, password } = req.body
    if (!email || typeof email !== 'string') {
        return res.json({ status: 'error', error: 'Invalid email' })
    }

    if (!password || typeof password !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' })
    }

    if (password.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        })
    }
    const hashPassword = await bcrypt.hash(password, 10)
    try {
        await Sleeps.create({ email, password:hashPassword })
        res.redirect("/")
    } catch (error) {
        console.log("Error : ", error);
    }
})

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    const user = await Sleeps.findOne({ email }).lean()
    try {
        if (!user) {
            return res.status(401).json({ message: 'Invalid email/password' })
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email, id: user._id }, JWT_KEY)
            res.cookie('authn',token,{expire:new Date().getTime() + 1*3600*1000})
            res.redirect("/home")
        }
        return res.status(401).json({ message: 'Invalid Password' })
    } catch (error) {
        console.log("Error : ", error);
    }

})

const auth = async (req, res, next) => {
    const token = req.cookies.authn || ""
    try {
        if (!token) {
            return res.status(400).json({ message: "Not exist" })
        }
            const user = await jwt.verify(token, JWT_KEY)
                    req.user = user
                    next()
    } catch (error) {
        console.log("Error : ", error);
    }
}

app.post('/add', async (req, res) => {
    try {
        const data = await Data.create(req.body)
        res.redirect("/dashboard")
    } catch (error) {
        console.log("Error : ", error);
    }
})


app.get('/signup', (req, res) => {
    res.render("signup")
})
app.get('/', (req, res) => {
    res.render("login",{error:""})
})

app.get('/dashboard', async (req, res) => {
    const AllData = await Data.find()
    res.render("dashboard", { data: AllData })
})

app.get('/home', (req, res) => {
    res.render('home')
})

app.get('/tips', auth, (req, res) => {
    res.render('tips')
})

app.get('/logout', (req, res) => {
    res.clearCookie('authn')
    res.redirect('/signup')
})


app.listen(8000, () => {
    console.log("Server started on port 8000");
})