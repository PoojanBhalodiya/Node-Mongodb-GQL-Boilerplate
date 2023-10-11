const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    email: String
    password: String
    token: String
  }

  input RegisterInput {
    email: String
    password: String
  }

  input LoginInput {
    email: String
    password: String
  }

  type Query {
    user(id: ID!): User
  }

  type Mutation {
    registerUser(registerInput: RegisterInput): User
    loginUser(loginInput: LoginInput): User
  }
`;
