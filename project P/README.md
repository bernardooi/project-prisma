# Project Prisma Form. #

## About ##
This project is about implementing a form application using Node JS and Prisma ORM. In this form application the user should be able to do the following: 

- **Register**
- **Login**
- **Update Password**
- **Delete Account**

### Register ###
The registration part includes a form that consists of username, fullname, password, birthday and a file upload. By requiring and installing a module called **expressjs** made it possible to send the data from the form to the database using route methods such as GET and POST. But that only made it possible to request the data from the client-side, **Prisma** on other hand was used to select which database table  to store the data on. Another crucial module is **multer**, which is a middleware that helped with duplicating and moving the selected image to an image folder when registering an new account. The last thing that the Create part required was to hash the password, that was achieved using the module **bcrypt** and this has methods that can hash passwords. 

### Login ###
Implementing the login page went smoothly, prisma made it possible to GET from the database. By using it we could compare if the information was matching the data from the input fields with the data from the database. 

### Update Password ###
To update the password there is form with 4 input fields, Username, Old password, New password and Confirm New password. When submitting the form the server requests the data from the client-side and then finds the user in the database. It is the same process as the login page, where it confirms the user by entering the right password. Afterwards it updates the password in the database using Prisma with the entered values from the form. 

### Delete Account ###
To delete the account the user have to enter their username and password and also confirm the password. When submitting the form it redirects the user to another page where the code is executed and then back to the home page. This part is the same as the login where it uses GET method to request data from the database, then compare it with the entered information from the client-side. Then if the data is correct it deletes the user from the database table and redirects the user to the home page. 

## How To Run ##
Node start.
