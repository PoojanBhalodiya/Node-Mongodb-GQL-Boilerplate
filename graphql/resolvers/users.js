const Message = require("../../models/User");
const { ApolloError } = require("apollo-server-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

module.exports = {
  Mutation: {
    async registerUser(_, { registerInput: { email, password } }) {
      //see if an user exists with email attempting to register
      const oldUser = await User.findOne({ email });

      // Throw error if that user exist
      if (oldUser) {
        throw new ApolloError(
          "A user is already register with the email" + email,
          "USER_ALREADY_EXISTS"
        );
      }

      //Encrypt password
      var ecryptedPassword = await bcrypt.hash(password, 10);

      // Build out mongoose model
      const newUser = new User({
        email: email.toLowerCase(),
        password: ecryptedPassword,
      });
      //create our JWT (attach to our User model)
      const token = jwt.sign({ user_id: newUser._id, email }, "UNSAFE_STRING",
      {
        expiresIn: "2h"
      }
      );

      newUser.token = token;
      // save our user in MongoDB
      const res = await newUser.save();

      return {
        id: res.id,
        ...res._doc,
      };
    },
    async loginUser(_, { loginInput: { email, password } }) {
      //see if a user exists with the email
      const user = await User.findOne({ email });

      //check if the enter password equals the encrypted password
      if (user && (await bcrypt.compare(password, user.password))) {
        //check a NEW token
      
        const token = jwt.sign({ user_id: user._id, email }, "UNSAFE_STRING",
        {
          expiresIn: "2h"
        }
        );
        user.token = token;
        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        //If user doesn't exists, return error
        throw new ApolloError("Incorect password", "INCORRECT_PASSWORD");
      }
    },
  },
  Query: {
    user: (_, { ID }) => User.findById(ID),
  },
};
