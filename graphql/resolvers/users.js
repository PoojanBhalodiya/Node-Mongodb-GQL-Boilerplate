const Message = require("../../models/User");
const { ApolloError } = require("apollo-server-errors");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

module.exports = {
  Mutation: {
    async registerUser(_, { registerInput: { email, password } }) {
      //see if an user exists with email attempting to register
      const oldUser = await User.findOne({ email });

      // Throw error if that user exist
      if (oldUser) {
        throw new ApolloError(
          "Auser is already register with the email" + email,
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
        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        //If user doesn't exists, return error
        throw new ApolloError("Incorect passwor", "INCORRECT_PASSWORD");
      }
    },
  },
  Query: {
    user: (_, { ID }) => User.findById(ID),
  },
};
