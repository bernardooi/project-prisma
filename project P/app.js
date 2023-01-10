// importation station.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bodyParser = require("body-parser");
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const { decompressFromBase64, findSync } = require("@prisma/client/runtime");
const { log } = require("console");
const ejs = require("ejs");

const app = express();
app.use(express.static("images"));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());  
app.set('view engine', 'ejs');

//path to where image files are stored.
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './images');
    },
  
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({storage: storage});
// session settings.
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized:true,
    cookie:{
        maxAge: 6000*6000,
    }

  }))   

//home page
app.get('/', (req,res)=>{

    res.render('index');

})

//register webpage
app.get('/register', (req, res)=>{
    res.render('register');
})
//register redirects to posted that posts the data to the database, then it redirects to login.
app.post('/posted',upload.single('file'), (req, res)=>{
    const birthday= req.body.bDay;
    const pass1 = req.body.pWord;
    const pass2 = req.body.confirmPword;

    if(pass1 === pass2)
    {
        async function main() {
            const hashedPass1 = await bcrypt.hash(pass1, 10);
            //creates a user using prisma create method
            const createuser = await prisma.user.create({
                data: {
                        name:req.body.fName,
                        username:req.body.uName,  
                        birthday: new Date(birthday),
                        password: hashedPass1,
                        image:req.file.filename, 
                        time: new Date()
                    },
            });
        }
        main()
        .then(async () => {
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
        res.redirect('/login'); 
    }
    else
    {
        res.redirect('/register'); 
    }
})
//renders login page
app.get('/login', (req, res)=>{

    res.render('login');

});


//login redirects to connect to compare the input and database values. 
app.post('/connect', (req, res) =>
{
    const userN = req.body.uName;
    const pass = req.body.pWord;

    async function main() 
    {
        req.session.regenerate(async(err)=>{
            const findUser = await prisma.user.findUnique({
                where:{
                    username: userN,
                    }   
            });
            if(findUser == null){
                console.log("there is no user");
                res.redirect("/login");
            }
            else{   
                const tempPassword = findUser.password;
            
                const result = await bcrypt.compare(pass, tempPassword);//compares the new password with the hashed password from the database
                    if(result === true)
                    {
                        req.session.user = findUser;
                        req.session.secret = findUser.id;
                        console.log(req.session.user);
    
                        req.session.save(function (err) {
                            if (err) return next(err)
                            res.redirect('/profile')})
                        
                    }
                    else{
                        console.log("wrong password");
                    }}
         
        })
       
    }
    main()
})
//finds the matching account with the same username and then deletes it if password matches.
app.post('/removed', (req,res)=>{
async function main(){

    const findUser = await prisma.user.findUnique({
        where: {
            username:req.body.uName,
        }
    })
    const tempPassword = findUser.password;
    const result = await bcrypt.compare(req.body.pWord, tempPassword);
        if(result === true)
        {
            const deleteUser = await prisma.user.delete({
                where: {
                    username: req.body.uName,
                },
              })
              res.redirect('/')
        }
        else{
            console.log("wrong password");
        }
    }
    main();
})

//shows the delete page
app.get('/delete', (req, res)=>{

    res.render("delete");

})
//users page
app.get('/users', (req,res)=>{
    async function main() 
    {
    const users = await prisma.user.findMany({
        select:{
            name:true,
            username: true,
        },
    });
    app.locals.users = JSON.stringify(users);
    res.render('users')
    }

    main();
})

//renders the profile and stores session values as locals.
app.get('/profile', (req, res)=> {

    res.locals.profPic = req.session.user.image;
    res.locals.name = req.session.user.name;
    res.render('profile');
  })

//destroys the session then redirects to the login page.
app.get('/logout', function (req, res, next) {

    req.session.destroy(function(err) {

      })
    res.redirect("/login");
  })

//renders the update webpage
app.get('/update',(req,res)=>{

res.render('update')

})
//changes the password
app.post('/changed', (req, res)=>{
    async function main(){

        const findUser = await prisma.user.findUnique({
            where: {
                username:req.body.uName,
            }
        })
        const tempPass = findUser.password;
            if(req.body.confirmPword === req.body.pWord){
                const result = await bcrypt.compare(req.body.OldpWord, tempPass);   
                if(result === true)
                    {
                        const hashedPass1 = await bcrypt.hash(req.body.pWord, 10);
                        const change = await prisma.user.update({
                            where:{
                                username:req.body.uName,
                            },
                            data:{
                                password:hashedPass1,
                            }
                        })
                        res.redirect("/");
                        console.log("password has been changed");
                    }
            }
            else{
                console.log("password is not matching");
            }
    }
    main();
})

app.listen(2500)